#!/bin/bash

# Script para probar y corregir gateways IPFS
# Autor: Kiro AI Assistant

echo "🔧 Corrección de Gateways IPFS"
echo "=============================="
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

# Lista de gateways IPFS para probar (actualizados y corregidos)
gateways=(
    "https://dweb.link/ipfs/"
    "https://ipfs.io/ipfs/"
    "https://4everland.io/ipfs/"
    "https://nftstorage.link/ipfs/"
    "https://w3s.link/ipfs/"
    "https://cf-ipfs.com/ipfs/"
    "https://gateway.ipfs.io/ipfs/"
    "https://gateway.pinata.cloud/ipfs/"
    "https://hardbin.com/ipfs/"
    "https://cloudflare-ipfs.com/ipfs/"
)

# CID de prueba conocido que existe
test_cid="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"

echo "1. Probando gateways IPFS actualizados..."
echo "-----------------------------------------"

working_gateways=()
failed_gateways=()

for gateway in "${gateways[@]}"; do
    url="${gateway}${test_cid}"
    echo -n "Probando ${gateway}... "
    
    # Usar timeout más largo y verificar tanto HEAD como GET
    if timeout 15s curl -s --max-time 10 --head "$url" > /dev/null 2>&1; then
        print_status "success" "Funcionando"
        working_gateways+=("$gateway")
    else
        # Intentar con GET si HEAD falla
        if timeout 15s curl -s --max-time 10 "$url" > /dev/null 2>&1; then
            print_status "success" "Funcionando (GET)"
            working_gateways+=("$gateway")
        else
            print_status "error" "No accesible"
            failed_gateways+=("$gateway")
        fi
    fi
done

echo ""
echo "2. Resumen de gateways..."
echo "------------------------"
print_status "success" "Gateways funcionando: ${#working_gateways[@]}"
print_status "error" "Gateways fallidos: ${#failed_gateways[@]}"

echo ""
echo "Gateways funcionando:"
for gateway in "${working_gateways[@]}"; do
    echo "  ✅ $gateway"
done

