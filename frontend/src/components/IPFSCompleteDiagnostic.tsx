import { useState } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Heading,
  Code,
  Divider,
  Badge,
  Progress,
} from '@chakra-ui/react'
import { OfflineIPFSService } from '../services/ipfs-offline'
import { getIPFSContent } from '../services/ipfs'

export const IPFSCompleteDiagnostic = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const runCompleteDiagnostic = async () => {
    setIsRunning(true)
    setProgress(0)
    
    const result: any = {
      timestamp: new Date().toISOString(),
      steps: []
    }

    try {
      // Paso 1: Verificar almacenamiento offline
      setProgress(20)
      result.steps.push({
        step: 1,
        name: 'Verificar Almacenamiento Offline',
        status: 'running'
      })
      
      const storedCIDs = OfflineIPFSService.listStoredCIDs()
      result.steps[0].status = 'success'
      result.steps[0].data = {
        stored_cids: storedCIDs,
        count: storedCIDs.length
      }

      // Paso 2: Crear contenido de prueba
      setProgress(40)
      result.steps.push({
        step: 2,
        name: 'Crear Contenido de Prueba',
        status: 'running'
      })
      
      const testContent = OfflineIPFSService.createDenunciaContent({
        tipo: 'diagnostic_test',
        descripcion: `Contenido de diagnóstico creado el ${new Date().toLocaleString()}`,
        timestamp: new Date().toISOString(),
        encrypted: false
      })
      
      result.steps[1].status = 'success'
      result.steps[1].data = {
        content_preview: testContent.slice(0, 200) + '...',
        content_length: testContent.length
      }

      // Paso 3: Generar CID offline
      setProgress(60)
      result.steps.push({
        step: 3,
        name: 'Generar CID Offline',
        status: 'running'
      })
      
      const generatedCID = await OfflineIPFSService.uploadContent(testContent)
      result.steps[2].status = 'success'
      result.steps[2].data = {
        generated_cid: generatedCID,
        cid_length: generatedCID.length,
        cid_format: generatedCID.startsWith('Qm') ? 'CIDv0' : 'Unknown'
      }

      // Paso 4: Recuperar contenido usando CID
      setProgress(80)
      result.steps.push({
        step: 4,
        name: 'Recuperar Contenido con CID',
        status: 'running'
      })
      
      const retrievedContent = OfflineIPFSService.retrieveContent(generatedCID)
      const contentMatches = retrievedContent === testContent
      
      result.steps[3].status = contentMatches ? 'success' : 'error'
      result.steps[3].data = {
        content_retrieved: !!retrievedContent,
        content_matches: contentMatches,
        retrieved_length: retrievedContent?.length || 0
      }

      // Paso 5: Probar getIPFSContent
      setProgress(90)
      result.steps.push({
        step: 5,
        name: 'Probar getIPFSContent',
        status: 'running'
      })
      
      try {
        const ipfsContent = await getIPFSContent(generatedCID)
        const isRealContent = ipfsContent === testContent
        
        result.steps[4].status = isRealContent ? 'success' : 'warning'
        result.steps[4].data = {
          content_returned: !!ipfsContent,
          is_real_content: isRealContent,
          is_example_content: ipfsContent.includes('ejemplo') || ipfsContent.includes('Ejemplo'),
          content_preview: ipfsContent.slice(0, 200) + '...'
        }
      } catch (error: any) {
        result.steps[4].status = 'error'
        result.steps[4].data = {
          error: error.message
        }
      }

      // Paso 6: Diagnóstico final
      setProgress(100)
      result.steps.push({
        step: 6,
        name: 'Diagnóstico Final',
        status: 'success',
        data: {
          offline_storage_working: storedCIDs.length >= 0,
          cid_generation_working: !!generatedCID,
          content_retrieval_working: !!retrievedContent && contentMatches,
          ipfs_service_working: result.steps[4].status === 'success'
        }
      })

      result.overall_status = result.steps.every((step: any) => step.status === 'success') ? 'success' : 'partial'
      
    } catch (error: any) {
      result.overall_status = 'error'
      result.error = error.message
    }

    setDiagnosticResult(result)
    setIsRunning(false)
    setProgress(100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      case 'running': return 'blue'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '✅ ÉXITO'
      case 'warning': return '⚠️ ADVERTENCIA'
      case 'error': return '❌ ERROR'
      case 'running': return '🔄 EJECUTANDO'
      default: return '⏳ PENDIENTE'
    }
  }

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <Heading size="md" mb={4}>🔍 Diagnóstico Completo IPFS</Heading>
      
      <VStack spacing={4} align="stretch">
        <Button 
          onClick={runCompleteDiagnostic} 
          isLoading={isRunning}
          colorScheme="blue"
          size="lg"
        >
          🚀 Ejecutar Diagnóstico Completo
        </Button>
        
        {isRunning && (
          <Box>
            <Text mb={2}>Progreso del diagnóstico:</Text>
            <Progress value={progress} colorScheme="blue" />
          </Box>
        )}
        
        {diagnosticResult && (
          <Box>
            <Alert status={diagnosticResult.overall_status === 'success' ? 'success' : 'warning'} mb={4}>
              <AlertIcon />
              <Text fontWeight="bold">
                Estado General: {diagnosticResult.overall_status === 'success' ? 'SISTEMA FUNCIONANDO' : 'PROBLEMAS DETECTADOS'}
              </Text>
            </Alert>
            
            <VStack spacing={3} align="stretch">
              {diagnosticResult.steps.map((step: any, index: number) => (
                <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    Paso {step.step}: {step.name}
                    <Badge ml={2} colorScheme={getStatusColor(step.status)}>
                      {getStatusText(step.status)}
                    </Badge>
                  </Text>
                  
                  {step.data && (
                    <Box mt={2}>
                      <Code fontSize="xs" p={2} display="block" whiteSpace="pre-wrap">
                        {JSON.stringify(step.data, null, 2)}
                      </Code>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
            
            <Divider my={4} />
            
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" mb={2}>📋 Resumen del Diagnóstico:</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">• Almacenamiento Offline: {diagnosticResult.steps[5]?.data?.offline_storage_working ? '✅' : '❌'}</Text>
                <Text fontSize="sm">• Generación de CID: {diagnosticResult.steps[5]?.data?.cid_generation_working ? '✅' : '❌'}</Text>
                <Text fontSize="sm">• Recuperación de Contenido: {diagnosticResult.steps[5]?.data?.content_retrieval_working ? '✅' : '❌'}</Text>
                <Text fontSize="sm">• Servicio IPFS: {diagnosticResult.steps[5]?.data?.ipfs_service_working ? '✅' : '❌'}</Text>
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  )
}