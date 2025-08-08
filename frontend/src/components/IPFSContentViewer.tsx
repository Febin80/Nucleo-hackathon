import { useState } from 'react'
import {
  Box,
  Button,
  Text,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Badge,
  Link,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  Code
} from '@chakra-ui/react'
import { getIPFSContent, getIPFSGatewayURL } from '../services/ipfs'
import { EncryptionService } from '../services/encryption'
import { MediaViewer } from './MediaViewer'

interface IPFSContentViewerProps {
  hash: string
  buttonText?: string
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg'
}

export const IPFSContentViewer = ({
  hash,
  buttonText = "Ver contenido completo",
  buttonSize = "sm"
}: IPFSContentViewerProps) => {
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure()
  const [content, setContent] = useState<string | null>(null)
  const [rawContent, setRawContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [password, setPassword] = useState('')
  const [decrypting, setDecrypting] = useState(false)
  const toast = useToast()

  // Función personalizada para cerrar modal y limpiar estado
  const onClose = () => {
    if (content && isEncrypted) {
      toast({
        title: '🔒 Sesión cerrada',
        description: 'Deberás ingresar la contraseña nuevamente',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    }
    
    setPassword('')
    setContent(null)
    setError(null)
    setDecrypting(false)
    originalOnClose()
  }

  const handleViewContent = async () => {
    setContent(null)
    setPassword('')
    setError(null)
    setDecrypting(false)
    setLoading(true)

    try {
      console.log(`🔍 Cargando contenido IPFS: ${hash.slice(0, 10)}...`)
      
      const ipfsContent = await getIPFSContent(hash)
      setRawContent(ipfsContent)

      // Verificar si el contenido está cifrado
      let encrypted = EncryptionService.isEncrypted(ipfsContent)
      let contentToProcess = ipfsContent
      
      // Verificar si tiene estructura especial con contenido_cifrado
      if (!encrypted) {
        try {
          const parsedContent = JSON.parse(ipfsContent)
          
          if (parsedContent.contenido_cifrado) {
            console.log('🔍 Detectada estructura con contenido_cifrado anidado')
            
            let extractedContent = parsedContent.contenido_cifrado
            
            // Si es un string, intentar parsearlo como JSON
            if (typeof extractedContent === 'string') {
              try {
                const firstParse = JSON.parse(extractedContent)
                
                if (typeof firstParse === 'string') {
                  try {
                    const secondParse = JSON.parse(firstParse)
                    if (secondParse && typeof secondParse === 'object' && 
                        secondParse.encrypted && secondParse.algorithm) {
                      extractedContent = firstParse
                    } else {
                      extractedContent = JSON.stringify(secondParse)
                    }
                  } catch {
                    extractedContent = firstParse
                  }
                } else if (firstParse && typeof firstParse === 'object' && 
                          firstParse.encrypted && firstParse.algorithm) {
                  extractedContent = extractedContent
                } else {
                  extractedContent = JSON.stringify(firstParse)
                }
              } catch {
                // Usar como string si no se puede parsear
              }
            }
            
            contentToProcess = extractedContent
            encrypted = EncryptionService.isEncrypted(contentToProcess)
          }
        } catch {
          // Si no se puede parsear como JSON, usar contenido original
        }
      }
      
      setIsEncrypted(encrypted)
      
      if (encrypted) {
        setRawContent(contentToProcess)
      } else {
        setContent(ipfsContent)
      }

      onOpen()
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error al cargar contenido',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (rawContent: string) => {
    try {
      const jsonContent = JSON.parse(rawContent)
      return JSON.stringify(jsonContent, null, 2)
    } catch {
      return rawContent
    }
  }

  const isJSON = (str: string) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  const handleDecrypt = async () => {
    if (!rawContent || !password) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa la contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setDecrypting(true)
    setError(null)

    try {
      const decryptedContent = EncryptionService.decryptPackage(rawContent, password)
      setContent(decryptedContent)

      toast({
        title: 'Éxito',
        description: 'Contenido descifrado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error de descifrado',
        description: 'Contraseña incorrecta o contenido corrupto',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setDecrypting(false)
    }
  }

  return (
    <>
      <HStack spacing={2}>
        <Button
          size={buttonSize}
          colorScheme="blue"
          variant="outline"
          leftIcon={<Text>👁️</Text>}
          onClick={handleViewContent}
          isLoading={loading}
          loadingText="Cargando..."
        >
          {buttonText}
        </Button>

        <Link
          href={getIPFSGatewayURL(hash)}
          isExternal
          color="blue.500"
          fontSize="sm"
        >
          <HStack spacing={1}>
            <Text>Gateway</Text>
            <Text fontSize="xs">🔗</Text>
          </HStack>
        </Link>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text fontSize="xl" fontWeight="bold">
                📄 Contenido IPFS
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="blue" fontSize="xs">
                  Hash: {hash.slice(0, 8)}...{hash.slice(-4)}
                </Badge>
                {isEncrypted && (
                  <Badge colorScheme="orange" fontSize="xs">
                    🔒 Cifrado
                  </Badge>
                )}
                {content && (
                  <Badge colorScheme="green" fontSize="xs">
                    {isJSON(content) ? '📋 JSON' : '📝 Texto'}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto">
            {error ? (
              <Alert status="error">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Error al cargar contenido</Text>
                  <Text fontSize="sm">{error}</Text>
                  <Text fontSize="xs" color="gray.600">
                    Puedes intentar acceder directamente usando el enlace "Gateway"
                  </Text>
                </VStack>
              </Alert>
            ) : isEncrypted && !content ? (
              <VStack spacing={6} w="100%">
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  <Box w="100%">
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      🔒 Contenido cifrado
                    </Text>
                    <Text fontSize="md" color="orange.700">
                      Este contenido está protegido. Ingresa la contraseña que guardaste al crear la denuncia.
                    </Text>
                  </Box>
                </Alert>

                <Box w="100%" maxW="400px" mx="auto">
                  <FormControl>
                    <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
                      🔑 Contraseña de descifrado
                    </FormLabel>
                    
                    <VStack spacing={4} align="stretch">
                      <Input
                        type="password"
                        placeholder="Ingresa tu contraseña..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)"
                        }}
                      />
                      
                      <Button
                        colorScheme="blue"
                        onClick={handleDecrypt}
                        isLoading={decrypting}
                        loadingText="🔓 Descifrando..."
                        size="lg"
                        borderRadius="xl"
                        w="100%"
                      >
                        🔓 Descifrar contenido
                      </Button>
                    </VStack>
                  </FormControl>
                  
                  <Box mt={4} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.700" textAlign="center">
                      💡 <strong>Tip:</strong> La contraseña se generó automáticamente al crear la denuncia confidencial
                    </Text>
                  </Box>
                </Box>
              </VStack>
            ) : content ? (
              <VStack spacing={4} align="stretch">
                <Box w="100%">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Contenido almacenado en IPFS:
                    {isEncrypted && <Text as="span" color="green.600" ml={2}>✅ Descifrado</Text>}
                  </Text>
                  
                  {/* Mostrar multimedia si existe */}
                  {(() => {
                    try {
                      const jsonContent = JSON.parse(content);
                      if (jsonContent.evidencia && jsonContent.evidencia.archivos && jsonContent.evidencia.archivos.length > 0) {
                        return (
                          <Box w="100%" mb={4}>
                            <MediaViewer
                              mediaHashes={jsonContent.evidencia.archivos}
                              mediaTypes={jsonContent.evidencia.tipos || []}
                              title="Evidencia de la Denuncia"
                            />
                          </Box>
                        );
                      }
                    } catch (error: any) {
                      // Si no es JSON válido o no tiene evidencia, continuar
                    }
                    return null;
                  })()}
                  
                  <Box
                    as="pre"
                    p={4}
                    bg="gray.800"
                    color="gray.100"
                    borderRadius="md"
                    fontSize="sm"
                    overflowX="auto"
                    maxH="50vh"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {formatContent(content)}
                  </Box>
                </Box>
                
                {isEncrypted && rawContent && (
                  <>
                    <Divider />
                    <Box w="100%">
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Contenido cifrado original:
                      </Text>
                      <Box
                        bg="red.50"
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="red.200"
                        maxH="200px"
                        overflowY="auto"
                      >
                        <Code
                          fontSize="xs"
                          color="red.700"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {rawContent}
                        </Code>
                      </Box>
                    </Box>
                  </>
                )}
              </VStack>
            ) : (
              <VStack justify="center" align="center" h="200px" spacing={4}>
                <Box textAlign="center">
                  <Text fontSize="lg" fontWeight="bold">Contenido no cargado</Text>
                  <Text color="gray.500">Haz clic en "Ver contenido completo" para iniciar.</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => window.open(getIPFSGatewayURL(hash), '_blank')}
              >
                🔗 Abrir Gateway
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}