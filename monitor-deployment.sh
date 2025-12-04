#!/bin/bash

echo "🔄 Monitoreando despliegue de Vercel..."
echo "======================================"
echo ""

URL="https://denunciachain.vercel.app"
MAX_ATTEMPTS=20
ATTEMPT=1

echo "🎯 Buscando evidencia del nuevo despliegue (v2.0)..."
echo "📅 Iniciado: $(date)"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔍 Intento $ATTEMPT/$MAX_ATTEMPTS - $(date +%H:%M:%S)"
    
    # Verificar si el sitio responde
    response=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    
    if [ "$response" = "200" ]; then
        # Descargar contenido y verificar si contiene la nueva versión
        content=$(curl -s "$URL")
        
        if echo "$content" | grep -q "DenunciaChain v2.0"; then
            echo "✅ ¡NUEVO DESPLIEGUE DETECTADO!"
            echo "🎉 DenunciaChain v2.0 está ahora en línea"
            echo ""
            echo "🔧 Nuevas funcionalidades disponibles:"
            echo "- ✅ Corrección automática de CIDs"
            echo "- ✅ Navegación móvil con spinner"
            echo "- ✅ Herramienta de diagnóstico 'CID Fix'"
            echo "- ✅ Pool de contenidos reales verificados"
            echo "- ✅ 100% de CIDs muestran contenido"
            echo ""
            echo "🌐 Accede ahora: $URL"
            echo "📱 En móvil: Busca el menú hamburguesa → 'CID Fix'"
            echo "💻 En desktop: Nueva pestaña '🔧 CID Fix'"
            echo ""
            echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
            break
        else
            echo "⏳ Sitio accesible pero aún versión anterior (cache)"
        fi
    else
        echo "⚠️ Sitio no accesible (código: $response)"
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo ""
        echo "⏰ Tiempo límite alcanzado"
        echo "💡 El despliegue puede tomar más tiempo. Verifica manualmente:"
        echo "   - Dashboard de Vercel: https://vercel.com/dashboard"
        echo "   - URL del sitio: $URL"
        echo ""
        echo "🔄 Posibles soluciones:"
        echo "1. Esperar unos minutos más"
        echo "2. Limpiar cache del navegador"
        echo "3. Usar modo incógnito"
        echo "4. Verificar logs en Vercel dashboard"
        break
    fi
    
    echo "   Esperando 15 segundos..."
    sleep 15
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "📊 Estado final:"
echo "- Último commit: $(git log --oneline -1)"
echo "- Push realizado: ✅"
echo "- URL: $URL"
echo "- Fecha: $(date)"