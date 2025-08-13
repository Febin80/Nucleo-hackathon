import { Container, Heading, VStack, Tabs, TabList, TabPanels, Tab, TabPanel, Box } from '@chakra-ui/react'
import { Home } from './components/Home'
import { DenunciaForm } from './components/DenunciaForm'
import { HistorialConActualizacion } from './components/HistorialConActualizacion'
import { About } from './components/About'
import { IPFSDebugTest } from './components/IPFSDebugTest'
import { IPFSStatusChecker } from './components/IPFSStatusChecker'
import { CIDValidator } from './components/CIDValidator'
import { OfflineStorageDebug } from './components/OfflineStorageDebug'
import { IPFSCompleteDiagnostic } from './components/IPFSCompleteDiagnostic'
import { IPFSFixDiagnostic } from './components/IPFSFixDiagnostic'
import { IPFSQuickTest } from './components/IPFSQuickTest'
import { UltraSimpleDiagnostic } from './components/UltraSimpleDiagnostic'
import { VercelIPFSTest } from './components/VercelIPFSTest'
import { OfflineIPFSTest } from './components/OfflineIPFSTest'
import { OnlineIPFSTest } from './components/OnlineIPFSTest'
import { CIDFixTest } from './components/CIDFixTest'
import { MobileNavigation } from './components/MobileNavigation'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'

function AppContent() {
  const { activeTab, setActiveTab } = useNavigation()

  return (
    <>
      {/* Navegación móvil */}
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Heading 
            as="h1" 
            size={{ base: "lg", md: "xl" }} 
            textAlign="center"
            px={{ base: 2, md: 0 }}
            pt={{ base: 12, lg: 0 }}
          >
            DenunciaChain - Denuncias Anónimas
          </Heading>
        
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={activeTab}
          onChange={setActiveTab}
          size={{ base: "sm", md: "md" }}
          display={{ base: "none", lg: "block" }}
        >
          <TabList 
            overflowX="auto" 
            overflowY="hidden"
            css={{
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '2px',
              },
            }}
            flexWrap="nowrap"
            minH={{ base: "40px", md: "48px" }}
          >
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>🏠 Inicio</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>📝 Crear</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>📋 Historial</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "flex" }}>📄 Whitepaper</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>🧪 Debug</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>🔍 Estado</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>✅ Validar</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>💾 Storage</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>🔬 Diagnóstico</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "flex" }}>🔧 Fix</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>⚡ Rápida</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "flex" }}>🚀 Simple</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "flex" }}>🌐 Vercel</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>🏠 Offline</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }}>🌐 Online</Tab>
            <Tab minW="fit-content" fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "flex" }}>🔧 CID Fix</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={{ base: 2, md: 4 }}>
              <Home />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <DenunciaForm />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <HistorialConActualizacion />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <About />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <IPFSDebugTest />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <IPFSStatusChecker />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <CIDValidator />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <OfflineStorageDebug />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <IPFSCompleteDiagnostic />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <IPFSFixDiagnostic />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <IPFSQuickTest />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <UltraSimpleDiagnostic />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <VercelIPFSTest />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <OfflineIPFSTest />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <OnlineIPFSTest />
            </TabPanel>

            <TabPanel p={{ base: 2, md: 4 }}>
              <CIDFixTest />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Contenido móvil - mostrar solo la pestaña activa */}
        <Box display={{ base: 'block', lg: 'none' }} pb={20}>
          {activeTab === 0 && <Home />}
          {activeTab === 1 && <DenunciaForm />}
          {activeTab === 2 && <HistorialConActualizacion />}
          {activeTab === 3 && <About />}
          {activeTab === 4 && <IPFSDebugTest />}
          {activeTab === 5 && <IPFSStatusChecker />}
          {activeTab === 6 && <CIDValidator />}
          {activeTab === 7 && <OfflineStorageDebug />}
          {activeTab === 8 && <IPFSCompleteDiagnostic />}
          {activeTab === 9 && <IPFSFixDiagnostic />}
          {activeTab === 10 && <IPFSQuickTest />}
          {activeTab === 11 && <UltraSimpleDiagnostic />}
          {activeTab === 12 && <VercelIPFSTest />}
          {activeTab === 13 && <OfflineIPFSTest />}
          {activeTab === 14 && <OnlineIPFSTest />}
          {activeTab === 15 && <CIDFixTest />}
        </Box>
      </VStack>
    </Container>
    </>
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
