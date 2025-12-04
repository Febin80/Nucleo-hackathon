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
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Divider
} from '@chakra-ui/react'
import { emergencyIPFS } from '../services/ipfs-emergency'

export const IPFSQuickTest = () => {
  const [testContent, setTestContent] = useState('{"tipo": "denuncia_test", "descripcion": "Prueba rápida del sistema IPFS", "timestamp": "' + new Date().toISOString() + '"}')
  const [testCID, setTestCID] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const runQuickTest = async () => {
    setLoading(true)
    setResults(null)

    try {
      console.log('🚀 Iniciando prueba rápida de IPFS...')
      
      const testResults: any = {
        timestamp: new Date().toISOString(),
        tests: []
      }

      // Test 1: Conectividad
      console.log('📡 Test 1: Conectividad...')
      const startTime1 = Date.now()
      const connectivity = await emergencyIPFS.testConnection()
      const duration1 = Date.now() - startTime1
      
      testResults.tests.push({
        name: 'Conectividad',
        success: connectivity,
        duration: duration1,
        message: connectivity ? 'Sistema funcionando' : 'Error de conectividad'
      })

      // Test 2: Subir contenido
      console.log('📤 Test 2: Subir contenido...')
      const startTime2 = Date.now()
      const uploadResult = await emergencyIPFS.uploadContent(testContent)
      const duration2 = Date.now() - startTime2
      
      testResults.tests.push({
        name: 'Subir Contenido',
        success: uploadResult.success,
        duration: duration2,
        message: uploadResult.success ? `CID: ${uploadResult.cid}` : uploadResult.error,
        cid: uploadResult.cid,
        url: uploadResult.url
      })

      // Test 3: Recuperar contenido subido
      if (uploadResult.success && uploadResult.cid) {
        console.log('📥 Test 3: Recuperar contenido subido...')
        const startTime3 = Date.now()
        try {
          const retrievedContent = await emergencyIPFS.getContent(uploadResult.cid)
          const duration3 = Date.now() - startTime3
          
          testResults.tests.push({
            name: 'Recuperar Contenido Subido',
            success: !!retrievedContent,
            duration: duration3,
            message: retrievedContent ? 'Contenido recuperado exitosamente' : 'No se pudo recuperar',
            contentPreview: retrievedContent ? retrievedContent.slice(0, 100) + '...' : null
          })
        } catch (error) {
          const duration3 = Date.now() - startTime3
          testResults.tests.push({
            name: 'Recuperar Contenido Subido',
            success: false,
            duration: duration3,
            message: error instanceof Error ? error.message : 'Error desconocido'
          })
        }
      }

      // Test 4: Recuperar CID existente
      console.log('🔍 Test 4: Recuperar CID existente...')
      const startTime4 = Date.now()
      try {
        const existingContent = await emergencyIPFS.getContent(testCID)
        const duration4 = Date.now() - startTime4
        
        testResults.tests.push({
          name: 'Recuperar CID Existente',
          success: !!existingContent,
          duration: duration4,
          message: existingContent ? 'CID recuperado exitosamente' : 'CID no encontrado',
          contentPreview: existingContent ? existingContent.slice(0, 100) + '...' : null
        })
      } catch (error) {
        const duration4 = Date.now() - startTime4
        testResults.tests.push({
          name: 'Recuperar CID Existente',
          success: false,
          duration: duration4,
          message: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // Test 5: Estadísticas del sistema
      console.log('📊 Test 5: Estadísticas del sistema...')
      const startTime5 = Date.now()
      const stats = emergencyIPFS.getCacheStats()
      const duration5 = Date.now() - startTime5
      
      testResults.tests.push({
        name: 'Estadísticas del Sistema',
        success: true,
        duration: duration5,
        message: `${stats.totalItems} elementos en cache`,
        stats: stats
      })

      // Test 6: URLs de gateway
      console.log('🌐 Test 6: URLs de gateway...')
      const startTime6 = Date.now()
      const urls = emergencyIPFS.getAllGatewayUrls(testCID)
      const bestUrl = emergencyIPFS.getBestGatewayUrl(testCID)
      const duration6 = Date.now() - startTime6
      
      testResults.tests.push({
        name: 'URLs de Gateway',
        success: urls.length > 0,
        duration: duration6,
        message: `${urls.length} gateways disponibles`,
        urls: urls,
        bestUrl: bestUrl
      })

      setResults(testResults)

      // Mostrar resultado
      const successCount = testResults.tests.filter((t: any) => t.success).length
      const totalTests = testResults.tests.length
      
      toast({
        title: '✅ Prueba rápida completada',
        description: `${successCount}/${totalTests} pruebas exitosas`,
        status: successCount === totalTests ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en prueba rápida:', error)
      toast({
        title: 'Error en prueba rápida',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCache = () => {
    emergencyIPFS.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache del sistema de emergencia ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box p={{ base: 4, md: 6 }} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Box textAlign="center">
          <Text 
            fontSize={{ base: "lg", md: "xl" }} 
            fontWeight="bold" 
            color="green.700" 
            mb={2}
            px={{ base: 2, md: 0 }}
          >
            ⚡ Prueba Rápida IPFS
          </Text>
          <Text 
            fontSize={{ base: "xs", md: "sm" }} 
            color="green.600"
            px={{ base: 2, md: 0 }}
          >
            Sistema de emergencia que funciona SIEMPRE - No requiere credenciales
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Contenido de prueba (JSON):
            </FormLabel>
            <Textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              size="sm"
              bg="white"
              rows={3}
            />
          </FormControl>

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
        </VStack>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runQuickTest}
            isLoading={loading}
            loadingText="Probando..."
            colorScheme="green"
            size="lg"
            flex={1}
          >
            🚀 Ejecutar Prueba Rápida
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

        {results && (
          <>
            <Divider />
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="md" color="green.700">
                📊 Resultados de la Prueba:
              </Text>

              {/* Resumen */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="green.200">
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="semibold">Resumen:</Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="green">
                      ✅ {results.tests.filter((t: any) => t.success).length}
                    </Badge>
                    <Badge colorScheme="red">
                      ❌ {results.tests.filter((t: any) => !t.success).length}
                    </Badge>
                  </HStack>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  {results.tests.map((test: any, index: number) => (
                    <Box
                      key={index}
                      p={3}
                      bg={test.success ? 'green.50' : 'red.50'}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={test.success ? 'green.200' : 'red.200'}
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Text fontSize="sm">{test.success ? '✅' : '❌'}</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {test.name}
                          </Text>
                        </HStack>
                        <Badge colorScheme="blue" variant="outline" fontSize="xs">
                          {test.duration}ms
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color={test.success ? 'green.700' : 'red.700'}>
                        {test.message}
                      </Text>

                      {test.cid && (
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          CID: {test.cid}
                        </Text>
                      )}

                      {test.contentPreview && (
                        <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.700">
                            Vista previa: {test.contentPreview}
                          </Text>
                        </Box>
                      )}

                      {test.stats && (
                        <VStack align="start" mt={2} spacing={1}>
                          <Text fontSize="xs" color="gray.600">
                            📊 Elementos en cache: {test.stats.totalItems}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            💾 Tamaño total: {Math.round(test.stats.totalSize / 1024)} KB
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            🔗 CIDs reales: {test.stats.realCIDs}
                          </Text>
                        </VStack>
                      )}

                      {test.urls && (
                        <VStack align="start" mt={2} spacing={1}>
                          <Text fontSize="xs" color="gray.600">
                            🌐 Mejor gateway: {test.bestUrl?.split('/')[2]}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            📡 Gateways disponibles: {test.urls.length}
                          </Text>
                        </VStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Alert status="success" size="sm">
                <AlertIcon />
                <Text fontSize="xs">
                  💡 Este sistema de emergencia funciona incluso sin credenciales de IPFS.
                  Usa CIDs reales del pool verificado y almacenamiento local como respaldo.
                </Text>
              </Alert>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
}