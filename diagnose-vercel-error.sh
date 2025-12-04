#!/bin/bash

echo "🔍 Diagnosticando error de Vercel"
echo "================================="
echo ""

echo "📊 1. Verificando estado del repositorio:"
echo "Último commit: $(git log --oneline -1)"
echo "Branch actual: $(git branch --show-current)"
echo "Estado git:"
git status --porcelain
echo ""

echo "🏗️ 2. Probando build local para identificar errores:"
cd frontend
echo "Ejecutando npm run build..."
if npm run build 2>&1 | tee ../build-log.txt; then
    echo "✅ Build local exitoso"
else
    echo "❌ Build local falló - este es probablemente el problema en Vercel"
    echo ""
    echo "📋 Errores encontrados:"
    tail -20 ../build-log.txt
fi
cd ..
echo ""

echo "📁 3. Verificando archivos críticos:"
critical_files=(
    "frontend/package.json"
    "frontend/src/App.tsx"
    "frontend/src/main.tsx"
    "frontend/src/components/CIDFixTest.tsx"
    "frontend/src/services/vercel-cid-fix.ts"
    "vercel.json"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file falta"
    fi
done
echo ""

echo "🔧 4. Verificando configuración de Vercel:"
if [ -f "vercel.json" ]; then
    echo "Contenido de vercel.json:"
    cat vercel.json
else
    echo "⚠️ vercel.json no encontrado"
fi
echo ""

echo "📦 5. Verificando dependencias:"
cd frontend
echo "Verificando package.json..."
if [ -f "package.json" ]; then
    echo "Scripts disponibles:"
    npm run 2>/dev/null | grep -E "(build|dev)"
    echo ""
    echo "Dependencias principales:"
    grep -A 10 '"dependencies"' package.json | head -15
else
    echo "❌ package.json no encontrado"
fi
cd ..
echo ""

echo "🌐 6. Verificando acceso al sitio:"
response=$(curl -s -o /dev/null -w "%{http_code}" "https://denunciachain.vercel.app/")
echo "Código de respuesta: $response"

if [ "$response" = "500" ]; then
    echo "❌ Error 500 - Error del servidor en Vercel"
elif [ "$response" = "404" ]; then
    echo "❌ Error 404 - Sitio no encontrado"
elif [ "$response" = "200" ]; then
    echo "✅ Sitio accesible"
else
    echo "⚠️ Respuesta inesperada: $response"
fi
echo ""

echo "📋 7. Posibles causas del fallo:"
echo "- Error de compilación TypeScript"
echo "- Dependencias faltantes"
echo "- Configuración incorrecta de vercel.json"
echo "- Imports incorrectos en los nuevos archivos"
echo "- Problemas de sintaxis en JSX"
echo ""

echo "🔧 8. Próximos pasos recomendados:"
echo "1. Revisar el build log arriba"
echo "2. Corregir errores de TypeScript/sintaxis"
echo "3. Verificar imports en archivos nuevos"
echo "4. Hacer nuevo commit y push"
echo ""

echo "📊 Diagnóstico completado - revisa los errores arriba"