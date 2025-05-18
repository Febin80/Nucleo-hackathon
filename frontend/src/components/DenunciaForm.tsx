import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useToast,
  Textarea,
  Card,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useDenunciaAnonima } from '../hooks/useDenunciaAnonima'

export const DenunciaForm = () => {
  const [tipoAcoso, setTipoAcoso] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { crearDenuncia } = useDenunciaAnonima()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Usar un hash IPFS de prueba
      const ipfsHashTest = "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ"
      const txHash = await crearDenuncia(tipoAcoso, ipfsHashTest)

      if (txHash) {
        toast({
          title: 'Denuncia creada',
          description: 'Tu denuncia ha sido registrada en la blockchain',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        setTipoAcoso('')
        setDescripcion('')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la denuncia')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la denuncia',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card width="100%" maxW="800px" mx="auto">
      <CardBody>
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="md">Crear Nueva Denuncia</Heading>
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>Tipo de Acoso</FormLabel>
            <Select
              placeholder="Selecciona el tipo de acoso"
              value={tipoAcoso}
              onChange={(e) => setTipoAcoso(e.target.value)}
            >
              <option value="acoso_laboral">Acoso Laboral</option>
              <option value="acoso_escolar">Acoso Escolar</option>
              <option value="acoso_sexual">Acoso Sexual</option>
              <option value="acoso_digital">Acoso Digital</option>
              <option value="otro">Otro</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              placeholder="Describe la situación..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              minH="150px"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            isLoading={loading}
            loadingText="Enviando denuncia..."
          >
            Enviar Denuncia
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
} 