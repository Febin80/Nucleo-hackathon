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
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon, TimeIcon } from '@chakra-ui/icons'
import { onlineIPFSReal } from '../services/ipfs-online-real'
import { getIPFSContent } from '../services/ipfs'

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
  source?: string;
  gateway?: string;
}

export const OnlineIPFSTest = () => {
  const [testCID, setTestCID] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [customContent, setCustomContent] = useState('{"tipo": "test_online", "mensaje": "Prueba del sistema IPFS online real", "timestamp": "' + new Date().toISOString() + '"}')
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [contentPreview, setContentPreview] = useState<string>('')
  const [gatewayStats, setGatewayStats] = useState<any>(null)
  const toast = useToast()

  const runOnlineTest = async () => {
    setLoading(true)
    setResults([])
    setProgress(0)
    setContentPreview('')
    setGatewayStats(null)

    const testResults: TestResult[] = []

    try {
      // Test 1: Conectividad del sistema online
      setProgress(10)
      console.log('🧪 Test 1: Conectividad sistema online...')
      const startTime1 = Date.now()
      const connectivity = await onlineIPFSReal.testConnection()
      const duration1 = Date.now() - startTime1
      
      testResults.push({
        name: 'Conectividad Online',
        status: connectivity ? 'success' : 'error',
        message: connectivity ? 'Gateways online funcionando' : 'Sin conectividad online',
        duration: duration1
      })

      // Test 2: Obtener estadísticas de gateways
      setProgress(20)
      console.log('🧪 Test 2: Estadísticas de gateways...')
      const startTime2 = Date.now()
      const stats = onlineIPFSReal.getStats()
      const duration2 = Date.now() - startTime2
      setGatewayStats(stats)
      
      testResults.push({
        name: 'Estadísticas de Gateways',
        status: stats.workingGateways > 0 ? 'success' : 'warning',
        message: `${stats.workingGateways}/${stats.totalGateways} gateways funcionando`,
        details: `Cache: ${stats.cacheItems} elementos, Último test: ${stats.lastTest || 'Nunca'}`,
        duration: duration2
      })

      // Test 3: Obtener contenido de CID conocido
      setProgress(35)
      console.log('🧪 Test 3: Obtener contenido de CID conocido...')
      const startTime3 = Date.now()
      try {
        const knownResult = await onlineIPFSReal.getContent(testCID)
        const duration3 = Date.now() - startTime3
        
        testResults.push({
          name: 'Obtener CID Conocido',
          status: knownResult.success ? 'success' : 'error',
          message: knownResult.success ? `Obtenido (${knownResult.source})` : 'Error obteniendo contenido',
          details: knownResult.success ? 
            `Gateway: ${knownResult.gateway}, Tiempo: ${knownResult.responseTime}ms, Tamaño: ${knownResult.content.length} chars` : 
            knownResult.error,
          duration: duration3,
          source: knownResult.source,
          gateway: knownResult.gateway
        })

        if (knownResult.success && knownResult.content) {
          setContentPreview(knownResult.content.slice(0, 500) + '...')
        }
      } catch (error) {
        const duration3 = Date.now() - startTime3
        testResults.push({
          name: 'Obtener CID Conocido',
          status: 'error',
          message: 'Error en la prueba',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration3
        })
      }

      // Test 4: Obtener contenido via servicio principal
      setProgress(50)
      console.log('🧪 Test 4: Servicio principal IPFS...')
      const startTime4 = Date.now()
      try {
        const mainContent = await getIPFSContent(testCID)
        const duration4 = Date.now() - startTime4
        
        testResults.push({
          name: 'Servicio Principal IPFS',
          status: mainContent ? 'success' : 'error',
          message: mainContent ? 'Contenido obtenido exitosamente' : 'No se pudo obtener contenido',
          details: mainContent ? `Tamaño: ${mainContent.length} chars` : 'Sin contenido',
          duration: duration4
        })
      } catch (error) {
        const duration4 = Date.now() - startTime4
        testResults.push({
          name: 'Servicio Principal IPFS',
          status: 'error',
          message: 'Error en servicio principal',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration4
        })
      }

      // Test 5: Probar CID inexistente
      setProgress(65)
      console.log('🧪 Test 5: CID inexistente...')
      const fakeCID = 'QmFakeOnlineTest' + Date.now().toString(36) + 'NotExist123456789'
      const startTime5 = Date.now()
      try {
        const fakeResult = await onlineIPFSReal.getContent(fakeCID)
        const duration5 = Date.now() - startTime5
        
        testResults.push({
          name: 'CID Inexistente',
          status: fakeResult.success ? 'warning' : 'success',
          message: fakeResult.success ? 'Contenido obtenido (inesperado)' : 'CID no encontrado (esperado)',
          details: fakeResult.success ? 'El CID inexistente devolvió contenido' : 'Comportamiento correcto para CID inexistente',
          duration: duration5,
          source: fakeResult.source
        })
      } catch (error) {
        const duration5 = Date.now() - startTime5
        testResults.push({
          name: 'CID Inexistente',
          status: 'success',
          message: 'CID no encontrado (correcto)',
          details: 'Comportamiento esperado para CID inexistente',
          duration: duration5
        })
      }

      // Test 6: Rendimiento con múltiples CIDs
      setProgress(80)
      console.log('🧪 Test 6: Rendimiento múltiple...')
      const testCIDs = [
        'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
        'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
      ]
      
      const startTime6 = Date.now()
      const multiplePromises = testCIDs.map(cid => onlineIPFSReal.getContent(cid))
      const multipleResults = await Promise.allSettled(multiplePromises)
      const duration6 = Date.now() - startTime6
      
      const multipleSuccessCount = multipleResults.filter(r => r.status === 'fulfilled' && r.value.success).length
      
      testResults.push({
        name: 'Rendimiento Múltiple',
        status: multipleSuccessCount === testCIDs.length ? 'success' : multipleSuccessCount > 0 ? 'warning' : 'error',
        message: `${multipleSuccessCount}/${testCIDs.length} CIDs procesados`,
        details: `Tiempo total: ${duration6}ms, Promedio: ${Math.round(duration6 / testCIDs.length)}ms por CID`,
        duration: duration6
      })

      // Test 7: Actualizar gateways funcionales
      setProgress(95)
      console.log('🧪 Test 7: Actualizar gateways funcionales...')
      const startTime7 = Date.now()
      try {
        await onlineIPFSReal.updateWorkingGateways()
        const duration7 = Date.now() - startTime7
        const updatedStats = onlineIPFSReal.getStats()
        
        testResults.push({
          name: 'Actualizar Gateways',
          status: 'success',
          message: `Gateways actualizados: ${updatedStats.workingGateways}/${updatedStats.totalGateways}`,
          details: `Proceso completado en ${duration7}ms`,
          duration: duration7
        })
        
        setGatewayStats(updatedStats)
      } catch (error) {
        const duration7 = Date.now() - startTime7
        testResults.push({
          name: 'Actualizar Gateways',
          status: 'warning',
          message: 'Error actualizando gateways',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration7
        })
      }

      setProgress(100)
      setResults(testResults)

      // Mostrar resultado final
      const finalSuccessCount = testResults.filter(r => r.status === 'success').length
      const warningCount = testResults.filter(r => r.status === 'warning').length
      const errorCount = testResults.filter(r => r.status === 'error').length

      toast({
        title: '🌐 Prueba Online completada',
        description: `✅ ${finalSuccessCount} | ⚠️ ${warningCount} | ❌ ${errorCount}`,
        status: errorCount === 0 ? 'success' : warningCount > 0 ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en prueba online:', error)
      toast({
        title: 'Error en prueba online',
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
    onlineIPFSReal.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache del sistema online ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const updateGateways = async () => {
    try {
      await onlineIPFSReal.updateWorkingGateways()
      const stats = onlineIPFSReal.getStats()
      setGatewayStats(stats)
      
      toast({
        title: '🔄 Gateways actualizados',
        description: `${stats.workingGateways}/${stats.totalGateways} gateways funcionando`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error actualizando gateways',
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
    <Box p={6} bg="cyan.50" borderRadius="lg" border="1px solid" borderColor="cyan.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="cyan.700" mb={2}>
            🌐 Prueba Sistema IPFS Online Real
          </Text>
          <Text fontSize="sm" color="cyan.600">
            Sistema que usa gateways IPFS públicos reales - Requiere conectividad a internet
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
            onClick={runOnlineTest}
            isLoading={loading}
            loadingText="Probando..."
            colorScheme="cyan"
            size="lg"
            flex={1}
          >
            🧪 Ejecutar Prueba Online
          </Button>
          <Button
            onClick={updateGateways}
            variant="outline"
            colorScheme="blue"
            size="lg"
          >
            🔄 Actualizar Gateways
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
            <Text fontSize="sm" mb={2} textAlign="center" color="cyan.700">
              Ejecutando pruebas del sistema online real...
            </Text>
            <Progress value={progress} colorScheme="cyan" size="lg" />
          </Box>
        )}

        {results.length > 0 && (
          <VStack spacing={4} align="stretch">
            {/* Resumen */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="cyan.200">
              <Text fontWeight="bold" fontSize="md" color="cyan.700" mb={3}>
                📊 Resumen de Pruebas Online:
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

            {/* Estadísticas de gateways */}
            {gatewayStats && (
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="cyan.200">
                <Text fontWeight="bold" fontSize="md" color="cyan.700" mb={3}>
                  🌐 Estadísticas de Gateways:
                </Text>
                <HStack spacing={4} justify="center" flexWrap="wrap">
                  <Badge colorScheme="blue" p={2}>
                    📡 Total: {gatewayStats.totalGateways}
                  </Badge>
                  <Badge colorScheme="green" p={2}>
                    ✅ Funcionando: {gatewayStats.workingGateways}
                  </Badge>
                  <Badge colorScheme="purple" p={2}>
                    💾 Cache: {gatewayStats.cacheItems}
                  </Badge>
                  {gatewayStats.lastTest && (
                    <Badge colorScheme="gray" p={2}>
                      <TimeIcon mr={1} />
                      {gatewayStats.lastTest}
                    </Badge>
                  )}
                </HStack>
              </Box>
            )}

            {/* Resultados detallados */}
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Text fontWeight="semibold">Resultados Detallados</Text>
                      <Badge colorScheme="cyan">{results.length} pruebas</Badge>
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
                                {result.gateway && (
                                  <Badge colorScheme="purple" fontSize="xs">
                                    {result.gateway}
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

            {/* Vista previa del contenido */}
            {contentPreview && (
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="cyan.200">
                <Text fontWeight="bold" fontSize="md" color="cyan.700" mb={3}>
                  👁️ Vista Previa del Contenido Online:
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

            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">
                💡 Este sistema online usa gateways IPFS públicos reales.
                Requiere conectividad a internet y puede ser más lento que el sistema offline.
              </Text>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}