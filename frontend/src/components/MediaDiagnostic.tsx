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
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import { IPFSMediaService } from '../services/ipfs-media'

export const MediaDiagnostic = () => {
  const [testHash, setTestHash] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const toast = useToast()

  const runDiagnostic = async () => {
    if (!testHash.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un hash IPFS válido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setTesting(true)
    setResults(null)

    try {
      console.log(`🔍 Iniciando diagnóstico para hash: ${testHash}`)
      
      // 1. Validar hash
      const isValid = IPFSMediaService.isValidMediaHash(testHash)
      console.log(`✅ Hash válido: ${isValid}`)

      // 2. Obtener URLs disponibles
      const urls = IPFSMediaService.getMediaUrls(testHash)
      console.log(`📊 URLs disponibles: ${urls.length}`)

      // 3. Obtener mejor URL
      const bestUrl = await IPFSMediaService.getBestMediaUrl(testHash)
      console.log(`🎯 Mejor URL: ${bestUrl}`)

      // 4. Obtener información de contenido
      const contentInfo = await IPFSMediaService.getContentInfo(testHash)
      console.log(`📄 Info de contenido:`, contentInfo)

      // 5. Obtener estadísticas del cache
      const cacheStats = IPFSMediaService.getCacheStats()
      console.log(`📈 Estadísticas del cache:`, cacheStats)

      // 6. Probar cada URL individualmente
      const urlTests = await Promise.allSettled(
        urls.slice(0, 5).map(async (url) => {
          try {
            const startTime = Date.now()
            const response = await Promise.race([
              fetch(url, { method: 'HEAD', mode: 'cors' }),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ])
            const responseTime = Date.now() - startTime
            
            return {
              url,
              gateway: url.split('/')[2],
              success: response.ok,
              status: response.status,
              responseTime,
              contentType: response.headers.get('content-type'),
              contentLength: response.headers.get('content-length')
            }
          } catch (error) {
            return {
              url,
              gateway: url.split('/')[2],
              success: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
              responseTime: 9999
            }
          }
        })
      )

      const urlResults = urlTests.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean)

      setResults({
        hash: testHash,
        isValid,
        urls,
        bestUrl,
        contentInfo,
        cacheStats,
        urlResults,
        timestamp: new Date().toISOString()
      })

      toast({
        title: '✅ Diagnóstico completado',
        description: `Probadas ${urlResults.length} URLs`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error)
      toast({
        title: 'Error en diagnóstico',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setTesting(false)
    }
  }

  const clearCache = () => {
    IPFSMediaService.clearCache()
    toast({
      title: '🗑️ Cache limpiado',
      description: 'El cache de URLs ha sido limpiado',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box p={6} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" color="purple.700" mb={2}>
            🔧 Diagnóstico de Multimedia IPFS
          </Text>
          <Text fontSize="sm" color="purple.600">
            Herramienta para diagnosticar problemas con imágenes, videos y PDFs en IPFS
          </Text>
        </Box>

        <VStack spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Hash IPFS a probar:
            </FormLabel>
            <Input
              value={testHash}
              onChange={(e) => setTestHash(e.target.value)}
              placeholder="Ej: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
              size="sm"
              bg="white"
            />
          </FormControl>

          <HStack spacing={3} w="100%">
            <Button
              onClick={runDiagnostic}
              isLoading={testing}
              loadingText="Diagnosticando..."
              colorScheme="purple"
              size="md"
              flex={1}
            >
              🔍 Ejecutar Diagnóstico
            </Button>
            <Button
              onClick={clearCache}
              variant="outline"
              colorScheme="gray"
              size="md"
            >
              🗑️ Limpiar Cache
            </Button>
          </HStack>
        </VStack>

        {results && (
          <>
            <Divider />
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="md" color="purple.700">
                📊 Resultados del Diagnóstico:
              </Text>

              {/* Información básica */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold">Hash:</Text>
                    <Code fontSize="xs" colorScheme="purple">{results.hash}</Code>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold">Válido:</Text>
                    <Badge colorScheme={results.isValid ? 'green' : 'red'}>
                      {results.isValid ? '✅ Sí' : '❌ No'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold">URLs disponibles:</Text>
                    <Badge colorScheme="blue">{results.urls.length}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold">Mejor gateway:</Text>
                    <Badge colorScheme="green" fontSize="xs">
                      {results.bestUrl.split('/')[2]}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Información de contenido */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
                <Text fontSize="sm" fontWeight="semibold" mb={3}>📄 Información de Contenido:</Text>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Tipo:</Text>
                    <Code fontSize="xs">{results.contentInfo.contentType}</Code>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Tamaño:</Text>
                    <Text fontSize="sm">{results.contentInfo.size ? `${Math.round(results.contentInfo.size / 1024)} KB` : 'N/A'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Accesible:</Text>
                    <Badge colorScheme={results.contentInfo.isAccessible ? 'green' : 'red'}>
                      {results.contentInfo.isAccessible ? '✅ Sí' : '❌ No'}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Estadísticas del cache */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
                <Text fontSize="sm" fontWeight="semibold" mb={3}>📈 Estadísticas del Cache:</Text>
                <HStack spacing={4}>
                  <Badge colorScheme="green">URLs funcionando: {results.cacheStats.workingUrls}</Badge>
                  <Badge colorScheme="red">URLs fallidas: {results.cacheStats.failedUrls}</Badge>
                  <Badge colorScheme="blue">Gateways: {results.cacheStats.gateways}</Badge>
                </HStack>
              </Box>

              {/* Resultados de URLs */}
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
                <Text fontSize="sm" fontWeight="semibold" mb={3}>🌐 Prueba de Gateways:</Text>
                <VStack spacing={3} align="stretch">
                  {results.urlResults.map((result: any, index: number) => (
                    <Box
                      key={index}
                      p={3}
                      bg={result.success ? 'green.50' : 'red.50'}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={result.success ? 'green.200' : 'red.200'}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge 
                          colorScheme={result.success ? 'green' : 'red'}
                          fontSize="xs"
                        >
                          {result.gateway}
                        </Badge>
                        <HStack spacing={2}>
                          {result.success && (
                            <>
                              <Badge colorScheme="blue" fontSize="xs">
                                {result.responseTime}ms
                              </Badge>
                              <Badge colorScheme="purple" fontSize="xs">
                                HTTP {result.status}
                              </Badge>
                            </>
                          )}
                        </HStack>
                      </HStack>
                      
                      {result.success ? (
                        <VStack align="stretch" spacing={1}>
                          {result.contentType && (
                            <Text fontSize="xs" color="green.700">
                              📄 Tipo: {result.contentType}
                            </Text>
                          )}
                          {result.contentLength && (
                            <Text fontSize="xs" color="green.700">
                              📏 Tamaño: {Math.round(parseInt(result.contentLength) / 1024)} KB
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        <Text fontSize="xs" color="red.700">
                          ❌ Error: {result.error}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="xs">
                  💡 Este diagnóstico ayuda a identificar qué gateways IPFS funcionan mejor para tu contenido multimedia.
                </Text>
              </Alert>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
}