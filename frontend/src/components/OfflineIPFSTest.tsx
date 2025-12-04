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
  useToast,
  Input,
  FormControl,
  FormLabel,

  Progress,
  Code,
  List,
  ListItem,
  ListIcon,
  Textarea
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { offlineIPFSComplete } from '../services/ipfs-offline-complete'
import { getIPFSContent } from '../services/ipfs'

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
  source?: string;
}

export const OfflineIPFSTest = () => {
  const [testCID, setTestCID] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [customContent, setCustomContent] = useState('{"tipo": "test_offline", "mensaje": "Prueba del sistema completamente offline", "timestamp": "' + new Date().toISOString() + '"}')
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [contentPreview, setContentPreview] = useState<string>('')
  const toast = useToast()

  const runOfflineTest = async () => {
    setLoading(true)
    setResults([])
    setProgress(0)
    setContentPreview('')

    const testResults: TestResult[] = []

    try {
      // Test 1: Conectividad del sistema offline
      setProgress(12)
      console.log('🧪 Test 1: Conectividad sistema offline...')
      const startTime1 = Date.now()
      const connectivity = await offlineIPFSComplete.testConnection()
      const duration1 = Date.now() - startTime1
      
      testResults.push({
        name: 'Conectividad Offline',
        status: connectivity ? 'success' : 'error',
        message: connectivity ? 'Sistema offline funcionando' : 'Error en sistema offline',
        duration: duration1
      })

      // Test 2: Obtener contenido del pool
      setProgress(25)
      console.log('🧪 Test 2: Obtener contenido del pool...')
      const startTime2 = Date.now()
      try {
        const poolResult = await offlineIPFSComplete.getContent(testCID)
        const duration2 = Date.now() - startTime2
        
        testResults.push({
          name: 'Contenido del Pool',
          status: poolResult.success ? 'success' : 'error',
          message: poolResult.success ? `Obtenido (${poolResult.source})` : 'Error obteniendo del pool',
          details: poolResult.content ? `Tamaño: ${poolResult.content.length} chars` : poolResult.error,
          duration: duration2,
          source: poolResult.source
        })

        if (poolResult.success && poolResult.content) {
          setContentPreview(poolResult.content.slice(0, 500) + '...')
        }
      } catch (error) {
        const duration2 = Date.now() - startTime2
        testResults.push({
          name: 'Contenido del Pool',
          status: 'error',
          message: 'Error en la prueba',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration2
        })
      }

      // Test 3: Generar contenido para CID inexistente
      setProgress(37)
      console.log('🧪 Test 3: Generar contenido para CID inexistente...')
      const fakeCID = 'QmFakeOfflineTest' + Date.now().toString(36)
      const startTime3 = Date.now()
      try {
        const fakeResult = await offlineIPFSComplete.getContent(fakeCID)
        const duration3 = Date.now() - startTime3
        
        testResults.push({
          name: 'Generación de Contenido',
          status: fakeResult.success ? 'success' : 'warning',
          message: fakeResult.success ? `Generado (${fakeResult.source})` : 'Error generando',
          details: fakeResult.content ? `Contenido generado automáticamente` : 'Sin contenido',
          duration: duration3,
          source: fakeResult.source
        })
      } catch (error) {
        const duration3 = Date.now() - startTime3
        testResults.push({
          name: 'Generación de Contenido',
          status: 'error',
          message: 'Error generando contenido',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration3
        })
      }

      // Test 4: Subir contenido personalizado
      setProgress(50)
      console.log('🧪 Test 4: Subir contenido personalizado...')
      const startTime4 = Date.now()
      try {
        const uploadResult = await offlineIPFSComplete.uploadContent(customContent)
        const duration4 = Date.now() - startTime4
        
        testResults.push({
          name: 'Subida de Contenido',
          status: uploadResult.success ? 'success' : 'error',
          message: uploadResult.success ? `CID: ${uploadResult.cid.slice(0, 10)}...` : 'Error subiendo',
          details: uploadResult.success ? `Contenido almacenado localmente` : uploadResult.error,
          duration: duration4,
          source: uploadResult.source
        })
      } catch (error) {
        const duration4 = Date.now() - startTime4
        testResults.push({
          name: 'Subida de Contenido',
          status: 'error',
          message: 'Error subiendo contenido',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration4
        })
      }

      // Test 5: Integración con servicio principal
      setProgress(62)
      console.log('🧪 Test 5: Integración con servicio principal...')
      const startTime5 = Date.now()
      try {
        const mainContent = await getIPFSContent(testCID)
        const duration5 = Date.now() - startTime5
        
        testResults.push({
          name: 'Servicio Principal',
          status: mainContent ? 'success' : 'error',
          message: mainContent ? 'Integración exitosa' : 'Error en integración',
          details: mainContent ? `Contenido obtenido via servicio principal` : 'Sin contenido',
          duration: duration5
        })
      } catch (error) {
        const duration5 = Date.now() - startTime5
        testResults.push({
          name: 'Servicio Principal',
          status: 'error',
          message: 'Error en servicio principal',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration5
        })
      }

      // Test 6: Estadísticas del sistema
      setProgress(75)
      console.log('🧪 Test 6: Estadísticas del sistema...')
      const startTime6 = Date.now()
      const stats = offlineIPFSComplete.getCacheStats()
      const duration6 = Date.now() - startTime6
      
      testResults.push({
        name: 'Estadísticas del Sistema',
        status: 'success',
        message: `${stats.totalItems} elementos, Pool: ${stats.poolSize}`,
        details: `Tamaño: ${Math.round(stats.totalSize / 1024)} KB, Entrada más antigua: ${stats.oldestEntry || 'N/A'}`,
        duration: duration6
      })

      // Test 7: Rendimiento con múltiples CIDs
      setProgress(87)
      console.log('🧪 Test 7: Rendimiento múltiple...')
      const testCIDs = [
        'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
        'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
        'QmFakeTest1' + Date.now(),
        'QmFakeTest2' + Date.now()
      ]
      
      const startTime7 = Date.now()
      const multiplePromises = testCIDs.map(cid => offlineIPFSComplete.getContent(cid))
      const multipleResults = await Promise.allSettled(multiplePromises)
      const duration7 = Date.now() - startTime7
      
      const multipleSuccessCount = multipleResults.filter(r => r.status === 'fulfilled' && r.value.success).length
      
      testResults.push({
        name: 'Rendimiento Múltiple',
        status: multipleSuccessCount === testCIDs.length ? 'success' : multipleSuccessCount > 0 ? 'warning' : 'error',
        message: `${multipleSuccessCount}/${testCIDs.length} CIDs procesados`,
        details: `Tiempo total: ${duration7}ms, Promedio: ${Math.round(duration7 / testCIDs.length)}ms por CID`,
        duration: duration7
      })

      // Test 8: Simulación de archivo
      setProgress(100)
      console.log('🧪 Test 8: Simulación de archivo...')
      const startTime8 = Date.now()
      try {
        // Crear archivo simulado
        const fakeFile = new File(['contenido de prueba'], 'test.txt', { type: 'text/plain' })
        const fileResult = await offlineIPFSComplete.uploadFile(fakeFile)
        const duration8 = Date.now() - startTime8
        
        testResults.push({
          name: 'Simulación de Archivo',
          status: fileResult.success ? 'success' : 'error',
          message: fileResult.success ? `Archivo simulado: ${fakeFile.name}` : 'Error simulando archivo',
          details: fileResult.success ? `CID: ${fileResult.cid.slice(0, 15)}...` : fileResult.error,
          duration: duration8,
          source: fileResult.source
        })
      } catch (error) {
        const duration8 = Date.now() - startTime8
        testResults.push({
          name: 'Simulación de Archivo',
          status: 'error',
          message: 'Error simulando archivo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration8
        })
      }

      setResults(testResults)

      // Mostrar resultado final
      const finalSuccessCount = testResults.filter(r => r.status === 'success').length
      const warningCount = testResults.filter(r => r.status === 'warning').length
      const errorCount = testResults.filter(r => r.status === 'error').length

      toast({
        title: '🏠 Prueba Offline completada',
        description: `✅ ${finalSuccessCount} | ⚠️ ${warningCount} | ❌ ${errorCount}`,
        status: errorCount === 0 ? 'success' : warningCount > 0 ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en prueba offline:', error)
      toast({
        title: 'Error en prueba offline',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const clearCache = () => {
    offlineIPFSComplete.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache del sistema offline ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="green.500" />
      case 'warning': return <WarningIcon color="yellow.500" />
      case 'error': return <WarningIcon color="red.500" />
      default: return <InfoIcon color="blue.500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      default: return 'blue'
    }
  }

  return (
    <Box p={6} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="orange.700" mb={2}>
            🏠 Prueba Sistema IPFS Offline Completo
          </Text>
          <Text fontSize="sm" color="orange.600">
            Sistema que funciona al 100% sin internet - Pool de contenidos reales + generación automática
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              CID de prueba:
            </FormLabel>
            <Input
              value={testCID}
              onChange={(e) => setTestCID(e.target.value)}
              size="sm"
              bg="white"
              placeholder="Ej: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Contenido personalizado (JSON):
            </FormLabel>
            <Textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              size="sm"
              bg="white"
              rows={3}
              placeholder='{"tipo": "test", "mensaje": "contenido personalizado"}'
            />
          </FormControl>
        </VStack>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runOfflineTest}
            isLoading={loading}
            loadingText="Probando..."
            colorScheme="orange"
            size="lg"
            flex={1}
          >
            🧪 Ejecutar Prueba Offline
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

        {loading && (
          <Box>
            <Text fontSize="sm" mb={2} textAlign="center" color="orange.700">
              Ejecutando pruebas del sistema offline completo...
            </Text>
            <Progress value={progress} colorScheme="orange" size="lg" />
          </Box>
        )}

        {results.length > 0 && (
          <VStack spacing={4} align="stretch">
            {/* Resumen */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="orange.200">
              <Text fontWeight="bold" fontSize="md" color="orange.700" mb={3}>
                📊 Resumen de Pruebas Offline:
              </Text>
              <HStack spacing={4} justify="center">
                <Badge colorScheme="green" p={2}>
                  ✅ {results.filter(r => r.status === 'success').length} Exitosos
                </Badge>
                <Badge colorScheme="yellow" p={2}>
                  ⚠️ {results.filter(r => r.status === 'warning').length} Advertencias
                </Badge>
                <Badge colorScheme="red" p={2}>
                  ❌ {results.filter(r => r.status === 'error').length} Errores
                </Badge>
              </HStack>
            </Box>

            {/* Resultados detallados */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="orange.200">
              <Text fontWeight="bold" fontSize="md" color="orange.700" mb={3}>
                📋 Resultados Detallados:
              </Text>
              <List spacing={3}>
                {results.map((result, index) => (
                  <ListItem key={index}>
                    <HStack align="start" spacing={3}>
                      <ListIcon as={() => getStatusIcon(result.status)} />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="medium" fontSize="sm">
                            {result.name}
                          </Text>
                          <HStack spacing={2}>
                            {result.source && (
                              <Badge colorScheme="blue" fontSize="xs">
                                {result.source}
                              </Badge>
                            )}
                            {result.duration && (
                              <Badge colorScheme="gray" fontSize="xs">
                                {result.duration}ms
                              </Badge>
                            )}
                            <Badge colorScheme={getStatusColor(result.status)} fontSize="xs">
                              {result.message}
                            </Badge>
                          </HStack>
                        </HStack>
                        {result.details && (
                          <Text fontSize="xs" color="gray.600">
                            {result.details}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Vista previa del contenido */}
            {contentPreview && (
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontWeight="bold" fontSize="md" color="orange.700" mb={3}>
                  👁️ Vista Previa del Contenido:
                </Text>
                <Code
                  fontSize="xs"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                  maxH="200px"
                  overflowY="auto"
                  w="100%"
                  display="block"
                >
                  {contentPreview}
                </Code>
              </Box>
            )}

            <Alert status="success" size="sm">
              <AlertIcon />
              <Text fontSize="xs">
                💡 Este sistema offline funciona completamente sin internet.
                Incluye un pool de 5 denuncias reales y genera contenido automáticamente para cualquier CID.
              </Text>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}