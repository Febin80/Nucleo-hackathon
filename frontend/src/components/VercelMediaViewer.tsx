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
import { VercelIPFSService } from '../services/ipfs-vercel-fix'

interface VercelMediaViewerProps {
  mediaHashes: string[]
  mediaTypes?: string[]
  title?: string
  maxWidth?: string
}

// Componente para mostrar imagen almacenada en Vercel
const VercelImage = ({ hash, alt, ...props }: { hash: string; alt: string; [key: string]: any }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadImage = () => {
      console.log(`🖼️ [VERCEL] Cargando imagen: ${hash.slice(0, 15)}...`)
      
      try {
        const blobUrl = VercelIPFSService.getFileAsBlob(hash)
        if (blobUrl) {
          setImageSrc(blobUrl)
          setIsLoading(false)
          console.log(`✅ [VERCEL] Imagen cargada exitosamente: ${hash.slice(0, 15)}...`)
        } else {
          console.warn(`⚠️ [VERCEL] No se pudo cargar imagen: ${hash}`)
          setHasError(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(`❌ [VERCEL] Error cargando imagen:`, error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadImage()
  }, [hash])

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="200px" {...props}>
        <VStack>
          <Spinner size="lg" />
          <Text fontSize="sm" color="gray.500">Cargando imagen...</Text>
        </VStack>
      </Box>
    )
  }

  if (hasError || !imageSrc) {
    return (
      <Box p={4} border="1px" borderColor="red.200" borderRadius="md" {...props}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontSize="sm">No se pudo cargar la imagen</Text>
            <Text fontSize="xs" color="gray.500">CID: {hash}</Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      borderRadius="md"
      maxW="100%"
      {...props}
    />
  )
}

export const VercelMediaViewer = ({ 
  mediaHashes, 
  mediaTypes = [], 
  title = "Archivos multimedia",
  maxWidth = "100%"
}: VercelMediaViewerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!mediaHashes || mediaHashes.length === 0) {
    return null
  }

  const openModal = (index: number) => {
    setSelectedIndex(index)
    onOpen()
  }

  const getMediaType = (index: number): string => {
    if (mediaTypes && mediaTypes[index]) {
      return mediaTypes[index]
    }
    return 'image/jpeg' // Default
  }

  const isImage = (type: string): boolean => {
    return type.startsWith('image/')
  }

  return (
    <Box maxW={maxWidth}>
      <Text fontWeight="bold" mb={3} fontSize="sm">
        {title} ({mediaHashes.length})
      </Text>
      
      <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={3}>
        {mediaHashes.map((hash, index) => {
          const mediaType = getMediaType(index)
          
          return (
            <GridItem key={hash}>
              <Box
                position="relative"
                cursor="pointer"
                onClick={() => openModal(index)}
                _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
              >
                {isImage(mediaType) ? (
                  <VercelImage
                    hash={hash}
                    alt={`Evidencia ${index + 1}`}
                    maxH="150px"
                    objectFit="cover"
                    w="100%"
                  />
                ) : (
                  <Box
                    h="150px"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="md"
                  >
                    <VStack>
                      <Text fontSize="2xl">📄</Text>
                      <Text fontSize="xs" textAlign="center">
                        {mediaType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Text>
                    </VStack>
                  </Box>
                )}
                
                <Badge
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="blue"
                  fontSize="xs"
                >
                  {index + 1}
                </Badge>
              </Box>
            </GridItem>
          )
        })}
      </Grid>

      {/* Modal para vista ampliada */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Evidencia {selectedIndex + 1}
            <Badge ml={2} colorScheme="blue">
              {getMediaType(selectedIndex).split('/')[1]?.toUpperCase()}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {isImage(getMediaType(selectedIndex)) ? (
              <VercelImage
                hash={mediaHashes[selectedIndex]}
                alt={`Evidencia ${selectedIndex + 1}`}
                maxW="100%"
                maxH="70vh"
                objectFit="contain"
              />
            ) : (
              <Box textAlign="center" py={8}>
                <Text fontSize="4xl" mb={4}>📄</Text>
                <Text>Archivo: {getMediaType(selectedIndex)}</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  CID: {mediaHashes[selectedIndex]}
                </Text>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                isDisabled={selectedIndex === 0}
              >
                ← Anterior
              </Button>
              <Text fontSize="sm">
                {selectedIndex + 1} de {mediaHashes.length}
              </Text>
              <Button
                size="sm"
                onClick={() => setSelectedIndex(Math.min(mediaHashes.length - 1, selectedIndex + 1))}
                isDisabled={selectedIndex === mediaHashes.length - 1}
              >
                Siguiente →
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}