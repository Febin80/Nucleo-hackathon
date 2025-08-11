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
  GridItem,
  useToast
} from '@chakra-ui/react'
import { IPFSMediaService, getBestMediaUrl } from '../services/ipfs-media'

interface MediaItem {
  hash: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface OptimizedMediaViewerProps {
  mediaHashes: string[];
  mediaTypes?: string[];
  title?: string;
  maxWidth?: string;
}

// Componente de imagen optimizado para Vercel
const OptimizedIPFSImage = ({ hash, alt, ...props }: { hash: string; alt: string; [key: string]: any }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!IPFSMediaService.isValidMediaHash(hash)) {
        console.error(`❌ Hash IPFS inválido: ${hash}`);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔄 OptimizedIPFSImage: Cargando imagen para hash ${hash.slice(0, 10)}...`);
        
        // Obtener la mejor URL disponible
        const bestUrl = await getBestMediaUrl(hash);
        
        if (isMounted) {
          console.log(`✅ OptimizedIPFSImage: URL obtenida: ${bestUrl.split('/')[2]}`);
          setImageUrl(bestUrl);
        }
      } catch (error) {
        console.error(`❌ OptimizedIPFSImage: Error obteniendo URL para ${hash}:`, error);
        
        if (isMounted) {
          // Fallback a URL directa
          const fallbackUrl = `https://dweb.link/ipfs/${hash}`;
          console.log(`🔄 OptimizedIPFSImage: Usando fallback: ${fallbackUrl}`);
          setImageUrl(fallbackUrl);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [hash, retryCount]);

  const handleImageLoad = () => {
    console.log(`✅ OptimizedIPFSImage: Imagen cargada exitosamente para ${hash.slice(0, 10)}...`);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.warn(`❌ OptimizedIPFSImage: Error cargando imagen para ${hash.slice(0, 10)}...`);
    
    if (retryCount < 2) {
      console.log(`🔄 OptimizedIPFSImage: Reintentando... (${retryCount + 1}/2)`);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.error(`❌ OptimizedIPFSImage: Todos los reintentos fallaron para ${hash}`);
      setHasError(true);
      setIsLoading(false);
      
      toast({
        title: 'Imagen no disponible',
        description: `No se pudo cargar la imagen desde IPFS`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (hasError) {
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
        cursor="pointer"
        _hover={{ bg: 'gray.200' }}
        onClick={() => {
          if (imageUrl) {
            window.open(imageUrl, '_blank');
          }
        }}
      >
        <Text fontSize="24px">🖼️</Text>
        <Text fontSize="xs" color="gray.600" textAlign="center" px={2}>
          Imagen no disponible
        </Text>
        <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
          {hash.slice(0, 8)}...
        </Text>
        <Text fontSize="2xs" color="blue.500" textAlign="center" px={2} mt={1}>
          Clic para intentar abrir
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
          boxShadow="md"
        >
          <Spinner size="sm" color="blue.500" />
        </Box>
      )}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          opacity={isLoading ? 0.3 : 1}
          transition="opacity 0.3s ease-in-out"
          loading="lazy"
          {...props}
        />
      )}
    </Box>
  );
};

