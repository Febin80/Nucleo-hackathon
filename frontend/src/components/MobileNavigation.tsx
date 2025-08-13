import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Text,
  Badge,
  HStack,
  IconButton,
  Spinner,
  Center
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'

interface MobileNavigationProps {
  activeTab: number
  setActiveTab: (index: number) => void
  isLoading?: boolean
}

// Componente de spinner reutilizable
const LoadingSpinner = ({ message = "Cargando..." }: { message?: string }) => (
  <Center py={8}>
    <VStack spacing={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
      <Text fontSize="sm" color="gray.600">
        {message}
      </Text>
    </VStack>
  </Center>
)

export const MobileNavigation = ({ activeTab, setActiveTab, isLoading = false }: MobileNavigationProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const tabs = [
    { label: '🏠 Inicio', index: 0, category: 'Principal' },
    { label: '📝 Crear Denuncia', index: 1, category: 'Principal' },
    { label: '📋 Historial', index: 2, category: 'Principal' },
    { label: '📄 Whitepaper', index: 3, category: 'Información' },
    { label: '🧪 Debug IPFS', index: 4, category: 'Herramientas' },
    { label: '🔍 Estado IPFS', index: 5, category: 'Herramientas' },
    { label: '✅ Validar CID', index: 6, category: 'Herramientas' },
    { label: '💾 Storage Debug', index: 7, category: 'Herramientas' },
    { label: '🔬 Diagnóstico IPFS', index: 8, category: 'Diagnóstico' },
    { label: '🔧 Fix IPFS', index: 9, category: 'Diagnóstico' },
    { label: '⚡ Prueba Rápida', index: 10, category: 'Diagnóstico' },
    { label: '🚀 Ultra Simple', index: 11, category: 'Diagnóstico' },
    { label: '🌐 Vercel Test', index: 12, category: 'Diagnóstico' },
    { label: '🏠 Offline Test', index: 13, category: 'Diagnóstico' },
    { label: '🌐 Online Test', index: 14, category: 'Diagnóstico' },
    { label: '🔧 CID Fix', index: 15, category: 'Diagnóstico' },
  ]

  const handleTabSelect = (index: number) => {
    setActiveTab(index)
    onClose()
  }

  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.category]) {
      acc[tab.category] = []
    }
    acc[tab.category].push(tab)
    return acc
  }, {} as Record<string, typeof tabs>)

  const currentTab = tabs.find(tab => tab.index === activeTab)

  return (
    <>
      {/* Botón de menú móvil */}
      <Box display={{ base: 'block', lg: 'none' }} position="fixed" top={4} right={4} zIndex={1000}>
        <IconButton
          aria-label="Abrir menú"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          colorScheme="blue"
          variant="solid"
          size="md"
          borderRadius="full"
          shadow="lg"
        />
      </Box>

      {/* Indicador de pestaña actual en móvil */}
      <Box 
        display={{ base: 'block', lg: 'none' }} 
        position="fixed" 
        bottom={4} 
        left={4} 
        right={4} 
        zIndex={999}
      >
        <Box
          bg="white"
          p={3}
          borderRadius="lg"
          shadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Pestaña actual:
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                {currentTab?.label || 'Desconocida'}
              </Text>
            </VStack>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onOpen}
              leftIcon={<HamburgerIcon />}
            >
              Cambiar
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* Drawer de navegación */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                🛡️ DenunciaChain
              </Text>
              <Text fontSize="sm" color="gray.600">
                Navegación
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            {isLoading ? (
              <LoadingSpinner message="Cargando navegación..." />
            ) : (
              <VStack spacing={0} align="stretch">
                {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
                  <Box key={category}>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderBottomWidth="1px"
                      borderColor="gray.200"
                    >
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {category}
                      </Text>
                    </Box>
                    
                    <VStack spacing={0} align="stretch">
                      {categoryTabs.map((tab) => (
                        <Button
                          key={tab.index}
                          onClick={() => handleTabSelect(tab.index)}
                          variant="ghost"
                          justifyContent="flex-start"
                          h="auto"
                          py={3}
                          px={4}
                          borderRadius={0}
                          borderBottomWidth="1px"
                          borderColor="gray.100"
                          bg={activeTab === tab.index ? 'blue.50' : 'transparent'}
                          color={activeTab === tab.index ? 'blue.600' : 'gray.700'}
                          fontWeight={activeTab === tab.index ? 'semibold' : 'normal'}
                          _hover={{
                            bg: activeTab === tab.index ? 'blue.100' : 'gray.50'
                          }}
                        >
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="sm">{tab.label}</Text>
                            {activeTab === tab.index && (
                              <Badge colorScheme="blue" size="sm">
                                Activa
                              </Badge>
                            )}
                          </HStack>
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}