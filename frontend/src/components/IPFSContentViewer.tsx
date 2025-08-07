import { useState } from 'react'
import {
  Box,
  Button,
  Text,
  Spinner,
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
// Usando iconos simples en lugar de @chakra-ui/icons
import { getIPFSContent, getIPFSGatewayURL } from '../services/ipfs'
import { getContentFromPublicIPFS } from '../services/ipfs-public'
import { EncryptionService } from '../services/encryption'
import { MediaViewer } from './MediaViewer'

interface IPFSContentViewerProps {
  hash: string
  buttonText?: string
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg'
}

export const IPFSContentViewer = ({
  hash,
  buttonText = "Ver contenido",
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
  const [loadingStatus, setLoadingStatus] = useState<string>('')
  const toast = useToast()

  // Función personalizada para cerrar modal y limpiar estado
  const onClose = () => {
    // Solo mostrar toast si había contenido descifrado
    if (content && isEncrypted) {
      toast({
        title: '🔒 Sesión cerrada',
        description: 'Deberás ingresar la contraseña nuevamente',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    }
    
    // Limpiar estado de descifrado
    setPassword('')
    setContent(null)
    setError(null)
    setDecrypting(false)
    
    // Cerrar modal
    originalOnClose()
    
    console.log('🔄 Modal cerrado - Estado de descifrado limpiado')
  }

  const handleViewContent = async () => {
    // Siempre limpiar estado al abrir para forzar nueva autenticación
    setContent(null)
    setPassword('')
    setError(null)
    setDecrypting(false)
    
    console.log('🔄 Abriendo modal - Estado limpiado para nueva autenticación')

    setLoading(true)
    setError(null)
    setLoadingStatus('Conectando a gateways IPFS...')

    try {
      // Intentar obtener contenido con manejo robusto de errores
      let ipfsContent;
      try {
        // Primero intentar con el servicio principal
        ipfsContent = await getIPFSContent(hash);
      } catch (mainError: any) {
        console.warn('❌ Servicio principal falló:', mainError.message);
        
        try {
          // Fallback al servicio público
          ipfsContent = await getContentFromPublicIPFS(hash);
        } catch (publicError: any) {
          console.warn('❌ IPFS público también falló:', publicError.message);
          
          // Último recurso: contenido de ejemplo
          ipfsContent = JSON.stringify({
            error: 'Contenido no disponible',
            hash: hash,
            mensaje: 'El contenido IPFS no pudo ser recuperado desde ningún gateway',
            posibles_causas: [
              'CID inválido o corrupto',
              'Contenido no disponible en la red IPFS',
              'Problemas de conectividad',
              'Gateways temporalmente no disponibles'
            ],
            sugerencia: 'Este puede ser contenido simulado para propósitos de demostración'
          }, null, 2);
        }
      }
      setLoadingStatus('Procesando contenido...')
      
      // Limpiar y normalizar el contenido IPFS antes de procesarlo
      let cleanedContent = ipfsContent;
      try {
        // Intentar parsear y reformatear para limpiar posibles errores de formato
        const testParse = JSON.parse(ipfsContent);
        cleanedContent = JSON.stringify(testParse);
        console.log('✅ Contenido IPFS limpiado y reformateado');
      } catch (cleanError: any) {
        console.log('⚠️ Contenido IPFS no es JSON válido:', cleanError.message);
        console.log('📄 Contenido problemático (primeros 200 chars):', ipfsContent.substring(0, 200));
        
        // Para contenido malformado, intentar procesarlo directamente sin reparar
        // El componente manejará la extracción del contenido cifrado de forma más robusta
        cleanedContent = ipfsContent;
      }
      
      setRawContent(cleanedContent)

      // Verificar si el contenido está cifrado
      let encrypted = EncryptionService.isEncrypted(cleanedContent);
      let contentToProcess = cleanedContent;
      
      console.log('🔍 IPFSContentViewer: Analizando contenido...');
      console.log('📄 Contenido recibido (primeros 200 chars):', cleanedContent.substring(0, 200));
      console.log('📄 Contenido principal cifrado:', encrypted);
      
      // Verificar si tiene estructura especial con contenido_cifrado
      if (!encrypted) {
        try {
          const parsedContent = JSON.parse(cleanedContent);
          console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
          
          // Debug específico para el problema del usuario
          console.log('🔍 Debug parseo raw:', {
            propiedades: Object.keys(parsedContent),
            tieneContenidoCifrado: !!parsedContent.contenido_cifrado,
            tipoContenidoCifrado: typeof parsedContent.contenido_cifrado
          });
          
          // Debug adicional: mostrar todas las propiedades y sus valores
          console.log('🔍 Debug completo de propiedades:');
          Object.keys(parsedContent).forEach(key => {
            const value = parsedContent[key];
            const preview = typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value;
            console.log(`  ${key}:`, typeof value, preview);
          });
          
          if (parsedContent.contenido_cifrado) {
            console.log('🔍 Detectada estructura con contenido_cifrado anidado');
            
            // El contenido_cifrado puede ser un string JSON escapado
            let extractedContent = parsedContent.contenido_cifrado;
            
            // Si es un string, intentar parsearlo como JSON
            if (typeof extractedContent === 'string') {
              try {
                // Intentar parsear el string JSON escapado
                const firstParse = JSON.parse(extractedContent);
                
                // Si el resultado es un string, necesita otro parseo (doble escape)
                if (typeof firstParse === 'string') {
                  try {
                    const secondParse = JSON.parse(firstParse);
                    // Verificar si es un paquete cifrado
                    if (secondParse && typeof secondParse === 'object' && 
                        secondParse.encrypted && secondParse.algorithm) {
                      // Es un paquete cifrado, usar el string del primer parseo
                      extractedContent = firstParse;
                      console.log('✅ Paquete cifrado detectado con doble escape');
                    } else {
                      // No es cifrado, usar el objeto parseado
                      extractedContent = JSON.stringify(secondParse);
                      console.log('✅ Contenido con doble escape parseado');
                    }
                  } catch (secondParseError: any) {
                    // Si falla el segundo parseo, usar el primer resultado
                    extractedContent = firstParse;
                    console.log('⚠️ Segundo parseo falló, usando primer resultado');
                  }
                } else if (firstParse && typeof firstParse === 'object' && 
                          firstParse.encrypted && firstParse.algorithm) {
                  // Es un paquete cifrado directo
                  extractedContent = extractedContent; // Usar el string original
                  console.log('✅ Paquete cifrado detectado en JSON escapado');
                } else {
                  // No es un paquete cifrado, reformatear
                  extractedContent = JSON.stringify(firstParse);
                  console.log('✅ String JSON escapado parseado correctamente');
                }
              } catch (unescapeError: any) {
                console.log('⚠️ No se pudo parsear como JSON escapado, usando como string');
              }
            }
            
            contentToProcess = extractedContent;
            encrypted = EncryptionService.isEncrypted(contentToProcess);
            console.log('🔐 Contenido anidado cifrado:', encrypted);
            console.log('📦 Contenido cifrado extraído (primeros 100 chars):', contentToProcess.substring(0, 100));
            
            // Debug adicional
            if (!encrypted) {
              console.log('❌ Contenido extraído no detectado como cifrado');
              console.log('🔍 Contenido completo extraído:', contentToProcess);
              
              // Intentar detectar manualmente
              try {
                const testParse = JSON.parse(contentToProcess);
                console.log('🧪 Test manual - propiedades:', Object.keys(testParse));
                console.log('🧪 Test manual - encrypted:', testParse.encrypted);
                console.log('🧪 Test manual - algorithm:', testParse.algorithm);
                console.log('🧪 Test manual - data:', !!testParse.data);
              } catch (testError: any) {
                console.log('❌ Test manual falló:', testError.message);
              }
            }
          }
        } catch (parseError: any) {
          console.log('❌ Error parseando JSON:', parseError.message);
          console.log('🔍 Intentando extracción manual de contenido cifrado...');
          
          // Fallback: Extracción manual con regex para contenido malformado
          const cifradoPatterns = [
            /"contenido_cifrado":\s*"(\{[\s\S]*?\})"\s*,/, // Patrón más específico con coma
            /"contenido_cifrado":\s*"(\{[\s\S]*?\})"/, // JSON con saltos de línea dentro de comillas
            /"contenido_cifrado":\s*(\{[\s\S]*?\})(?=\s*[,}])/, // JSON directo sin comillas
            /"contenido_cifrado":\s*"([^"]+(?:\\.[^"]*)*)"/ // Patrón con escapes (último recurso)
          ];
          
          let extractedContent = null;
          for (const pattern of cifradoPatterns) {
            const match = cleanedContent.match(pattern);
            if (match) {
              extractedContent = match[1];
              console.log('✅ Contenido cifrado extraído con patrón manual');
              console.log('📦 Contenido extraído (primeros 100 chars):', extractedContent.substring(0, 100));
              break;
            }
          }
          
          if (extractedContent) {
            // Intentar procesar el contenido extraído
            if (typeof extractedContent === 'string') {
              // Si parece ser JSON directo (empieza con {)
              if (extractedContent.trim().startsWith('{')) {
                encrypted = EncryptionService.isEncrypted(extractedContent);
                if (encrypted) {
                  contentToProcess = extractedContent;
                  console.log('✅ Contenido cifrado detectado en extracción manual');
                }
              } else {
                // Intentar parsear como JSON escapado
                try {
                  const unescaped = JSON.parse(extractedContent);
                  if (typeof unescaped === 'object' && unescaped.encrypted) {
                    encrypted = true;
                    contentToProcess = extractedContent;
                    console.log('✅ Contenido cifrado detectado después de unescape manual');
                  }
                } catch (unescapeError: any) {
                  console.log('⚠️ No se pudo procesar contenido extraído manualmente');
                }
              }
            }
          }
        }
      }
      
      console.log('🎯 Resultado final - Está cifrado:', encrypted);
      setIsEncrypted(encrypted);
      
      // Actualizar rawContent con el contenido cifrado real
      if (encrypted) {
        console.log('🔐 Configurando contenido cifrado para descifrado');
        setRawContent(contentToProcess);
      } else {
        console.log('📄 Configurando contenido como texto plano');
        setContent(ipfsContent);
      }

      onOpen()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingStatus('')
    }
  }

  const formatContent = (rawContent: string) => {
    try {
      // Intentar parsear como JSON
      const jsonContent = JSON.parse(rawContent)
      return JSON.stringify(jsonContent, null, 2)
    } catch {
      // Si no es JSON, devolver como texto plano
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

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl", lg: "2xl" }}>
        <ModalOverlay />
        <ModalContent
          w={{ base: '95%', md: '80%', lg: '70%' }}
          maxW="1200px"
          my={{ base: 2, md: 4 }}
          mx="auto"
          maxH="90vh"
        >
          <ModalHeader p={{ base: 4, md: 6 }}>
            <VStack align="start" spacing={{ base: 2, md: 3 }}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                📄 Contenido IPFS
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge 
                  colorScheme="blue" 
                  variant="subtle" 
                  fontSize={{ base: "2xs", md: "xs" }}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  Hash: {hash.slice(0, 8)}...{hash.slice(-4)}
                </Badge>
                {isEncrypted && (
                  <Badge 
                    colorScheme="orange" 
                    variant="subtle"
                    fontSize={{ base: "2xs", md: "xs" }}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    🔒 Cifrado
                  </Badge>
                )}
                {content && (
                  <Badge 
                    colorScheme="green" 
                    variant="subtle"
                    fontSize={{ base: "2xs", md: "xs" }}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {isJSON(content) ? '📋 JSON' : '📝 Texto'}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={{ base: 4, md: 6 }} pb={{ base: 6, md: 8 }}>
            {error ? (
              <Alert status="error">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Error al cargar contenido</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }}>{error}</Text>
                  <Text fontSize="xs" color="gray.600">
                    Puedes intentar acceder directamente usando el enlace "Gateway"
                  </Text>
                </VStack>
              </Alert>
            ) : isEncrypted && !content ? (
              <VStack spacing={{ base: 4, md: 6 }} w="100%">
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  <Box w="100%">
                    <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} mb={2}>
                      🔒 Contenido cifrado
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color="orange.700">
                      Este contenido está protegido. Ingresa la contraseña que guardaste al crear la denuncia.
                    </Text>
                  </Box>
                </Alert>

                <Box w="100%" maxW={{ base: "100%", md: "400px" }} mx="auto">
                  <FormControl>
                    <FormLabel 
                      fontSize={{ base: "md", md: "lg" }} 
                      fontWeight="semibold"
                      color="gray.700"
                      mb={3}
                    >
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
                        fontSize={{ base: "md", md: "lg" }}
                        h={{ base: "48px", md: "56px" }}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 3px rgb(255, 255, 255)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                      />
                      
                      <Button
                        colorScheme="blue"
                        onClick={handleDecrypt}
                        isLoading={decrypting}
                        loadingText="🔓 Descifrando..."
                        size="lg"
                        h={{ base: "48px", md: "56px" }}
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="semibold"
                        borderRadius="xl"
                        w="100%"
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "lg"
                        }}
                        transition="all 0.2s"
                      >
                        🔓 Descifrar contenido
                      </Button>
                    </VStack>
                  </FormControl>
                  
                  {/* Ayuda adicional */}
                  <Box mt={4} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <Text fontSize={{ base: "xs", md: "sm" }} color="blue.700" textAlign="center">
                      💡 <strong>Tip:</strong> La contraseña se generó automáticamente al crear la denuncia confidencial
                    </Text>
                  </Box>
                </Box>
              </VStack>
            ) : content ? (
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Box w="100%" px={{ base: 1, md: 0 }}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                    Contenido almacenado en IPFS:
                    {isEncrypted && <Text as="span" color="green.600" ml={2}>✅ Descifrado</Text>}
                  </Text>
                  {/* Mostrar multimedia si existe */}
                  {(() => {
                    try {
                      const jsonContent = JSON.parse(content);
                      if (jsonContent.evidencia && jsonContent.evidencia.archivos && jsonContent.evidencia.archivos.length > 0) {
                        return (
                          <Box w="100%" minW={0}>
                            <MediaViewer
                              mediaHashes={jsonContent.evidencia.archivos}
                              mediaTypes={jsonContent.evidencia.tipos || []}
                              title="Evidencia de la Denuncia"

                            />
                          </Box>
                        );
                      }
                    } catch (error: any) {}
                    return null;
                  })()}
                  <Box
                    as="pre"
                    p={{ base: 2, md: 4 }}
                    bg="gray.800"
                    color="gray.100"
                    borderRadius="md"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    overflowX="auto"
                    maxH={{ base: '60vh', md: '50vh' }}
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {formatContent(content)}
                    <pre
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        margin: 0,
                        padding: '4px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        boxSizing: 'border-box',
                        width: '100%',
                        maxWidth: '100%',
                      }}
                    >
                      {formatContent(content)}
                    </pre>
                  </Box>
                </Box>
                
                {isEncrypted && (
                  <>
                    <Divider my={{ base: 3, md: 4 }} />
                    <Box w="100%" minW={0}>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                        Contenido cifrado original:
                      </Text>
                      <Box
                        bg="red.50"
                        p={{ base: 1, md: 3 }}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="red.200"
                        minH={{ base: "180px", md: "320px" }}
                        maxH={{ base: "400px", md: "600px" }}
                        minW={0}
                        overflowY="auto"
                        overflowX="auto"
                        w="100%"
                        sx={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#f87171 #fee2e2',
                          WebkitOverflowScrolling: 'touch',
                        }}
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                      >
                        <pre
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            margin: 0,
                            padding: '8px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            boxSizing: 'border-box',
                            width: '100%',
                            maxWidth: '100%',
                            color: '#b91c1c',
                          }}
                        >
                          {rawContent}
                        </pre>
                      </Box>
                    </Box>
                  </>
                )}
              </VStack>
            ) : (
          <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay />
        <ModalContent
          w={{ base: '95%', sm: '90%', md: '85%', lg: '80%' }}
          maxW="1200px"
          maxH="90vh"
          my={{ base: 4, md: 8 }}
          mx="auto"
        >
          <ModalHeader p={{ base: 4, md: 6 }}>
            <VStack align="start" spacing={{ base: 2, md: 3 }}>
              <HStack justify="space-between" w="100%">
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="gray.800">
                  Visor de Contenido IPFS
                </Text>
                <Badge colorScheme={isEncrypted ? "red" : "green"}>
                  {isEncrypted ? "Cifrado" : "Público"}
                </Badge>
              </HStack>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" noOfLines={1} wordBreak="break-all">
                <Code p={1} borderRadius="md" fontSize="xs">{hash}</Code>
              </Text>
            </VStack>
          </ModalHeader>

          <ModalBody p={{ base: 4, md: 6 }} overflowY="auto">
            {loading ? (
              <VStack justify="center" align="center" h="200px" spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text fontWeight="medium" color="gray.600">{loadingStatus}</Text>
              </VStack>
            ) : error ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            ) : content ? (
              <VStack spacing={4} align="stretch">
                {isEncrypted && !password && (
                  <VStack as="form" onSubmit={(e) => { e.preventDefault(); handleDecrypt(); }} spacing={4} p={4} bg="yellow.50" borderRadius="md">
                    <FormControl isRequired>
                      <FormLabel>Contraseña para descifrar</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa la clave de seguridad"
                        autoFocus
                      />
                    </FormControl>
                    <Button type="submit" isLoading={decrypting} colorScheme="blue" w="100%">
                      Descifrar Contenido
                    </Button>
                  </VStack>
                )}

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Contenido Obtenido:</Text>
                  {(() => {
                    try {
                      if (isJSON(content)) {
                        const parsed = JSON.parse(content);
                        if (parsed.metadata && parsed.metadata.media_type && parsed.evidencia && parsed.evidencia.archivos) {
                          return <MediaViewer 
                            mediaHashes={parsed.evidencia.archivos} 
                            mediaTypes={parsed.evidencia.tipos || []}
                            title="Evidencia Multimedia"
                          />;
                        }
                      }
                    } catch (error: any) {}
                    return null;
                  })()}
                  <Box
                    as="pre"
                    p={{ base: 3, md: 4 }}
                    bg="gray.900"
                    color="gray.100"
                    borderRadius="md"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    maxH={{ base: '50vh', md: '60vh' }}
                    overflowY="auto"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {formatContent(content)}
                  </Box>
                </Box>
                
                {isEncrypted && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Contenido cifrado original:</Text>
                    <Box as="pre" bg="red.100" color="red.900" p={2} borderRadius="md" fontSize="xs" overflowX="auto" whiteSpace="pre-wrap" wordBreak="break-all">
                      {rawContent}
                    </Box>
                  </Box>
                )}

              </VStack>
            ) : (
              <VStack justify="center" align="center" h="200px" spacing={4}>
                <Box textAlign="center">
                  <Text fontSize="lg" fontWeight="bold">Contenido no cargado</Text>
                  <Text color="gray.500">Haz clic en "Ver contenido" para iniciar.</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} pt={{ base: 2, md: 4 }}>
            <HStack spacing={{ base: 2, md: 3 }} w="100%" justify={{ base: "center", md: "flex-end" }} wrap="wrap">
              {content && isEncrypted && (
                <Button
                  size={{ base: "sm", md: "md" }}
                  colorScheme="orange"
                  variant="outline"
                  onClick={() => {
                    setContent(null);
                    setPassword('');
                    setError(null);
                    setDecrypting(false);
                    toast({
                      title: '🔒 Sesión limpiada',
                      description: 'Ingresa la contraseña nuevamente',
                      status: 'info',
                      duration: 2000,
                      isClosable: true,
                    });
                  }}
                >
                  🔒 Limpiar sesión
                </Button>
              )}
              <Button
                as={Link}
                href={getIPFSGatewayURL(hash)}
                isExternal
                size={{ base: "sm", md: "md" }}
                variant="outline"
                colorScheme="blue"
              >
                🔗 Gateway
              </Button>
              <Button 
                variant="solid" 
                colorScheme="gray"
                onClick={onClose}
                size={{ base: "sm", md: "md" }}
              >
                ✕ Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
            )}
        </ModalBody>

        <ModalFooter p={{ base: 4, md: 6 }} pt={{ base: 2, md: 4 }}>
          <HStack spacing={{ base: 3, md: 0 }} w="100%" justify={{ base: "center", md: "flex-end" }}>
            {/* Botón para limpiar sesión si hay contenido descifrado */}
            {content && isEncrypted && (
              <Button
                size={{ base: "sm", md: "md" }}
                colorScheme="orange"
                variant="outline"
                w={{ base: "100%", md: "auto" }}
                onClick={() => {
                  setContent(null)
                  setPassword('')
                  setError(null)
                  setDecrypting(false)
                  toast({
                    title: '🔒 Sesión limpiada',
                    description: 'Ingresa la contraseña nuevamente',
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                  })
                }}
              >
                🔒 Limpiar sesión
              </Button>
            )}
            <Button
              size={{ base: "sm", md: "md" }}
              variant="outline"
              w={{ base: "100%", md: "auto" }}
              onClick={() => {
                console.log('🔍 Debug IPFS para hash:', hash);
                console.log('📄 Contenido raw completo:', rawContent);
                console.log('🔒 Es cifrado:', isEncrypted);
                console.log('✅ Contenido procesado:', content);
                if (rawContent) {
                  try {
                    const parsed = JSON.parse(rawContent!)
                    console.log('🧪 Debug parseo raw:', {
                      propiedades: Object.keys(parsed),
                      tieneContenidoCifrado: !!parsed.contenido_cifrado,
                      tipoContenidoCifrado: typeof parsed.contenido_cifrado
                    });
                    if (parsed.contenido_cifrado) {
                      console.log('🔐 Contenido cifrado extraído:', parsed.contenido_cifrado.substring(0, 200));
                      try {
                        const cifradoParsed = JSON.parse(parsed.contenido_cifrado);
                        console.log('🔓 Paquete cifrado parseado:', {
                          version: cifradoParsed.version,
                          encrypted: cifradoParsed.encrypted,
                          algorithm: cifradoParsed.algorithm,
                          hasData: !!cifradoParsed.data,
                          hasSalt: !!cifradoParsed.salt,
                          hasIv: !!cifradoParsed.iv
                        });
                      } catch (parseError: any) {
                        console.log('❌ Error parseando contenido cifrado:', parseError.message);
                      }
                    }
                  } catch (parseError: any) {
                    console.log('❌ Error parseando raw content:', parseError.message);
                  }
                }
              }}
            >
              🐛 Debug
            </Button>
            <Button
              as={Link}
              href={getIPFSGatewayURL(hash)}
              isExternal
              size={{ base: "sm", md: "md" }}
              variant="outline"
              colorScheme="blue"
              w={{ base: "100%", md: "auto" }}
            >
              <Text>🔗 Abrir en Gateway</Text>
            </Button>
            <Button 
              variant="solid" 
              colorScheme="gray"
              onClick={onClose}
              size={{ base: "sm", md: "md" }}
              w={{ base: "100%", md: "auto" }}
            >
              ✕ Cerrar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal >
    </>
  )
}