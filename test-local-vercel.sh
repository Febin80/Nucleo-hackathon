#!/bin/bash
echo "🧪 Simulando entorno Vercel localmente..."
echo "========================================"

# Configurar variables de entorno como en Vercel
export VITE_VERCEL_ENV=production
export VITE_IPFS_OPTIMIZED=true

# Iniciar servidor con configuración de Vercel
echo "🚀 Iniciando servidor con configuración Vercel..."
npm run dev
