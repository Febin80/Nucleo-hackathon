import { useState, useEffect } from 'react'
import { useDenunciaAnonimaSimple } from '../hooks/useDenunciaAnonimaSimple'
import { Box, Heading, Text, Spinner, VStack, Button, Alert, AlertIcon, Divider, HStack, Badge } from '@chakra-ui/react'
import { DiagnosticoRed } from './DiagnosticoRed'
import { IPFSContentViewer } from './IPFSContentViewer'
import { HistorialDebug } from './HistorialDebug'

export const HistorialConActualizacion = () => {
  const { denuncias, loading, error, actualizarDenuncias } = useDenunciaAnonimaSimple()
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  console.log('🎯 HistorialConActualizacion renderizado:', { 
    denunciasCount: denuncias.length, 
    loading, 
    error,
    autoRefresh
  })

  // Detectar cuando se crea una nueva denuncia y activar auto-refresh automáticamente
  useEffect(() => {
    const checkForNewDenuncia = () => {
      const shouldActivate = localStorage.getItem('activateAutoRefresh')
      const newDenunciaTime = localStorage.getItem('newDenunciaCreated')
      
      if (shouldActivate === 'true' && newDenunciaTime) {
        const createdTime = parseInt(newDenunciaTime)
        const now = Date.now()
        
        // Si la denuncia se creó hace menos de 2 minutos, activar auto-refresh
        if (now - createdTime < 120000) { // 2 minutos
          console.log('🚀 Nueva denuncia detectada - activando auto-refresh automáticamente')
          setAutoRefresh(true)
          
          // Limpiar las señales
          localStorage.removeItem('activateAutoRefresh')
          localStorage.removeItem('newDenunciaCreated')
          
          // Hacer una actualización inmediata
          handleManualRefresh()
        }
      }
    }

    // Verificar al montar el componente
    checkForNewDenuncia()

    // Verificar cada 2 segundos por si el usuario cambia de pestaña
    const interval = setInterval(checkForNewDenuncia, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh cada 3 segundos si está habilitado (optimizado para velocidad)
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      console.log('🔄 Auto-refresh rápido activado - actualizando denuncias...')
      await actualizarDenuncias()
      setLastRefresh(new Date())
    }, 15000) // 15 segundos para balance entre actualización y rendimiento

    return () => clearInterval(interval)
  }, [autoRefresh, actualizarDenuncias])

  // Función para actualizar manualmente
  const handleManualRefresh = async () => {
    console.log('🔄 Refresh manual - actualizando denuncias...')
    await actualizarDenuncias()
    setLastRefresh(new Date())
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} fontSize="lg">Cargando denuncias sin MetaMask...</Text>
        <Text fontSize="sm" color="gray.600">
          Conectando a blockchain pública...
        </Text>
      </Box>
    )
  }

  if (error) {
    return (
      <VStack spacing={6} py={8}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error al cargar denuncias</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
        
        <Button onClick={handleManualRefresh} colorScheme="blue">
          🔄 Reintentar
        </Button>
        
        <Divider />
        
        <DiagnosticoRed />
        
        <Divider />
        
        <HistorialDebug />
      </VStack>
    )
  }

  if (denuncias.length === 0) {
    return (
      <VStack spacing={6} py={8}>
        <Box textAlign="center">
          <Text fontSize="2xl" mb={4}>📝</Text>
          <Heading size="md" mb={2}>No hay denuncias disponibles</Heading>
          <Text color="gray.600" mb={4}>
            El contrato no tiene denuncias registradas o hubo un problema al cargarlas.
          </Text>
          
          <VStack spacing={3}>
            <Button onClick={handleManualRefresh} colorScheme="blue">
              🔄 Actualizar Ahora
            </Button>
            
            <HStack spacing={3}>
              <Button
                size="sm"
                colorScheme={autoRefresh ? "red" : "green"}
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "⏹️ Detener Auto-refresh" : "▶️ Activar Auto-refresh"}
              </Button>
              
              {lastRefresh && (
                <Badge colorScheme="blue" fontSize="xs">
                  Última actualización: {lastRefresh.toLocaleTimeString()}
                </Badge>
              )}
            </HStack>
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
            Si acabas de crear una denuncia y no aparece, usa estas herramientas:
          </Text>
          <DiagnosticoRed />
          
          <Divider my={6} />
          
          <Text fontSize="sm" color="red.600" mb={4} textAlign="center" fontWeight="bold">
            🔧 Debug avanzado del historial:
          </Text>
          <HistorialDebug />
        </Box>
      </VStack>
    )
  }

  return (
    <Box>
      <Box mb={6}>
        <HStack justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="blue.600">
              🎉 Historial de Denuncias (Sin MetaMask)
            </Heading>
            <Text color="gray.600">
              Se encontraron <strong>{denuncias.length} denuncias</strong> en la blockchain
            </Text>
          </VStack>
          
          <VStack spacing={2}>
            <HStack spacing={2}>
              <Button 
                onClick={handleManualRefresh} 
                size="sm" 
                colorScheme="blue" 
                variant="outline"
                isLoading={loading}
              >
                🔄 Actualizar
              </Button>
              
              <Button
                size="sm"
                colorScheme={autoRefresh ? "red" : "green"}
                variant={autoRefresh ? "solid" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "⏹️ Detener" : "▶️ Auto-refresh"}
              </Button>
            </HStack>
            
            {lastRefresh && (
              <Badge colorScheme="blue" fontSize="xs">
                Última actualización: {lastRefresh.toLocaleTimeString()}
              </Badge>
            )}
            
            {autoRefresh && (
              <Badge colorScheme="green" fontSize="xs" variant="solid">
                🔄 Auto-refresh (cada 15s)
              </Badge>
            )}
          </VStack>
        </HStack>
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
                <Text color={denuncia.esPublica ? "green.600" : "orange.600"}>
                  {denuncia.esPublica ? "✅ Pública" : "🔒 Privada"}
                </Text>
              </Box>

              {/* Botones para ver contenido IPFS */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>Acciones</Text>
                <HStack spacing={3}>
                  <IPFSContentViewer 
                    hash={denuncia.ipfsHash}
                    buttonText="Ver descripción completa"
                    buttonSize="sm"
                  />
                </HStack>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>

      <Box mt={6} p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
        <Text fontSize="sm" color="green.700" fontWeight="bold" mb={2}>
          ✅ ¡Funciona sin MetaMask!
        </Text>
        <Text fontSize="xs" color="green.600">
          Este historial se carga directamente desde la blockchain pública sin necesidad de instalar MetaMask.
          Los usuarios pueden ver todas las denuncias sin barreras técnicas.
        </Text>
        
        {autoRefresh && (
          <Text fontSize="xs" color="green.600" mt={2}>
            🔄 Auto-refresh rápido activado: El historial se actualiza automáticamente cada 3 segundos.
          </Text>
        )}
      </Box>
    </Box>
  )
}