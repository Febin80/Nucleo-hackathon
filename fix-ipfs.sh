#!/bin/bash

# Script para diagnosticar y reparar problemas de IPFS
# Autor: Kiro AI Assistant
# Fecha: $(date)

echo "🔧 Script de Diagnóstico y Reparación IPFS"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# 1. Verificar archivos de configuración
echo "1. Verificando archivos de configuración..."
echo "----------------------------------------"

if [ -f ".env" ]; then
    print_status "success" "Archivo .env encontrado"
    
    # Verificar variables IPFS
    if grep -q "VITE_PINATA_JWT" .env; then
        print_status "success" "VITE_PINATA_JWT configurada"
    else
        print_status "error" "VITE_PINATA_JWT no encontrada"
        echo "VITE_PINATA_JWT=tu_jwt_token_aqui" >> .env
        print_status "info" "Variable agregada al .env (requiere configuración manual)"
    fi
    
    if grep -q "VITE_PINATA_GATEWAY" .env; then
        print_status "success" "VITE_PINATA_GATEWAY configurada"
    else
        print_status "warning" "VITE_PINATA_GATEWAY no encontrada"
        echo "VITE_PINATA_GATEWAY=https://gateway.pinata.cloud" >> .env
        print_status "info" "Gateway por defecto agregado"
    fi
else
    print_status "error" "Archivo .env no encontrado"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "success" "Archivo .env creado desde .env.example"
    else
        print_status "error" "Archivo .env.example tampoco existe"
        exit 1
    fi
fi

echo ""

# 2. Verificar dependencias de Node.js
echo "2. Verificando dependencias..."
echo "-----------------------------"

if [ -f "package.json" ]; then
    print_status "success" "package.json encontrado"
    
    # Verificar si node_modules existe
    if [ -d "node_modules" ]; then
        print_status "success" "node_modules encontrado"
    else
        print_status "warning" "node_modules no encontrado"
        print_status "info" "Ejecutando npm install..."
        npm install
        if [ $? -eq 0 ]; then
            print_status "success" "Dependencias instaladas correctamente"
        else
            print_status "error" "Error instalando dependencias"
        fi
    fi
else
    print_status "error" "package.json no encontrado"
    exit 1
fi

echo ""

# 3. Verificar servicios IPFS
echo "3. Probando conectividad IPFS..."
echo "--------------------------------"

# Test de gateways públicos
gateways=(
    "https://ipfs.io/ipfs/"
    "https://cloudflare-ipfs.com/ipfs/"
    "https://dweb.link/ipfs/"
    "https://gateway.pinata.cloud/ipfs/"
)

test_cid="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"

for gateway in "${gateways[@]}"; do
    url="${gateway}${test_cid}"
    echo -n "Probando ${gateway}... "
    
    if curl -s --max-time 5 --head "$url" > /dev/null 2>&1; then
        print_status "success" "Funcionando"
    else
        print_status "error" "No accesible"
    fi
done

echo ""

# 4. Verificar archivos del proyecto
echo "4. Verificando archivos del proyecto..."
echo "--------------------------------------"

required_files=(
    "frontend/src/services/ipfs-emergency.ts"
    "frontend/src/components/IPFSFixDiagnostic.tsx"
    "frontend/src/components/IPFSQuickTest.tsx"
    "frontend/src/components/UltraSimpleDiagnostic.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "success" "$file existe"
    else
        print_status "error" "$file no encontrado"
    fi
done

echo ""

# 5. Limpiar cache si existe
echo "5. Limpiando cache..."
echo "--------------------"

if [ -d ".next" ]; then
    rm -rf .next
    print_status "success" "Cache de Next.js limpiado"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_status "success" "Cache de node_modules limpiado"
fi

echo ""

# 6. Instrucciones finales
echo "6. Instrucciones finales"
echo "========================"
echo ""
print_status "info" "Para completar la configuración:"
echo ""
echo "1. Obtén credenciales de Pinata en: https://pinata.cloud"
echo "2. Edita el archivo .env y reemplaza 'tu_jwt_token_aqui' con tu JWT real"
echo "3. Ejecuta: npm run dev"
echo "4. Ve a la pestaña '⚡ Prueba Rápida' para verificar que todo funciona"
echo ""
print_status "success" "El sistema de emergencia funcionará incluso sin credenciales reales"
print_status "info" "Usa CIDs del pool verificado y almacenamiento local como respaldo"
echo ""

# 7. Crear script de inicio rápido
echo "7. Creando script de inicio rápido..."
echo "------------------------------------"

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando servidor de desarrollo..."
echo "======================================"
echo ""
echo "📱 La aplicación estará disponible en: http://localhost:3000"
echo "🔧 Para diagnósticos IPFS, ve a las pestañas de diagnóstico"
echo ""
npm run dev
EOF

chmod +x start-dev.sh
print_status "success" "Script start-dev.sh creado"

echo ""
print_status "success" "¡Diagnóstico y reparación completados!"
print_status "info" "Ejecuta ./start-dev.sh para iniciar el servidor"
echo ""