import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Box, 
  Button, 
  VStack, 
  Text, 
  Code,
  Divider,
  useToast
} from '@chakra-ui/react'

interface NetworkHelperProps {
  error: string | null
  onRetry: () => void
}

export const NetworkHelper = ({ error, onRetry }: NetworkHelperProps) => {
  const toast = useToast()

  const addHardhatNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask no encontrado',
        description: 'Por favor instala MetaMask para continuar',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x138b',
          chainName: 'Mantle Sepolia Testnet',
          nativeCurrency: {
            name: 'Mantle',
            symbol: 'MNT',
            decimals: 18
          },
          rpcUrls: [
            'https://rpc.sepolia.mantle.xyz',
            'https://mantle-sepolia.drpc.org'
          ],
          blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz/']
        }],
      })
      
      toast({
        title: 'Red agregada',
        description: 'La red Mantle Sepolia se agregó correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      // Intentar cambiar a la red
      setTimeout(() => {
        onRetry()
      }, 1000)
      
    } catch (error) {
      console.error('Error al agregar red:', error)
      toast({
        title: 'Error al agregar red',
        description: 'Por favor agrega la red manualmente siguiendo las instrucciones',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (!error) return null

  const isNetworkError = error.includes('red') || error.includes('network') || error.includes('Hardhat')
  const isNodeError = error.includes('nodo') || error.includes('node') || error.includes('127.0.0.1')

  return (
    <Alert status="warning" flexDirection="column" alignItems="flex-start" p={6}>
      <AlertIcon />
      <AlertTitle mb={2}>
        {isNetworkError ? 'Problema de Red' : isNodeError ? 'Nodo No Disponible' : 'Error de Conexión'}
      </AlertTitle>
      
      <AlertDescription>
        <VStack align="stretch" spacing={4}>
          <Text>{error}</Text>
          
          <Divider />
          
          {isNetworkError && (
            <Box>
              <Text fontWeight="bold" mb={2}>🔧 Solución Automática:</Text>
              <Button colorScheme="blue" onClick={addHardhatNetwork} size="sm">
                Agregar Red Mantle Sepolia Automáticamente
              </Button>
            </Box>
          )}
          
          <Box>
            <Text fontWeight="bold" mb={2}>📋 Configuración Manual de MetaMask:</Text>
            <VStack align="stretch" spacing={2} bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="sm"><strong>Nombre:</strong> <Code>Mantle Sepolia Testnet</Code></Text>
              <Text fontSize="sm"><strong>RPC URL:</strong> <Code>https://rpc.sepolia.mantle.xyz</Code></Text>
              <Text fontSize="sm"><strong>Chain ID:</strong> <Code>5003</Code></Text>
              <Text fontSize="sm"><strong>Símbolo:</strong> <Code>MNT</Code></Text>
              <Text fontSize="sm"><strong>Explorador:</strong> <Code>https://explorer.sepolia.mantle.xyz/</Code></Text>
            </VStack>
          </Box>
          
          {isNodeError && (
            <Box>
              <Text fontWeight="bold" mb={2}>🌐 Verificar Conexión:</Text>
              <VStack align="stretch" spacing={2} bg="gray.50" p={3} borderRadius="md">
                <Text fontSize="sm">1. Verifica tu conexión a internet</Text>
                <Text fontSize="sm">2. Asegúrate de estar conectado a Mantle Sepolia en MetaMask</Text>
                <Text fontSize="sm">3. Si tienes fondos MNT de prueba, intenta hacer una transacción</Text>
                <Text fontSize="sm">4. Recarga esta página</Text>
              </VStack>
            </Box>
          )}
          
          <Button colorScheme="green" onClick={onRetry} size="sm">
            Reintentar Conexión
          </Button>
        </VStack>
      </AlertDescription>
    </Alert>
  )
}