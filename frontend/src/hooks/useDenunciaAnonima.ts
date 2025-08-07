import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { DenunciaAnonimaABI } from '../contracts/DenunciaAnonima'
import { ZKProofService } from '../services/zkProofs'
import { deleteIPFSFile } from '../services/ipfs'

// Dirección del contrato desplegado en Mantle Sepolia (con función actualizarHashIPFS)
const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// Configuración oficial de la red Mantle Sepolia Testnet
const MANTLE_SEPOLIA = {
  chainId: '0x138b', // 5003 en hexadecimal
  chainName: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18
  },
  rpcUrls: [
    'https://rpc.sepolia.mantle.xyz',
    'https://mantle-sepolia.drpc.org',
    'https://mantle-sepolia-testnet.rpc.thirdweb.com'
  ],
  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz/']
}

interface SwitchError {
  code: number;
  message: string;
}

export interface Denuncia {
  denunciante: string;
  tipoAcoso: string;
  descripcion: string;
  ipfsHash: string;
  timestamp: Date;
  blockNumber: number;
  proof?: unknown;
  publicSignals?: unknown;
  esPublica: boolean; // Nueva propiedad para privacidad
}

export const useDenunciaAnonima = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zkService, setZkService] = useState<ZKProofService | null>(null)
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [nuevaDenunciaDetectada, setNuevaDenunciaDetectada] = useState(false)

  // RPCs públicos para Mantle Sepolia
  const MANTLE_SEPOLIA_RPCS = [
    'https://mantle-sepolia.drpc.org',
    'https://rpc.sepolia.mantle.xyz',
    'https://mantle-sepolia.gateway.tenderly.co',
    'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
    'https://mantle-sepolia-testnet.rpc.thirdweb.com',
  ]

  // Función para obtener provider público (sin MetaMask)
  const getPublicProvider = async (): Promise<ethers.JsonRpcProvider> => {
    for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
      try {
        console.log(`🔍 Probando RPC público: ${rpcUrl.split('/')[2]}`)
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        
        // Verificar que funciona
        const network = await provider.getNetwork()
        if (network.chainId === BigInt(5003)) {
          console.log(`✅ RPC público funcional: ${rpcUrl.split('/')[2]}`)
          return provider
        }
      } catch (error) {
        console.warn(`❌ RPC ${rpcUrl.split('/')[2]} falló`)
        continue
      }
    }
    
    throw new Error('No se pudo conectar a ningún RPC público de Mantle Sepolia')
  }

  // Función helper para retry con backoff exponencial
  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        const isRateLimit = error instanceof Error && 
          (error.message.includes('rate limit') || error.message.includes('-32005'))
        
        if (isRateLimit && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Backoff exponencial
          console.log(`🔄 Rate limit detectado, reintentando en ${delay}ms (intento ${attempt}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw error
      }
    }
    throw new Error('Max retries reached')
  }

  // Función helper para procesar promesas en lotes y evitar rate limiting
  const procesarDenunciasEnLotes = async (
    promesas: Promise<Denuncia | null>[], 
    tamañoLote: number = 3, 
    delayMs: number = 1000
  ): Promise<Denuncia[]> => {
    const resultados: Denuncia[] = []
    
    console.log(`📦 Procesando ${promesas.length} denuncias en lotes de ${tamañoLote} con delay de ${delayMs}ms`)
    
    for (let i = 0; i < promesas.length; i += tamañoLote) {
      const lote = promesas.slice(i, i + tamañoLote)
      const loteNumero = Math.floor(i / tamañoLote) + 1
      const totalLotes = Math.ceil(promesas.length / tamañoLote)
      
      console.log(`🔄 Procesando lote ${loteNumero}/${totalLotes} (${lote.length} denuncias)`)
      
      try {
        // Usar retry con backoff para cada lote
        const resultadosLote = await retryWithBackoff(async () => {
          return await Promise.all(lote)
        }, 3, 1000)
        
        const denunciasValidas = resultadosLote.filter((d): d is Denuncia => d !== null)
        resultados.push(...denunciasValidas)
        
        console.log(`✅ Lote ${loteNumero} completado: ${denunciasValidas.length}/${lote.length} denuncias válidas`)
        
        // Delay entre lotes para evitar rate limiting (excepto en el último lote)
        if (i + tamañoLote < promesas.length) {
          console.log(`⏳ Esperando ${delayMs}ms antes del siguiente lote...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch (error) {
        console.error(`❌ Error en lote ${loteNumero} después de reintentos:`, error)
        // Continuar con el siguiente lote en caso de error persistente
        continue
      }
    }
    
    console.log(`🎉 Procesamiento completado: ${resultados.length} denuncias válidas en total`)
    return resultados
  }



  // Inicializar el servicio ZK
  const initializeZK = async () => {
    try {
      if (!zkService) {
        const service = await ZKProofService.getInstance()
        setZkService(service)
        return service
      }
      return zkService
    } catch (error) {
      console.error('Error al inicializar el servicio ZK:', error)
      throw new Error('No se pudo inicializar el servicio ZK')
    }
  }

  const getProvider = async (skipNetworkCheck = false) => {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado. Por favor instala MetaMask para continuar.')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    
    if (skipNetworkCheck) {
      return provider
    }

    try {
      const network = await provider.getNetwork()
      
      if (network.chainId !== BigInt(5003)) {
        console.log(`Red actual: ${network.chainId}, necesaria: 5003 (Mantle Sepolia)`)
        
        try {
          console.log('Intentando cambiar a red Mantle Sepolia...')
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x138b' }],
          })
          console.log('✅ Red cambiada exitosamente')
        } catch (switchError) {
          const error = switchError as SwitchError
          console.log('Error al cambiar red:', error.code, error.message)
          
          if (error.code === 4902) {
            console.log('Red no existe, intentando agregarla...')
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [MANTLE_SEPOLIA],
              })
              console.log('✅ Red agregada exitosamente')
            } catch (addError) {
              console.error('Error al agregar red:', addError)
              throw new Error(`
                No se pudo agregar la red Mantle Sepolia automáticamente.
                
                Por favor agrega la red manualmente en MetaMask:
                • Nombre: Mantle Sepolia
                • RPC URL: https://rpc.sepolia.mantle.xyz
                • Chain ID: 5003
                • Símbolo: MNT
                • Explorador: https://explorer.sepolia.mantle.xyz
              `)
            }
          } else if (error.code === 4001) {
            throw new Error('Cambio de red cancelado por el usuario. Por favor cambia a la red Mantle Sepolia manualmente.')
          } else {
            throw new Error(`Error al cambiar a la red Mantle Sepolia: ${error.message}`)
          }
        }
      }
    } catch (networkError) {
      console.error('Error de red:', networkError)
      if (networkError instanceof Error && networkError.message.includes('agregar la red manualmente')) {
        throw networkError
      }
      throw new Error('Error al verificar la red. Asegúrate de estar conectado a Mantle Sepolia.')
    }

    return provider
  }

  const crearDenuncia = async (tipoAcoso: string, ipfsHash: string, _esPublica: boolean = true) => {
    try {
      console.log('Iniciando creación de denuncia...')
      setLoading(true)
      setError(null)

      if (!tipoAcoso || !ipfsHash) {
        throw new Error('Faltan datos requeridos para la denuncia')
      }

      // Validación de la dirección del contrato
      if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x') || CONTRACT_ADDRESS.length !== 42) {
        throw new Error('Dirección del contrato inválida')
      }

      const provider = await getProvider()
      const signer = await provider.getSigner()
      const denunciante = await signer.getAddress()
      
      // Verificar que el contrato existe
      const code = await provider.getCode(CONTRACT_ADDRESS)
      if (code === '0x') {
        throw new Error('El contrato no está desplegado en esta red')
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI,
        signer
      )

      // Generar prueba ZK
      const zkService = await initializeZK()
      const timestamp = Math.floor(Date.now() / 1000)
      
      console.log('Generando prueba ZK...')
      const { proof, publicSignals } = await zkService.generateProof({
        publicInputs: {
          ipfsHash,
          timestamp
        },
        privateInputs: {
          denunciante,
          tipoAcoso
        }
      })

      if (!proof || !publicSignals) {
        throw new Error('Error al generar la prueba ZK')
      }

      // Convertir la prueba a bytes
      const proofBytes = ethers.toUtf8Bytes(JSON.stringify(proof))

      // Convertir las señales públicas a números
      const publicSignalsArray = Array.isArray(publicSignals) 
        ? publicSignals.map(signal => {
            if (typeof signal === 'string') {
              return BigInt(signal)
            }
            return BigInt(signal)
          })
        : [BigInt(publicSignals)]

      console.log('Enviando transacción con datos:', {
        tipoAcoso,
        ipfsHash,
        proofLength: proofBytes.length,
        publicSignalsLength: publicSignalsArray.length
      })

      // Enviar la transacción con el parámetro esPublica
      const tx = await contract.crearDenuncia(
        tipoAcoso,
        ipfsHash,
        proofBytes,
        publicSignalsArray,
        _esPublica
      )

      console.log('Transacción enviada:', tx.hash)
      console.log('Esperando confirmación...')

      // Esperar la confirmación con timeout más largo
      const receipt = await Promise.race([
        tx.wait().then((receipt: ethers.ContractTransactionReceipt) => {
          console.log('Transacción confirmada en el bloque:', receipt.blockNumber)
          return receipt
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La transacción no se confirmó en 120 segundos')), 120000)
        )
      ])

      console.log('Transacción confirmada:', receipt.hash)

      // Actualizar la lista de denuncias
      await actualizarDenuncias()

      return receipt.hash
    } catch (err) {
      console.error('Error detallado al crear denuncia:', err)
      if (err instanceof Error) {
        console.error('Mensaje de error:', err.message)
        console.error('Stack trace:', err.stack)
      }
      setError(err instanceof Error ? err.message : 'Error al crear la denuncia')
      return null
    } finally {
      setLoading(false)
    }
  }

  const eliminarDenuncia = async (ipfsHash: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Eliminar el archivo de IPFS
      const eliminado = await deleteIPFSFile(ipfsHash)
      if (!eliminado) {
        throw new Error('No se pudo eliminar el archivo de IPFS')
      }

      return true
    } catch (err) {
      console.error('Error al eliminar denuncia:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar la denuncia')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener denuncias usando las funciones del contrato
  const obtenerDenuncias = useCallback(async (): Promise<Denuncia[]> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🚀 OBTENIENDO DENUNCIAS SIN METAMASK')
      
      // Usar provider público (no requiere MetaMask)
      const provider = await getPublicProvider()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI as ethers.InterfaceAbi,
        provider
      )

      console.log('Obteniendo total de denuncias...')
      
      try {
        // Obtener el total de denuncias
        console.log('🔍 Consultando contrato en:', CONTRACT_ADDRESS);
        const total = await contract.totalDenuncias()
        const totalNumber = Number(total)
        
        console.log(`✅ Total de denuncias en el nuevo contrato: ${totalNumber}`)

        if (totalNumber === 0) {
          console.log('📝 Contrato nuevo - no hay denuncias registradas aún')
          return []
        }

        // Obtener todas las denuncias
        const denunciasPromises = []
        for (let i = 0; i < totalNumber; i++) {
          denunciasPromises.push(
            contract.obtenerDenuncia(i).then(async (denunciaStruct: any) => {
              try {
                // El contrato devuelve un struct, no valores individuales
                const denuncia = {
                  denunciante: denunciaStruct.denunciante,
                  tipoAcoso: denunciaStruct.tipoAcoso,
                  ipfsHash: denunciaStruct.ipfsHash,
                  timestamp: denunciaStruct.timestamp,
                  proof: denunciaStruct.proof,
                  publicSignals: denunciaStruct.publicSignals,
                  esPublica: denunciaStruct.esPublica || true // Fallback para compatibilidad
                };
                
                // Obtener el bloque para el timestamp usando el provider público
                const currentBlock = await provider.getBlockNumber()
                
                // Intentar obtener un preview del contenido IPFS
                let descripcionPreview = "No se proporcionó descripción";
                if (denuncia.ipfsHash) {
                  try {
                    // Importar dinámicamente para evitar problemas de dependencias circulares
                    const { getIPFSContent } = await import('../services/ipfs');
                    const contenidoIPFS = await getIPFSContent(denuncia.ipfsHash);
                    
                    // Intentar parsear como JSON para extraer la descripción
                    try {
                      const jsonContent = JSON.parse(contenidoIPFS);
                      
                      // Verificar si tiene estructura anidada con contenido_cifrado
                      if (jsonContent.contenido_cifrado) {
                        console.log('🔍 Hook: Detectada estructura con contenido_cifrado anidado');
                        descripcionPreview = `🔒 Denuncia cifrada de ${jsonContent.tipo || 'tipo no especificado'} (haz clic para descifrar)`;
                      } else if (jsonContent.descripcion) {
                        // Mostrar un preview de la descripción (primeros 200 caracteres)
                        descripcionPreview = jsonContent.descripcion.length > 200 
                          ? jsonContent.descripcion.substring(0, 200) + "..."
                          : jsonContent.descripcion;
                      } else if (jsonContent.message) {
                        descripcionPreview = jsonContent.message.length > 200 
                          ? jsonContent.message.substring(0, 200) + "..."
                          : jsonContent.message;
                      } else {
                        descripcionPreview = "Contenido IPFS disponible (haz clic en 'Ver descripción completa')";
                      }
                    } catch {
                      // Si no es JSON, usar el contenido como texto plano
                      descripcionPreview = contenidoIPFS.length > 200 
                        ? contenidoIPFS.substring(0, 200) + "..."
                        : contenidoIPFS;
                    }
                  } catch (error) {
                    console.warn(`No se pudo obtener preview de IPFS para ${denuncia.ipfsHash}:`, error);
                    descripcionPreview = "Contenido almacenado en IPFS (haz clic en 'Ver descripción completa' para acceder)";
                  }
                }

                return {
                  denunciante: denuncia.denunciante,
                  tipoAcoso: denuncia.tipoAcoso,
                  descripcion: descripcionPreview,
                  ipfsHash: denuncia.ipfsHash,
                  proof: denuncia.proof,
                  publicSignals: denuncia.publicSignals,
                  timestamp: new Date(Number(denuncia.timestamp) * 1000),
                  blockNumber: currentBlock,
                  esPublica: denuncia.esPublica !== undefined ? denuncia.esPublica : true
                } as Denuncia
              } catch (error) {
                console.error(`Error al procesar denuncia ${i}:`, error)
                return null
              }
            }).catch((error: any) => {
              console.error(`Error al obtener denuncia ${i}:`, error)
              return null
            })
          )
        }

        // Procesar denuncias en lotes para evitar rate limiting
        const denunciasValidas = await procesarDenunciasEnLotes(denunciasPromises, 3, 1000)
        
        console.log(`✅ Se obtuvieron ${denunciasValidas.length} denuncias válidas`)
        
        // Ordenar las denuncias por timestamp (más recientes primero)
        const denunciasOrdenadas = denunciasValidas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        
        return denunciasOrdenadas
      } catch (contractError) {
        console.error('❌ Error al llamar funciones del contrato:', contractError)
        
        // Si es un contrato nuevo, es normal que no tenga denuncias
        if (contractError instanceof Error && contractError.message.includes('could not decode result data')) {
          console.log('📝 Contrato nuevo detectado - inicializando historial vacío')
          return []
        }
        
        // Fallback: intentar obtener eventos como antes
        console.log('🔄 Intentando obtener denuncias mediante eventos...')
        return await obtenerDenunciasPorEventos()
      }
    } catch (err) {
      console.error('Error al obtener denuncias:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener las denuncias')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Función fallback para obtener denuncias por eventos
  const obtenerDenunciasPorEventos = async (): Promise<Denuncia[]> => {
    try {
      const provider = await getProvider()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI as ethers.InterfaceAbi,
        provider
      )

      const currentBlock = await provider.getBlockNumber()
      // Para el contrato nuevo, buscar desde el bloque de despliegue
      const startBlock = Math.max(0, currentBlock - 10000) // Buscar en más bloques para el nuevo contrato
      
      console.log(`🔍 Buscando eventos en contrato ${CONTRACT_ADDRESS}`)
      console.log(`📊 Rango de bloques: ${startBlock} hasta ${currentBlock}`)

      const filter = contract.filters.DenunciaCreada()
      const eventos = await contract.queryFilter(filter, startBlock, currentBlock)

      console.log(`Se encontraron ${eventos.length} eventos`)

      if (eventos.length === 0) {
        return []
      }

      const denunciasPromises = eventos.map(async (evento) => {
        try {
          const bloque = await provider.getBlock(evento.blockNumber)
          if (!bloque) {
            console.error(`No se pudo obtener el bloque ${evento.blockNumber}`)
            return null
          }

          const args = (evento as ethers.EventLog).args
          if (!args) {
            console.error('Evento sin argumentos:', evento)
            return null
          }

          const [denunciante, tipoAcoso, ipfsHash, proof, publicSignals] = args as unknown as [string, string, string, unknown, unknown]

          // Intentar obtener un preview del contenido IPFS para eventos
          let descripcionPreview = "No se proporcionó descripción";
          if (ipfsHash) {
            try {
              // Importar dinámicamente para evitar problemas de dependencias circulares
              const { getIPFSContent } = await import('../services/ipfs');
              const contenidoIPFS = await getIPFSContent(ipfsHash);
              
              // Intentar parsear como JSON para extraer la descripción
              try {
                const jsonContent = JSON.parse(contenidoIPFS);
                
                // Verificar si tiene estructura anidada con contenido_cifrado
                if (jsonContent.contenido_cifrado) {
                  console.log('🔍 Hook (eventos): Detectada estructura con contenido_cifrado anidado');
                  descripcionPreview = `🔒 Denuncia cifrada de ${jsonContent.tipo || 'tipo no especificado'} (haz clic para descifrar)`;
                } else if (jsonContent.descripcion) {
                  // Mostrar un preview de la descripción (primeros 200 caracteres)
                  descripcionPreview = jsonContent.descripcion.length > 200 
                    ? jsonContent.descripcion.substring(0, 200) + "..."
                    : jsonContent.descripcion;
                } else if (jsonContent.message) {
                  descripcionPreview = jsonContent.message.length > 200 
                    ? jsonContent.message.substring(0, 200) + "..."
                    : jsonContent.message;
                } else {
                  descripcionPreview = "Contenido IPFS disponible (haz clic en 'Ver descripción completa')";
                }
              } catch {
                // Si no es JSON, usar el contenido como texto plano
                descripcionPreview = contenidoIPFS.length > 200 
                  ? contenidoIPFS.substring(0, 200) + "..."
                  : contenidoIPFS;
              }
            } catch (error) {
              console.warn(`No se pudo obtener preview de IPFS para evento ${ipfsHash}:`, error);
              descripcionPreview = "Contenido almacenado en IPFS (haz clic en 'Ver descripción completa' para acceder)";
            }
          }

          return {
            denunciante,
            tipoAcoso,
            descripcion: descripcionPreview,
            ipfsHash,
            proof,
            publicSignals,
            timestamp: new Date(Number(bloque.timestamp) * 1000),
            blockNumber: evento.blockNumber,
            esPublica: true // Por defecto para eventos
          } as Denuncia
        } catch (error) {
          console.error('Error al procesar evento:', error)
          return null
        }
      })

      const nuevasDenuncias = await procesarDenunciasEnLotes(denunciasPromises, 2, 1500)
      return nuevasDenuncias.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error('Error al obtener eventos:', error)
      return []
    }
  }

  // Función para cargar más denuncias
  const cargarMasDenuncias = useCallback(async () => {
    // Por ahora, simplemente actualizar todas las denuncias
    await actualizarDenuncias()
  }, [])

  // Función para actualizar la lista de denuncias
  const actualizarDenuncias = useCallback(async () => {
    console.log('Actualizando lista de denuncias...')
    const nuevasDenuncias = await obtenerDenuncias()
    setDenuncias(nuevasDenuncias)
    console.log(`Lista actualizada con ${nuevasDenuncias.length} denuncias`)
  }, [obtenerDenuncias])

  // Efecto para cargar denuncias inicialmente y configurar el listener
  useEffect(() => {
    let contract: ethers.Contract | null = null
    let isActive = true

    const setupContract = async () => {
      try {
        console.log('🔄 Configurando listener de eventos...')
        const provider = await getProvider()
        contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DenunciaAnonimaABI as ethers.InterfaceAbi,
          provider
        )

        // Cargar denuncias iniciales
        if (isActive) {
          await actualizarDenuncias()
        }

        // Configurar listener para nuevos eventos con manejo de errores
        const handleNewDenuncia = async (denunciante: string, tipoAcoso: string, _ipfsHash: string, _proof: unknown, _publicSignals: unknown, event: ethers.EventLog) => {
          try {
            console.log('🆕 Nueva denuncia detectada:', {
              denunciante: denunciante.slice(0, 6) + '...',
              tipoAcoso,
              bloque: event.blockNumber,
              txHash: event.transactionHash
            })
            
            // Mostrar indicador de nueva denuncia
            if (isActive) {
              setNuevaDenunciaDetectada(true)
            }
            
            // Esperar un poco para asegurar que la transacción esté completamente procesada
            setTimeout(async () => {
              if (isActive) {
                console.log('🔄 Actualizando lista de denuncias...')
                await actualizarDenuncias()
                // Ocultar indicador después de actualizar
                setTimeout(() => {
                  if (isActive) {
                    setNuevaDenunciaDetectada(false)
                  }
                }, 3000) // Mostrar por 3 segundos
              }
            }, 2000) // Esperar 2 segundos
            
          } catch (error) {
            console.error('❌ Error al procesar nueva denuncia:', error)
          }
        }

        contract.on('DenunciaCreada', handleNewDenuncia)

        // Configurar listener para errores del provider
        if (provider) {
          provider.on('error', (error) => {
            console.error('❌ Error en el provider:', error)
            // Intentar reconectar después de un error
            setTimeout(() => {
              if (isActive) {
                console.log('🔄 Intentando reconectar listener...')
                setupContract()
              }
            }, 5000)
          })
        }

        console.log('✅ Listener de eventos configurado correctamente')

      } catch (error) {
        console.error('❌ Error al configurar el contrato:', error)
        if (isActive) {
          setError('Error al conectar con la blockchain. Reintentando...')
          // Reintentar después de 10 segundos
          setTimeout(() => {
            if (isActive) {
              setupContract()
            }
          }, 10000)
        }
      }
    }

    setupContract()

    // Cleanup function
    return () => {
      isActive = false
      if (contract) {
        console.log('🧹 Limpiando listeners de eventos...')
        contract.removeAllListeners('DenunciaCreada')
        contract.removeAllListeners('error')
      }
    }
  }, [actualizarDenuncias])

  const actualizarHashIPFS = async (denunciaId: number, nuevoHashIPFS: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Iniciando actualización de hash IPFS...', { denunciaId, nuevoHashIPFS });

      const provider = await getProvider()
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()
      
      console.log('👤 Signer address:', signerAddress);
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI,
        signer
      )

      // Verificar que la denuncia existe y obtener información actual
      console.log('🔍 Verificando denuncia existente...');
      const denunciaActual = await contract.obtenerDenuncia(denunciaId);
      console.log('📋 Denuncia actual:', {
        denunciante: denunciaActual.denunciante,
        hashActual: denunciaActual.ipfsHash,
        esDelMismoUsuario: denunciaActual.denunciante.toLowerCase() === signerAddress.toLowerCase()
      });

      if (denunciaActual.denunciante.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`Solo el denunciante puede actualizar el hash. Denunciante: ${denunciaActual.denunciante}, Usuario actual: ${signerAddress}`);
      }

      // Verificar que el hash actual sea temporal (solo para hashes que realmente lo sean)
      if (!denunciaActual.ipfsHash.startsWith('QmTemporal')) {
        console.warn('⚠️ El hash actual no es temporal, no se puede actualizar:', denunciaActual.ipfsHash);
        throw new Error('Solo se pueden actualizar hashes temporales. Este hash ya es real.');
      }

      console.log('📤 Enviando transacción de actualización...');
      
      // Llamar a la función actualizarHashIPFS del contrato
      const tx = await contract.actualizarHashIPFS(denunciaId, nuevoHashIPFS)
      
      console.log('✅ Transacción de actualización enviada:', tx.hash)
      
      // Esperar confirmación
      const receipt = await tx.wait()
      console.log('🎉 Hash IPFS actualizado en blockchain:', receipt.hash)

      // Actualizar la lista de denuncias
      console.log('🔄 Actualizando lista de denuncias...');
      await actualizarDenuncias()

      return true
    } catch (err) {
      console.error('❌ Error detallado al actualizar hash IPFS:', err)
      if (err instanceof Error) {
        console.error('📝 Mensaje de error:', err.message)
        console.error('📚 Stack trace:', err.stack)
      }
      setError(err instanceof Error ? err.message : 'Error al actualizar hash IPFS')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    denuncias,
    crearDenuncia,
    eliminarDenuncia,
    actualizarDenuncias,
    cargarMasDenuncias,
    obtenerDenuncias,
    actualizarHashIPFS,
    loading,
    error,
    nuevaDenunciaDetectada
  }
} 