import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Heading,
  Code,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Badge,
  Textarea
} from '@chakra-ui/react'
import { OfflineIPFSService } from '../services/ipfs-offline'

export const OfflineStorageDebug = () => {
  const [storedCIDs, setStoredCIDs] = useState<string[]>([])
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [selectedCID, setSelectedCID] = useState<string | null>(null)

  const refreshStoredCIDs = () => {
    const cids = OfflineIPFSService.listStoredCIDs()
    setStoredCIDs(cids)
    console.log('📋 CIDs almacenados offline:', cids)
  }

  const viewContent = (cid: string) => {
    const content = OfflineIPFSService.retrieveContent(cid)
    setSelectedContent(content)
    setSelectedCID(cid)
    console.log(`👀 Viendo contenido para CID: ${cid}`)
  }

  const clearAllStorage = () => {
    const cleared = OfflineIPFSService.clearOfflineStorage()
    setStoredCIDs([])
    setSelectedContent(null)
    setSelectedCID(null)
    console.log(`🧹 Limpiados ${cleared} elementos`)
  }

  const testStorage = async () => {
    console.log('🧪 Probando almacenamiento offline...')
    
    const testContent = OfflineIPFSService.createDenunciaContent({
      tipo: 'test',
      descripcion: 'Esta es una denuncia de prueba para verificar el almacenamiento',
      timestamp: new Date().toISOString(),
      encrypted: false
    })
    
    try {
      const cid = await OfflineIPFSService.uploadContent(testContent)
      console.log('✅ Test exitoso, CID generado:', cid)
      refreshStoredCIDs()
    } catch (error) {
      console.error('❌ Error en test:', error)
    }
  }

  useEffect(() => {
    refreshStoredCIDs()
  }, [])

  const formatContent = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return content
    }
  }

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <Heading size="md" mb={4}>🔍 Debug Almacenamiento Offline</Heading>
      
      <VStack spacing={4} align="stretch">
        <Box display="flex" gap={2}>
          <Button onClick={refreshStoredCIDs} colorScheme="blue" size="sm">
            🔄 Actualizar Lista
          </Button>
          <Button onClick={testStorage} colorScheme="green" size="sm">
            🧪 Probar Almacenamiento
          </Button>
          <Button onClick={clearAllStorage} colorScheme="red" size="sm">
            🧹 Limpiar Todo
          </Button>
        </Box>
        
        <Alert status="info">
          <AlertIcon />
          <Text>
            CIDs almacenados offline: <Badge colorScheme="blue">{storedCIDs.length}</Badge>
          </Text>
        </Alert>
        
        {storedCIDs.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>📋 CIDs Almacenados:</Text>
            <Table size="sm" variant="simple">
              <Tbody>
                {storedCIDs.map((cid, index) => (
                  <Tr key={cid}>
                    <Th>#{index + 1}</Th>
                    <Td>
                      <Code fontSize="xs">{cid}</Code>
                    </Td>
                    <Td>
                      <Button 
                        size="xs" 
                        onClick={() => viewContent(cid)}
                        colorScheme="blue"
                      >
                        👀 Ver Contenido
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
        
        {selectedContent && selectedCID && (
          <Box>
            <Text fontWeight="bold" mb={2}>
              📄 Contenido para CID: <Code>{selectedCID}</Code>
            </Text>
            <Textarea
              value={formatContent(selectedContent)}
              readOnly
              minH="300px"
              fontSize="xs"
              fontFamily="monospace"
            />
          </Box>
        )}
        
        {storedCIDs.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            <Text>
              No hay CIDs almacenados offline. Crea una denuncia para generar contenido.
            </Text>
          </Alert>
        )}
        
        <Box mt={6} p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            🔧 Información de Debug:
          </Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="xs">
              • Los CIDs se almacenan en localStorage con prefijo "offline_ipfs_"
            </Text>
            <Text fontSize="xs">
              • Cada denuncia genera un CID único basado en su contenido
            </Text>
            <Text fontSize="xs">
              • Si no ves tu contenido, puede que el CID no se esté generando correctamente
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}