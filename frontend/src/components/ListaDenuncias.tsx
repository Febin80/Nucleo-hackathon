import { useEffect } from 'react'
import { useDenunciaAnonima } from '../hooks/useDenunciaAnonima'
import { Box, Heading, Text, Link, Badge, Spinner, Alert, AlertIcon, VStack, Button } from '@chakra-ui/react'
import { getIPFSGatewayURL } from '../services/ipfs'

export const ListaDenuncias = () => {
  const { denuncias, actualizarDenuncias, loading, error } = useDenunciaAnonima()

  useEffect(() => {
    actualizarDenuncias()
  }, [actualizarDenuncias])

  if (loading) return (
    <Box textAlign="center" py={8}>
      <Spinner size="xl" />
      <Text mt={4}>Cargando denuncias...</Text>
    </Box>
  )

  if (error) return (
    <VStack spacing={4} align="stretch">
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
      <Button onClick={actualizarDenuncias} colorScheme="blue">
        Reintentar
      </Button>
    </VStack>
  )

  if (denuncias.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text fontSize="lg" color="gray.500">No hay denuncias registradas</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="md" mb={2} color="brand.500">Denuncias en la Blockchain</Heading>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Registro inmutable y seguro de denuncias anónimas verificadas mediante pruebas criptográficas
      </Text>
      <VStack spacing={4} align="stretch">
        {denuncias.map((denuncia, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="sm"
            bg="white"
          >
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Tipo de Acoso</Text>
                <Text fontWeight="bold" color="brand.700">{denuncia.tipoAcoso}</Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Descripción</Text>
                <Text color="gray.700" whiteSpace="pre-wrap">
                  {denuncia.descripcion || "No se proporcionó descripción"}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Denunciante</Text>
                <Text color="gray.700">
                  {denuncia.denunciante.slice(0, 6)}...{denuncia.denunciante.slice(-4)}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Fecha y Hora</Text>
                <Text color="gray.700">{denuncia.timestamp.toLocaleString()}</Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Documento en IPFS</Text>
                <Text color="gray.700" wordBreak="break-all">
                  Hash: {denuncia.ipfsHash}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Este hash permite acceder al documento completo de la denuncia de forma segura y descentralizada
                </Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  )
} 