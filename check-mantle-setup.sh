#!/bin/bash

echo "🔍 Verificando configuración para Mantle Sepolia..."
echo ""

# Verificar conexión a Mantle Sepolia
echo "1. Verificando conexión a Mantle Sepolia..."
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   https://rpc.sepolia.mantle.xyz | grep -q "0x1389"; then
    echo "✅ Conexión a Mantle Sepolia exitosa"
else
    echo "❌ No se puede conectar a Mantle Sepolia"
    echo "   Verifica tu conexión a internet"
    echo ""
fi

# Verificar si el contrato está desplegado
echo "2. Verificando contrato en Mantle Sepolia..."
CONTRACT_CODE=$(curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B","latest"],"id":1}' \
   https://rpc.sepolia.mantle.xyz | jq -r '.result')

if [ "$CONTRACT_CODE" != "0x" ] && [ "$CONTRACT_CODE" != "null" ]; then
    echo "✅ Contrato desplegado en 0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B"
    
    # Obtener total de denuncias
    TOTAL_HEX=$(curl -s -X POST -H "Content-Type: application/json" \
       --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B","data":"0x1c1a2b4b"},"latest"],"id":1}' \
       https://rpc.sepolia.mantle.xyz | jq -r '.result')
    
    TOTAL_DECIMAL=$((16#${TOTAL_HEX#0x}))
    echo "   📊 Total de denuncias: $TOTAL_DECIMAL"
else
    echo "❌ Contrato NO encontrado en Mantle Sepolia"
    echo ""
fi

# Verificar si el frontend está corriendo
echo "3. Verificando frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend está corriendo en puerto 5173"
else
    echo "❌ Frontend NO está corriendo"
    echo "   Ejecuta: cd frontend && npm run dev"
    echo ""
fi

echo ""
echo "📋 Configuración de MetaMask para Mantle Sepolia:"
echo "   • Nombre: Mantle Sepolia"
echo "   • RPC URL: https://rpc.sepolia.mantle.xyz"
echo "   • Chain ID: 5003"
echo "   • Símbolo: MNT"
echo "   • Explorador: https://explorer.sepolia.mantle.xyz"
echo ""
echo "🎯 Accede a: http://localhost:5173"
echo "🔗 Ver contrato: https://explorer.sepolia.mantle.xyz/address/0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B"