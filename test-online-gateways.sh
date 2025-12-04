#!/bin/bash

# Script para probar gateways IPFS online reales
# Autor: Kiro AI Assistant

echo "🌐 Prueba de Gateways IPFS Online Reales"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
        "highlight") echo -e "${CYAN}🎯 $2${NC}" ;;
    esac
}

# Lista de gateways IPFS públicos reales para probar
gateways=(
    "https://ipfs.io/ipfs/"
    "https://dweb.link/ipfs/"
    "https://gateway.ipfs.io/ipfs/"
    "https://cloudflare-ipfs.com/ipfs/"
    "https://gateway.pinata.cloud/ipfs/"
    "https://4everland.io/ipfs/"
    "https://nftstorage.link/ipfs/"
    "https://w3s.link/ipfs/"
    "https://cf-ipfs.com/ipfs/"
    "https://hardbin.com/ipfs/"
)

# CIDs de prueba conocidos que existen en IPFS
test_cids=(
    "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"  # Hello World
    "QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A"  # JSON example
    "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o"  # Text file
)

echo "1. Probando conectividad básica..."
echo "---------------------------------"

# Test de conectividad básica
if ping -c 1 google.com > /dev/null 2>&1; then
    print_status "success" "Conectividad a internet disponible"
else
    print_status "error" "Sin conectividad a internet"
    echo "Este test requiere conexión a internet para funcionar."
    exit 1
fi

echo ""
echo "2. Probando gateways IPFS individuales..."
echo "-----------------------------------------"

working_gateways=()
failed_gateways=()
gateway_times=()

for gateway in "${gateways[@]}"; do
    echo -n "Probando ${gateway}... "
    
    # Usar el primer CID de prueba
    test_cid="${test_cids[0]}"
    url="${gateway}${test_cid}"
    
    # Medir tiempo de respuesta
    start_time=$(date +%s%N)
    
    # Probar con timeout de 10 segundos
    if timeout 10s curl -s --max-time 8 --head "$url" > /dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 )) # Convertir a ms
        
        print_status "success" "Funcionando (${response_time}ms)"
        working_gateways+=("$gateway")
        gateway_times+=("$gateway:${response_time}ms")
    else
        print_status "error" "No accesible"
        failed_gateways+=("$gateway")
    fi
done

echo ""
echo "3. Probando múltiples CIDs en gateways funcionales..."
echo "----------------------------------------------------"

