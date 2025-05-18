'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Text,
  Heading,
} from '@chakra-ui/react'
import { useDenunciaAnonima } from '@/hooks/useDenunciaAnonima'

export const DenunciaForm = () => {
  const [formData, setFormData] = useState({
    tipoAcoso: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
  })
  const { crearDenuncia, loading, error } = useDenunciaAnonima()
  const toast = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Aquí iría la lógica para subir el archivo a IPFS
      const ipfsHash = "QmTest123" // Esto sería el hash real de IPFS
      
      const txHash = await crearDenuncia(formData.tipoAcoso, ipfsHash)
      
      if (txHash) {
        toast({
          title: "Denuncia creada",
          description: "Tu denuncia ha sido registrada exitosamente en la blockchain.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        
        // Limpiar el formulario
        setFormData({
          tipoAcoso: '',
          descripcion: '',
          fecha: '',
          ubicacion: '',
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Hubo un error al crear la denuncia. Por favor, intenta nuevamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6}>
        <Heading size="md" mb={4}>Formulario de Denuncia</Heading>

        <FormControl isRequired>
          <FormLabel>Tipo de Acoso</FormLabel>
          <Select
            name="tipoAcoso"
            value={formData.tipoAcoso}
            onChange={handleChange}
            placeholder="Selecciona el tipo de acoso"
          >
            <option value="laboral">Acoso Laboral</option>
            <option value="sexual">Acoso Sexual</option>
            <option value="escolar">Acoso Escolar</option>
            <option value="ciber">Ciberacoso</option>
            <option value="otro">Otro</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe los hechos en detalle"
            rows={4}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Fecha del Incidente</FormLabel>
          <Input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Ubicación</FormLabel>
          <Input
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Lugar donde ocurrió el incidente"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          width="full"
          isLoading={loading}
          loadingText="Enviando..."
        >
          Enviar Denuncia
        </Button>

        {error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}
      </VStack>
    </Box>
  )
} 