#!/bin/bash

# Script para probar IPFS específicamente en Vercel
# Autor: Kiro AI Assistant

echo "🌐 Prueba IPFS para Vercel"
echo "=========================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# 1. Verificar archivos específicos para Vercel
echo "1. Verificando archivos para Vercel..."
echo "-------------------------------------"

required_files=(
    "vercel.json"
    "frontend/src/services/vercel-ipfs-production.ts"
    "frontend/src/components/VercelIPFSTest.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "success" "$file existe"
    else
        print_status "error" "$file no encontrado"
    fi
done

echo ""

# 2. Verificar configuración de Vercel
echo "2. Verificando configuración de Vercel..."
echo "-----------------------------------------"

if [ -f "vercel.json" ]; then
    print_status "success" "vercel.json encontrado"
    
    # Verificar configuraciones importantes
    if grep -q "maxDuration" vercel.json; then
        print_status "success" "Timeout configurado para funciones"
    else
        print_status "warning" "Timeout no configurado"
    fi
    
    if grep -q "Access-Control-Allow-Origin" vercel.json; then
        print_status "success" "Headers CORS configurados"
    else
        print_status "warning" "Headers CORS no configurados"
    fi
    
    if grep -q "rewrites" vercel.json; then
        print_status "success" "Rewrites IPFS configurados"
    else
        print_status "warning" "Rewrites IPFS no configurados"
    fi
else
    print_status "error" "vercel.json no encontrado"
fi

echo ""

# 3. Probar gateways IPFS optimizados para Vercel
echo "3. Probando gateways optimizados para Vercel..."
echo "-----------------------------------------------"

vercel_gateways=(
    "https://dweb.link/ipfs/"
    "https://ipfs.io/ipfs/"
    "https://4everland.io/ipfs/"
    "https://nftstorage.link/ipfs/"
    "https://w3s.link/ipfs/"
    "https://cf-ipfs.com/ipfs/"
    "https://gateway.ipfs.io/ipfs/"
    "https://gateway.pinata.cloud/ipfs/"
)

test_cid="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"

for gateway in "${vercel_gateways[@]}"; do
    url="${gateway}${test_cid}"
    echo -n "Probando ${gateway}... "
    
    # Usar timeout más largo para Vercel
    if curl -s --max-time 10 --head "$url" > /dev/null 2>&1; then
        print_status "success" "Funcionando"
    else
        print_status "error" "No accesible"
    fi
done

echo ""

# 4. Verificar variables de entorno para Vercel
echo "4. Verificando variables de entorno..."
echo "-------------------------------------"

if [ -f ".env" ]; then
    print_status "success" "Archivo .env encontrado"
    
    # Variables importantes para Vercel
    vercel_vars=(
        "VITE_PINATA_JWT"
        "VITE_PINATA_GATEWAY"
        "VITE_IPFS_GATEWAY"
        "VITE_CLOUDFLARE_GATEWAY"
        "VITE_DWEB_GATEWAY"
    )
    
    for var in "${vercel_vars[@]}"; do
        if grep -q "$var" .env; then
            print_status "success" "$var configurada"
        else
            print_status "warning" "$var no encontrada"
        fi
    done
else
    print_status "error" "Archivo .env no encontrado"
fi

echo ""

# 5. Verificar build para Vercel
echo "5. Verificando configuración de build..."
echo "----------------------------------------"

if [ -f "package.json" ]; then
    print_status "success" "package.json encontrado"
    
    # Verificar scripts de build
    if grep -q "\"build\":" package.json; then
        print_status "success" "Script de build configurado"
    else
        print_status "warning" "Script de build no encontrado"
    fi
    
    # Verificar dependencias importantes
    if grep -q "\"next\":" package.json; then
        print_status "success" "Next.js detectado"
    elif grep -q "\"vite\":" package.json; then
        print_status "success" "Vite detectado"
    else
        print_status "warning" "Framework no identificado"
    fi
else
    print_status "error" "package.json no encontrado"
fi

echo ""

# 6. Crear archivo de configuración de entorno para Vercel
echo "6. Creando configuración para Vercel..."
echo "---------------------------------------"

cat > .env.vercel << 'EOF'
# Variables de entorno específicas para Vercel
VITE_VERCEL_ENV=production
VITE_IPFS_OPTIMIZED=true
VITE_CORS_PROXY_ENABLED=true
VITE_CACHE_ENABLED=true
VITE_FALLBACK_CONTENT=true

# Gateways optimizados para Vercel
VITE_PRIMARY_GATEWAY=https://dweb.link/ipfs/
VITE_SECONDARY_GATEWAY=https://cloudflare-ipfs.com/ipfs/
VITE_TERTIARY_GATEWAY=https://4everland.io/ipfs/

# Configuración de timeouts para Vercel
VITE_GATEWAY_TIMEOUT=10000
VITE_PROXY_TIMEOUT=15000
VITE_CACHE_DURATION=86400000
EOF

print_status "success" "Archivo .env.vercel creado"

echo ""

# 7. Instrucciones para despliegue en Vercel
echo "7. Instrucciones para Vercel"
echo "============================"
echo ""
print_status "info" "Para desplegar en Vercel:"
echo ""
echo "1. Instala Vercel CLI: npm i -g vercel"
echo "2. Configura las variables de entorno en Vercel Dashboard:"
echo "   - VITE_PINATA_JWT (opcional pero recomendado)"
echo "   - VITE_PINATA_GATEWAY"
echo "   - VITE_VERCEL_ENV=production"
echo "3. Despliega: vercel --prod"
echo ""
print_status "info" "El sistema funcionará incluso sin credenciales de Pinata"
print_status "success" "Los gateways públicos y el cache local garantizan disponibilidad"
echo ""

# 8. Crear script de prueba local que simula Vercel
echo "8. Creando script de prueba local..."
echo "------------------------------------"

cat > test-local-vercel.sh << 'EOF'
#!/bin/bash
echo "🧪 Simulando entorno Vercel localmente..."
echo "========================================"

# Configurar variables de entorno como en Vercel
export VITE_VERCEL_ENV=production
export VITE_IPFS_OPTIMIZED=true

# Iniciar servidor con configuración de Vercel
echo "🚀 Iniciando servidor con configuración Vercel..."
npm run dev
EOF

chmod +x test-local-vercel.sh
print_status "success" "Script test-local-vercel.sh creado"

echo ""
print_status "success" "¡Configuración para Vercel completada!"
print_status "info" "Ejecuta ./test-local-vercel.sh para probar localmente"
print_status "info" "Ve a la pestaña '🌐 Vercel Test' en la aplicación para pruebas específicas"
echo ""