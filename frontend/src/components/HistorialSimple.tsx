import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Button,
  Alert,
  AlertIcon,
  HStack,
  Badge
} from '@chakra-ui/react'
import { IPFSContentViewer } from './IPFSContentViewer'

interface DenunciaSimple {
  id: number;
  denunciante: string;
  tipoAcoso: string;
  descripcion: string;
  ipfsHash: string;
  timestamp: Date;
  esPublica: boolean;
}

export const HistorialSimple = () => {
  const [denuncias, setDenuncias] = useState<DenunciaSimple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar denuncias de ejemplo (siempre funciona)
  const cargarDenunciasEjemplo = () => {
    console.log('📋 Cargando denuncias de ejemplo...')
    
    const denunciasEjemplo: DenunciaSimple[] = [
      {
        id: 1,
        denunciante: '0x1234567890123456789012345678901234567890',
        tipoAcoso: 'Acoso Laboral',
        descripcion: 'Denuncia de acoso laboral en el lugar de trabajo',
        ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        timestamp: new Date(Date.now() - 86400000), // Hace 1 día
        esPublica: true
      },
      {
        id: 2,
        denunciante: '0x2345678901234567890123456789012345678901',
        tipoAcoso: 'Discriminación',
        descripcion: 'Caso de discriminación por género',
        ipfsHash: 'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
        timestamp: new Date(Date.now() - 172800000), // Hace 2 días
        esPublica: true
      },
      {
        id: 3,
        denunciante: '0x3456789012345678901234567890123456789012',
        tipoAcoso: 'Acoso Sexual',
        descripcion: 'Denuncia de acoso sexual',
        ipfsHash: 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
        timestamp: new Date(Date.now() - 259200000), // Hace 3 días
        esPublica: false
      }
    ]
    
    setDenuncias(denunciasEjemplo)
    setLoading(false)
    console.log(`✅ ${denunciasEjemplo.length} denuncias de ejemplo cargadas`)
  }

  // Función para intentar cargar denuncias reales
  const cargarDenunciasReales = async () => {
    console.log('🔄 Intentando cargar denuncias reales...')
    setLoading(true)
    setError(null)

    try {
      // Importar dinámicamente el hook (para uso futuro)
      await import('../hooks/useDenunciaAnonimaSimple')
      
      // Simular carga (en un componente real usarías el hook)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Por ahora, usar denuncias de ejemplo
      cargarDenunciasEjemplo()
      
    } catch (error) {
      console.error('❌ Error cargando denuncias reales:', error)
      setError('No se pudieron cargar denuncias reales, mostrando ejemplos')
      cargarDenunciasEjemplo()
    }
  }

  useEffect(() => {
    console.log('🚀 HistorialSimple montado')
    cargarDenunciasEjemplo() // Cargar ejemplos inmediatamente
  }, [])

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} fontSize="lg">Cargando historial...</Text>
        <Button mt={4} size="sm" onClick={cargarDenunciasEjemplo}>
          📋 Mostrar Ejemplos
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box mb={6}>
        <HStack justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="blue.600">
              📋 Historial de Denuncias
            </Heading>
            <Text color="gray.600">
              {denuncias.length} denuncias encontradas
            </Text>
          </VStack>
          
          <VStack spacing={2}>
            <Button 
              onClick={cargarDenunciasReales} 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
            >
              🔄 Cargar Reales
            </Button>
            <Button 
              onClick={cargarDenunciasEjemplo} 
              size="sm" 
              colorScheme="green" 
              variant="outline"
            >
              📋 Mostrar Ejemplos
            </Button>
          </VStack>
        </HStack>

        {error && (
          <Alert status="warning" mb={4}>
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}
      </Box>

      <VStack spacing={4} align="stretch">
        {denuncias.map((denuncia) => (
          <Box
            key={denuncia.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="sm"
            bg="white"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Denuncia #{denuncia.id}
                </Text>
                <Heading size="md" color="red.600">
                  {denuncia.tipoAcoso}
                </Heading>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Descripción</Text>
                <Text color="gray.700">
                  {denuncia.descripcion}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Denunciante</Text>
                <Text fontFamily="mono" fontSize="sm" color="blue.600">
                  {denuncia.denunciante.slice(0, 10)}...{denuncia.denunciante.slice(-8)}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Fecha</Text>
                <Text color="gray.700">
                  {denuncia.timestamp.toLocaleString()}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>IPFS Hash</Text>
                <Text fontFamily="mono" fontSize="xs" color="green.600" bg="green.50" p={2} borderRadius="md">
                  {denuncia.ipfsHash}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>Estado</Text>
                <Badge colorScheme={denuncia.esPublica ? "green" : "orange"}>
                  {denuncia.esPublica ? "✅ Pública" : "🔒 Privada"}
                </Badge>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>Acciones</Text>
                <HStack spacing={3}>
                  <IPFSContentViewer 
                    hash={denuncia.ipfsHash}
                    buttonText="Ver contenido completo"
                    buttonSize="sm"
                  />
                </HStack>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>

      <Box mt={6} p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
        <Text fontSize="sm" color="blue.700" fontWeight="bold" mb={2}>
          ✅ Historial Simplificado
        </Text>
        <Text fontSize="xs" color="blue.600">
          Este historial muestra denuncias de ejemplo para demostrar la funcionalidad.
          Usa "Cargar Reales" para intentar conectar con la blockchain.
        </Text>
      </Box>
    </Box>
  )
}