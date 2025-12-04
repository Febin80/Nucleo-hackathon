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
