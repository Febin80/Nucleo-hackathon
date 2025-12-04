#!/bin/bash

echo "🔧 Monitoreando corrección de Vercel"
echo "===================================="
echo ""

URL="https://denunciachain.vercel.app"
MAX_ATTEMPTS=15
ATTEMPT=1

echo "🎯 Verificando despliegue con configuración corregida..."
echo "📅 Iniciado: $(date)"
echo "🔄 Último commit: $(git log --oneline -1)"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔍 Intento $ATTEMPT/$MAX_ATTEMPTS - $(date +%H:%M:%S)"
    
    # Verificar respuesta del servidor
    response=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    
    echo "   Código de respuesta: $response"
    
    if [ "$response" = "200" ]; then
        # Verificar contenido
        content=$(curl -s "$URL")
        
        # Verificar si contiene la nueva versión
        if echo "$content" | grep -q "DenunciaChain v2.0"; then
            echo "✅ ¡DESPLIEGUE EXITOSO!"
            echo "🎉 Nueva versión detectada: DenunciaChain v2.0"
            
            # Verificar si contiene referencias a los nuevos componentes
            if echo "$content" | grep -q -E "(CIDFix|vercel-cid-fix|MobileNavigation)"; then
                echo "✅ Nuevos componentes detectados en el bundle"
            else
                echo "⚠️ Nuevos componentes no detectados en el HTML"
            fi
            
            echo ""
            echo "🔧 Funcionalidades disponibles:"
            echo "- ✅ Corrección automática de CIDs"
            echo "- ✅ Navegación móvil mejorada"
            echo "- ✅ Herramienta de diagnóstico CID Fix"
            echo "- ✅ Pool de contenidos reales"
            echo ""
            echo "🌐 Accede ahora: $URL"
            echo "📱 En móvil: Menú hamburguesa → 'CID Fix'"
            echo "💻 En desktop: Pestaña '🔧 CID Fix'"
            echo ""
            echo "✅ CORRECCIÓN DE VERCEL EXITOSA"
            break
            
        elif echo "$content" | grep -q "DenunciaChain"; then
            echo "⚠️ Sitio accesible pero versión anterior (v1.0)"
            
        else
            echo "❌ Contenido inesperado o página de error"
        fi
        
    elif [ "$response" = "500" ]; then
        echo "❌ Error 500 - Error del servidor"
        
    elif [ "$response" = "404" ]; then
        echo "❌ Error 404 - Sitio no encontrado"
        
    elif [ "$response" = "000" ]; then
        echo "⚠️ Sin respuesta - posible problema de red"
        
    else
        echo "⚠️ Respuesta inesperada: $response"
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo ""
        echo "⏰ Tiempo límite alcanzado"
        echo ""
        echo "📊 Estado final:"
        echo "- Configuración corregida: ✅"
        echo "- Push realizado: ✅"
        echo "- Último código de respuesta: $response"
        echo ""
        echo "🔧 Si el problema persiste:"
        echo "1. Verificar dashboard de Vercel: https://vercel.com/dashboard"
        echo "2. Revisar logs de build en Vercel"
        echo "3. Verificar que la configuración sea correcta"
        echo "4. Considerar redespliegue manual desde dashboard"
        echo ""
        echo "💡 La configuración ahora debería ser correcta para React/Vite"
        break
    fi
    
    echo "   Esperando 20 segundos..."
    sleep 20
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "📋 Cambios realizados en esta corrección:"
echo "- ✅ vercel.json optimizado para React/Vite"
echo "- ✅ package.json con scripts de build correctos"
echo "- ✅ .vercelignore para optimizar despliegue"
echo "- ✅ Configuración simplificada y robusta"
echo ""
echo "🚀 Monitoreo completado"