import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  Badge,
  Divider,
  List,
  ListItem,
  Link,
  useColorModeValue
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export const Home = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const addMantleNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask no está instalado. Por favor instala MetaMask primero.')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x138b', // 5003 en hexadecimal
          chainName: 'Mantle Sepolia Testnet',
          nativeCurrency: {
            name: 'Mantle',
            symbol: 'MNT',
            decimals: 18
          },
          rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
          blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz/']
        }]
      })
      alert('¡Red Mantle Sepolia agregada exitosamente!')
    } catch (error) {
      console.error('Error al agregar red:', error)
      alert('Error al agregar la red. Por favor agrega manualmente.')
    }
  }

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="container.lg" px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading 
              size={{ base: "xl", md: "2xl" }} 
              mb={4} 
              color="blue.600"
              px={{ base: 2, md: 0 }}
            >
              🛡️ DenunciaChain v2.2 - Fixed Deploy
            </Heading>
            <Text 
              fontSize={{ base: "md", md: "xl" }} 
              color="gray.600" 
              maxW="600px" 
              mx="auto"
              px={{ base: 2, md: 0 }}
            >
              Plataforma descentralizada para denuncias anónimas usando blockchain y IPFS
            </Text>
            <HStack 
              justify="center" 
              mt={4} 
              spacing={{ base: 2, md: 4 }}
              flexWrap="wrap"
            >
              <Badge colorScheme="blue" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Blockchain</Badge>
              <Badge colorScheme="green" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>IPFS</Badge>
              <Badge colorScheme="purple" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Anónimo</Badge>
              <Badge colorScheme="orange" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Inmutable</Badge>
            </HStack>
          </Box>

          {/* Qué es DenunciaChain */}
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="lg" mb={4} color="blue.600">
                🎯 ¿Qué es DenunciaChain?
              </Heading>
              <VStack align="start" spacing={3}>
                <Text>
                  DenunciaChain es una plataforma revolucionaria que permite realizar denuncias anónimas 
                  de manera segura y transparente utilizando tecnología blockchain e IPFS.
                </Text>
                <VStack 
                  direction={{ base: "column", md: "row" }} 
                  align="start" 
                  spacing={{ base: 4, md: 4 }}
                  w="100%"
                >
                  <VStack align="start" flex={1} w={{ base: "100%", md: "auto" }}>
                    <Text fontWeight="bold" color="green.600">✅ Ventajas:</Text>
                    <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                      <ListItem>🔒 Completamente anónimo</ListItem>
                      <ListItem>🌐 Descentralizado e inmutable</ListItem>
                      <ListItem>📄 Evidencia multimedia soportada</ListItem>
                      <ListItem>🔐 Cifrado opcional de contenido</ListItem>
                      <ListItem>⚡ Acceso global 24/7</ListItem>
                    </List>
                  </VStack>
                  <VStack align="start" flex={1} w={{ base: "100%", md: "auto" }}>
                    <Text fontWeight="bold" color="blue.600">🛠️ Tecnologías:</Text>
                    <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                      <ListItem>⛓️ Mantle Sepolia Blockchain</ListItem>
                      <ListItem>📦 IPFS para almacenamiento</ListItem>
                      <ListItem>🦊 MetaMask para autenticación</ListItem>
                      <ListItem>🔐 Cifrado AES-256-CBC</ListItem>
                      <ListItem>📱 Interfaz web responsive</ListItem>
                    </List>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Configuración Requerida */}
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="lg" mb={4} color="orange.600">
                ⚙️ Configuración Requerida
              </Heading>
              
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Importante:</strong> Necesitas MetaMask y la red Mantle Sepolia configurada para usar DenunciaChain.
                </Text>
              </Alert>

              <VStack align="start" spacing={6}>
                {/* Paso 1: MetaMask */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="blue" fontSize="sm">PASO 1</Badge>
                    <Heading size="md">🦊 Instalar MetaMask</Heading>
                  </HStack>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text>MetaMask es necesario para interactuar con la blockchain:</Text>
                    <HStack>
                      <Link href="https://metamask.io/download/" isExternal color="blue.500">
                        Descargar MetaMask <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>
                    <List spacing={1} fontSize="sm" color="gray.600">
                      <ListItem>• Instala la extensión en tu navegador</ListItem>
                      <ListItem>• Crea una nueva wallet o importa una existente</ListItem>
                      <ListItem>• Guarda tu frase de recuperación de forma segura</ListItem>
                    </List>
                  </VStack>
                </Box>

                <Divider />

                {/* Paso 2: Mantle Sepolia */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="green" fontSize="sm">PASO 2</Badge>
                    <Heading size="md">🌐 Configurar Mantle Sepolia Testnet</Heading>
                  </HStack>
                  <VStack align="start" spacing={3} pl={4}>
                    <Text>DenunciaChain funciona en la red de prueba Mantle Sepolia:</Text>
                    
                    <Button 
                      colorScheme="green" 
                      onClick={addMantleNetwork}
                      leftIcon={<Text>🚀</Text>}
                      size={{ base: "sm", md: "md" }}
                      w={{ base: "100%", md: "auto" }}
                    >
                      Agregar Mantle Sepolia Automáticamente
                    </Button>

                    <Box bg="gray.100" p={{ base: 2, md: 3 }} borderRadius="md" w="100%">
                      <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" mb={2}>📋 Configuración Manual:</Text>
                      <VStack align="start" spacing={1} fontSize={{ base: "2xs", md: "xs" }} fontFamily="mono">
                        <Text wordBreak="break-all"><strong>Nombre de Red:</strong> Mantle Sepolia Testnet</Text>
                        <Text wordBreak="break-all"><strong>RPC URL:</strong> https://rpc.sepolia.mantle.xyz</Text>
                        <Text><strong>Chain ID:</strong> 5003</Text>
                        <Text><strong>Símbolo:</strong> MNT</Text>
                        <Text wordBreak="break-all"><strong>Explorador:</strong> https://explorer.sepolia.mantle.xyz</Text>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>

                <Divider />

                {/* Paso 3: Tokens de Prueba */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="purple" fontSize="sm">PASO 3</Badge>
                    <Heading size="md">💰 Obtener Tokens de Prueba (MNT)</Heading>
                  </HStack>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text>Necesitas tokens MNT para pagar las transacciones:</Text>
                    <HStack>
                      <Link href="https://faucet.sepolia.mantle.xyz/" isExternal color="purple.500">
                        Faucet de Mantle Sepolia <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>
                    <List spacing={1} fontSize="sm" color="gray.600">
                      <ListItem>• Conecta tu wallet MetaMask</ListItem>
                      <ListItem>• Solicita tokens MNT gratuitos</ListItem>
                      <ListItem>• Espera unos minutos para recibir los tokens</ListItem>
                    </List>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Cómo Usar */}
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="lg" mb={4} color="green.600">
                📝 Cómo Usar DenunciaChain
              </Heading>

              <VStack align="start" spacing={6}>
                {/* Crear Denuncia */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="blue" fontSize="sm">CREAR</Badge>
                    <Heading size="md">📝 Crear Nueva Denuncia</Heading>
                  </HStack>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text>Proceso de 3 pasos para crear una denuncia:</Text>
                    <List spacing={2} fontSize="sm">
                      <ListItem>
                        <HStack>
                          <Badge size="sm" colorScheme="blue">1</Badge>
                          <Text><strong>Aceptar Contrato:</strong> Conecta tu wallet MetaMask</Text>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <Badge size="sm" colorScheme="green">2</Badge>
                          <Text><strong>Registrar en Blockchain:</strong> Se crea el registro inmutable</Text>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <Badge size="sm" colorScheme="purple">3</Badge>
                          <Text><strong>Subir a IPFS:</strong> Se almacena el contenido descentralizado</Text>
                        </HStack>
                      </ListItem>
                    </List>
                  </VStack>
                </Box>

                <Divider />

                {/* Tipos de Contenido */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="orange" fontSize="sm">CONTENIDO</Badge>
                    <Heading size="md">📄 Tipos de Contenido Soportados</Heading>
                  </HStack>
                  <VStack align="start" spacing={2} pl={4}>
                    <VStack 
                      direction={{ base: "column", md: "row" }} 
                      spacing={{ base: 4, md: 8 }}
                      align="start"
                      w="100%"
                    >
                      <VStack align="start" w={{ base: "100%", md: "auto" }}>
                        <Text fontWeight="bold" color="green.600">📝 Texto:</Text>
                        <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                          <ListItem>• Descripción detallada</ListItem>
                          <ListItem>• Cifrado opcional</ListItem>
                          <ListItem>• Categorización por tipo</ListItem>
                        </List>
                      </VStack>
                      <VStack align="start" w={{ base: "100%", md: "auto" }}>
                        <Text fontWeight="bold" color="blue.600">📎 Multimedia:</Text>
                        <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                          <ListItem>• Imágenes (JPG, PNG, GIF)</ListItem>
                          <ListItem>• Videos (MP4, MOV, AVI)</ListItem>
                          <ListItem>• Documentos (PDF)</ListItem>
                        </List>
                      </VStack>
                    </VStack>
                  </VStack>
                </Box>

                <Divider />

                {/* Cómo Descifrar */}
                <Box w="100%">
                  <HStack mb={3}>
                    <Badge colorScheme="red" fontSize="sm">DESCIFRAR</Badge>
                    <Heading size="md">🔓 Cómo Descifrar Contenido Cifrado</Heading>
                  </HStack>
                  <VStack align="start" spacing={3} pl={4}>
                    <Text>Si una denuncia tiene contenido cifrado, puedes descifrarlo siguiendo estos pasos:</Text>
                    
                    <Alert status="info" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">
                        <strong>Identificación:</strong> Las denuncias cifradas muestran "🔒 Denuncia cifrada" en lugar de la descripción completa.
                      </Text>
                    </Alert>

                    <List spacing={2} fontSize="sm">
                      <ListItem>
                        <HStack align="start">
                          <Badge size="sm" colorScheme="blue">1</Badge>
                          <VStack align="start" spacing={1}>
                            <Text><strong>Ir al Historial:</strong> Ve a la pestaña "📋 Historial"</Text>
                            <Text fontSize="xs" color="gray.600">Busca denuncias que muestren "🔒 Denuncia cifrada"</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start">
                          <Badge size="sm" colorScheme="green">2</Badge>
                          <VStack align="start" spacing={1}>
                            <Text><strong>Hacer clic en "Ver contenido completo":</strong> Botón azul en cada denuncia</Text>
                            <Text fontSize="xs" color="gray.600">Se abrirá una ventana modal con el contenido IPFS</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start">
                          <Badge size="sm" colorScheme="purple">3</Badge>
                          <VStack align="start" spacing={1}>
                            <Text><strong>Ingresar contraseña:</strong> Aparecerá un campo de contraseña</Text>
                            <Text fontSize="xs" color="gray.600">Ingresa la contraseña que se generó al crear la denuncia</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start">
                          <Badge size="sm" colorScheme="orange">4</Badge>
                          <VStack align="start" spacing={1}>
                            <Text><strong>Hacer clic en "🔓 Descifrar":</strong> El contenido se descifrará automáticamente</Text>
                            <Text fontSize="xs" color="gray.600">Verás el contenido completo, incluyendo multimedia si la hay</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                    </List>

                    <Box bg="yellow.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="yellow.400">
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="bold" color="yellow.800">
                          ⚠️ Importante sobre las contraseñas:
                        </Text>
                        <List spacing={1} fontSize="xs" color="yellow.700">
                          <ListItem>• Las contraseñas se generan automáticamente al cifrar</ListItem>
                          <ListItem>• Debes guardar la contraseña cuando creas la denuncia</ListItem>
                          <ListItem>• Sin la contraseña, el contenido no se puede descifrar</ListItem>
                          <ListItem>• Las contraseñas no se almacenan en la blockchain</ListItem>
                        </List>
                      </VStack>
                    </Box>

                    <Box bg="green.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="green.400">
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="bold" color="green.800">
                          💡 Consejos para el descifrado:
                        </Text>
                        <List spacing={1} fontSize="xs" color="green.700">
                          <ListItem>• Usa el botón "🐛 Debug" si hay problemas</ListItem>
                          <ListItem>• Verifica que la contraseña sea correcta</ListItem>
                          <ListItem>• El descifrado funciona con cifrado AES-256-CBC</ListItem>
                          <ListItem>• Puedes ver tanto el contenido original como el cifrado</ListItem>
                        </List>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Seguridad y Mejores Prácticas */}
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="lg" mb={4} color="red.600">
                �  Seguridad y Mejores Prácticas
              </Heading>
              <VStack align="start" spacing={4}>
                <Alert status="info">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">
                      🛡️ Tu privacidad está protegida
                    </Text>
                    <Text fontSize="xs">
                      DenunciaChain no almacena información personal. Solo se registra la dirección de tu wallet.
                    </Text>
                  </VStack>
                </Alert>

                <VStack 
                  direction={{ base: "column", md: "row" }} 
                  spacing={{ base: 4, md: 8 }} 
                  align="start"
                  w="100%"
                >
                  <VStack align="start" flex={1} w={{ base: "100%", md: "auto" }}>
                    <Text fontWeight="bold" color="green.600">✅ Garantías de Seguridad:</Text>
                    <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                      <ListItem>🔐 Cifrado AES-256-CBC</ListItem>
                      <ListItem>⛓️ Inmutabilidad blockchain</ListItem>
                      <ListItem>🌐 Almacenamiento descentralizado</ListItem>
                      <ListItem>🔒 Anonimato garantizado</ListItem>
                      <ListItem>🛡️ Sin servidores centralizados</ListItem>
                    </List>
                  </VStack>
                  <VStack align="start" flex={1} w={{ base: "100%", md: "auto" }}>
                    <Text fontWeight="bold" color="orange.600">⚠️ Recomendaciones:</Text>
                    <List spacing={1} fontSize={{ base: "xs", md: "sm" }}>
                      <ListItem>💾 Guarda las contraseñas de cifrado</ListItem>
                      <ListItem>🔑 Protege tu wallet MetaMask</ListItem>
                      <ListItem>📱 Usa conexión segura (HTTPS)</ListItem>
                      <ListItem>🚫 No compartas información sensible</ListItem>
                      <ListItem>📝 Anota las contraseñas en lugar seguro</ListItem>
                    </List>
                  </VStack>
                </VStack>

                <Box bg="red.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="red.400">
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="red.800">
                      🚨 Advertencias Importantes:
                    </Text>
                    <List spacing={1} fontSize="xs" color="red.700">
                      <ListItem>• Las transacciones en blockchain son irreversibles</ListItem>
                      <ListItem>• Las contraseñas perdidas no se pueden recuperar</ListItem>
                      <ListItem>• El contenido cifrado sin contraseña es inaccesible</ListItem>
                      <ListItem>• Mantén tu frase de recuperación de MetaMask segura</ListItem>
                    </List>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Call to Action */}
          <Card bg="blue.50" borderColor="blue.200" borderWidth={2}>
            <CardBody textAlign="center">
              <Heading size="lg" mb={4} color="blue.600">
                🚀 ¿Listo para Comenzar?
              </Heading>
              <Text mb={4} color="gray.700">
                Una vez que tengas MetaMask configurado con Mantle Sepolia y algunos tokens MNT, 
                estarás listo para usar DenunciaChain de forma segura y anónima.
              </Text>
              <VStack spacing={3}>
                <HStack justify="center" spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                  <Badge colorScheme="green" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Gratuito</Badge>
                  <Badge colorScheme="blue" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Anónimo</Badge>
                  <Badge colorScheme="purple" px={3} py={1} fontSize={{ base: "xs", md: "sm" }}>Seguro</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Recuerda: Guarda siempre las contraseñas de cifrado en un lugar seguro
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Reconocimiento */}
          <Box textAlign="center" pt={10} pb={4}>
            <Text fontSize="sm" color="gray.600">
              Desarrollado por <strong>Kevin Kuo</strong>
            </Text>
            <Badge colorScheme="yellow" mt={2} px={3} py={1} borderRadius="full">
              🏆 Ganador del Hackathon Nucleo de Odisea Labs
            </Badge>
          </Box>

        </VStack>
      </Container>
    </Box>
  )
}