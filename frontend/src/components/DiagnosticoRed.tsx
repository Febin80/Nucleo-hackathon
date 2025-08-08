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

const RPCS_TO_TEST = [
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

interface TestResult {
  rpc: string
  status: 'success' | 'error' | 'testing'
  message: string
  blockNumber?: number
  totalDenuncias?: number
  error?: string
}

export const DiagnosticoRed = () => {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const testRPCs = async () => {
    setTesting(true)
    setResults([])
    
    const testResults: TestResult[] = []
    
    for (const rpcUrl of RPCS_TO_TEST) {
      const result: TestResult = {
        rpc: rpcUrl,
        status: 'testing',
        message: 'Probando conexión...'
      }
      
      testResults.push(result)
      setResults([...testResults])
      
      try {
        console.log(`🔍 Probando RPC: ${rpcUrl}`)
        
        // Test 1: Conexión básica
        const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          staticNetwork: true
        })
        
        const blockNumber = await Promise.race([
          provider.getBlockNumber(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout (5s)')), 5000)
          )
        ])
        
        result.blockNumber = blockNumber
        result.message = `Conectado - Bloque: ${blockNumber}`
        
        // Test 2: Contrato
        const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, provider)
        
        const total = await Promise.race([
          contract.totalDenuncias(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout contrato (8s)')), 8000)
          )
        ])
        
        result.totalDenuncias = Number(total)
        result.status = 'success'
        result.message = `✅ Funcional - Bloque: ${blockNumber}, Denuncias: ${total}`
        
      } catch (error) {
        result.status = 'error'
        result.error = error instanceof Error ? error.message : 'Error desconocido'
        result.message = `❌ Error: ${result.error}`
      }
      
      // Actualizar resultado
      const updatedResults = testResults.map(r => 
        r.rpc === rpcUrl ? result : r
      )
      setResults([...updatedResults])
      
      // Pequeño delay entre tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setTesting(false)
  }

  return (
    <Box p={6} bg="gray.50" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Box textAlign="center">
          <Heading size="md" mb={2}>🔧 Diagnóstico de Red</Heading>
          <Text fontSize="sm" color="gray.600">
            Prueba la conectividad con los RPCs de Mantle Sepolia
          </Text>
        </Box>

        <Button 
          onClick={testRPCs} 
          isLoading={testing}
          loadingText="Probando RPCs..."
          colorScheme="blue"
          size="lg"
        >
          🚀 Probar Conexiones
        </Button>

        {results.length > 0 && (
          <>
            <Divider />
            <VStack spacing={3} align="stretch">
              {results.map((result, index) => (
                <Box 
                  key={index}
                  p={3} 
                  bg="white" 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={
                    result.status === 'success' ? 'green.200' :
                    result.status === 'error' ? 'red.200' : 'blue.200'
                  }
                >
                  <VStack align="stretch" spacing={2}>
                    <Box>
                      <Badge 
                        colorScheme={
                          result.status === 'success' ? 'green' :
                          result.status === 'error' ? 'red' : 'blue'
                        }
                        mb={2}
                      >
                        {result.rpc.split('/')[2]}
                      </Badge>
                      <Text fontSize="sm" fontWeight="bold">
                        {result.message}
                      </Text>
                    </Box>
                    
                    {result.blockNumber && (
                      <Text fontSize="xs" color="gray.600">
                        Bloque actual: {result.blockNumber}
                      </Text>
                    )}
                    
                    {result.totalDenuncias !== undefined && (
                      <Text fontSize="xs" color="green.600">
                        Total denuncias en contrato: {result.totalDenuncias}
                      </Text>
                    )}
                    
                    {result.error && (
                      <Code fontSize="xs" colorScheme="red" p={2}>
                        {result.error}
                      </Code>
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
              Si todos los RPCs fallan, puede ser un problema de CORS en producción o conectividad de red.
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  )
}