
import { useDenunciaAnonimaSimple } from '../hooks/useDenunciaAnonimaSimple'
import { Box, Heading, Text, Spinner, VStack, Button, Alert, AlertIcon, Divider, HStack } from '@chakra-ui/react'
import { DiagnosticoRed } from './DiagnosticoRed'
import { IPFSContentViewer } from './IPFSContentViewer'
import { HistorialDebug } from './HistorialDebug'

export const ListaDenunciasSimple = () => {
  const { denuncias, loading, error, actualizarDenuncias } = useDenunciaAnonimaSimple()

  console.log('🎯 Componente renderizado:', { 
    denunciasCount: denuncias.length, 
    loading, 
    error 
  })

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} fontSize="lg">Cargando denuncias sin MetaMask...</Text>
        <Text fontSize="sm" color="gray.600">
          Conectando a blockchain pública...
        </Text>
      </Box>
    )
  }

  if (error) {
    return (
      <VStack spacing={6} py={8}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error al cargar denuncias</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
        
        <Button onClick={actualizarDenuncias} colorScheme="blue">
          🔄 Reintentar
        </Button>
        
        <Divider />
        
        <DiagnosticoRed />
        
        <Divider />
        
        <HistorialDebug />
      </VStack>
    )
  }

  if (denuncias.length === 0) {
    return (
      <VStack spacing={6} py={8}>
        <Box textAlign="center">
          <Text fontSize="2xl" mb={4}>📝</Text>
          <Heading size="md" mb={2}>No hay denuncias disponibles</Heading>
          <Text color="gray.600" mb={4}>
            El contrato no tiene denuncias registradas o hubo un problema al cargarlas.
          </Text>
          <Button onClick={actualizarDenuncias} colorScheme="blue">
            🔄 Actualizar
          </Button>
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
            Si el problema persiste, usa el diagnóstico para verificar la conectividad:
          </Text>
          <DiagnosticoRed />
          
          <Divider my={6} />
          
          <Text fontSize="sm" color="red.600" mb={4} textAlign="center" fontWeight="bold">
            🔧 Debug avanzado del historial:
          </Text>
          <HistorialDebug />
        </Box>
      </VStack>
    )
  }

  return (
    <Box>
      <Box mb={6}>
        <Heading size="lg" color="blue.600" mb={2}>
          🎉 Historial de Denuncias (Sin MetaMask)
        </Heading>
        <Text color="gray.600" mb={4}>
          Se encontraron <strong>{denuncias.length} denuncias</strong> en la blockchain
        </Text>
        <Button onClick={actualizarDenuncias} size="sm" colorScheme="blue" variant="outline">
          🔄 Actualizar
        </Button>
      </Box>

      <VStack spacing={4} align="stretch">
        {denuncias.map((denuncia) => (
          <Box
            key={denuncia.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="sm"
            bg="white"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Denuncia #{denuncia.id}
                </Text>
                <Heading size="md" color="red.600">
                  {denuncia.tipoAcoso}
                </Heading>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Descripción</Text>
                <Text color="gray.700">
                  {denuncia.descripcion}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Denunciante</Text>
                <Text fontFamily="mono" fontSize="sm" color="blue.600">
                  {denuncia.denunciante.slice(0, 10)}...{denuncia.denunciante.slice(-8)}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Fecha</Text>
                <Text color="gray.700">
                  {denuncia.timestamp.toLocaleString()}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>IPFS Hash</Text>
                <Text fontFamily="mono" fontSize="xs" color="green.600" bg="green.50" p={2} borderRadius="md">
                  {denuncia.ipfsHash}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Estado</Text>
                <Text color={denuncia.esPublica ? "green.600" : "orange.600"}>
                  {denuncia.esPublica ? "✅ Pública" : "🔒 Privada"}
                </Text>
              </Box>

              {/* Botones para ver contenido IPFS */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>Acciones</Text>
                <HStack spacing={3}>
                  <IPFSContentViewer 
                    hash={denuncia.ipfsHash}
                    buttonText="Ver descripción completa"
                    buttonSize="sm"
                  />
                </HStack>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>

      <Box mt={6} p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
        <Text fontSize="sm" color="green.700" fontWeight="bold" mb={2}>
          ✅ ¡Funciona sin MetaMask!
        </Text>
        <Text fontSize="xs" color="green.600">
          Este historial se carga directamente desde la blockchain pública sin necesidad de instalar MetaMask.
          Los usuarios pueden ver todas las denuncias sin barreras técnicas.
        </Text>
      </Box>
    </Box>
  )
}