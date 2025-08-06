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
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Textarea
} from '@chakra-ui/react'
import { 
  uploadJSONToPublicIPFS, 
  getContentFromPublicIPFS, 
  checkPublicGatewaysHealth 
} from '../services/ipfs-public'

export const PublicIPFSTest = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [testing, setTesting] = useState(false)
  const [testHash, setTestHash] = useState<string | null>(null)
  const [retrievedContent, setRetrievedContent] = useState<string | null>(null)
  const [gatewayHealth, setGatewayHealth] = useState<any[]>([])
  const toast = useToast()

  const handleTestUpload = async () => {
    setTesting(true)
    
    try {
      const testContent = {
        mensaje: "Test de IPFS público sin API keys",
        timestamp: new Date().toISOString(),
        tipo: "test_publico",
        datos: {
          navegador: navigator.userAgent,
          idioma: navigator.language,
          timestamp_unix: Date.now()
        }
      }
      
      console.log('📤 Subiendo contenido de prueba a IPFS público...')
      const hash = await uploadJSONToPublicIPFS(testContent)
      
      setTestHash(hash)
      
      toast({
        title: '✅ Subida exitosa',
        description: `Hash generado: ${hash}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
    } catch (error) {
      console.error('❌ Error al subir:', error)
      toast({
        title: 'Error de subida',
        description: 'No se pudo subir el contenido, usando hash simulado',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setTesting(false)
    }
  }

  const handleTestRetrieve = async () => {
    if (!testHash) {
      toast({
        title: 'Sin hash',
        description: 'Primero sube contenido para obtener un hash',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setTesting(true)
    
    try {
      console.log('📥 Obteniendo contenido desde IPFS público...')
      const content = await getContentFromPublicIPFS(testHash)
      
      setRetrievedContent(content)
      
      toast({
        title: '✅ Contenido obtenido',
        description: 'Contenido recuperado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      console.error('❌ Error al obtener:', error)
      toast({
        title: 'Error de obtención',
        description: 'No se pudo obtener el contenido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setTesting(false)
    }
  }

  const handleCheckGateways = async () => {
    setTesting(true)
    
    try {
      console.log('🔍 Verificando salud de gateways públicos...')
      const health = await checkPublicGatewaysHealth()
      setGatewayHealth(health)
      
      const healthyCount = health.filter(g => g.healthy).length
      
      toast({
        title: 'Verificación simulada completa',
        description: `${healthyCount}/${health.length} gateways simulados como disponibles`,
        status: 'info',
        duration: 4000,
        isClosable: true,
      })
      
    } catch (error) {
      console.error('❌ Error al verificar gateways:', error)
      toast({
        title: 'Error de verificación',
        description: 'No se pudo verificar los gateways',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        colorScheme="green"
        onClick={onOpen}
        leftIcon={<Text fontSize="xs">🌐</Text>}
      >
        Test IPFS Público
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>Test de IPFS Público</Text>
              <HStack>
                <Badge colorScheme="green" variant="subtle">
                  🆓 Sin API Keys
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  🌐 Servicios Públicos
                </Badge>
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">
                    🌐 IPFS Público (Modo Desarrollo)
                  </Text>
                  <Text fontSize="xs">
                    En desarrollo local, las verificaciones de gateways están simuladas 
                    para evitar errores CORS. En producción funcionarían normalmente.
                  </Text>
                </VStack>
              </Alert>

              <VStack spacing={3} w="100%">
                <HStack spacing={2} w="100%">
                  <Button
                    colorScheme="green"
                    onClick={handleTestUpload}
                    isLoading={testing}
                    loadingText="Subiendo..."
                    flex={1}
                    size="sm"
                  >
                    📤 Subir Test
                  </Button>
                  
                  <Button
                    colorScheme="blue"
                    onClick={handleTestRetrieve}
                    isLoading={testing}
                    loadingText="Obteniendo..."
                    flex={1}
                    size="sm"
                    isDisabled={!testHash}
                  >
                    📥 Obtener
                  </Button>
                </HStack>

                <Button
                  colorScheme="purple"
                  onClick={handleCheckGateways}
                  isLoading={testing}
                  loadingText="Verificando..."
                  w="100%"
                  size="sm"
                >
                  🔍 Verificar Gateways
                </Button>
              </VStack>

              {testHash && (
                <Box w="100%" p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <Text fontSize="sm" fontWeight="bold" color="green.700" mb={2}>
                    ✅ Hash generado:
                  </Text>
                  <Code fontSize="xs" p={2} bg="white" borderRadius="md" w="100%" wordBreak="break-all">
                    {testHash}
                  </Code>
                </Box>
              )}

              {retrievedContent && (
                <Box w="100%" p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
                    📥 Contenido obtenido:
                  </Text>
                  <Textarea
                    value={retrievedContent}
                    readOnly
                    fontSize="xs"
                    bg="white"
                    maxH="200px"
                    resize="vertical"
                  />
                </Box>
              )}

              {gatewayHealth.length > 0 && (
                <Box w="100%">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    🌐 Estado de Gateways:
                  </Text>
                  <VStack spacing={1} maxH="150px" overflowY="auto">
                    {gatewayHealth.map((gateway, index) => (
                      <HStack
                        key={index}
                        w="100%"
                        p={2}
                        bg={gateway.healthy ? "green.50" : "red.50"}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={gateway.healthy ? "green.200" : "red.200"}
                        justify="space-between"
                      >
                        <Text fontSize="xs" fontFamily="mono">
                          {gateway.gateway.replace('https://', '').replace('/ipfs/', '')}
                        </Text>
                        <Badge 
                          colorScheme={gateway.healthy ? "green" : "red"} 
                          variant="subtle" 
                          fontSize="xs"
                        >
                          {gateway.healthy ? "✅ OK" : "❌ Error"}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {testing && (
                <HStack>
                  <Spinner size="sm" />
                  <Text fontSize="sm">Procesando...</Text>
                </HStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}