import { useState } from 'react'
import { ethers } from 'ethers'
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  Alert, 
  AlertIcon, 
  Code, 
  Heading,
  Badge,
  Divider
} from '@chakra-ui/react'

const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5'

const WORKING_RPCS = [
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.gateway.tenderly.co',
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
  'https://mantle-sepolia.drpc.org',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia.public.blastapi.io',
  'https://rpc.ankr.com/mantle_sepolia'
]

const SIMPLE_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
]

interface DebugResult {
  step: string
  status: 'success' | 'error' | 'testing'
  message: string
  data?: any
  error?: string
}

export const HistorialDebug = () => {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<DebugResult[]>([])

  const debugHistorial = async () => {
    setTesting(true)
    setResults([])
    
    const debugResults: DebugResult[] = []
    
    const addResult = (result: DebugResult) => {
      debugResults.push(result)
      setResults([...debugResults])
    }

    try {
      // Paso 1: Probar conectividad RPC
      addResult({
        step: 'RPC Connection',
        status: 'testing',
        message: 'Probando conectividad con RPCs...'
      })

      let workingProvider = null
      let workingRPC = ''

      for (const rpcUrl of WORKING_RPCS) {
        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
            staticNetwork: true
          })
          
          const blockNumber = await Promise.race([
            provider.getBlockNumber(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ])
          
          if (blockNumber > 0) {
            workingProvider = provider
            workingRPC = rpcUrl
            break
          }
        } catch (error) {
          continue
        }
      }

      if (!workingProvider) {
        addResult({
          step: 'RPC Connection',
          status: 'error',
          message: 'No se pudo conectar a ningún RPC',
          error: 'Todos los RPCs fallaron'
        })
        return
      }

      addResult({
        step: 'RPC Connection',
        status: 'success',
        message: `Conectado exitosamente`,
        data: { rpc: workingRPC.split('/')[2] }
      })

      // Paso 2: Verificar contrato
      addResult({
        step: 'Contract Check',
        status: 'testing',
        message: 'Verificando contrato...'
      })

      const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, workingProvider)
      
      try {
        const total = await Promise.race([
          contract.totalDenuncias(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ])
        
        const totalNumber = Number(total)
        
        addResult({
          step: 'Contract Check',
          status: 'success',
          message: `Contrato funcional`,
          data: { totalDenuncias: totalNumber, contractAddress: CONTRACT_ADDRESS }
        })

        // Paso 3: Obtener denuncias si existen
        if (totalNumber > 0) {
          addResult({
            step: 'Fetch Denuncias',
            status: 'testing',
            message: `Obteniendo ${totalNumber} denuncias...`
          })

          const denunciasObtenidas = []
          const maxToGet = Math.min(totalNumber, 3) // Solo las primeras 3 para debug

          for (let i = 0; i < maxToGet; i++) {
            try {
              const denunciaStruct = await Promise.race([
                contract.obtenerDenuncia(i),
                new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), 8000)
                )
              ])
              
              const denuncia = {
                id: i,
                denunciante: denunciaStruct.denunciante,
                tipoAcoso: denunciaStruct.tipoAcoso,
                ipfsHash: denunciaStruct.ipfsHash,
                timestamp: new Date(Number(denunciaStruct.timestamp) * 1000),
                esPublica: denunciaStruct.esPublica !== undefined ? denunciaStruct.esPublica : true
              }
              
              denunciasObtenidas.push(denuncia)
              
              // Delay entre denuncias
              if (i < maxToGet - 1) {
                await new Promise(resolve => setTimeout(resolve, 800))
              }
              
            } catch (error) {
              addResult({
                step: 'Fetch Denuncias',
                status: 'error',
                message: `Error en denuncia ${i}`,
                error: error instanceof Error ? error.message : 'Error desconocido'
              })
              continue
            }
          }

          addResult({
            step: 'Fetch Denuncias',
            status: 'success',
            message: `${denunciasObtenidas.length} denuncias obtenidas exitosamente`,
            data: { denuncias: denunciasObtenidas }
          })
        } else {
          addResult({
            step: 'Fetch Denuncias',
            status: 'success',
            message: 'Contrato vacío - no hay denuncias registradas',
            data: { totalDenuncias: 0 }
          })
        }

      } catch (contractError) {
        addResult({
          step: 'Contract Check',
          status: 'error',
          message: 'Error al interactuar con el contrato',
          error: contractError instanceof Error ? contractError.message : 'Error desconocido'
        })
      }

    } catch (error) {
      addResult({
        step: 'General Error',
        status: 'error',
        message: 'Error general en el debug',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Box p={6} bg="gray.50" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Box textAlign="center">
          <Heading size="md" mb={2}>🔧 Debug del Historial</Heading>
          <Text fontSize="sm" color="gray.600">
            Diagnóstico completo del sistema de historial
          </Text>
        </Box>

        <Button 
          onClick={debugHistorial} 
          isLoading={testing}
          loadingText="Ejecutando debug..."
          colorScheme="red"
          size="lg"
        >
          🚀 Ejecutar Debug Completo
        </Button>

        {results.length > 0 && (
          <>
            <Divider />
            <VStack spacing={3} align="stretch">
              {results.map((result, index) => (
                <Box 
                  key={index}
                  p={4} 
                  bg="white" 
                  borderRadius="md" 
                  borderWidth="2px"
                  borderColor={
                    result.status === 'success' ? 'green.200' :
                    result.status === 'error' ? 'red.200' : 'blue.200'
                  }
                >
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Badge 
                        colorScheme={
                          result.status === 'success' ? 'green' :
                          result.status === 'error' ? 'red' : 'blue'
                        }
                        mb={2}
                        fontSize="sm"
                      >
                        {result.step}
                      </Badge>
                      <Text fontSize="md" fontWeight="bold">
                        {result.status === 'success' ? '✅' : 
                         result.status === 'error' ? '❌' : '🔄'} {result.message}
                      </Text>
                    </Box>
                    
                    {result.data && (
                      <Box bg="green.50" p={3} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="green.800" mb={2}>
                          📊 Datos obtenidos:
                        </Text>
                        <Code fontSize="xs" colorScheme="green" p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
                          {JSON.stringify(result.data, null, 2)}
                        </Code>
                      </Box>
                    )}
                    
                    {result.error && (
                      <Box bg="red.50" p={3} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="red.800" mb={2}>
                          ❌ Error:
                        </Text>
                        <Code fontSize="xs" colorScheme="red" p={2} borderRadius="md">
                          {result.error}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </>
        )}

        {results.length > 0 && !testing && (
          <Alert status="info" size="sm">
            <AlertIcon />
            <Text fontSize="xs">
              Debug completado. Si hay errores, esto explica por qué el historial no funciona.
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  )
}