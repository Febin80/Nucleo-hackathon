import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Grid,
  GridItem
} from '@chakra-ui/react'

interface MediaItem {
  hash: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface MediaViewerProps {
  mediaHashes: string[];
  mediaTypes?: string[];
  title?: string;
  maxWidth?: string;
}

// Componente de imagen optimizado con fallback inteligente
const IPFSImage = ({ hash, alt, ...props }: { hash: string; alt: string; [key: string]: any }) => {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [gateways, setGateways] = useState<string[]>([]);

  // Inicializar gateways cuando cambia el hash
  useEffect(() => {
    const urls = getGatewayUrls(hash);
    setGateways(urls);
    setCurrentGatewayIndex(0);
    setIsLoading(true);
    setHasError(false);
    
    console.log(`🔄 IPFSImage: Inicializando para hash ${hash.slice(0, 10)}...${hash.slice(-6)}`);
    console.log(`   Gateways disponibles: ${urls.length}`);
    console.log(`   Primer gateway: ${urls[0]?.split('/')[2] || 'N/A'}`);
  }, [hash]);

  const handleImageError = () => {
    const currentUrl = gateways[currentGatewayIndex];
    const gatewayName = currentUrl?.split('/')[2] || 'unknown';
    
    console.warn(`❌ IPFSImage Error: Gateway ${gatewayName} falló para hash ${hash.slice(0, 10)}...`);
    
    if (currentGatewayIndex < gateways.length - 1) {
      const nextIndex = currentGatewayIndex + 1;
      const nextGateway = gateways[nextIndex]?.split('/')[2] || 'unknown';
      console.log(`🔄 IPFSImage: Intentando siguiente gateway: ${nextGateway}`);
      setCurrentGatewayIndex(nextIndex);
    } else {
      console.error(`❌ IPFSImage: Todos los gateways fallaron para hash: ${hash}`);
      console.error(`   Gateways probados:`, gateways.map(url => url.split('/')[2]));
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    const currentUrl = gateways[currentGatewayIndex];
    const gatewayName = currentUrl?.split('/')[2] || 'unknown';
    
    console.log(`✅ IPFSImage: Imagen cargada exitosamente`);
    console.log(`   Hash: ${hash.slice(0, 10)}...${hash.slice(-6)}`);
    console.log(`   Gateway: ${gatewayName}`);
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError || gateways.length === 0) {
    return (
      <Box
        {...props}
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        border="2px dashed"
        borderColor="gray.300"
      >
        <Text fontSize="24px">🖼️</Text>
        <Text fontSize="xs" color="gray.600" textAlign="center" px={2}>
          Imagen no disponible
        </Text>
        <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
          {hash.slice(0, 8)}...
        </Text>
      </Box>
    );
  }

  return (
    <Box position="relative" {...props}>
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
          bg="white"
          borderRadius="full"
          p={2}
        >
          <Spinner size="sm" color="blue.500" />
        </Box>
      )}
      <Image
        src={gateways[currentGatewayIndex]}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        opacity={isLoading ? 0.3 : 1}
        transition="opacity 0.3s"
        {...props}
      />
    </Box>
  );
};

import { getOptimizedMediaUrls } from '../services/ipfs-media'

// Función auxiliar para obtener URLs de gateways optimizadas
function getGatewayUrls(hash: string) {
  return getOptimizedMediaUrls(hash);
}

