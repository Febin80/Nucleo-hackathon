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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,

  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { vercelIPFSProduction } from '../services/vercel-ipfs-production'
import { getIPFSContent } from '../services/ipfs'

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
  source?: string;
}

export const VercelIPFSTest = () => {
  const [testCID, setTestCID] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [customContent, setCustomContent] = useState('{"tipo": "test", "mensaje": "Prueba de contenido personalizado", "timestamp": "' + new Date().toISOString() + '"}')
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const runVercelTest = async () => {
    setLoading(true)
    setResults([])
    setProgress(0)

    const testResults: TestResult[] = []

    try {
      // Test 1: Conectividad del servicio Vercel Production
      setProgress(15)
      console.log('🧪 Test 1: Conectividad Vercel Production...')
      const startTime1 = Date.now()
      const connectivity = await vercelIPFSProduction.testConnection()
      const duration1 = Date.now() - startTime1
      
      testResults.push({
        name: 'Conectividad Vercel Production',
        status: connectivity ? 'success' : 'error',
        message: connectivity ? 'Servicio funcionando correctamente' : 'Servicio no disponible',
        duration: duration1
      })

      // Test 2: Obtener contenido de CID conocido
      setProgress(30)
      console.log('🧪 Test 2: Obtener contenido de CID conocido...')
      const startTime2 = Date.now()
      try {
        const knownResult = await vercelIPFSProduction.getContent(testCID)
        const duration2 = Date.now() - startTime2
        
        testResults.push({
          name: 'Obtener CID Conocido',
          status: knownResult.success ? 'success' : 'error',
          message: knownResult.success ? `Contenido obtenido (${knownResult.source})` : 'Error obteniendo contenido',
          details: knownResult.content ? `Tamaño: ${knownResult.content.length} chars` : knownResult.error,
          duration: duration2,
          source: knownResult.source
        })
      } catch (error) {
        const duration2 = Date.now() - startTime2
        testResults.push({
          name: 'Obtener CID Conocido',
          status: 'error',
          message: 'Error en la prueba',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration2
        })
      }

      // Test 3: Obtener contenido via servicio principal
      setProgress(45)
      console.log('🧪 Test 3: Servicio principal IPFS...')
      const startTime3 = Date.now()
      try {
        const mainContent = await getIPFSContent(testCID)
        const duration3 = Date.now() - startTime3
        
        testResults.push({
          name: 'Servicio Principal IPFS',
          status: mainContent ? 'success' : 'error',
          message: mainContent ? 'Contenido obtenido exitosamente' : 'No se pudo obtener contenido',
          details: mainContent ? `Tamaño: ${mainContent.length} chars` : 'Sin contenido',
          duration: duration3
        })
      } catch (error) {
        const duration3 = Date.now() - startTime3
        testResults.push({
          name: 'Servicio Principal IPFS',
          status: 'error',
          message: 'Error en servicio principal',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration3
        })
      }

      // Test 4: Probar CID inexistente (debe generar contenido)
      setProgress(60)
      console.log('🧪 Test 4: CID inexistente...')
      const fakeCID = 'QmFakeHashThatDoesNotExist123456789012345678'
      const startTime4 = Date.now()
      try {
        const fakeResult = await vercelIPFSProduction.getContent(fakeCID)
        const duration4 = Date.now() - startTime4
        
        testResults.push({
          name: 'CID Inexistente',
          status: fakeResult.success ? 'success' : 'warning',
          message: fakeResult.success ? `Contenido generado (${fakeResult.source})` : 'No se pudo generar contenido',
          details: fakeResult.content ? `Contenido generado automáticamente` : 'Sin contenido generado',
          duration: duration4,
          source: fakeResult.source
        })
      } catch (error) {
        const duration4 = Date.now() - startTime4
        testResults.push({
          name: 'CID Inexistente',
          status: 'error',
          message: 'Error procesando CID inexistente',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration4
        })
      }

      // Test 5: Estadísticas del cache
      setProgress(75)
      console.log('🧪 Test 5: Estadísticas del cache...')
      const startTime5 = Date.now()
      const stats = vercelIPFSProduction.getCacheStats()
      const duration5 = Date.now() - startTime5
      
      testResults.push({
        name: 'Estadísticas del Cache',
        status: 'success',
        message: `${stats.totalItems} elementos en cache`,
        details: `Tamaño total: ${Math.round(stats.totalSize / 1024)} KB, Entrada más antigua: ${stats.oldestEntry || 'N/A'}`,
        duration: duration5
      })

      // Test 6: Rendimiento con múltiples CIDs
      setProgress(90)
      console.log('🧪 Test 6: Rendimiento múltiple...')
      const testCIDs = [
        'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
        'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
      ]
      
      const startTime6 = Date.now()
      const multiplePromises = testCIDs.map(cid => vercelIPFSProduction.getContent(cid))
      const multipleResults = await Promise.allSettled(multiplePromises)
      const duration6 = Date.now() - startTime6
      
      const multipleSuccessCount = multipleResults.filter(r => r.status === 'fulfilled' && r.value.success).length
      
      testResults.push({
        name: 'Rendimiento Múltiple',
        status: multipleSuccessCount === testCIDs.length ? 'success' : multipleSuccessCount > 0 ? 'warning' : 'error',
        message: `${multipleSuccessCount}/${testCIDs.length} CIDs procesados exitosamente`,
        details: `Tiempo total: ${duration6}ms, Promedio: ${Math.round(duration6 / testCIDs.length)}ms por CID`,
        duration: duration6
      })

      setProgress(100)
      setResults(testResults)

      // Mostrar resultado final
      const finalSuccessCount = testResults.filter(r => r.status === 'success').length
      const warningCount = testResults.filter(r => r.status === 'warning').length
      const errorCount = testResults.filter(r => r.status === 'error').length

      toast({
        title: '🧪 Prueba Vercel completada',
        description: `✅ ${finalSuccessCount} | ⚠️ ${warningCount} | ❌ ${errorCount}`,
        status: errorCount === 0 ? 'success' : warningCount > 0 ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en prueba Vercel:', error)
      toast({
        title: 'Error en prueba Vercel',
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
    vercelIPFSProduction.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache de Vercel Production ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const testCustomContent = async () => {
    if (!customContent.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa contenido personalizado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      // Simular subida de contenido personalizado
      const mockCID = 'QmCustomContent' + Date.now().toString(36)
      
      // Almacenar temporalmente
      localStorage.setItem('vercel_prod_' + mockCID, JSON.stringify({
        content: customContent,
        timestamp: Date.now(),
        cid: mockCID
      }))

      // Obtener el contenido
      const result = await vercelIPFSProduction.getContent(mockCID)
      
      if (result.success) {
        toast({
          title: '✅ Contenido personalizado procesado',
          description: `Fuente: ${result.source}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error procesando contenido',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
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
    <Box p={6} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="purple.700" mb={2}>
            🚀 Prueba Específica para Vercel
          </Text>
          <Text fontSize="sm" color="purple.600">
            Herramienta especializada para probar IPFS en el entorno de producción de Vercel
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
            <Input
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              size="sm"
              bg="white"
              placeholder='{"tipo": "test", "mensaje": "contenido personalizado"}'
            />
          </FormControl>
        </VStack>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runVercelTest}
            isLoading={loading}
            loadingText="Probando..."
            colorScheme="purple"
            size="lg"
            flex={1}
          >
            🧪 Ejecutar Prueba Vercel
          </Button>
          <Button
            onClick={testCustomContent}
            variant="outline"
            colorScheme="blue"
            size="lg"
          >
            📝 Probar Personalizado
          </Button>
          <Button
            onClick={clearCache}
            variant="outline"
            colorScheme="gray"
            size="lg"
          >
            🗑️ Limpiar
          </Button>
        </HStack>

        {loading && (
          <Box>
            <Text fontSize="sm" mb={2} textAlign="center" color="purple.700">
              Ejecutando pruebas específicas para Vercel...
            </Text>
            <Progress value={progress} colorScheme="purple" size="lg" />
          </Box>
        )}

        {results.length > 0 && (
          <VStack spacing={4} align="stretch">
            {/* Resumen */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
              <Text fontWeight="bold" fontSize="md" color="purple.700" mb={3}>
                📊 Resumen de Pruebas Vercel:
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
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Text fontWeight="semibold">Resultados Detallados</Text>
                      <Badge colorScheme="purple">{results.length} pruebas</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
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
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">
                💡 Esta prueba está optimizada específicamente para el entorno de Vercel.
                Verifica gateways, proxies CORS, cache local y generación de contenido de respaldo.
              </Text>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}