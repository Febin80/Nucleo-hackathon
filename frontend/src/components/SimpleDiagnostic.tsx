import { useState } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Badge,
  Code,
  Divider,
  useToast,
  Progress
} from '@chakra-ui/react'
import { simpleIPFS } from '../services/ipfs-simple'

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const SimpleDiagnostic = () => {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const runDiagnostic = async () => {
    setRunning(true)
    setResults([])
    setProgress(0)

    const tests: DiagnosticResult[] = []

    try {
      // Test 1: Validación de CID
      setProgress(20)
      const testCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
      const isValidCID = simpleIPFS.isValidCID(testCID)
      
      tests.push({
        test: 'Validación de CID',
        status: isValidCID ? 'success' : 'error',
        message: isValidCID ? 'CID válido detectado correctamente' : 'Error en validación de CID',
        details: { testCID, isValid: isValidCID }
      })

      // Test 2: Generación de CID mock
      setProgress(40)
      const mockCID = simpleIPFS.generateMockCID()
      const isMockValid = simpleIPFS.isValidCID(mockCID)
      
      tests.push({
        test: 'Generación de CID Mock',
        status: isMockValid ? 'success' : 'error',
        message: isMockValid ? 'CID mock generado correctamente' : 'Error generando CID mock',
        details: { mockCID, isValid: isMockValid }
      })

      // Test 3: Almacenamiento local
      setProgress(60)
      const testData = { test: 'data', timestamp: Date.now() }
      const uploadResult = await simpleIPFS.uploadJSON(testData)
      
      tests.push({
        test: 'Almacenamiento Local',
        status: uploadResult.success ? 'success' : 'error',
        message: uploadResult.success ? 'Datos almacenados correctamente' : 'Error en almacenamiento',
        details: uploadResult
      })

      // Test 4: Recuperación de contenido
      setProgress(80)
      if (uploadResult.success && uploadResult.cid) {
        try {
          const retrievedContent = await simpleIPFS.getContent(uploadResult.cid)
          const parsedContent = JSON.parse(retrievedContent)
          const isCorrect = parsedContent.test === testData.test
          
          tests.push({
            test: 'Recuperación de Contenido',
            status: isCorrect ? 'success' : 'warning',
            message: isCorrect ? 'Contenido recuperado correctamente' : 'Contenido recuperado pero diferente',
            details: { original: testData, retrieved: parsedContent }
          })
        } catch (error) {
          tests.push({
            test: 'Recuperación de Contenido',
            status: 'error',
            message: 'Error recuperando contenido',
            details: { error: error instanceof Error ? error.message : 'Error desconocido' }
          })
        }
      }

      // Test 5: Conectividad IPFS
      setProgress(90)
      const connectivity = await simpleIPFS.testConnection()
      
      tests.push({
        test: 'Conectividad IPFS',
        status: connectivity ? 'success' : 'warning',
        message: connectivity ? 'Conectividad IPFS exitosa' : 'Sin conectividad IPFS (usando modo offline)',
        details: { connected: connectivity }
      })

      // Test 6: Estadísticas del cache
      setProgress(95)
      const cacheStats = simpleIPFS.getCacheStats()
      
      tests.push({
        test: 'Cache Local',
        status: 'success',
        message: `Cache funcionando: ${cacheStats.totalItems} elementos`,
        details: cacheStats
      })

      setProgress(100)
      setResults(tests)

      // Mostrar resumen
      const successCount = tests.filter(t => t.status === 'success').length
      const totalTests = tests.length
      
      toast({
        title: `Diagnóstico completado`,
        description: `${successCount}/${totalTests} pruebas exitosas`,
        status: successCount === totalTests ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      console.error('Error en diagnóstico:', error)
      toast({
        title: 'Error en diagnóstico',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setRunning(false)
      setProgress(0)
    }
  }

  const clearCache = () => {
    simpleIPFS.clearLocalCache()
    toast({
      title: 'Cache limpiado',
      description: 'El cache local ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '🔄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green'
      case 'warning': return 'orange'
      case 'error': return 'red'
      default: return 'blue'
    }
  }

  return (
    <Box p={6} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" color="blue.700" mb={2}>
            🔧 Diagnóstico Simple IPFS
          </Text>
          <Text fontSize="sm" color="blue.600">
            Diagnóstico básico del sistema IPFS simplificado
          </Text>
        </Box>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runDiagnostic}
            isLoading={running}
            loadingText="Ejecutando..."
            colorScheme="blue"
            size="lg"
            flex={1}
          >
            🚀 Ejecutar Diagnóstico
          </Button>
          <Button
            onClick={clearCache}
            variant="outline"
            colorScheme="gray"
            size="lg"
          >
            🗑️ Limpiar Cache
          </Button>
        </HStack>

        {running && (
          <Box>
            <Text fontSize="sm" mb={2} textAlign="center">
              Ejecutando pruebas...
            </Text>
            <Progress value={progress} colorScheme="blue" size="lg" />
          </Box>
        )}

        {results.length > 0 && (
          <>
            <Divider />
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="md" color="blue.700">
                📊 Resultados del Diagnóstico:
              </Text>

              {/* Resumen */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="semibold">Resumen:</Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="green">
                      ✅ {results.filter(r => r.status === 'success').length}
                    </Badge>
                    <Badge colorScheme="orange">
                      ⚠️ {results.filter(r => r.status === 'warning').length}
                    </Badge>
                    <Badge colorScheme="red">
                      ❌ {results.filter(r => r.status === 'error').length}
                    </Badge>
                  </HStack>
                </HStack>

                <VStack align="stretch" spacing={2}>
                  {results.map((result, index) => (
                    <Box
                      key={index}
                      p={3}
                      bg={`${getStatusColor(result.status)}.50`}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={`${getStatusColor(result.status)}.200`}
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Text fontSize="lg">{getStatusIcon(result.status)}</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {result.test}
                          </Text>
                        </HStack>
                        <Badge colorScheme={getStatusColor(result.status)} variant="subtle">
                          {result.status.toUpperCase()}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color={`${getStatusColor(result.status)}.700`} mb={2}>
                        {result.message}
                      </Text>
                      
                      {result.details && (
                        <Code
                          fontSize="xs"
                          p={2}
                          borderRadius="md"
                          display="block"
                          whiteSpace="pre-wrap"
                          bg={`${getStatusColor(result.status)}.100`}
                        >
                          {JSON.stringify(result.details, null, 2)}
                        </Code>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="xs">
                  💡 Este diagnóstico verifica el funcionamiento básico del sistema IPFS simplificado.
                  En desarrollo, usa almacenamiento local como fallback.
                </Text>
              </Alert>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
}