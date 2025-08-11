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

// Función para limpiar y corregir hashes IPFS
const cleanIPFSHash = (hash: string): string => {
  if (!hash) return hash;
  
  // Remover espacios y caracteres extraños
  let cleaned = hash.trim();
  
  // Si es un hash Qm y tiene longitud incorrecta, intentar corregir
  if (cleaned.startsWith('Qm')) {
    // Si es muy largo, truncar a 46 caracteres
    if (cleaned.length > 46) {
      console.warn(`⚠️ Hash Qm muy largo (${cleaned.length}), truncando a 46: ${cleaned}`);
      cleaned = cleaned.substring(0, 46);
    }
    // Si es muy corto y parece que se duplicó el final, intentar corregir
    else if (cleaned.length < 46 && cleaned.length > 40) {
      console.warn(`⚠️ Hash Qm muy corto (${cleaned.length}), usando como está: ${cleaned}`);
    }
  }
  
  return cleaned;
}

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
      // Limpiar el hash primero
      const cleanedHash = cleanIPFSHash(hash);
      
      // Validación mejorada del hash
      if (!cleanedHash || cleanedHash.length < 10) {
        console.error(`❌ Hash IPFS vacío o muy corto: ${cleanedHash}`);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Verificar formato básico
      const validPrefixes = ['Qm', 'bafy', 'bafk', 'bafz'];
      const hasValidPrefix = validPrefixes.some(prefix => cleanedHash.startsWith(prefix));
      
      if (!hasValidPrefix) {
        console.error(`❌ Hash IPFS con prefijo inválido: ${cleanedHash}`);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Verificar longitud específica
      if (cleanedHash.startsWith('Qm') && cleanedHash.length !== 46) {
        console.error(`❌ Hash Qm con longitud incorrecta: ${cleanedHash.length} (debe ser 46). Hash: ${cleanedHash}`);
        console.error(`   Hash original: ${hash}`);
        console.error(`   Hash limpiado: ${cleanedHash}`);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔄 OptimizedIPFSImage: Cargando imagen para hash válido ${cleanedHash.slice(0, 10)}...`);
        if (cleanedHash !== hash) {
          console.log(`   Hash original: ${hash}`);
          console.log(`   Hash limpiado: ${cleanedHash}`);
        }
        
        // Usar URLs directas más confiables con el hash limpiado
        const directUrls = [
          `https://dweb.link/ipfs/${cleanedHash}`,
          `https://cloudflare-ipfs.com/ipfs/${cleanedHash}`,
          `https://ipfs.io/ipfs/${cleanedHash}`
        ];
        
        if (isMounted) {
          console.log(`✅ OptimizedIPFSImage: Usando URL directa: ${directUrls[0].split('/')[2]}`);
          setImageUrl(directUrls[0]);
        }
      } catch (error) {
        console.error(`❌ OptimizedIPFSImage: Error configurando URL para ${cleanedHash}:`, error);
        
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
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
    const currentUrl = imageUrl;
    const gatewayName = currentUrl ? currentUrl.split('/')[2] : 'unknown';
    
    console.warn(`❌ OptimizedIPFSImage: Error cargando imagen para ${hash.slice(0, 10)}... desde ${gatewayName}`);
    console.warn(`   Hash completo: ${hash}`);
    console.warn(`   URL que falló: ${currentUrl}`);
    
    if (retryCount < 2) {
      console.log(`🔄 OptimizedIPFSImage: Reintentando con gateway alternativo... (${retryCount + 1}/2)`);
      
      // Probar gateways alternativos
      const alternativeUrls = [
        `https://cloudflare-ipfs.com/ipfs/${hash}`,
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`
      ];
      
      const nextUrl = alternativeUrls[retryCount];
      if (nextUrl) {
        console.log(`🔄 Probando gateway alternativo: ${nextUrl.split('/')[2]}`);
        setImageUrl(nextUrl);
      }
      
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.error(`❌ OptimizedIPFSImage: Todos los reintentos fallaron para hash: ${hash}`);
      console.error(`   Posibles causas:`);
      console.error(`   - Hash inválido o corrupto`);
      console.error(`   - Contenido no existe en IPFS`);
      console.error(`   - Problemas de conectividad con gateways`);
      
      setHasError(true);
      setIsLoading(false);
      
      // Solo mostrar toast si es un error inesperado (no para hashes claramente inválidos)
      if (hash.length === 46 && hash.startsWith('Qm')) {
        toast({
          title: 'Imagen no disponible',
          description: `Hash IPFS no accesible: ${hash.slice(0, 10)}...`,
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  if (hasError) {
    // Determinar el tipo de error
    const isInvalidLength = hash.startsWith('Qm') && hash.length !== 46;
    const isInvalidPrefix = !['Qm', 'bafy', 'bafk', 'bafz'].some(prefix => hash.startsWith(prefix));
    
    return (
      <Box
        {...props}
        bg={isInvalidLength || isInvalidPrefix ? "red.50" : "gray.100"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        border="2px dashed"
        borderColor={isInvalidLength || isInvalidPrefix ? "red.300" : "gray.300"}
        cursor="pointer"
        _hover={{ bg: isInvalidLength || isInvalidPrefix ? "red.100" : "gray.200" }}
        onClick={() => {
          if (imageUrl && !isInvalidLength && !isInvalidPrefix) {
            window.open(imageUrl, '_blank');
          }
        }}
      >
        <Text fontSize="24px">{isInvalidLength || isInvalidPrefix ? '⚠️' : '🖼️'}</Text>
        <Text fontSize="xs" color={isInvalidLength || isInvalidPrefix ? "red.600" : "gray.600"} textAlign="center" px={2}>
          {isInvalidLength ? 'Hash inválido (longitud)' : 
           isInvalidPrefix ? 'Hash inválido (formato)' : 
           'Imagen no disponible'}
        </Text>
        <Text fontSize="xs" color="gray.500" textAlign="center" px={2} fontFamily="mono">
          {hash.slice(0, 8)}...{hash.slice(-4)}
        </Text>
        {isInvalidLength && (
          <Text fontSize="2xs" color="red.500" textAlign="center" px={2} mt={1}>
            Longitud: {hash.length} (debe ser 46)
          </Text>
        )}
        {!isInvalidLength && !isInvalidPrefix && (
          <Text fontSize="2xs" color="blue.500" textAlign="center" px={2} mt={1}>
            Clic para intentar abrir
          </Text>
        )}
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