export const MediaViewer = ({ 
  mediaHashes, 
  mediaTypes = [], 
  title = "Evidencia Multimedia",
  maxWidth
}: MediaViewerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  if (!mediaHashes || mediaHashes.length === 0) {
    return null
  }

  const getMediaType = (_hash: string, index: number): 'image' | 'video' | 'document' => {
    if (mediaTypes[index]) {
      if (mediaTypes[index].startsWith('image/')) return 'image'
      if (mediaTypes[index].startsWith('video/')) return 'video'
      if (mediaTypes[index] === 'application/pdf') return 'document'
    }
    return 'image' // default
  }

  const getGatewayUrl = (hash: string) => {
    // Usar el primer gateway como principal
    return getGatewayUrls(hash)[0];
  }

  const openMediaModal = (hash: string, type: 'image' | 'video' | 'document', name?: string) => {
    setSelectedMedia({ hash, type, name })
    onOpen()
  }

  return (
    <>
      <Box w="100%" maxW={maxWidth} p={{ base: 3, md: 4 }} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
        <VStack align="start" spacing={{ base: 2, md: 3 }}>
          <HStack flexWrap="wrap" spacing={2}>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color="blue.700">
              📎 {title}
            </Text>
            <Badge colorScheme="blue" variant="subtle" fontSize={{ base: "2xs", md: "xs" }}>
              {mediaHashes.length} archivo(s)
            </Badge>
          </HStack>

          <Alert status="info" size="sm">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize={{ base: "2xs", md: "xs" }}>
                Haz clic en cualquier elemento para verlo en tamaño completo
              </Text>
              <Text fontSize="2xs" color="blue.600">
                💡 Si las imágenes no cargan, los gateways IPFS pueden estar ocupados
              </Text>
            </VStack>
          </Alert>

          <Grid 
            templateColumns={{ 
              base: "repeat(auto-fit, minmax(80px, 1fr))", 
              md: "repeat(auto-fit, minmax(120px, 1fr))" 
            }} 
            gap={{ base: 2, md: 3 }} 
            w="100%"
          >
            {mediaHashes.map((hash, index) => {
              const mediaType = getMediaType(hash, index)

              return (
                <GridItem key={hash}>
                  <Box
                    position="relative"
                    cursor="pointer"
                    onClick={() => openMediaModal(hash, mediaType, `Evidencia ${index + 1}`)}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="transform 0.2s"
                  >
                    {mediaType === 'image' ? (
                      <Box position="relative">
                        <IPFSImage
                          hash={hash}
                          alt={`Evidencia ${index + 1}`}
                          w={{ base: "80px", md: "120px" }}
                          h={{ base: "80px", md: "120px" }}
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid"
                          borderColor="blue.300"
                        />
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="green"
                          variant="solid"
                          fontSize="xs"
                        >
                          🖼️
                        </Badge>
                      </Box>
                    ) : mediaType === 'video' ? (
                      <Box
                        w={{ base: "80px", md: "120px" }}
                        h={{ base: "80px", md: "120px" }}
                        bg="gray.200"
                        borderRadius="md"
                        border="2px solid"
                        borderColor="blue.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                      >
                        <Text fontSize={{ base: "24px", md: "32px" }}>🎥</Text>
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="purple"
                          variant="solid"
                          fontSize="xs"
                        >
                          VIDEO
                        </Badge>
                      </Box>
                    ) : (
                      <Box
                        w={{ base: "80px", md: "120px" }}
                        h={{ base: "80px", md: "120px" }}
                        bg="gray.200"
                        borderRadius="md"
                        border="2px solid"
                        borderColor="blue.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                      >
                        <Text fontSize={{ base: "24px", md: "32px" }}>📄</Text>
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="red"
                          variant="solid"
                          fontSize={{ base: "2xs", md: "xs" }}
                        >
                          PDF
                        </Badge>
                      </Box>
                    )}
                    
                    <Text
                      fontSize={{ base: "2xs", md: "xs" }}
                      textAlign="center"
                      mt={1}
                      color="blue.700"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      Evidencia {index + 1}
                    </Text>
                  </Box>
                </GridItem>
              )
            })}
          </Grid>

          <HStack spacing={2} w="100%" justify="center">
            <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.600" textAlign="center">
              💡 Almacenado en IPFS descentralizado
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Modal para ver multimedia en tamaño completo */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>{selectedMedia?.name || 'Evidencia'}</Text>
              <Badge colorScheme={
                selectedMedia?.type === 'image' ? 'green' : 
                selectedMedia?.type === 'video' ? 'purple' : 'red'
              }>
                {selectedMedia?.type === 'image' ? '🖼️ Imagen' : 
                 selectedMedia?.type === 'video' ? '🎥 Video' : '📄 PDF'}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedMedia && (
              <Box textAlign="center">
                {selectedMedia.type === 'image' ? (
                  <IPFSImage
                    hash={selectedMedia.hash}
                    alt={selectedMedia.name || 'Evidencia'}
                    maxW="100%"
                    maxH="500px"
                    objectFit="contain"
                    borderRadius="md"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <video
                    src={getGatewayUrl(selectedMedia.hash)}
                    controls
                    style={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      borderRadius: '8px'
                    }}
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                ) : (
                  <Box>
                    <iframe
                      src={getGatewayUrl(selectedMedia.hash)}
                      width="100%"
                      height="500px"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={selectedMedia.name || 'Documento PDF'}
                    />
                    <Alert status="info" mt={3}>
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          Si el PDF no se muestra correctamente, puedes descargarlo o abrirlo en una nueva pestaña.
                        </Text>
                      </VStack>
                    </Alert>
                  </Box>
                )}
                
                <VStack mt={4} spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Hash IPFS: {selectedMedia.hash}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => window.open(getGatewayUrl(selectedMedia.hash), '_blank')}
                    >
                      {selectedMedia.type === 'document' ? '📄 Abrir PDF' : '🔗 Abrir en Nueva Pestaña'}
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(getGatewayUrl(selectedMedia.hash))
                        // Aquí podrías agregar un toast de confirmación
                      }}
                    >
                      📋 Copiar URL
                    </Button>
                    {selectedMedia.type === 'document' && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = getGatewayUrl(selectedMedia.hash)
                          link.download = `evidencia-${selectedMedia.hash.slice(0, 8)}.pdf`
                          link.target = '_blank'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        💾 Descargar PDF
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </Box>
            )}
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