#!/bin/bash

# ============================================
# COMANDOS PARA DESPLEGAR EN VERCEL
# ============================================

echo "🚀 DenunciaChain - Despliegue en Vercel"
echo "========================================"
echo ""
echo "Elige una opción:"
echo ""
echo "1) Verificar que todo está listo"
echo "2) Commitear cambios y preparar para GitHub"
echo "3) Desplegar con Vercel CLI"
echo "4) Ver guía completa"
echo "5) Salir"
echo ""
read -p "Opción (1-5): " opcion

case $opcion in
    1)
        echo ""
        echo "🔍 Ejecutando verificación pre-despliegue..."
        ./pre-deploy-check.sh
        ;;
    2)
        echo ""
        echo "📝 Commiteando cambios..."
        git add .
        echo ""
        read -p "Mensaje del commit (Enter para usar default): " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="Preparar para despliegue en Vercel"
        fi
        git commit -m "$commit_msg"
        echo ""
        echo "📤 Pusheando a GitHub..."
        git push origin main
        echo ""
        echo "✅ ¡Listo!"
        echo ""
        echo "Próximos pasos:"
        echo "1. Ve a https://vercel.com/new"
        echo "2. Importa tu repositorio: Nucleo-hackathon"
        echo "3. Configura:"
        echo "   - Root Directory: frontend"
        echo "   - Framework: Vite"
        echo "   - Build Command: npm run build"
        echo "   - Output Directory: dist"
        echo "4. Agrega las variables de entorno (ver DESPLIEGUE_RAPIDO.md)"
        echo "5. Click en Deploy"
        ;;
    3)
        echo ""
        echo "🚀 Desplegando con Vercel CLI..."
        echo ""
        
        # Verificar si Vercel CLI está instalado
        if ! command -v vercel &> /dev/null; then
            echo "📦 Vercel CLI no está instalado"
            read -p "¿Deseas instalarlo ahora? (s/n): " install_vercel
            if [[ $install_vercel =~ ^[Ss]$ ]]; then
                npm install -g vercel
            else
                echo "❌ Necesitas Vercel CLI para continuar"
                exit 1
            fi
        fi
        
        echo "🔐 Iniciando sesión en Vercel..."
        vercel login
        
        echo ""
        read -p "¿Desplegar a producción? (s/n): " prod_deploy
        if [[ $prod_deploy =~ ^[Ss]$ ]]; then
            echo "🚀 Desplegando a PRODUCCIÓN..."
            vercel --prod
        else
            echo "🔍 Desplegando PREVIEW..."
            vercel
        fi
        ;;
    4)
        echo ""
        echo "📚 Abriendo guía completa..."
        if command -v open &> /dev/null; then
            open DESPLIEGUE_RAPIDO.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open DESPLIEGUE_RAPIDO.md
        else
            cat DESPLIEGUE_RAPIDO.md
        fi
        ;;
    5)
        echo ""
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "✅ Proceso completado"
echo ""
echo "📚 Documentación disponible:"
echo "   - DESPLIEGUE_RAPIDO.md (guía rápida)"
echo "   - GUIA_DESPLIEGUE_VERCEL.md (guía completa)"
echo "   - CHECKLIST_VERCEL.md (checklist detallado)"
echo "   - RESUMEN_DESPLIEGUE.md (resumen ejecutivo)"
echo ""
