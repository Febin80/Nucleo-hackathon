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
  ListIcon,
  Code,
  Divider
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { vercelCIDFix } from '../services/vercel-cid-fix'

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
  source?: string;
  content?: string;
}

export const CIDFixTest = () => {
  const [testCID, setTestCID] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [customCID, setCustomCID] = useState('')
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [contentPreview, setContentPreview] = useState<string>('')
  const toast = useToast()

  const runCIDFixTest = async () => {
    setLoading(true)
    setResults([])
    setProgress(0)
    setContentPreview('')

    const testResults: TestResult[] = []

    try {
      // Test 1: Conectividad del servicio
      setProgress(15)
      console.log('🧪 Test 1: Conectividad CID Fix...')
      const startTime1 = Date.now()
      const connectivity = await vercelCIDFix.testConnection()
      const duration1 = Date.now() - startTime1
      
      testResults.push({
        name: 'Conectividad CID Fix',
        status: connectivity ? 'success' : 'error',
        message: connectivity ? 'Servicio funcionando correctamente' : 'Servicio no disponible',
        duration: duration1
      })

      // Test 2: CID del pool real
      setProgress(30)
      console.log('🧪 Test 2: CID del pool real...')
      const startTime2 = Date.now()
      try {
        const poolResult = await vercelCIDFix.getContentWithFix(testCID)
        const duration2 = Date.now() - startTime2
        
        testResults.push({
          name: 'CID del Pool Real',
          status: poolResult.success ? 'success' : 'error',
          message: poolResult.success ? `Contenido obtenido (${poolResult.source})` : 'Error obteniendo contenido',
          details: poolResult.content ? `Tamaño: ${poolResult.content.length} chars` : 'Sin contenido',
          duration: duration2,
          source: poolResult.source,
          content: poolResult.content?.slice(0, 200) + '...'
        })

        if (poolResult.success && poolResult.content) {
          setContentPreview(poolResult.content)
        }
      } catch (error) {
        const duration2 = Date.now() - startTime2
        testResults.push({
          name: 'CID del Pool Real',
          status: 'error',
          message: 'Error en la prueba',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration2
        })
      }

      // Test 3: CID inexistente (debe generar contenido)
      setProgress(45)
      console.log('🧪 Test 3: CID inexistente...')
      const fakeCID = 'QmFakeHashThatDoesNotExist123456789012345678'
      const startTime3 = Date.now()
      try {
        const fakeResult = await vercelCIDFix.getContentWithFix(fakeCID)
        const duration3 = Date.now() - startTime3
        
        testResults.push({
          name: 'CID Inexistente',
          status: fakeResult.success ? 'success' : 'warning',
          message: fakeResult.success ? `Contenido generado (${fakeResult.source})` : 'No se pudo generar contenido',
          details: fakeResult.content ? `Contenido generado automáticamente` : 'Sin contenido generado',
          duration: duration3,
          source: fakeResult.source
        })
      } catch (error) {
        const duration3 = Date.now() - startTime3
        testResults.push({
          name: 'CID Inexistente',
          status: 'error',
          message: 'Error procesando CID inexistente',
          details: error instanceof Error ? error.message : 'Error desconocido',
          duration: duration3
        })
      }

      // Test 4: CID personalizado si se proporciona
      if (customCID.trim()) {
        setProgress(60)
        console.log('🧪 Test 4: CID personalizado...')
        const startTime4 = Date.now()
        try {
          const customResult = await vercelCIDFix.getContentWithFix(customCID.trim())
          const duration4 = Date.now() - startTime4
          
          testResults.push({
            name: 'CID Personalizado',
            status: customResult.success ? 'success' : 'error',
            message: customResult.success ? `Contenido obtenido (${customResult.source})` : 'Error con CID personalizado',
            details: customResult.content ? `Tamaño: ${customResult.content.length} chars` : 'Sin contenido',
            duration: duration4,
            source: customResult.source
          })
        } catch (error) {
          const duration4 = Date.now() - startTime4
          testResults.push({
            name: 'CID Personalizado',
            status: 'error',
            message: 'Error procesando CID personalizado',
            details: error instanceof Error ? error.message : 'Error desconocido',
            duration: duration4
          })
        }
      }

      // Test 5: Rendimiento con múltiples CIDs
      setProgress(75)
      console.log('🧪 Test 5: Rendimiento múltiple...')
      const testCIDs = [
        'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
        'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
      ]
      
      const startTime5 = Date.now()
      const multiplePromises = testCIDs.map(cid => vercelCIDFix.getContentWithFix(cid))
      const multipleResults = await Promise.allSettled(multiplePromises)
      const duration5 = Date.now() - startTime5
      
      const multipleSuccessCount = multipleResults.filter(r => r.status === 'fulfilled' && r.value.success).length
      
      testResults.push({
        name: 'Rendimiento Múltiple',
        status: multipleSuccessCount === testCIDs.length ? 'success' : multipleSuccessCount > 0 ? 'warning' : 'error',
        message: `${multipleSuccessCount}/${testCIDs.length} CIDs procesados exitosamente`,
        details: `Tiempo total: ${duration5}ms, Promedio: ${Math.round(duration5 / testCIDs.length)}ms por CID`,
        duration: duration5
      })

      // Test 6: Verificar cache
      setProgress(90)
      console.log('🧪 Test 6: Verificación de cache...')
      const startTime6 = Date.now()
      
      // Hacer la misma consulta dos veces para verificar cache
      await vercelCIDFix.getContentWithFix(testCID)
      const cachedResult = await vercelCIDFix.getContentWithFix(testCID)
      const duration6 = Date.now() - startTime6
      
      testResults.push({
        name: 'Verificación de Cache',
        status: cachedResult.success && cachedResult.source === 'cache' ? 'success' : 'warning',
        message: cachedResult.source === 'cache' ? 'Cache funcionando correctamente' : 'Cache no utilizado',
        details: `Segunda consulta: ${cachedResult.source}`,
        duration: duration6
      })

      setProgress(100)
      setResults(testResults)

      // Mostrar resultado final
      const finalSuccessCount = testResults.filter(r => r.status === 'success').length
      const warningCount = testResults.filter(r => r.status === 'warning').length
      const errorCount = testResults.filter(r => r.status === 'error').length

      toast({
        title: '🔧 Prueba CID Fix completada',
        description: `✅ ${finalSuccessCount} | ⚠️ ${warningCount} | ❌ ${errorCount}`,
        status: errorCount === 0 ? 'success' : warningCount > 0 ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en prueba CID Fix:', error)
      toast({
        title: 'Error en prueba CID Fix',
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
    vercelCIDFix.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache de CID Fix ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const testQuickCID = async (cid: string) => {
    try {
      const result = await vercelCIDFix.getContentWithFix(cid)
      
      if (result.success) {
        setContentPreview(result.content)
        toast({
          title: '✅ CID procesado',
          description: `Fuente: ${result.source}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error procesando CID',
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
    <Box p={6} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="orange.700" mb={2}>
            🔧 Corrección de CIDs para Vercel
          </Text>
          <Text fontSize="sm" color="orange.600">
            Herramienta especializada para garantizar que todos los CIDs muestren contenido en Vercel
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              CID de prueba (del pool real):
            </FormLabel>
            <HStack>
              <Input
                value={testCID}
                onChange={(e) => setTestCID(e.target.value)}
                size="sm"
                bg="white"
                placeholder="Ej: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
              />
              <Button
                onClick={() => testQuickCID(testCID)}
                size="sm"
                colorScheme="orange"
                variant="outline"
              >
                🚀 Probar
              </Button>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              CID personalizado (opcional):
            </FormLabel>
            <HStack>
              <Input
                value={customCID}
                onChange={(e) => setCustomCID(e.target.value)}
                size="sm"
                bg="white"
                placeholder="Ingresa cualquier CID para probar"
              />
              <Button
                onClick={() => testQuickCID(customCID)}
                size="sm"
                colorScheme="blue"
                variant="outline"
                isDisabled={!customCID.trim()}
              >
                🧪 Probar
              </Button>
            </HStack>
          </FormControl>
        </VStack>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runCIDFixTest}
            isLoading={loading}
            loadingText="Probando..."
            colorScheme="orange"
            size="lg"
            flex={1}
          >
            🔧 Ejecutar Prueba Completa
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
              Ejecutando corrección de CIDs para Vercel...
            </Text>
            <Progress value={progress} colorScheme="orange" size="lg" />
          </Box>
        )}

        {contentPreview && (
          <Box>
            <Text fontWeight="bold" fontSize="md" color="orange.700" mb={3}>
              📄 Vista Previa del Contenido:
            </Text>
            <Box
              bg="white"
              p={4}
              borderRadius="md"
              border="1px solid"
              borderColor="orange.200"
              maxH="300px"
              overflowY="auto"
            >
              <Code
                fontSize="xs"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                color="gray.700"
              >
                {contentPreview}
              </Code>
            </Box>
          </Box>
        )}

        {results.length > 0 && (
          <VStack spacing={4} align="stretch">
            {/* Resumen */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="orange.200">
              <Text fontWeight="bold" fontSize="md" color="orange.700" mb={3}>
                📊 Resumen de Corrección CID:
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
                      <Badge colorScheme="orange">{results.length} pruebas</Badge>
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
                            {result.content && (
                              <>
                                <Divider />
                                <Box w="100%" bg="gray.50" p={2} borderRadius="md">
                                  <Text fontSize="xs" color="gray.700" fontFamily="mono">
                                    {result.content}
                                  </Text>
                                </Box>
                              </>
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
                💡 Este servicio garantiza que TODOS los CIDs muestren contenido en Vercel,
                usando contenido real cuando está disponible y generando contenido realista como respaldo.
              </Text>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}