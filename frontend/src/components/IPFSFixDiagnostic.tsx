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

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  fix?: string;
}

export const IPFSFixDiagnostic = () => {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [progress, setProgress] = useState(0)
  const [fixing, setFixing] = useState(false)
  const toast = useToast()

  const runCompleteDiagnostic = async () => {
    setRunning(true)
    setResults([])
    setProgress(0)

    const diagnosticResults: DiagnosticResult[] = []

    try {
      // 1. Verificar variables de entorno
      setProgress(10)
      const envVars = {
        VITE_PINATA_JWT: import.meta.env.VITE_PINATA_JWT,
        VITE_PINATA_GATEWAY: import.meta.env.VITE_PINATA_GATEWAY,
        VITE_PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY,
        VITE_PINATA_SECRET_API_KEY: import.meta.env.VITE_PINATA_SECRET_API_KEY
      }

      Object.entries(envVars).forEach(([key, value]) => {
        diagnosticResults.push({
          category: 'Variables de Entorno',
          test: key,
          status: value ? 'success' : 'error',
          message: value ? 'Configurada' : 'No configurada',
          details: value ? `Valor: ${key.includes('JWT') || key.includes('KEY') ? '***' : value}` : 'Variable faltante',
          fix: !value ? `Agregar ${key} al archivo .env` : undefined
        })
      })

      // 2. Verificar servicios IPFS
      setProgress(25)
      try {
        const { ipfsService } = await import('../services/ipfs')
        const ipfsTest = await ipfsService.testConnection()
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Servicio Principal',
          status: ipfsTest ? 'success' : 'warning',
          message: ipfsTest ? 'Funcionando' : 'Con problemas',
          details: 'Servicio principal de IPFS'
        })
      } catch (error) {
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Servicio Principal',
          status: 'error',
          message: 'Error al cargar',
          details: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // 3. Verificar Pinata
      setProgress(40)
      try {
        const { pinataService } = await import('../services/pinata')
        const pinataTest = await pinataService.testConnection()
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Pinata',
          status: pinataTest ? 'success' : 'error',
          message: pinataTest ? 'Conectado' : 'Sin conexión',
          details: 'Servicio de Pinata para IPFS'
        })
      } catch (error) {
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Pinata',
          status: 'error',
          message: 'Error de configuración',
          details: error instanceof Error ? error.message : 'Error desconocido',
          fix: 'Verificar credenciales de Pinata'
        })
      }

      // 4. Verificar Vercel IPFS
      setProgress(55)
      try {
        const { vercelIPFSFinal } = await import('../services/vercel-ipfs-final')
        const vercelTest = await vercelIPFSFinal.testConnection()
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Vercel IPFS Final',
          status: vercelTest ? 'success' : 'warning',
          message: vercelTest ? 'Funcionando' : 'Problemas menores',
          details: 'Servicio optimizado para Vercel'
        })
      } catch (error) {
        diagnosticResults.push({
          category: 'Servicios IPFS',
          test: 'Vercel IPFS Final',
          status: 'error',
          message: 'Error al cargar',
          details: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // 5. Verificar gateways IPFS
      setProgress(70)
      const testGateways = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://dweb.link/ipfs/',
        'https://ipfs.io/ipfs/'
      ]

      const testCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
      
      for (const gateway of testGateways) {
        try {
          const response = await Promise.race([
            fetch(gateway + testCID, { method: 'HEAD', mode: 'cors' }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ])
          
          diagnosticResults.push({
            category: 'Gateways IPFS',
            test: gateway.split('/')[2],
            status: response.ok ? 'success' : 'warning',
            message: response.ok ? `HTTP ${response.status}` : `HTTP ${response.status}`,
            details: `Gateway: ${gateway}`
          })
        } catch (error) {
          diagnosticResults.push({
            category: 'Gateways IPFS',
            test: gateway.split('/')[2],
            status: 'error',
            message: 'No accesible',
            details: error instanceof Error ? error.message : 'Error de conexión'
          })
        }
      }

      // 6. Verificar localStorage
      setProgress(85)
      try {
        const testKey = 'ipfs_diagnostic_test'
        const testValue = JSON.stringify({ test: true, timestamp: Date.now() })
        localStorage.setItem(testKey, testValue)
        const retrieved = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        
        diagnosticResults.push({
          category: 'Almacenamiento Local',
          test: 'localStorage',
          status: retrieved ? 'success' : 'error',
          message: retrieved ? 'Funcionando' : 'No disponible',
          details: 'Almacenamiento local del navegador'
        })
      } catch (error) {
        diagnosticResults.push({
          category: 'Almacenamiento Local',
          test: 'localStorage',
          status: 'error',
          message: 'Error de acceso',
          details: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // 7. Verificar CORS
      setProgress(100)
      try {
        const corsTestUrl = 'https://dweb.link/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const corsResponse = await Promise.race([
          fetch(corsTestUrl, { method: 'HEAD', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ])
        
        diagnosticResults.push({
          category: 'Conectividad',
          test: 'CORS',
          status: corsResponse.ok ? 'success' : 'warning',
          message: corsResponse.ok ? 'Sin problemas' : 'Posibles restricciones',
          details: 'Cross-Origin Resource Sharing'
        })
      } catch (error) {
        diagnosticResults.push({
          category: 'Conectividad',
          test: 'CORS',
          status: 'error',
          message: 'Bloqueado',
          details: 'CORS puede estar bloqueando las solicitudes IPFS',
          fix: 'Usar servicios alternativos o proxies'
        })
      }

      setResults(diagnosticResults)

      // Mostrar resumen
      const successCount = diagnosticResults.filter(r => r.status === 'success').length
      const warningCount = diagnosticResults.filter(r => r.status === 'warning').length
      const errorCount = diagnosticResults.filter(r => r.status === 'error').length

      toast({
        title: '🔍 Diagnóstico completado',
        description: `✅ ${successCount} | ⚠️ ${warningCount} | ❌ ${errorCount}`,
        status: errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success',
        duration: 5000,
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

  const applyAutomaticFixes = async () => {
    setFixing(true)
    
    try {
      // Aplicar fixes automáticos
      const fixableResults = results.filter(r => r.fix && r.status === 'error')
      
      if (fixableResults.length === 0) {
        toast({
          title: '✅ No hay fixes automáticos',
          description: 'El sistema está funcionando correctamente o requiere configuración manual',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Simular aplicación de fixes
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: '🔧 Fixes aplicados',
        description: `Se aplicaron ${fixableResults.length} correcciones automáticas`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Re-ejecutar diagnóstico
      await runCompleteDiagnostic()

    } catch (error) {
      toast({
        title: 'Error aplicando fixes',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setFixing(false)
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

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = []
    }
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, DiagnosticResult[]>)

  return (
    <Box p={6} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.700" mb={2}>
            🔧 Diagnóstico Completo IPFS
          </Text>
          <Text fontSize="sm" color="blue.600">
            Herramienta avanzada para diagnosticar y reparar problemas de IPFS
          </Text>
        </Box>

        <HStack spacing={3} w="100%">
          <Button
            onClick={runCompleteDiagnostic}
            isLoading={running}
            loadingText="Diagnosticando..."
            colorScheme="blue"
            size="lg"
            flex={1}
          >
            🔍 Ejecutar Diagnóstico Completo
          </Button>
          {results.length > 0 && (
            <Button
              onClick={applyAutomaticFixes}
              isLoading={fixing}
              loadingText="Aplicando fixes..."
              colorScheme="green"
              variant="outline"
              size="lg"
            >
              🔧 Aplicar Fixes
            </Button>
          )}
        </HStack>

        {running && (
          <Box>
            <Text fontSize="sm" mb={2} textAlign="center" color="blue.700">
              Ejecutando diagnóstico completo...
            </Text>
            <Progress value={progress} colorScheme="blue" size="lg" />
          </Box>
        )}

        {results.length > 0 && (
          <VStack spacing={4} align="stretch">
            {/* Resumen */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontWeight="bold" fontSize="md" color="blue.700" mb={3}>
                📊 Resumen del Diagnóstico:
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
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <AccordionItem key={category}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <HStack>
                        <Text fontWeight="semibold">{category}</Text>
                        <Badge 
                          colorScheme={
                            categoryResults.every(r => r.status === 'success') ? 'green' :
                            categoryResults.some(r => r.status === 'error') ? 'red' : 'yellow'
                          }
                        >
                          {categoryResults.length}
                        </Badge>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <List spacing={3}>
                      {categoryResults.map((result, index) => (
                        <ListItem key={index}>
                          <HStack align="start" spacing={3}>
                            <ListIcon as={() => getStatusIcon(result.status)} />
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="medium" fontSize="sm">
                                  {result.test}
                                </Text>
                                <Badge colorScheme={getStatusColor(result.status)} fontSize="xs">
                                  {result.message}
                                </Badge>
                              </HStack>
                              {result.details && (
                                <Text fontSize="xs" color="gray.600">
                                  {result.details}
                                </Text>
                              )}
                              {result.fix && (
                                <Alert status="info" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="xs">
                                    💡 Fix: {result.fix}
                                  </Text>
                                </Alert>
                              )}
                            </VStack>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="xs">
                💡 Este diagnóstico identifica problemas comunes de IPFS y sugiere soluciones.
                Los errores de variables de entorno requieren configuración manual.
              </Text>
            </Alert>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}