#!/bin/bash

# Script de verificación pre-despliegue
# Verifica que todo está listo antes de desplegar en Vercel

echo "🔍 Verificación Pre-Despliegue para Vercel"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Función para mostrar error
error() {
    echo "❌ ERROR: $1"
    ERRORS=$((ERRORS + 1))
}

# Función para mostrar warning
warning() {
    echo "⚠️  WARNING: $1"
    WARNINGS=$((WARNINGS + 1))
}

# Función para mostrar éxito
success() {
    echo "✅ $1"
}

# 1. Verificar estructura del proyecto
echo "📁 Verificando estructura del proyecto..."
if [ -d "frontend" ]; then
    success "Directorio frontend existe"
else
    error "Directorio frontend no encontrado"
fi

if [ -f "vercel.json" ]; then
    success "Archivo vercel.json existe"
else
    error "Archivo vercel.json no encontrado"
fi

if [ -f "frontend/package.json" ]; then
    success "frontend/package.json existe"
else
    error "frontend/package.json no encontrado"
fi

echo ""

# 2. Verificar dependencias
echo "📦 Verificando dependencias..."
if [ -d "frontend/node_modules" ]; then
    success "node_modules instalado"
else
    warning "node_modules no encontrado, ejecuta: cd frontend && npm install"
fi

echo ""

# 3. Verificar archivo .env
echo "🔐 Verificando variables de entorno..."
if [ -f ".env" ]; then
    success "Archivo .env existe"
    
    # Verificar variables críticas
    if grep -q "VITE_PINATA_JWT=" .env && ! grep -q "VITE_PINATA_JWT=tu_jwt" .env; then
        success "VITE_PINATA_JWT configurado"
    else
        error "VITE_PINATA_JWT no configurado en .env"
    fi
    
    if grep -q "VITE_PINATA_API_KEY=" .env && ! grep -q "VITE_PINATA_API_KEY=tu_api" .env; then
        success "VITE_PINATA_API_KEY configurado"
    else
        error "VITE_PINATA_API_KEY no configurado en .env"
    fi
else
    warning "Archivo .env no encontrado (necesario para desarrollo local)"
fi

echo ""

# 4. Verificar Git
echo "🔧 Verificando Git..."
if [ -d ".git" ]; then
    success "Repositorio Git inicializado"
    
    # Verificar si hay cambios sin commitear
    if git diff-index --quiet HEAD --; then
        success "No hay cambios sin commitear"
    else
        warning "Hay cambios sin commitear"
    fi
    
    # Verificar remote
    if git remote -v | grep -q "origin"; then
        success "Remote origin configurado"
        REMOTE_URL=$(git remote get-url origin)
        echo "   📍 Remote: $REMOTE_URL"
    else
        warning "Remote origin no configurado (necesario para auto-deploy)"
    fi
else
    warning "Git no inicializado (recomendado para Vercel)"
fi

echo ""

# 5. Verificar build
echo "🔨 Verificando build..."
cd frontend

if npm run build > /dev/null 2>&1; then
    success "Build exitoso"
    
    if [ -d "dist" ]; then
        success "Directorio dist generado"
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo "   📊 Tamaño del build: $DIST_SIZE"
    else
        error "Directorio dist no generado"
    fi
else
    error "Build falló - revisa los errores con: cd frontend && npm run build"
fi

cd ..

echo ""

# 6. Verificar archivos críticos
echo "📄 Verificando archivos críticos..."
CRITICAL_FILES=(
    "frontend/src/App.tsx"
    "frontend/src/main.tsx"
    "frontend/index.html"
    "frontend/vite.config.ts"
    "frontend/tsconfig.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "$file existe"
    else
        error "$file no encontrado"
    fi
done

echo ""

# 7. Verificar .gitignore
echo "🚫 Verificando .gitignore..."
if [ -f ".gitignore" ]; then
    success ".gitignore existe"
    
    if grep -q "node_modules" .gitignore; then
        success "node_modules en .gitignore"
    else
        warning "node_modules no está en .gitignore"
    fi
    
    if grep -q ".env" .gitignore; then
        success ".env en .gitignore"
    else
        error ".env no está en .gitignore - ¡CRÍTICO!"
    fi
else
    error ".gitignore no encontrado"
fi

echo ""

# 8. Verificar tamaño del proyecto
echo "📊 Verificando tamaño del proyecto..."
PROJECT_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "   Tamaño total: $PROJECT_SIZE"

if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "   node_modules: $NODE_MODULES_SIZE"
fi

echo ""

# Resumen
echo "=========================================="
echo "📋 RESUMEN"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 ¡Todo listo para desplegar!"
    echo ""
    echo "Próximos pasos:"
    echo "1. Sube el código a GitHub (si no lo has hecho)"
    echo "2. Ve a https://vercel.com/new"
    echo "3. Importa tu repositorio"
    echo "4. Configura las variables de entorno"
    echo "5. ¡Despliega!"
    echo ""
    echo "O usa el script rápido:"
    echo "   ./deploy-vercel.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Hay $WARNINGS advertencias pero puedes continuar"
    echo ""
    echo "Revisa las advertencias arriba y considera corregirlas"
    echo "antes de desplegar a producción."
    exit 0
else
    echo "❌ Hay $ERRORS errores que deben corregirse"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  También hay $WARNINGS advertencias"
    fi
    echo ""
    echo "Por favor corrige los errores antes de desplegar."
    exit 1
fi
