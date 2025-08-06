import { useState, useRef } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Progress,
  Image,
  IconButton,
  Badge,
  useToast,
  Flex,
  Tooltip
} from '@chakra-ui/react'

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  hash?: string;
  uploading?: boolean;
}

interface MediaUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const MediaUploader = ({ 
  onFilesChange, 
  maxFiles = 5, 
  maxSizeMB = 100 
}: MediaUploaderProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const allowedTypes = [
    // Imágenes
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 
    'video/quicktime', 'video/x-msvideo', 'video/3gpp', 'video/x-ms-wmv',
    'video/mp2t', 'video/mpeg', 'video/ogg', 'video/x-flv',
    // Documentos
    'application/pdf'
  ]

  const allowedExtensions = [
    // Imágenes
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff',
    // Videos
    '.mp4', '.avi', '.mov', '.wmv', '.webm', '.3gp', '.flv', '.mkv', '.m4v',
    // Documentos
    '.pdf'
  ]

  // Función para validar archivo por tipo MIME y extensión
  const isFileAllowed = (file: File): boolean => {
    // Primero verificar por tipo MIME
    if (allowedTypes.includes(file.type)) {
      return true
    }
    
    // Si el tipo MIME no coincide, verificar por extensión
    const fileName = file.name.toLowerCase()
    const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (hasAllowedExtension) {
      console.log(`✅ Archivo aceptado por extensión: ${file.name} (tipo MIME: ${file.type})`);
      return true
    }
    
    return false
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return
    
    // Validar cantidad total
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: 'Demasiados archivos',
        description: `Máximo ${maxFiles} archivos permitidos`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    const validFiles: MediaFile[] = []
    
    files.forEach(file => {
      // Debug: mostrar tipo MIME detectado
      console.log(`🔍 Archivo: ${file.name}, Tipo MIME: ${file.type}, Tamaño: ${file.size}`);
      
      // Validar tipo usando función mejorada
      if (!isFileAllowed(file)) {
        console.error(`❌ Tipo no permitido: ${file.type} para archivo ${file.name}`);
        console.log('✅ Tipos MIME permitidos:', allowedTypes);
        console.log('✅ Extensiones permitidas:', allowedExtensions);
        
        toast({
          title: 'Tipo no permitido',
          description: `${file.name}: Tipo detectado "${file.type}". Solo se permiten imágenes, videos y PDFs`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      // Validar tamaño
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: 'Archivo muy grande',
          description: `${file.name}: Máximo ${maxSizeMB}MB permitido`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      
      // Crear preview
      const preview = URL.createObjectURL(file)
      let type: 'image' | 'video' | 'document'
      if (file.type.startsWith('image/')) {
        type = 'image'
      } else if (file.type.startsWith('video/')) {
        type = 'video'
      } else {
        type = 'document'
      }
      
      validFiles.push({
        file,
        preview,
        type
      })
    })
    
    if (validFiles.length > 0) {
      const newMediaFiles = [...mediaFiles, ...validFiles]
      setMediaFiles(newMediaFiles)
      onFilesChange(newMediaFiles.map(mf => mf.file))
      
      toast({
        title: 'Archivos agregados',
        description: `${validFiles.length} archivo(s) listo(s) para subir`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index)
    setMediaFiles(newMediaFiles)
    onFilesChange(newMediaFiles.map(mf => mf.file))
    
    // Liberar URL del preview
    URL.revokeObjectURL(mediaFiles[index].preview)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type === 'application/pdf') return '📄'
    return '📄'
  }

  return (
    <VStack spacing={4} w="100%">
      <Box w="100%">
        <Text fontSize="sm" fontWeight="bold" mb={2}>
          📎 Evidencia Multimedia (Opcional)
        </Text>
        
        <Alert status="info" mb={3}>
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontSize="xs">
              Puedes subir fotos, videos y documentos PDF como evidencia de tu denuncia
            </Text>
            <Text fontSize="xs" color="gray.600">
              Máximo {maxFiles} archivos • {maxSizeMB}MB por archivo • Formatos: JPG, PNG, MP4, MOV, AVI, PDF, etc.
            </Text>
          </VStack>
        </Alert>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.mov,.avi,.mp4,.wmv,.webm,.3gp,.flv,.pdf,application/pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          colorScheme="blue"
          variant="outline"
          w="100%"
          isDisabled={mediaFiles.length >= maxFiles}
        >
          📁 Seleccionar Archivos ({mediaFiles.length}/{maxFiles})
        </Button>
      </Box>

      {mediaFiles.length > 0 && (
        <Box w="100%" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
          <Text fontSize="sm" fontWeight="bold" mb={3}>
            📋 Archivos Seleccionados:
          </Text>
          
          <VStack spacing={3}>
            {mediaFiles.map((mediaFile, index) => (
              <Box
                key={index}
                w="100%"
                p={3}
                bg="white"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.300"
              >
                <Flex align="center" gap={3}>
                  {/* Preview */}
                  <Box flexShrink={0}>
                    {mediaFile.type === 'image' ? (
                      <Image
                        src={mediaFile.preview}
                        alt={mediaFile.file.name}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      <Box
                        w="60px"
                        h="60px"
                        bg="gray.200"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="24px"
                      >
                        {mediaFile.type === 'video' ? '🎥' : '📄'}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Info */}
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                        {getFileIcon(mediaFile.file.type)} {mediaFile.file.name}
                      </Text>
                      <Badge 
                        colorScheme={
                          mediaFile.type === 'image' ? 'green' : 
                          mediaFile.type === 'video' ? 'blue' : 'purple'
                        } 
                        variant="subtle" 
                        fontSize="xs"
                      >
                        {mediaFile.type === 'image' ? 'Imagen' : 
                         mediaFile.type === 'video' ? 'Video' : 'PDF'}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="xs" color="gray.600">
                      {formatFileSize(mediaFile.file.size)} • {mediaFile.file.type}
                    </Text>
                    
                    {mediaFile.uploading && (
                      <Progress size="sm" isIndeterminate colorScheme="blue" w="100%" />
                    )}
                  </VStack>
                  
                  {/* Actions */}
                  <VStack spacing={1}>
                    <Tooltip label="Eliminar archivo">
                      <IconButton
                        aria-label="Eliminar"
                        icon={<Text fontSize="sm">🗑️</Text>}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeFile(index)}
                        isDisabled={uploading}
                      />
                    </Tooltip>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>
          
          <HStack justify="space-between" mt={3} pt={3} borderTop="1px solid" borderColor="gray.300">
            <Text fontSize="xs" color="gray.600">
              Total: {mediaFiles.length} archivo(s) • {formatFileSize(mediaFiles.reduce((acc, mf) => acc + mf.file.size, 0))}
            </Text>
            
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                mediaFiles.forEach(mf => URL.revokeObjectURL(mf.preview))
                setMediaFiles([])
                onFilesChange([])
              }}
              isDisabled={uploading}
            >
              🗑️ Limpiar Todo
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  )
}