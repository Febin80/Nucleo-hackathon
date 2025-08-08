import { Container, Heading, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Home } from './components/Home'
import { DenunciaForm } from './components/DenunciaForm'
import { ListaDenunciasSimple } from './components/ListaDenunciasSimple'
import { About } from './components/About'
import { HistorialProvider } from './contexts/HistorialContext'


function App() {
  return (
    <HistorialProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            DenunciaChain - Denuncias Anónimas
          </Heading>
          
          <Tabs variant="enclosed" colorScheme="blue" defaultIndex={0}>
            <TabList>
              <Tab>🏠 Inicio</Tab>
              <Tab>📝 Crear Denuncia</Tab>
              <Tab>📋 Historial</Tab>
              <Tab>📄 Whitepaper</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <Home />
              </TabPanel>

              <TabPanel>
                <DenunciaForm />
              </TabPanel>

              <TabPanel>
                <ListaDenunciasSimple />
              </TabPanel>

              <TabPanel>
                <About />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </HistorialProvider>
  )
}

export default App