export const OptimizedMediaViewer = ({ 
  mediaHashes, 
  mediaTypes = [], 
  title = "Evidencia Multimedia",
  maxWidth
}: OptimizedMediaViewerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(new Map());
  const toast = useToast();

  // Pre-cargar URLs de multimedia al montar el componente
  useEffect(() => {
    const preloadUrls = async () => {
      const urlMap = new Map<string, string>();
      
      for (const hash of mediaHashes) {
        try {
          const url = await getBestMediaUrl(hash);
          urlMap.set(hash, url);
        } catch (error) {
          console.warn(`⚠️ No se pudo pre-cargar URL para ${hash}:`, error);
          // Usar fallback
          urlMap.set(hash, `https://dweb.link/ipfs/${hash}`);
        }
      }
      
      setMediaUrls(urlMap);
      console.log(`✅ Pre-cargadas ${urlMap.size} URLs de multimedia`);
    };

    if (mediaHashes.length > 0) {
      preloadUrls();
    }
  }, [mediaHashes]);

  if (!mediaHashes || mediaHashes.length === 0) {
    return null;
  }

  const getMediaType = (_hash: string, index: number): 'image' | 'video' | 'document' => {
    if (mediaTypes[index]) {
      if (mediaTypes[index].startsWith('image/')) return 'image';
      if (mediaTypes[index].startsWith('video/')) return 'video';
      if (mediaTypes[index] === 'application/pdf') return 'document';
    }
    return 'image'; // default
  };

  const getMediaUrl = (hash: string): string => {
    return mediaUrls.get(hash) || `https://dweb.link/ipfs/${hash}`;
  };

  const openMediaModal = (hash: string, type: 'image' | 'video' | 'document', name?: string) => {
    setSelectedMedia({ hash, type, name });
    onOpen();
  };

  const handleDownload = (hash: string, filename: string) => {
    const url = getMediaUrl(hash);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Descarga iniciada',
      description: 'El archivo se está descargando...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Box w="100%" maxW={maxWidth} p={{ base: 3, md: 4 }} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
        <VStack align="start" spacing={{ base: 3, md: 4 }}>
          <HStack flexWrap="wrap" spacing={2} justify="space-between" w="100%">
            <HStack spacing={2}>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color="blue.700">
                📎 {title}
              </Text>
              <Badge colorScheme="blue" variant="subtle" fontSize={{ base: "xs", md: "sm" }}>
                {mediaHashes.length} archivo(s)
              </Badge>
            </HStack>
            
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              ✅ Optimizado para Vercel
            </Badge>
          </HStack>

          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize={{ base: "xs", md: "sm" }}>
                Haz clic en cualquier elemento para verlo en tamaño completo
              </Text>
              <Text fontSize="xs" color="blue.600">
                💡 Sistema optimizado con múltiples gateways IPFS para máxima disponibilidad
              </Text>
            </VStack>
          </Alert>

          <Grid 
            templateColumns={{ 
              base: "repeat(auto-fit, minmax(100px, 1fr))", 
              md: "repeat(auto-fit, minmax(140px, 1fr))" 
            }} 
            gap={{ base: 3, md: 4 }} 
            w="100%"
          >
            {mediaHashes.map((hash, index) => {
              const mediaType = getMediaType(hash, index);

              return (
                <GridItem key={hash}>
                  <Box
                    position="relative"
                    cursor="pointer"
                    onClick={() => openMediaModal(hash, mediaType, `Evidencia ${index + 1}`)}
                    _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
                    transition="all 0.2s ease-in-out"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    {mediaType === 'image' ? (
                      <Box position="relative">
                        <OptimizedIPFSImage
                          hash={hash}
                          alt={`Evidencia ${index + 1}`}
                          w={{ base: "100px", md: "140px" }}
                          h={{ base: "100px", md: "140px" }}
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid"
                          borderColor="blue.300"
                          bg="gray.50"
                        />
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="green"
                          variant="solid"
                          fontSize="xs"
                          borderRadius="md"
                        >
                          🖼️
                        </Badge>
                      </Box>
                    ) : mediaType === 'video' ? (
                      <Box
                        w={{ base: "100px", md: "140px" }}
                        h={{ base: "100px", md: "140px" }}
                        bg="purple.100"
                        borderRadius="md"
                        border="2px solid"
                        borderColor="purple.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        _hover={{ bg: 'purple.200' }}
                      >
                        <Text fontSize={{ base: "32px", md: "40px" }}>🎥</Text>
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="purple"
                          variant="solid"
                          fontSize="xs"
                          borderRadius="md"
                        >
                          VIDEO
                        </Badge>
                      </Box>
                    ) : (
                      <Box
                        w={{ base: "100px", md: "140px" }}
                        h={{ base: "100px", md: "140px" }}
                        bg="red.100"
                        borderRadius="md"
                        border="2px solid"
                        borderColor="red.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        _hover={{ bg: 'red.200' }}
                      >
                        <Text fontSize={{ base: "32px", md: "40px" }}>📄</Text>
                        <Badge
                          position="absolute"
                          top={1}
                          right={1}
                          colorScheme="red"
                          variant="solid"
                          fontSize="xs"
                          borderRadius="md"
                        >
                          PDF
                        </Badge>
                      </Box>
                    )}
                    
                    <Text
                      fontSize={{ base: "xs", md: "sm" }}
                      textAlign="center"
                      mt={2}
                      color="blue.700"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      Evidencia {index + 1}
                    </Text>
                  </Box>
                </GridItem>
              );
            })}
          </Grid>

          <HStack spacing={2} w="100%" justify="center" flexWrap="wrap">
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
              💡 Almacenado en IPFS descentralizado
            </Text>
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              {IPFSMediaService.getCacheStats().gateways} gateways disponibles
            </Badge>
          </HStack>
        </VStack>
      </Box>

      {/* Modal optimizado para ver multimedia */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>
            <HStack justify="space-between">
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
              <Badge colorScheme="blue" variant="outline" fontSize="xs">
                IPFS Optimizado
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedMedia && (
              <Box textAlign="center">
                {selectedMedia.type === 'image' ? (
                  <OptimizedIPFSImage
                    hash={selectedMedia.hash}
                    alt={selectedMedia.name || 'Evidencia'}
                    maxW="100%"
                    maxH="60vh"
                    objectFit="contain"
                    borderRadius="md"
                    bg="gray.50"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <Box>
                    <video
                      src={getMediaUrl(selectedMedia.hash)}
                      controls
                      style={{
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        borderRadius: '8px'
                      }}
                      onError={() => {
                        toast({
                          title: 'Error cargando video',
                          description: 'Intenta abrir en nueva pestaña',
                          status: 'warning',
                          duration: 3000,
                          isClosable: true,
                        });
                      }}
                    >
                      Tu navegador no soporta el elemento video.
                    </video>
                  </Box>
                ) : (
                  <Box>
                    <iframe
                      src={getMediaUrl(selectedMedia.hash)}
                      width="100%"
                      height="60vh"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={selectedMedia.name || 'Documento PDF'}
                      onError={() => {
                        toast({
                          title: 'Error cargando PDF',
                          description: 'Intenta descargar el archivo',
                          status: 'warning',
                          duration: 3000,
                          isClosable: true,
                        });
                      }}
                    />
                    <Alert status="info" mt={3} size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Si el PDF no se muestra, puedes descargarlo o abrirlo en una nueva pestaña.
                      </Text>
                    </Alert>
                  </Box>
                )}
                
                <VStack mt={4} spacing={3}>
                  <Text fontSize="sm" color="gray.600" fontFamily="mono">
                    Hash IPFS: {selectedMedia.hash}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap" justify="center">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => window.open(getMediaUrl(selectedMedia.hash), '_blank')}
                    >
                      🔗 Abrir en Nueva Pestaña
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(getMediaUrl(selectedMedia.hash));
                        toast({
                          title: 'URL copiada',
                          description: 'La URL se copió al portapapeles',
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    >
                      📋 Copiar URL
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => handleDownload(
                        selectedMedia.hash, 
                        `evidencia-${selectedMedia.hash.slice(0, 8)}.${
                          selectedMedia.type === 'image' ? 'jpg' :
                          selectedMedia.type === 'video' ? 'mp4' : 'pdf'
                        }`
                      )}
                    >
                      💾 Descargar
                    </Button>
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
  );
};