import { useState } from 'react'
import { ethers } from 'ethers'
import DenunciaAnonima from '@/artifacts/contracts/DenunciaAnonima.sol/DenunciaAnonima.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export const useDenunciaAnonima = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crearDenuncia = async (tipoAcoso: string, ipfsHash: string) => {
    if (!window.ethereum) {
      setError('Por favor, instala MetaMask para continuar')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      // Conectar a MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Crear instancia del contrato
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DenunciaAnonima.abi,
        signer
      )

      // Crear la denuncia
      const tx = await contract.crearDenuncia(tipoAcoso, ipfsHash)
      const receipt = await tx.wait()

      return receipt.hash
    } catch (err) {
      console.error('Error al crear denuncia:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
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