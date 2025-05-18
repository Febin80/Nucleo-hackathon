'use client'

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { DenunciaForm } from '@/components/DenunciaForm'

export default function Home() {
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            Plataforma de Denuncia Anónima
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Tu voz importa. Denuncia de forma segura y anónima.
          </Text>
        </Box>

        <Box 
          bg="white" 
          p={8} 
          borderRadius="lg" 
          boxShadow="lg"
          maxW="800px"
          mx="auto"
          w="100%"
        >
          <DenunciaForm />
        </Box>
      </VStack>
    </Container>
  )
} 