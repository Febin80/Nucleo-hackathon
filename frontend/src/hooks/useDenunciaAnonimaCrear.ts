import { useState } from 'react'
import { ethers } from 'ethers'
import { DenunciaAnonimaABI } from '../contracts/DenunciaAnonima'
import { ZKProofService } from '../services/zkProofs'

// Dirección del contrato
const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// Configuración de la red Mantle Sepolia
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

export const useDenunciaAnonimaCrear = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zkService, setZkService] = useState<ZKProofService | null>(null)

  // Función para obtener provider con MetaMask (SOLO para crear denuncias)
  const getMetaMaskProvider = async (skipNetworkCheck = false) => {
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

  // Función para crear denuncia (REQUIERE MetaMask)
  const crearDenuncia = async (tipoAcoso: string, ipfsHash: string, _esPublica: boolean = true) => {
    try {
      console.log('🚀 Iniciando creación de denuncia...')
      setLoading(true)
      setError(null)

      if (!tipoAcoso || !ipfsHash) {
        throw new Error('Faltan datos requeridos para la denuncia')
      }

      if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x') || CONTRACT_ADDRESS.length !== 42) {
        throw new Error('Dirección del contrato inválida')
      }

      const provider = await getMetaMaskProvider()
      const signer = await provider.getSigner()
      const denunciante = await signer.getAddress()
      
      const code = await provider.getCode(CONTRACT_ADDRESS)
      if (code === '0x') {
        throw new Error('El contrato no está desplegado en esta red')
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonimaABI,
        signer
      )

      const zkService = await initializeZK()
      const timestamp = Math.floor(Date.now() / 1000)
      
      console.log('🔐 Generando prueba ZK...')
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

      const proofBytes = ethers.toUtf8Bytes(JSON.stringify(proof))

      const publicSignalsArray = Array.isArray(publicSignals) 
        ? publicSignals.map(signal => {
            if (typeof signal === 'string') {
              return BigInt(signal)
            }
            return BigInt(signal)
          })
        : [BigInt(publicSignals)]

      console.log('📤 Enviando transacción...', {
        tipoAcoso,
        ipfsHash: ipfsHash.slice(0, 20) + '...',
        proofLength: proofBytes.length,
        publicSignalsLength: publicSignalsArray.length
      })

      const tx = await contract.crearDenuncia(
        tipoAcoso,
        ipfsHash,
        proofBytes,
        publicSignalsArray,
        _esPublica
      )

      console.log('⏳ Transacción enviada:', tx.hash)
      console.log('Esperando confirmación...')

      const receipt = await Promise.race([
        tx.wait().then((receipt: ethers.ContractTransactionReceipt) => {
          console.log('✅ Transacción confirmada en el bloque:', receipt.blockNumber)
          return receipt
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La transacción no se confirmó en 120 segundos')), 120000)
        )
      ])

      console.log('🎉 Denuncia creada exitosamente:', receipt.hash)

      return receipt.hash
    } catch (err) {
      console.error('❌ Error al crear denuncia:', err)
      if (err instanceof Error) {
        console.error('Mensaje:', err.message)
      }
      setError(err instanceof Error ? err.message : 'Error al crear la denuncia')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    crearDenuncia,
    loading,
    error
  }
}