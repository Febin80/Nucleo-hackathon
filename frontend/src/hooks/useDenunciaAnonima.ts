// DEPRECATED: This hook is no longer used. Use useDenunciaAnonimaSimple for read operations and useDenunciaAnonimaCrear for write operations.
import { useState } from 'react'

export interface Denuncia {
  denunciante: string;
  tipoAcoso: string;
  descripcion: string;
  ipfsHash: string;
  timestamp: Date;
  blockNumber: number;
  proof?: unknown;
  publicSignals?: unknown;
  esPublica: boolean;
}

export const useDenunciaAnonima = () => {
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [denuncias] = useState<Denuncia[]>([])
  const [nuevaDenunciaDetectada] = useState(false)

  console.warn('⚠️ useDenunciaAnonima is deprecated. Use useDenunciaAnonimaSimple for read operations and useDenunciaAnonimaCrear for write operations.')

  return {
    denuncias,
    crearDenuncia: async () => null,
    eliminarDenuncia: async () => false,
    actualizarDenuncias: async () => {},
    cargarMasDenuncias: async () => {},
    obtenerDenuncias: async () => [],
    actualizarHashIPFS: async () => false,
    loading,
    error,
    nuevaDenunciaDetectada
  }
}