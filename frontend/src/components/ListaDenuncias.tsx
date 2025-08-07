import { useEffect } from 'react'
import { useDenunciaAnonima } from '../hooks/useDenunciaAnonima'
import { Box, Heading, Text, Spinner, VStack, Badge, HStack, Divider, Button } from '@chakra-ui/react'

const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5'
import { NetworkHelper } from './NetworkHelper'
import { NuevaDenunciaNotification } from './NuevaDenunciaNotification'
import { IPFSContentViewer } from './IPFSContentViewer'
import { IPFSGatewayStatus } from './IPFSGatewayStatus'
import { PublicIPFSTest } from './PublicIPFSTest'
import PinataTest from './PinataTest'

export const ListaDenuncias = () => {
  const { denuncias, actualizarDenuncias, loading, error, nuevaDenunciaDetectada } = useDenunciaAnonima()

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
      <NetworkHelper error={error} onRetry={actualizarDenuncias} />
    </VStack>
  )

  if (denuncias.length === 0) {
    return (
      <VStack spacing={6} py={8}>
        <HStack justify="space-between" align="center" w="100%" mb={2}>
          <Heading size="md" color="brand.500">Denuncias en la Blockchain</Heading>
          <HStack spacing={2}>
            <PinataTest />
            <PublicIPFSTest />
            <IPFSGatewayStatus />
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              Contrato Actualizado
            </Badge>
          </HStack>
        </HStack>
        
        <VStack align="start" spacing={2} w="100%" mb={4}>
          <Text fontSize="sm" color="gray.600">
            Registro inmutable y seguro de denuncias anónimas verificadas mediante pruebas criptográficas
          </Text>
          
          {/* Mensaje informativo para modo solo lectura */}
          <Text fontSize="xs" color="green.600" bg="green.50" px={2} py={1} borderRadius="md">
            ℹ️ Modo solo lectura activo - no se requiere MetaMask para ver denuncias
          </Text>
          
          <Text fontSize="xs" color="blue.600" bg="blue.50" px={2} py={1} borderRadius="md">
            📋 Contrato actualizado con función de actualización de hash IPFS: 0x7B339806...361b66f5
          </Text>
        </VStack>

        <Box textAlign="center" py={8} bg="gray.50" borderRadius="lg" w="100%">
          <Text fontSize="2xl" mb={4}>📝</Text>
          <Text fontSize="lg" color="gray.600" fontWeight="bold" mb={2}>
            Historial Limpio - Contrato Actualizado
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Este es un contrato nuevo con funcionalidades mejoradas.
            Las denuncias anteriores estaban en el contrato anterior.
          </Text>
          <VStack spacing={2} align="start" bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
            <Text fontSize="sm" fontWeight="bold" color="green.700">✅ Nuevas funcionalidades:</Text>
            <Text fontSize="xs" color="gray.600">• Actualización automática de hash IPFS</Text>
            <Text fontSize="xs" color="gray.600">• Mejor manejo de contenido multimedia</Text>
            <Text fontSize="xs" color="gray.600">• Flujo optimizado: Blockchain → IPFS → Actualización</Text>
            <Text fontSize="xs" color="gray.600">• Soporte para PDFs y más formatos de video</Text>
          </VStack>
        </Box>
      </VStack>
    )
  }

  return (
    <Box position="relative">
      {/* Notificación de nueva denuncia */}
      <NuevaDenunciaNotification isVisible={nuevaDenunciaDetectada} />
      
      <HStack justify="space-between" align="center" mb={2}>
        <Heading size="md" color="brand.500">Denuncias en la Blockchain</Heading>
        <HStack spacing={2}>
          <PinataTest />
          <PublicIPFSTest />
          <IPFSGatewayStatus />
          <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
            {denuncias.length} denuncias
          </Badge>
          <Badge colorScheme="green" variant="outline" fontSize="xs">
            Contrato Actualizado
          </Badge>
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              console.log('🔄 Forzando actualización del historial...');
              actualizarDenuncias();
            }}
          >
            🔄 Actualizar
          </Button>
        </HStack>
      </HStack>
      <VStack align="start" spacing={2} mb={4}>
        <Text fontSize="sm" color="gray.600">
          Registro inmutable y seguro de denuncias anónimas verificadas mediante pruebas criptográficas
          {nuevaDenunciaDetectada && (
            <Text as="span" color="green.600" fontWeight="bold" ml={2}>
              • Actualizando en tiempo real...
            </Text>
          )}
        </Text>
        
        {/* Mensaje informativo para modo solo lectura */}
        <Text fontSize="xs" color="green.600" bg="green.50" px={2} py={1} borderRadius="md">
          ℹ️ Modo solo lectura activo - no se requiere MetaMask para ver denuncias
        </Text>
        
        <Text fontSize="xs" color="blue.600" bg="blue.50" px={2} py={1} borderRadius="md">
          Conectado al contrato: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)} en Mantle Sepolia
        </Text>
      </VStack>
      
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
                <Text fontSize="sm" color="gray.500" mb={1}>Descripción (Resumen)</Text>
                <Text color="gray.700" whiteSpace="pre-wrap" fontSize="sm">
                  {denuncia.descripcion || "No se proporcionó descripción"}
                </Text>
                {denuncia.descripcion && denuncia.descripcion.includes("...") && (
                  <Text fontSize="xs" color="blue.600" mt={1} fontStyle="italic">
                    💡 Descripción truncada - usa "Ver descripción completa" para el contenido completo
                  </Text>
                )}
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
              
              <Divider />
              
              <Box bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.700" fontWeight="bold" mb={2}>
                  📄 Contenido Completo en IPFS
                </Text>
                <VStack align="start" spacing={2}>
                  <HStack spacing={2} wrap="wrap">
                    <Text color="gray.600" fontSize="xs" fontFamily="mono" bg="white" px={2} py={1} borderRadius="md">
                      {denuncia.ipfsHash.slice(0, 20)}...{denuncia.ipfsHash.slice(-10)}
                    </Text>
                    <IPFSContentViewer 
                      hash={denuncia.ipfsHash} 
                      buttonText="📖 Ver contenido completo"
                      buttonSize="sm"
                    />
                  </HStack>
                  <Text fontSize="xs" color="blue.600">
                    ✅ Contenido completo, evidencia multimedia y metadatos almacenados de forma descentralizada
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  )
} 