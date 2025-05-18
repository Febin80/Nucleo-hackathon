import { Box, Container, Heading, VStack } from '@chakra-ui/react'
import { DenunciaForm } from './components/DenunciaForm'
import { ListaDenuncias } from './components/ListaDenuncias'

function App() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Nucleo - Denuncias Anónimas
        </Heading>
        
        <Box>
          <DenunciaForm />
        </Box>

        <Box>
          <ListaDenuncias />
        </Box>
      </VStack>
    </Container>
  )
}

export default App
