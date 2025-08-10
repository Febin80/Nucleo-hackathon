import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Heading,
  Code,
  Table,
  Tbody,
  Tr,
  Td,
  Th
} from '@chakra-ui/react'
import { IPFSValidator } from '../utils/ipfs-validator'

export const CIDValidator = () => {
  const [input, setInput] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
  const [result, setResult] = useState<any>(null)

  const validateInput = () => {
    console.log('🧪 Validando CID/URL:', input)
    
    const normalizedCID = IPFSValidator.normalizeCID(input)
    const cidInfo = IPFSValidator.getCIDInfo(normalizedCID)
    
    setResult({
      original_input: input,
      normalized_cid: normalizedCID,
      cid_info: cidInfo,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading size="md" mb={4}>🔍 Validador de CID IPFS</Heading>
      
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Ingresa un CID o URL de IPFS"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <Button 
          onClick={validateInput} 
          colorScheme="blue"
        >
          Validar CID/URL
        </Button>
        
        {result && (
          <Box>
            <Alert status={result.cid_info.isValid ? 'success' : 'error'} mb={4}>
              <AlertIcon />
              <Text fontWeight="bold">
                CID {result.cid_info.isValid ? 'VÁLIDO' : 'INVÁLIDO'} - {result.cid_info.version}
              </Text>
            </Alert>
            
            <Table size="sm" variant="simple">
              <Tbody>
                <Tr>
                  <Th>Input Original</Th>
                  <Td><Code fontSize="xs">{result.original_input}</Code></Td>
                </Tr>
                <Tr>
                  <Th>CID Normalizado</Th>
                  <Td><Code fontSize="xs">{result.normalized_cid}</Code></Td>
                </Tr>
                <Tr>
                  <Th>Versión CID</Th>
                  <Td>{result.cid_info.version}</Td>
                </Tr>
                <Tr>
                  <Th>Formato</Th>
                  <Td>{result.cid_info.format}</Td>
                </Tr>
                <Tr>
                  <Th>Longitud</Th>
                  <Td>{result.cid_info.length} caracteres</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  )
}