#!/bin/bash

echo "🔍 Verificando configuración del proyecto..."
echo ""

# Verificar si el nodo Hardhat está corriendo
echo "1. Verificando nodo Hardhat..."
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   http://127.0.0.1:8545 | grep -q "0x539"; then
    echo "✅ Nodo Hardhat está corriendo en puerto 8545"
else
    echo "❌ Nodo Hardhat NO está corriendo"
    echo "   Ejecuta: npm run node"
    echo ""
fi

# Verificar si el contrato está desplegado
echo "2. Verificando contrato desplegado..."
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3","latest"],"id":1}' \
   http://127.0.0.1:8545 | grep -q '"result":"0x"' && \
   ! curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3","latest"],"id":1}' \
   http://127.0.0.1:8545 | grep -q '"result":"0x"$'; then
    echo "✅ Contrato desplegado en 0x5FbDB2315678afecb367f032d93F642f64180aa3"
else
    echo "❌ Contrato NO está desplegado"
    echo "   Ejecuta: npm run deploy"
    echo ""
fi

# Verificar si el frontend está corriendo
echo "3. Verificando frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend está corriendo en puerto 5173"
else
    echo "❌ Frontend NO está corriendo"
    echo "   Ejecuta: cd frontend && npm run dev"
    echo ""
fi

echo ""
echo "📋 Instrucciones para MetaMask:"
echo "   • Red: Hardhat Local"
echo "   • RPC URL: http://127.0.0.1:8545"
echo "   • Chain ID: 1337"
echo "   • Símbolo: ETH"
echo ""
echo "🎯 Accede a: http://localhost:5173"