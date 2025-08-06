import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  Box,
  useColorModeValue
} from '@chakra-ui/react'



interface NuevaDenunciaNotificationProps {
  isVisible: boolean
}

export const NuevaDenunciaNotification = ({ isVisible }: NuevaDenunciaNotificationProps) => {
  const bgColor = useColorModeValue('green.50', 'green.900')
  const borderColor = useColorModeValue('green.200', 'green.600')

  if (!isVisible) return null

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex={9999}
      sx={{
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      }}
    >
      <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="120px"
        width="300px"
        borderRadius="lg"
        boxShadow="lg"
        bg={bgColor}
        borderWidth="2px"
        borderColor={borderColor}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          ¡Nueva Denuncia!
        </AlertTitle>
        <AlertDescription maxWidth="sm" fontSize="sm">
          Se ha registrado una nueva denuncia en la blockchain
        </AlertDescription>
      </Alert>
    </Box>
  )
}