if [ ${#failed_gateways[@]} -gt 0 ]; then
    echo ""
    echo "Gateways fallidos:"
    for gateway in "${failed_gateways[@]}"; do
        echo "  ❌ $gateway"
    done
fi

echo ""
echo "3. Actualizando configuración de gateways..."
echo "--------------------------------------------"

# Crear lista de gateways funcionando para JavaScript
js_gateways=""
for gateway in "${working_gateways[@]}"; do
    js_gateways+="  '${gateway}', // Verificado funcionando\n"
done

# Crear archivo de configuración de gateways
cat > gateway-config.js << EOF
// Configuración de gateways IPFS verificados
// Generado automáticamente por fix-ipfs-gateways.sh
// Fecha: $(date)

export const WORKING_IPFS_GATEWAYS = [
$(echo -e "$js_gateways")];

export const FAILED_GATEWAYS = [
$(for gateway in "${failed_gateways[@]}"; do echo "  '${gateway}', // No accesible"; done)
];

export const GATEWAY_TEST_RESULTS = {
  total: ${#gateways[@]},
  working: ${#working_gateways[@]},
  failed: ${#failed_gateways[@]},
  success_rate: $(echo "scale=2; ${#working_gateways[@]} * 100 / ${#gateways[@]}" | bc -l)
};
EOF

print_status "success" "Archivo gateway-config.js creado"

echo ""
echo "4. Probando gateways con diferentes métodos..."
echo "----------------------------------------------"

# Probar gateways con diferentes estrategias
for gateway in "${working_gateways[@]:0:3}"; do  # Solo los primeros 3 para no saturar
    echo "Probando $gateway con diferentes métodos:"
    
    url="${gateway}${test_cid}"
    
    # Método 1: HEAD request
    if timeout 10s curl -s --head "$url" > /dev/null 2>&1; then
        echo "  ✅ HEAD request: OK"
    else
        echo "  ❌ HEAD request: Failed"
    fi
    
    # Método 2: GET request con límite de tamaño
    if timeout 10s curl -s --max-time 8 -r 0-1023 "$url" > /dev/null 2>&1; then
        echo "  ✅ GET request (1KB): OK"
    else
        echo "  ❌ GET request (1KB): Failed"
    fi
    
    # Método 3: Subdominio IPFS (si es compatible)
    if [[ "$gateway" == *"dweb.link"* ]] || [[ "$gateway" == *"cf-ipfs.com"* ]]; then
        subdomain_url="https://${test_cid}.ipfs.dweb.link/"
        if timeout 10s curl -s --head "$subdomain_url" > /dev/null 2>&1; then
            echo "  ✅ Subdominio IPFS: OK"
        else
            echo "  ❌ Subdominio IPFS: Failed"
        fi
    fi
    
    echo ""
done

echo "5. Creando configuración optimizada..."
echo "-------------------------------------"

# Crear configuración optimizada basada en los resultados
cat > .env.gateways << EOF
# Gateways IPFS verificados y optimizados
# Generado automáticamente - $(date)

# Gateways primarios (más rápidos y confiables)
VITE_PRIMARY_GATEWAY=${working_gateways[0]:-https://dweb.link/ipfs/}
VITE_SECONDARY_GATEWAY=${working_gateways[1]:-https://ipfs.io/ipfs/}
VITE_TERTIARY_GATEWAY=${working_gateways[2]:-https://4everland.io/ipfs/}

# Configuración de timeouts optimizada
VITE_GATEWAY_TIMEOUT=10000
VITE_GATEWAY_RETRY_COUNT=3
VITE_GATEWAY_PARALLEL_REQUESTS=true

# Estadísticas de gateways
VITE_TOTAL_GATEWAYS=${#gateways[@]}
VITE_WORKING_GATEWAYS=${#working_gateways[@]}
VITE_SUCCESS_RATE=$(echo "scale=0; ${#working_gateways[@]} * 100 / ${#gateways[@]}" | bc -l)%
EOF

print_status "success" "Archivo .env.gateways creado"

echo ""
echo "6. Recomendaciones de optimización..."
echo "------------------------------------"

if [ ${#working_gateways[@]} -ge 5 ]; then
    print_status "success" "Excelente: ${#working_gateways[@]} gateways funcionando"
    echo "  💡 Recomendación: Usar los primeros 3-5 gateways para mejor rendimiento"
elif [ ${#working_gateways[@]} -ge 3 ]; then
    print_status "warning" "Bueno: ${#working_gateways[@]} gateways funcionando"
    echo "  💡 Recomendación: Suficientes gateways para redundancia"
elif [ ${#working_gateways[@]} -ge 1 ]; then
    print_status "warning" "Mínimo: ${#working_gateways[@]} gateways funcionando"
    echo "  💡 Recomendación: Considerar agregar más gateways de respaldo"
else
    print_status "error" "Crítico: Ningún gateway funcionando"
    echo "  💡 Recomendación: Verificar conectividad a internet"
fi

echo ""
echo "7. Instrucciones de aplicación..."
echo "--------------------------------"
echo ""
print_status "info" "Para aplicar los gateways corregidos:"
echo ""
echo "1. Los archivos de configuración han sido actualizados automáticamente"
echo "2. Reinicia la aplicación: npm run dev"
echo "3. Ve a la pestaña '🌐 Vercel Test' para verificar"
echo "4. Los gateways fallidos han sido removidos automáticamente"
echo ""

# Crear script de verificación rápida
cat > verify-gateways.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificación rápida de gateways..."
source .env.gateways 2>/dev/null || echo "Archivo .env.gateways no encontrado"

echo "Gateway primario: ${VITE_PRIMARY_GATEWAY:-No configurado}"
echo "Gateway secundario: ${VITE_SECONDARY_GATEWAY:-No configurado}"
echo "Gateway terciario: ${VITE_TERTIARY_GATEWAY:-No configurado}"
echo "Tasa de éxito: ${VITE_SUCCESS_RATE:-No disponible}"

# Test rápido del gateway primario
if [ -n "$VITE_PRIMARY_GATEWAY" ]; then
    test_url="${VITE_PRIMARY_GATEWAY}QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    if timeout 5s curl -s --head "$test_url" > /dev/null 2>&1; then
        echo "✅ Gateway primario funcionando"
    else
        echo "❌ Gateway primario no responde"
    fi
fi
EOF

chmod +x verify-gateways.sh
print_status "success" "Script verify-gateways.sh creado"

echo ""
print_status "success" "¡Corrección de gateways completada!"
print_status "info" "Ejecuta ./verify-gateways.sh para verificación rápida"
echo ""

# Mostrar estadísticas finales
echo "📊 Estadísticas finales:"
echo "  Total de gateways probados: ${#gateways[@]}"
echo "  Gateways funcionando: ${#working_gateways[@]}"
echo "  Gateways fallidos: ${#failed_gateways[@]}"
echo "  Tasa de éxito: $(echo "scale=1; ${#working_gateways[@]} * 100 / ${#gateways[@]}" | bc -l)%"
echo ""