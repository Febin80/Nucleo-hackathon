#!/bin/bash

echo "🔧 Corrigiendo Errores de Despliegue en Vercel"
echo "============================================="
echo ""

echo "📊 Errores reportados:"
echo "- Deployment 3aloyshnh on nucleo-hackathon"
echo "- Deployment 4junxhtrk on denunciachain"
echo ""

echo "🔍 1. Verificando configuración actual..."

echo "📁 Estructura del proyecto:"
ls -la | grep -E "(package\.json|vercel\.json|frontend)"

echo ""
echo "📦 Verificando package.json raíz:"
if [ -f "package.json" ]; then
    echo "✅ package.json existe"
    echo "Scripts disponibles:"
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json no encontrado"
fi

echo ""
echo "🌐 Verificando vercel.json:"
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json existe"
    echo "Contenido:"
    cat vercel.json
else
    echo "❌ vercel.json no encontrado"
fi

echo ""
echo "📁 Verificando estructura frontend:"
if [ -d "frontend" ]; then
    echo "✅ Directorio frontend existe"
    echo "Archivos principales:"
    ls -la frontend/ | grep -E "(package\.json|src|dist)"
    
    if [ -f "frontend/package.json" ]; then
        echo ""
        echo "📦 Scripts de frontend:"
        cd frontend
        grep -A 5 '"scripts"' package.json
        cd ..
    fi
else
    echo "❌ Directorio frontend no encontrado"
fi

echo ""
echo "🏗️ 2. Probando build local para identificar errores..."
cd frontend
if npm run build 2>&1 | tee ../build-error-log.txt; then
    echo "✅ Build local exitoso"
    echo "Archivos generados en dist:"
    ls -la dist/ 2>/dev/null || echo "❌ Directorio dist no encontrado"
else
    echo "❌ Build local falló"
    echo "Errores encontrados:"
    tail -10 ../build-error-log.txt
fi
cd ..

echo ""
echo "🔧 3. Posibles causas de error en Vercel:"
echo "- Configuración incorrecta de buildCommand"
echo "- Directorio de salida (outputDirectory) incorrecto"
echo "- Dependencias faltantes en package.json raíz"
echo "- Conflicto entre configuraciones de Hardhat y React"
echo "- Variables de entorno faltantes"

echo ""
echo "📋 4. Soluciones recomendadas:"
echo "1. Simplificar vercel.json"
echo "2. Corregir scripts en package.json raíz"
echo "3. Asegurar que frontend/dist se genere correctamente"
echo "4. Verificar que no hay conflictos de dependencias"

echo ""
echo "🚀 Diagnóstico completado - aplicando correcciones..."