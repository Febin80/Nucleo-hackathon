import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Dirección del contrato
const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// RPCs que funcionan (confirmados por el diagnóstico) + más opciones
const WORKING_RPCS = [
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.gateway.tenderly.co', 
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
  'https://mantle-sepolia.drpc.org',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia.public.blastapi.io',
  'https://rpc.ankr.com/mantle_sepolia'
];

// ABI mínimo necesario
const SIMPLE_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
];

export interface DenunciaSimple {
  id: number;
  denunciante: string;
  tipoAcoso: string;
  descripcion: string;
  ipfsHash: string;
  timestamp: Date;
  esPublica: boolean;
}

export const useDenunciaAnonimaSimple = () => {
  const [denuncias, setDenuncias] = useState<DenunciaSimple[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función ultra-simple para obtener provider
  const getProvider = async () => {
    console.log('🔍 Buscando RPC funcional...')
    
    for (const rpcUrl of WORKING_RPCS) {
      try {
        console.log(`Probando: ${rpcUrl.split('/')[2]}`)
        const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          staticNetwork: true // Optimización para evitar llamadas innecesarias
        })
        
        // Test más rápido - solo verificar que responde
        const blockNumber = await Promise.race([
          provider.getBlockNumber(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])
        
        if (typeof blockNumber === 'number' && blockNumber > 0) {
          console.log(`✅ Usando: ${rpcUrl.split('/')[2]} (bloque: ${blockNumber})`)
          return provider
        }
      } catch (error) {
        console.log(`❌ Falló: ${rpcUrl.split('/')[2]} - ${error instanceof Error ? error.message : 'Error desconocido'}`)
        continue
      }
    }
    
    throw new Error('No se pudo conectar a ningún RPC de Mantle Sepolia. Verifica tu conexión a internet.')
  }

  // Función ultra-simple para obtener denuncias
  const obtenerDenuncias = async () => {
    try {
      console.log('🚀 INICIANDO CARGA SIMPLE DE DENUNCIAS')
      setLoading(true)
      setError(null)

      // Obtener provider
      const provider = await getProvider()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, provider)

      // Obtener total con timeout
      console.log('📊 Obteniendo total...')
      const total = await Promise.race([
        contract.totalDenuncias(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout al obtener total de denuncias')), 10000))
      ])
      const totalNumber = Number(total)
      console.log(`Total encontrado: ${totalNumber}`)

      if (totalNumber === 0) {
        console.log('⚠️ No hay denuncias registradas en el contrato')
        setDenuncias([])
        return
      }

      // Obtener denuncias más recientes primero (máximo 10)
      const maxToGet = Math.min(totalNumber, 10)
      console.log(`📋 Obteniendo ${maxToGet} denuncias más recientes...`)

      const denunciasObtenidas: DenunciaSimple[] = []

      // Construir los IDs desde el último hacia atrás: total-1, total-2, ...
      const idsRecientes = Array.from({ length: maxToGet }, (_, idx) => totalNumber - 1 - idx)

      for (let idx = 0; idx < idsRecientes.length; idx++) {
        const id = idsRecientes[idx]
        try {
          console.log(`Obteniendo denuncia id=${id} (${idx + 1}/${maxToGet})`)

          // Obtener denuncia con timeout
          const denunciaStruct = await Promise.race([
            contract.obtenerDenuncia(id),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ])

          const denuncia: DenunciaSimple = {
            id,
            denunciante: denunciaStruct.denunciante,
            tipoAcoso: denunciaStruct.tipoAcoso,
            descripcion: `Denuncia de ${denunciaStruct.tipoAcoso} - Ver contenido completo en IPFS`,
            ipfsHash: denunciaStruct.ipfsHash,
            timestamp: new Date(Number(denunciaStruct.timestamp) * 1000),
            esPublica: denunciaStruct.esPublica !== undefined ? denunciaStruct.esPublica : true
          }

          denunciasObtenidas.push(denuncia)
          console.log(`✅ Denuncia id=${id} obtenida: ${denuncia.tipoAcoso}`)

          // Delay reducido para respuesta más rápida
          if (idx < maxToGet - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (error) {
          console.error(`❌ Error al obtener denuncia id=${id}:`, error instanceof Error ? error.message : 'Error desconocido')
          continue
        }
      }

      // Ya vienen en orden reciente → asegurar orden por timestamp por robustez
      const denunciasOrdenadas = denunciasObtenidas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      console.log(`🎉 ÉXITO: ${denunciasOrdenadas.length} denuncias cargadas (más recientes primero)`)
      setDenuncias(denunciasOrdenadas)

    } catch (err) {
      console.error('❌ ERROR:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar denuncias: ${errorMessage}`)
      setDenuncias([])
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar (simplificada)
  const actualizarDenuncias = async () => {
    console.log('🔄 Actualizando denuncias...')
    await obtenerDenuncias()
  }

  // useEffect ultra-simple
  useEffect(() => {
    console.log('🎯 Hook simple montado - cargando denuncias...')
    obtenerDenuncias()
  }, []) // Sin dependencias

  return {
    denuncias,
    loading,
    error,
    actualizarDenuncias,
    obtenerDenuncias
  }
}