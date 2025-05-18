import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import './index.css'
import theme from './theme'

// Asegurarnos de que el elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento root')
}

// Crear el root de React
const root = createRoot(rootElement)

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
