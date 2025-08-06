
import {
  Box,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
  Container,
  Divider
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

export const About = () => {
  return (
    <Container maxW="container.lg" py={{ base: 10, md: 16 }}>
      <VStack spacing={{ base: 8, md: 12 }} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4} color="gray.800">
            ¿Qué es DenunciaChain?
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600">
            DenunciaChain es una plataforma de denuncias anónimas basada en blockchain.
          </Text>
        </Box>

        <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700" textAlign="center">
          Sirve para que cualquier persona pueda reportar casos de acoso escolar, laboral o ciberacoso, de manera anónima, segura y sin miedo a represalias.
        </Text>

        <Box p={6} bg="gray.50" borderRadius="lg">
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.800">
            En vez de confiar en una empresa o institución para proteger la identidad de la persona que denuncia, se usa tecnología blockchain y Zero-Knowledge Proofs (ZKP) para garantizar:
          </Text>
          <List spacing={3} mt={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Que nadie pueda saber quién hizo la denuncia.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Que la denuncia no pueda ser borrada o manipulada.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Que se pueda probar que la denuncia es real, sin revelar la identidad del denunciante.
            </ListItem>
          </List>
        </Box>

        <Divider />

        <VStack spacing={8} align="stretch">
          <Heading as="h2" size="xl" color="gray.800" textAlign="center">
            ¿Cómo funciona DenunciaChain?
          </Heading>
          <List spacing={5} fontSize={{ base: 'md', md: 'lg' }}>
            <ListItem>
              <Text><strong>1. Denunciante envía su denuncia anónimamente:</strong> Completa un formulario simple (en la web/app), puede adjuntar pruebas (fotos, documentos) y firma la denuncia con una firma anónima (ZKP). La denuncia se guarda en IPFS (un sistema de almacenamiento descentralizado).</Text>
            </ListItem>
            <ListItem>
              <Text><strong>2. Registro en Blockchain:</strong> Se crea un registro en la Blockchain (Mantle Testnet) con un hash de la denuncia, lo que sirve como una prueba inmutable de su existencia.</Text>
            </ListItem>
            <ListItem>
              <Text><strong>3. Blockchain garantiza la transparencia:</strong> La denuncia queda registrada en la blockchain, lo que garantiza que no puede ser alterada ni eliminada. No se guarda información personal (nombre, email, etc.).</Text>
            </ListItem>
          </List>
        </VStack>

        <Divider />

        <Box p={6} bg="blue.50" borderRadius="lg">
          <Heading as="h2" size="xl" color="blue.800" textAlign="center" mb={4}>
            ¿Por qué es importante?
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="blue.700" mb={4}>
            Muchas personas no denuncian por miedo a represalias. Las plataformas actuales requieren datos personales. DenunciaChain permite que la denuncia sea:
          </Text>
          <List spacing={3} styleType="disc" pl={5}>
            <ListItem><strong>Anónima</strong></ListItem>
            <ListItem><strong>Inmutable</strong> (no puede borrarse ni editarse)</ListItem>
            <ListItem><strong>Verificable</strong> (con pruebas criptográficas)</ListItem>
            <ListItem><strong>Privada</strong> (usando Zero-Knowledge Proofs)</ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};