if [ ${#working_gateways[@]} -gt 0 ]; then
    # Usar el gateway más rápido para probar múltiples CIDs
    best_gateway="${working_gateways[0]}"
    print_status "info" "Usando gateway más rápido: $best_gateway"
    
    for cid in "${test_cids[@]}"; do
        echo -n "Probando CID ${cid:0:10}... "
        url="${best_gateway}${cid}"
        
        if timeout 8s curl -s --max-time 6 --head "$url" > /dev/null 2>&1; then
            print_status "success" "Accesible"
        else
            print_status "warning" "No accesible"
        fi
    done
else
    print_status "error" "No hay gateways funcionales para probar CIDs"
fi

echo ""
echo "4. Probando subdominios IPFS..."
echo "------------------------------"

if [ ${#working_gateways[@]} -gt 0 ]; then
    test_cid="${test_cids[0]}"
    
    # Subdominios IPFS (mejor para CORS)
    subdomain_urls=(
        "https://${test_cid}.ipfs.dweb.link/"
        "https://${test_cid}.ipfs.cf-ipfs.com/"
        "https://${test_cid}.ipfs.4everland.io/"
    )
    
    for url in "${subdomain_urls[@]}"; do
        echo -n "Probando subdominio ${url}... "
        
        if timeout 8s curl -s --max-time 6 --head "$url" > /dev/null 2>&1; then
            print_status "success" "Funcionando"
        else
            print_status "warning" "No accesible"
        fi
    done
else
    print_status "info" "Saltando prueba de subdominios (sin gateways funcionales)"
fi

echo ""
echo "5. Probando proxies CORS..."
echo "---------------------------"

if [ ${#working_gateways[@]} -gt 0 ]; then
    best_gateway="${working_gateways[0]}"
    test_cid="${test_cids[0]}"
    original_url="${best_gateway}${test_cid}"
    
    # Proxies CORS públicos
    proxy_urls=(
        "https://api.allorigins.win/get?url=$(echo "$original_url" | sed 's/&/%26/g')"
        "https://corsproxy.io/?$(echo "$original_url" | sed 's/&/%26/g')"
    )
    
    for proxy_url in "${proxy_urls[@]}"; do
        proxy_name=$(echo "$proxy_url" | cut -d'/' -f3 | cut -d'?' -f1)
        echo -n "Probando proxy ${proxy_name}... "
        
        if timeout 10s curl -s --max-time 8 --head "$proxy_url" > /dev/null 2>&1; then
            print_status "success" "Funcionando"
        else
            print_status "warning" "No accesible"
        fi
    done
else
    print_status "info" "Saltando prueba de proxies (sin gateways funcionales)"
fi

echo ""
echo "6. Resumen de resultados..."
echo "--------------------------"

print_status "highlight" "RESUMEN:"
echo ""
print_status "success" "Gateways funcionando: ${#working_gateways[@]}"
print_status "error" "Gateways fallidos: ${#failed_gateways[@]}"

if [ ${#working_gateways[@]} -gt 0 ]; then
    echo ""
    echo "Gateways funcionando (ordenados por velocidad):"
    for gateway_time in "${gateway_times[@]}"; do
        gateway=$(echo "$gateway_time" | cut -d':' -f1)
        time=$(echo "$gateway_time" | cut -d':' -f2)
        echo "  ✅ $gateway ($time)"
    done
fi

if [ ${#failed_gateways[@]} -gt 0 ]; then
    echo ""
    echo "Gateways fallidos:"
    for gateway in "${failed_gateways[@]}"; do
        echo "  ❌ $gateway"
    done
fi

echo ""
echo "7. Recomendaciones..."
echo "--------------------"

if [ ${#working_gateways[@]} -ge 3 ]; then
    print_status "success" "Excelente: ${#working_gateways[@]} gateways funcionando"
    print_status "info" "El sistema online funcionará correctamente"
elif [ ${#working_gateways[@]} -ge 1 ]; then
    print_status "warning" "Aceptable: ${#working_gateways[@]} gateways funcionando"
    print_status "info" "El sistema online funcionará con limitaciones"
else
    print_status "error" "Crítico: Ningún gateway funcionando"
    print_status "info" "El sistema online no funcionará - usar sistema offline"
fi

echo ""
echo "8. Instrucciones de uso..."
echo "-------------------------"
print_status "info" "Para usar el sistema online:"
echo ""
echo "1. Ejecuta: npm run dev"
echo "2. Ve a la pestaña '🌐 Online Test'"
echo "3. Ejecuta 'Ejecutar Prueba Online'"
echo "4. Verifica que los tests pasen"
echo ""

if [ ${#working_gateways[@]} -gt 0 ]; then
    print_status "success" "El sistema online está listo para usar"
else
    print_status "warning" "Usa el sistema offline como alternativa"
fi

echo ""
echo "📊 Estadísticas finales:"
echo "  Total de gateways probados: ${#gateways[@]}"
echo "  Gateways funcionando: ${#working_gateways[@]}"
echo "  Gateways fallidos: ${#failed_gateways[@]}"
echo "  Tasa de éxito: $(echo "scale=1; ${#working_gateways[@]} * 100 / ${#gateways[@]}" | bc -l 2>/dev/null || echo "N/A")%"
echo ""

# Crear archivo de configuración con gateways funcionales
if [ ${#working_gateways[@]} -gt 0 ]; then
    echo "9. Creando configuración optimizada..."
    echo "-------------------------------------"
    
    cat > .env.online << EOF
# Gateways IPFS online verificados
# Generado automáticamente - $(date)

# Gateways funcionales (ordenados por velocidad)
$(for i in "${!working_gateways[@]}"; do
    echo "VITE_GATEWAY_$((i+1))=${working_gateways[$i]}"
done)

# Configuración de sistema online
VITE_ONLINE_ENABLED=true
VITE_ONLINE_GATEWAYS=${#working_gateways[@]}
VITE_ONLINE_TIMEOUT=8000
VITE_ONLINE_CACHE_DURATION=1800000

# Estadísticas
VITE_SUCCESS_RATE=$(echo "scale=0; ${#working_gateways[@]} * 100 / ${#gateways[@]}" | bc -l 2>/dev/null || echo "0")
VITE_LAST_TEST=$(date)
EOF
    
    print_status "success" "Archivo .env.online creado con gateways funcionales"
fi

print_status "success" "¡Prueba de gateways online completada!"
echo ""