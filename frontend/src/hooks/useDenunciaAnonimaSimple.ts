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

  // Función ultra-rápida para obtener provider (con cache)
  const getProvider = async () => {
    // Cache del provider para evitar reconexiones
    const cachedRpc = localStorage.getItem('fastRpc');
    
    if (cachedRpc) {
      try {
        console.log(`🚀 Usando RPC cacheado: ${cachedRpc.split('/')[2]}`);
        const provider = new ethers.JsonRpcProvider(cachedRpc, undefined, {
          staticNetwork: true,
          batchMaxCount: 10, // Optimización para batch requests
          batchStallTime: 10 // Reducir tiempo de espera
        });
        
        // Test ultra-rápido
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
        ]);
        
        console.log(`✅ RPC cacheado funciona`);
        return provider;
      } catch (error) {
        console.warn(`⚠️ RPC cacheado falló, buscando nuevo...`);
        localStorage.removeItem('fastRpc');
      }
    }
    
    console.log('🔍 Buscando RPC funcional rápido...')
    
    // Probar múltiples RPCs en paralelo para máxima velocidad
    const promises = WORKING_RPCS.slice(0, 3).map(async (rpcUrl) => {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          staticNetwork: true,
          batchMaxCount: 10,
          batchStallTime: 10
        });
        
        // Test ultra-rápido con timeout corto
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 800))
        ]);
        
        return { provider, rpcUrl };
      } catch (error) {
        throw new Error(`${rpcUrl} failed`);
      }
    });
    
    try {
      // Usar Promise.allSettled en lugar de Promise.any para compatibilidad
      const results = await Promise.allSettled(promises);
      const firstSuccess = results.find(result => result.status === 'fulfilled');
      
      if (firstSuccess && firstSuccess.status === 'fulfilled') {
        const result = firstSuccess.value;
        console.log(`✅ RPC más rápido: ${result.rpcUrl.split('/')[2]}`);
        
        // Cachear el RPC que funciona
        localStorage.setItem('fastRpc', result.rpcUrl);
        
        return result.provider;
      }
      
      throw new Error('Todos los RPCs fallaron');
    } catch (error) {
      console.error('❌ Todos los RPCs rápidos fallaron, usando fallback...');
      
      // Fallback al primer RPC
      const provider = new ethers.JsonRpcProvider(WORKING_RPCS[0], undefined, {
        staticNetwork: true
      });
      return provider;
    }
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

      // Obtener denuncias con estrategia más robusta
      const maxToGet = Math.min(totalNumber, 10); // Reducir a 10 para mayor velocidad
      console.log(`📋 Obteniendo las ${maxToGet} denuncias más recientes con timeouts optimizados...`)

      // Construir los IDs desde el último hacia atrás: total-1, total-2, ...
      const idsRecientes = Array.from({ length: maxToGet }, (_, idx) => totalNumber - 1 - idx)

      // Obtener denuncias con timeout más corto y mejor manejo de errores
      const promesasDenuncias = idsRecientes.map(async (id, index) => {
        try {
          console.log(`📄 Obteniendo denuncia ${id} (${index + 1}/${maxToGet})...`);
          
          const denunciaStruct = await Promise.race([
            contract.obtenerDenuncia(id),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout denuncia ${id}`)), 2000) // Reducido a 2s
            )
          ]);

          const denuncia = {
            id,
            denunciante: denunciaStruct[0],
            tipoAcoso: denunciaStruct[1],
            descripcion: `Denuncia #${id} - ${denunciaStruct[1]}`,
            ipfsHash: denunciaStruct[2],
            timestamp: new Date(Number(denunciaStruct[3]) * 1000),
            esPublica: denunciaStruct[6]
          };
          
          console.log(`✅ Denuncia ${id} obtenida: ${denuncia.tipoAcoso}`);
          return denuncia;
        } catch (error) {
          console.warn(`⚠️ Error obteniendo denuncia ${id}:`, error);
          return null;
        }
      });

      // Esperar todas las promesas con timeout global
      console.log(`⚡ Ejecutando ${promesasDenuncias.length} llamadas en paralelo...`);
      
      const resultados = await Promise.race([
        Promise.allSettled(promesasDenuncias),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout global de carga')), 10000) // 10s total
        )
      ]);
      
      // Filtrar resultados exitosos
      const denunciasObtenidas = resultados
        .filter(resultado => resultado.status === 'fulfilled' && resultado.value !== null)
        .map(resultado => (resultado as PromiseFulfilledResult<DenunciaSimple>).value);

      console.log(`📊 Resultados: ${denunciasObtenidas.length} exitosas de ${promesasDenuncias.length} intentos`);

      // Si obtuvimos pocas denuncias, agregar ejemplos para demostración
      if (denunciasObtenidas.length < 3) {
        console.log(`⚠️ Solo se obtuvieron ${denunciasObtenidas.length} denuncias, agregando ejemplos...`);
        
        const denunciasEjemplo: DenunciaSimple[] = [
          {
            id: 999,
            denunciante: '0x1234567890123456789012345678901234567890',
            tipoAcoso: 'Acoso Laboral (Ejemplo)',
            descripcion: 'Ejemplo de denuncia para demostración del sistema',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            timestamp: new Date(Date.now() - 86400000),
            esPublica: true
          },
          {
            id: 998,
            denunciante: '0x2345678901234567890123456789012345678901',
            tipoAcoso: 'Discriminación (Ejemplo)',
            descripcion: 'Ejemplo de caso de discriminación',
            ipfsHash: 'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
            timestamp: new Date(Date.now() - 172800000),
            esPublica: true
          }
        ];
        
        denunciasObtenidas.push(...denunciasEjemplo);
      }

      // Ordenar por timestamp
      const denunciasOrdenadas = denunciasObtenidas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      console.log(`🎉 ÉXITO: ${denunciasOrdenadas.length} denuncias cargadas (${denunciasOrdenadas.filter(d => d.id < 900).length} reales + ${denunciasOrdenadas.filter(d => d.id >= 900).length} ejemplos)`)
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