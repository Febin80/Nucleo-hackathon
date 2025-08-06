import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Badge,
  useToast,
  Switch,
  Divider
} from '@chakra-ui/react'
import { EncryptionService } from '../services/encryption'

interface EncryptionFormProps {
  onEncryptedContent: (encryptedContent: string, password: string) => void
  originalContent: string
}

export const EncryptionForm = ({ onEncryptedContent, originalContent }: EncryptionFormProps) => {
  const [useEncryption, setUseEncryption] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [encryptedContent, setEncryptedContent] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const generatePassword = () => {
    const newPassword = EncryptionService.generateSecurePassword(16)
    setPassword(newPassword)
    setConfirmPassword(newPassword)
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una contraseña segura automáticamente',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleEncrypt = async () => {
    if (!password) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Contraseña débil',
        description: 'La contraseña debe tener al menos 8 caracteres',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const encrypted = EncryptionService.createEncryptedPackage(originalContent, password)
      setEncryptedContent(encrypted)
      onEncryptedContent(encrypted, password)
      
      toast({
        title: 'Contenido cifrado',
        description: 'El contenido ha sido cifrado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error al cifrar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    toast({
      title: 'Contraseña copiada',
      description: 'La contraseña ha sido copiada al portapapeles',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  if (!useEncryption) {
    return (
      <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
        <VStack spacing={3}>
          <HStack justify="space-between" w="100%">
            <Text fontWeight="bold" color="blue.700">🔒 Cifrado de contenido</Text>
            <Switch
              colorScheme="blue"
              isChecked={useEncryption}
              onChange={(e) => setUseEncryption(e.target.checked)}
            />
          </HStack>
          <Text fontSize="sm" color="blue.600">
            Activa el cifrado para proteger el contenido de tu denuncia en IPFS
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
      <VStack spacing={4}>
        <HStack justify="space-between" w="100%">
          <Text fontWeight="bold" color="orange.700">🔐 Configuración de cifrado</Text>
          <Switch
            colorScheme="orange"
            isChecked={useEncryption}
            onChange={(e) => setUseEncryption(e.target.checked)}
          />
        </HStack>

        <Alert status="warning" size="sm">
          <AlertIcon />
          <Text fontSize="sm">
            <strong>Importante:</strong> Guarda la contraseña de forma segura. Sin ella no podrás descifrar el contenido.
          </Text>
        </Alert>

        <FormControl>
          <FormLabel fontSize="sm">Contraseña de cifrado</FormLabel>
          <HStack>
            <Input
              type="password"
              placeholder="Ingresa una contraseña segura..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="sm"
            />
            <Button size="sm" onClick={generatePassword} variant="outline">
              🎲 Generar
            </Button>
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">Confirmar contraseña</FormLabel>
          <Input
            type="password"
            placeholder="Confirma la contraseña..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="sm"
          />
        </FormControl>

        {password && (
          <Box w="100%">
            <Text fontSize="sm" color="gray.600" mb={2}>Contraseña actual:</Text>
            <HStack>
              <Badge colorScheme="gray" fontFamily="mono" fontSize="xs" p={2}>
                {password}
              </Badge>
              <Button size="xs" onClick={copyPassword} variant="ghost">
                📋 Copiar
              </Button>
            </HStack>
          </Box>
        )}

        <Button
          colorScheme="orange"
          onClick={handleEncrypt}
          isLoading={loading}
          loadingText="Cifrando..."
          size="sm"
          w="100%"
        >
          🔐 Cifrar contenido
        </Button>

        {encryptedContent && (
          <>
            <Divider />
            <Box w="100%">
              <Text fontSize="sm" color="green.600" mb={2}>✅ Contenido cifrado exitosamente</Text>
              <Box
                bg="gray.100"
                p={3}
                borderRadius="md"
                maxH="100px"
                overflowY="auto"
              >
                <Text fontSize="xs" fontFamily="mono" color="gray.700">
                  {encryptedContent.substring(0, 200)}...
                </Text>
              </Box>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  )
}