#!/bin/bash

# Script de despliegue rápido en Vercel
# Uso: ./deploy-vercel.sh

echo "🚀 Iniciando despliegue en Vercel..."
echo ""

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI detectado"
echo ""

# Verificar si hay un archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Creando .env desde .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales reales antes de continuar"
    echo "   Necesitas:"
    echo "   - VITE_PINATA_JWT"
    echo "   - VITE_PINATA_API_KEY"
    echo "   - VITE_PINATA_SECRET_API_KEY"
    echo ""
    read -p "¿Has configurado el archivo .env? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Por favor configura .env primero"
        exit 1
    fi
fi

echo "✅ Archivo .env encontrado"
echo ""

# Verificar que el build funciona localmente
echo "🔨 Verificando build local..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build local"
    echo "   Por favor corrige los errores antes de desplegar"
    exit 1
fi

echo "✅ Build local exitoso"
echo ""
cd ..

# Preguntar tipo de despliegue
echo "Selecciona el tipo de despliegue:"
echo "1) Preview (desarrollo)"
echo "2) Production"
read -p "Opción (1 o 2): " deploy_type

if [ "$deploy_type" = "2" ]; then
    echo ""
    echo "🚀 Desplegando a PRODUCCIÓN..."
    vercel --prod
else
    echo ""
    echo "🔍 Desplegando PREVIEW..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Despliegue exitoso!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Verifica que el sitio carga correctamente"
    echo "   2. Conecta MetaMask y prueba la funcionalidad"
    echo "   3. Crea una denuncia de prueba"
    echo ""
    echo "💡 Tip: Configura las variables de entorno en Vercel Dashboard si aún no lo has hecho"
    echo "   https://vercel.com/dashboard"
else
    echo ""
    echo "❌ Error en el despliegue"
    echo "   Revisa los logs arriba para más detalles"
    exit 1
fi
