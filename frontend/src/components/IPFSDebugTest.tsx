import { useState } from 'react'
import {
    Box,
    Button,
    Input,
    VStack,
    Text,
    Alert,
    AlertIcon,
    Code,
    Heading,
    Divider
} from '@chakra-ui/react'

export const IPFSDebugTest = () => {
    const [hash, setHash] = useState('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const testGateways = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://dweb.link/ipfs/',
        'https://4everland.io/ipfs/',
        'https://nftstorage.link/ipfs/',
        'https://ipfs.io/ipfs/'
    ]

    const testDirectAccess = async () => {
        setLoading(true)
        setResults([])

        const testResults = []

        for (const gateway of testGateways) {
            const url = gateway + hash
            const startTime = Date.now()

            try {
                console.log(`🧪 Testing: ${url}`)

                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    signal: AbortSignal.timeout(10000)
                })

                const endTime = Date.now()
                const duration = endTime - startTime

                if (response.ok) {
                    const content = await response.text()
                    testResults.push({
                        gateway,
                        status: 'SUCCESS',
                        duration: `${duration}ms`,
                        contentLength: content.length,
                        contentPreview: content.slice(0, 100) + '...',
                        statusCode: response.status
                    })
                } else {
                    testResults.push({
                        gateway,
                        status: 'FAILED',
                        duration: `${duration}ms`,
                        error: `HTTP ${response.status}: ${response.statusText}`,
                        statusCode: response.status
                    })
                }
            } catch (error: any) {
                const endTime = Date.now()
                const duration = endTime - startTime

                testResults.push({
                    gateway,
                    status: 'ERROR',
                    duration: `${duration}ms`,
                    error: error.message,
                    errorType: error.name
                })
            }

            setResults([...testResults])
        }

        setLoading(false)
    }

    return (
        <Box p={6} maxW="800px" mx="auto">
            <Heading size="md" mb={4}>🧪 IPFS Gateway Debug Test</Heading>

            <VStack spacing={4} align="stretch">
                <Input
                    placeholder="IPFS Hash para probar"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                />

                <Button
                    onClick={testDirectAccess}
                    isLoading={loading}
                    colorScheme="blue"
                >
                    Probar Gateways Directamente
                </Button>

                <Divider />

                {results.map((result, index) => (
                    <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                        <Text fontWeight="bold">{result.gateway}</Text>
                        <Text color={result.status === 'SUCCESS' ? 'green.500' : 'red.500'}>
                            Status: {result.status} ({result.duration})
                        </Text>

                        {result.statusCode && (
                            <Text>HTTP Status: {result.statusCode}</Text>
                        )}

                        {result.error && (
                            <Alert status="error" size="sm" mt={2}>
                                <AlertIcon />
                                {result.error}
                            </Alert>
                        )}

                        {result.contentLength && (
                            <>
                                <Text>Content Length: {result.contentLength} chars</Text>
                                <Code fontSize="xs" p={2} mt={2} display="block" whiteSpace="pre-wrap">
                                    {result.contentPreview}
                                </Code>
                            </>
                        )}
                    </Box>
                ))}
            </VStack>
        </Box>
    )
}