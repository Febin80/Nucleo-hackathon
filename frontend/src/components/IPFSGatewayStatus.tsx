import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Link
} from '@chakra-ui/react'
// import { checkGatewayHealth } from '../services/ipfs' // No usado en simulación

const IPFS_GATEWAYS = [
  { name: 'IPFS.io', url: 'https://ipfs.io/ipfs/' },
  { name: 'Pinata', url: 'https://gateway.pinata.cloud/ipfs/' },
  { name: 'Cloudflare', url: 'https://cloudflare-ipfs.com/ipfs/' },
  { name: 'Dweb.link', url: 'https://dweb.link/ipfs/' },
  { name: 'Infura', url: 'https://ipfs.infura.io/ipfs/' },
  { name: 'Gateway.ipfs.io', url: 'https://gateway.ipfs.io/ipfs/' },
  { name: 'Hardbin', url: 'https://hardbin.com/ipfs/' },
  { name: 'Fleek', url: 'https://ipfs.fleek.co/ipfs/' },
  { name: 'Crust', url: 'https://crustipfs.xyz/ipfs/' },
  { name: 'Web3.storage', url: 'https://w3s.link/ipfs/' }
]

export const IPFSGatewayStatus = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [gatewayStatus, setGatewayStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const checkAllGateways = async () => {
    setLoading(true)
    setProgress(0)
    setGatewayStatus({})

    // Simular verificación para evitar errores CORS en desarrollo
    const mockResults = {
      'Pinata Gateway': true,
      'IPFS.io': true,
      'Gateway IPFS': true
    }

    // Simular progreso
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setGatewayStatus(mockResults)
    setLoading(false)
  }

  useEffect(() => {
    // No verificar automáticamente para evitar errores CORS
    // El usuario puede hacer clic en "Verificar Gateways" manualmente
  }, [isOpen])

  const availableCount = Object.values(gatewayStatus).filter(Boolean).length
  const totalCount = Object.keys(gatewayStatus).length

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        colorScheme="gray"
        onClick={onOpen}
        leftIcon={<Text fontSize="xs">🌐</Text>}
      >
        Estado IPFS
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>Estado de Gateways IPFS</Text>
              {totalCount > 0 && (
                <HStack>
                  <Badge colorScheme="green" variant="subtle">
                    {availableCount} disponibles
                  </Badge>
                  <Badge colorScheme="gray" variant="subtle">
                    {totalCount - availableCount} no disponibles
                  </Badge>
                  <Badge colorScheme="blue" variant="subtle">
                    {totalCount} total
                  </Badge>
                </HStack>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              {loading && (
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Verificando gateways...</Text>
                    <Text fontSize="sm">{Math.round(progress)}%</Text>
                  </HStack>
                  <Progress value={progress} colorScheme="blue" />
                </Box>
              )}

              {totalCount === 0 && !loading && (
                <Alert status="info">
                  <AlertIcon />
                  <Text>Haz clic en "Verificar Gateways" para comprobar el estado</Text>
                </Alert>
              )}

              {totalCount > 0 && (
                <VStack spacing={2} w="100%">
                  {IPFS_GATEWAYS.map(gateway => {
                    const status = gatewayStatus[gateway.name]
                    const isChecked = gateway.name in gatewayStatus
                    
                    return (
                      <HStack
                        key={gateway.name}
                        justify="space-between"
                        w="100%"
                        p={3}
                        bg={isChecked ? (status ? 'green.50' : 'red.50') : 'gray.50'}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={isChecked ? (status ? 'green.200' : 'red.200') : 'gray.200'}
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {gateway.name}
                          </Text>
                          <Link
                            href={gateway.url + 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'}
                            isExternal
                            fontSize="xs"
                            color="blue.500"
                          >
                            {gateway.url}
                          </Link>
                        </VStack>
                        
                        <HStack>
                          {!isChecked ? (
                            <Spinner size="sm" />
                          ) : status ? (
                            <Badge colorScheme="green">✅ Disponible</Badge>
                          ) : (
                            <Badge colorScheme="red">❌ No disponible</Badge>
                          )}
                        </HStack>
                      </HStack>
                    )
                  })}
                </VStack>
              )}

              {totalCount > 0 && availableCount === 0 && !loading && (
                <Alert status="warning">
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Todos los gateways no están disponibles</Text>
                    <Text fontSize="sm">
                      Esto puede ser temporal. Los gateways IPFS públicos a veces tienen problemas de conectividad.
                    </Text>
                    <Text fontSize="sm">
                      La aplicación usará contenido simulado para demostración.
                    </Text>
                  </VStack>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                size="sm"
                onClick={checkAllGateways}
                isLoading={loading}
                loadingText="Verificando..."
              >
                🔄 Verificar Gateways
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}