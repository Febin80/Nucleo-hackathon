import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { DenunciaAnonimaABI } from '../contracts/DenunciaAnonima'
import { ZKProofService } from '../services/zkProofs'
import { deleteIPFSFile } from '../services/ipfs'

// Dirección del contrato desplegado en Mantle Sepolia
const CONTRACT_ADDRESS = '0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B';

// Configuración de la red Mantle Sepolia
const MANTLE_SEPOLIA = {
  chainId: '0x1389', // 5003 en hexadecimal
  chainName: 'Mantle Sepolia',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18
  },
  rpcUrls: ['https://rpc.testnet.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz']
}

interface SwitchError {
  code: number;
  message: string;
}

interface Denuncia {
  denunciante: string;
  tipoAcoso: string;
  descripcion: string;
  ipfsHash: string;
  timestamp: Date;
  blockNumber: number;
  proof?: unknown;
  publicSignals?: unknown;
}

export const useDenunciaAnonima = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zkService, setZkService] = useState<ZKProofService | null>(null)
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [ultimoBloque, setUltimoBloque] = useState<number | null>(null)

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

  const getProvider = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const network = await provider.getNetwork()
    
    if (network.chainId !== BigInt(5003)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1389' }],
        })
      } catch (switchError) {
        const error = switchError as SwitchError
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MANTLE_SEPOLIA],
            })
          } catch {
            throw new Error('Error al agregar la red Mantle Sepolia')
          }
        } else {
          throw new Error('Error al cambiar a la red Mantle Sepolia')
        }
      }
    }

    return provider
  }

  const crearDenuncia = async (tipoAcoso: string, ipfsHash: string) => {
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

      // Enviar la transacción
      const tx = await contract.crearDenuncia(
        tipoAcoso,
        ipfsHash,
        proofBytes,
        publicSignalsArray
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

  // Función para obtener denuncias
  const obtenerDenuncias = useCallback(async (fromBlock?: number): Promise<Denuncia[]> => {
    try {
      setLoading(true)
      setError(null)

      const provider = await getProvider()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI as ethers.InterfaceAbi,
        provider
      )

      // Obtener el bloque actual
      const currentBlock = await provider.getBlockNumber()
      
      // Si no se proporciona un bloque inicial, usar los últimos 10 bloques
      const startBlock = fromBlock || Math.max(0, currentBlock - 10)
      
      console.log(`Buscando eventos desde el bloque ${startBlock} hasta ${currentBlock}`)

      try {
        // Obtener el evento DenunciaCreada
        const filter = contract.filters.DenunciaCreada()
        const eventos = await contract.queryFilter(filter, startBlock, currentBlock)

        console.log(`Se encontraron ${eventos.length} eventos`)

        if (eventos.length === 0) {
          setUltimoBloque(startBlock)
          return []
        }

        // Convertir los eventos a un formato más amigable
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

            const [denunciante, tipoAcoso, descripcion, ipfsHash, proof, publicSignals] = args as unknown as [string, string, string, string, unknown, unknown]

            return {
              denunciante,
              tipoAcoso,
              descripcion: descripcion || "No se proporcionó descripción",
              ipfsHash,
              proof,
              publicSignals,
              timestamp: new Date(Number(bloque.timestamp) * 1000),
              blockNumber: evento.blockNumber
            } as Denuncia
          } catch (error) {
            console.error('Error al procesar evento:', error)
            return null
          }
        })

        const nuevasDenuncias = (await Promise.all(denunciasPromises)).filter((d): d is Denuncia => d !== null)
        
        // Actualizar el último bloque procesado
        setUltimoBloque(startBlock)
        
        // Ordenar las denuncias por timestamp (más recientes primero)
        const denunciasOrdenadas = nuevasDenuncias.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        
        // Actualizar el estado de denuncias
        setDenuncias(prevDenuncias => {
          // Combinar denuncias existentes con nuevas, evitando duplicados
          const denunciasUnicas = [...prevDenuncias]
          denunciasOrdenadas.forEach(nuevaDenuncia => {
            if (!denunciasUnicas.some(d => d.ipfsHash === nuevaDenuncia.ipfsHash)) {
              denunciasUnicas.push(nuevaDenuncia)
            }
          })
          return denunciasUnicas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        })

        return denunciasOrdenadas
      } catch (error) {
        console.error('Error al obtener eventos:', error)
        throw error
      }
    } catch (err) {
      console.error('Error al obtener denuncias:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener las denuncias')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para cargar más denuncias
  const cargarMasDenuncias = useCallback(async () => {
    if (!ultimoBloque) return
    
    const nuevasDenuncias = await obtenerDenuncias(ultimoBloque - 1)
    setDenuncias(prev => [...prev, ...nuevasDenuncias])
  }, [ultimoBloque, obtenerDenuncias])

  // Función para actualizar la lista de denuncias
  const actualizarDenuncias = useCallback(async () => {
    const nuevasDenuncias = await obtenerDenuncias()
    setDenuncias(nuevasDenuncias)
  }, [obtenerDenuncias])

  // Efecto para cargar denuncias inicialmente y configurar el listener
  useEffect(() => {
    const setupContract = async () => {
      try {
        const provider = await getProvider()
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DenunciaAnonimaABI as ethers.InterfaceAbi,
          provider
        )

        // Cargar denuncias iniciales
        await actualizarDenuncias()

        // Configurar listener para nuevos eventos
        contract.on('DenunciaCreada', async () => {
          console.log('Nueva denuncia detectada, actualizando lista...')
          await actualizarDenuncias()
        })

        // Limpiar listener al desmontar
        return () => {
          contract.removeAllListeners('DenunciaCreada')
        }
      } catch (error) {
        console.error('Error al configurar el contrato:', error)
        setError('Error al conectar con la blockchain')
      }
    }

    setupContract()
  }, [actualizarDenuncias])

  return {
    denuncias,
    crearDenuncia,
    eliminarDenuncia,
    actualizarDenuncias,
    cargarMasDenuncias,
    obtenerDenuncias,
    loading,
    error
  }
} 