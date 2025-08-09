import { useState } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Badge,
  Heading,
  Code
} from '@chakra-ui/react'
import { IPFSUploadService } from '../services/ipfs-upload'
import { pinataService } from '../services/pinata'
import { StorageFallbackService } from '../services/storage-fallback'

export const IPFSStatusChecker = () => {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAllServices = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      services: {}
    }

    // Test IPFSUploadService
    try {
      console.log('🧪 Testing IPFSUploadService...')
      const testContent = JSON.stringify({ test: 'content', timestamp: Date.now() })
      const hash = await IPFSUploadService.uploadContent(testContent)
      results.services.ipfsUpload = {
        status: 'SUCCESS',
        hash: hash,
        type: 'real_ipfs'
      }
    } catch (error: any) {
      results.services.ipfsUpload = {
        status: 'FAILED',
        error: error.message,
        type: 'real_ipfs'
      }
    }

    // Test Pinata
    try {
      console.log('🧪 Testing Pinata...')
      const hash = await pinataService.uploadJSON({ test: 'content', timestamp: Date.now() })
      results.services.pinata = {
        status: 'SUCCESS',
        hash: hash,
        type: 'simulated_hash'
      }
    } catch (error: any) {
      results.services.pinata = {
        status: 'FAILED',
        error: error.message,
        type: 'simulated_hash'
      }
    }

    // Test StorageFallback
    try {
      console.log('🧪 Testing StorageFallback...')
      const testContent = StorageFallbackService.createDenunciaContent({
        tipo: 'test',
        descripcion: 'Test content',
        timestamp: new Date().toISOString()
      })
      const hash = StorageFallbackService.storeContent(testContent)
      results.services.storageFallback = {
        status: 'SUCCESS',
        hash: hash,
        type: 'local_storage'
      }
    } catch (error: any) {
      results.services.storageFallback = {
        status: 'FAILED',
        error: error.message,
        type: 'local_storage'
      }
    }

    setStatus(results)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'green'
      case 'FAILED': return 'red'
      default: return 'gray'
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'real_ipfs': return '🌐 IPFS Real'
      case 'simulated_hash': return '🎭 Hash Simulado'
      case 'local_storage': return '🏠 Almacenamiento Local'
      default: return '❓ Desconocido'
    }
  }

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading size="md" mb={4}>🔍 Estado de Servicios IPFS</Heading>
      
      <VStack spacing={4} align="stretch">
        <Button 
          onClick={checkAllServices} 
          isLoading={loading}
          colorScheme="blue"
        >
          Verificar Todos los Servicios
        </Button>
        
        {status && (
          <Box>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Última verificación: {new Date(status.timestamp).toLocaleString()}
            </Text>
            
            {Object.entries(status.services).map(([serviceName, serviceData]: [string, any]) => (
              <Alert key={serviceName} status={serviceData.status === 'SUCCESS' ? 'success' : 'error'} mb={3}>
                <AlertIcon />
                <Box flex="1">
                  <Text fontWeight="bold">
                    {serviceName} - {getTypeDescription(serviceData.type)}
                  </Text>
                  <Badge colorScheme={getStatusColor(serviceData.status)} mr={2}>
                    {serviceData.status}
                  </Badge>
                  
                  {serviceData.hash && (
                    <Code fontSize="xs" display="block" mt={2}>
                      Hash: {serviceData.hash}
                    </Code>
                  )}
                  
                  {serviceData.error && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      Error: {serviceData.error}
                    </Text>
                  )}
                </Box>
              </Alert>
            ))}
          </Box>
        )}
      </VStack>
    </Box>
  )
}