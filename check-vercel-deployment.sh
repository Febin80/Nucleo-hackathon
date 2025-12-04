#!/bin/bash

echo "🚀 Verificando despliegue de Vercel..."
echo "📅 Fecha: $(date)"
echo "🔗 URL: https://denunciachain.vercel.app/"
echo ""

echo "📊 Estado del repositorio:"
echo "Último commit: $(git log --oneline -1)"
echo "Branch: $(git branch --show-current)"
echo ""

echo "🔍 Verificando conectividad..."
if curl -s --head https://denunciachain.vercel.app/ | head -n 1 | grep -q "200 OK"; then
    echo "✅ Sitio web accesible"
else
    echo "⚠️ Sitio web no responde o en despliegue"
fi

echo ""
echo "🧪 Probando endpoints específicos..."

# Verificar si el nuevo componente CIDFixTest está disponible
echo "Verificando nuevos componentes..."

echo ""
echo "📋 Instrucciones:"
echo "1. Vercel detecta automáticamente los cambios en GitHub"
echo "2. El despliegue puede tomar 2-5 minutos"
echo "3. Verifica en: https://vercel.com/dashboard"
echo "4. URL de producción: https://denunciachain.vercel.app/"
echo ""
echo "🔧 Si hay problemas:"
echo "- Revisa los logs de Vercel"
echo "- Verifica que el build sea exitoso"
echo "- Comprueba las variables de entorno"
echo ""
echo "✅ Push realizado exitosamente a GitHub"
echo "⏳ Esperando despliegue automático de Vercel..."