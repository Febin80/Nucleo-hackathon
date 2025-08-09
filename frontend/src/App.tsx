import { Container, Heading, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Home } from './components/Home'
import { DenunciaForm } from './components/DenunciaForm'
import { HistorialConActualizacion } from './components/HistorialConActualizacion'
import { About } from './components/About'
import { IPFSDebugTest } from './components/IPFSDebugTest'
import { IPFSStatusChecker } from './components/IPFSStatusChecker'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'

function AppContent() {
  const { activeTab, setActiveTab } = useNavigation()

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          DenunciaChain - Denuncias Anónimas
        </Heading>
        
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={activeTab}
          onChange={setActiveTab}
        >
          <TabList>
            <Tab>🏠 Inicio</Tab>
            <Tab>📝 Crear Denuncia</Tab>
            <Tab>📋 Historial</Tab>
            <Tab>📄 Whitepaper</Tab>
            <Tab>🧪 Debug IPFS</Tab>
            <Tab>🔍 Estado IPFS</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Home />
            </TabPanel>

            <TabPanel>
              <DenunciaForm />
            </TabPanel>

            <TabPanel>
              <HistorialConActualizacion />
            </TabPanel>

            <TabPanel>
              <About />
            </TabPanel>

            <TabPanel>
              <IPFSDebugTest />
            </TabPanel>

            <TabPanel>
              <IPFSStatusChecker />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}

export default App
