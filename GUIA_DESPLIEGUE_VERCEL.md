# 🚀 Guía de Despliegue en Vercel - DenunciaChain

## Preparación Previa

### 1. Verificar que tienes una cuenta en Vercel
- Ve a https://vercel.com
- Crea una cuenta o inicia sesión (puedes usar GitHub, GitLab o email)

### 2. Instalar Vercel CLI (Opcional pero recomendado)
```bash
npm install -g vercel
```

## Método 1: Despliegue desde GitHub (RECOMENDADO)

### Paso 1: Subir el proyecto a GitHub
```bash
# Si aún no has inicializado git
git init
git add .
git commit -m "Preparar proyecto para despliegue en Vercel"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/denunciachain.git
git branch -M main
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ve a https://vercel.com/new
2. Selecciona "Import Git Repository"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `denunciachain`
5. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Paso 3: Configurar Variables de Entorno
En la sección "Environment Variables" de Vercel, agrega:

```
VITE_PINATA_JWT=tu_jwt_token_de_pinata
VITE_PINATA_API_KEY=tu_api_key_de_pinata
VITE_PINATA_SECRET_API_KEY=tu_secret_key_de_pinata
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_CLOUDFLARE_GATEWAY=https://cloudflare-ipfs.com/ipfs/
VITE_DWEB_GATEWAY=https://dweb.link/ipfs/
VITE_NETWORK_NAME=mantle
VITE_NETWORK_RPC=https://rpc.mantle.xyz
VITE_CHAIN_ID=5000
```

### Paso 4: Desplegar
1. Click en "Deploy"
2. Espera a que termine el build (2-5 minutos)
3. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

## Método 2: Despliegue con Vercel CLI

### Paso 1: Login en Vercel
```bash
vercel login
```

### Paso 2: Configurar variables de entorno localmente
Crea un archivo `.env` en la raíz del proyecto con tus credenciales:
```bash
cp .env.example .env
# Edita .env con tus credenciales reales
```

### Paso 3: Desplegar
```bash
# Desde la raíz del proyecto
vercel

# Para producción
vercel --prod
```

### Paso 4: Agregar variables de entorno
```bash
# Agregar cada variable
vercel env add VITE_PINATA_JWT
vercel env add VITE_PINATA_API_KEY
vercel env add VITE_PINATA_SECRET_API_KEY
# ... etc
```

## Obtener Credenciales de Pinata

### 1. Crear cuenta en Pinata
- Ve a https://pinata.cloud
- Crea una cuenta gratuita

### 2. Obtener API Keys
1. Ve a https://app.pinata.cloud/developers/api-keys
2. Click en "New Key"
3. Selecciona permisos:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS
   - ✅ unpin
4. Dale un nombre: "DenunciaChain"
5. Click en "Create Key"
6. **IMPORTANTE**: Copia y guarda:
   - API Key
   - API Secret
   - JWT (en la sección "API Keys" principal)

## Verificación Post-Despliegue

### 1. Verificar que el sitio carga
- Abre la URL de Vercel
- Verifica que la página principal carga correctamente

### 2. Verificar conexión con MetaMask
- Conecta tu wallet
- Verifica que detecta la red correcta

### 3. Probar funcionalidad IPFS
- Intenta crear una denuncia de prueba
- Verifica que los archivos se suben a IPFS

### 4. Revisar logs en Vercel
- Ve a tu proyecto en Vercel Dashboard
- Click en "Deployments"
- Click en el deployment activo
- Revisa los logs si hay errores

## Configuración Avanzada

### Custom Domain (Opcional)
1. Ve a tu proyecto en Vercel
2. Click en "Settings" > "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

### Configurar Redirects
El archivo `vercel.json` ya está configurado con:
- Build command optimizado
- Output directory correcto
- Framework detection

### Optimizaciones
El proyecto ya incluye:
- ✅ Tree shaking automático
- ✅ Code splitting
- ✅ Compresión gzip/brotli
- ✅ CDN global de Vercel
- ✅ HTTPS automático

## Solución de Problemas

### Error: "Build failed"
```bash
# Verifica que el build funciona localmente
cd frontend
npm install
npm run build
```

### Error: "Environment variables not found"
- Verifica que agregaste todas las variables en Vercel Dashboard
- Las variables deben empezar con `VITE_` para ser accesibles en el frontend

### Error: "IPFS upload failed"
- Verifica tus credenciales de Pinata
- Asegúrate de que la API key tiene los permisos correctos

### Error: "Cannot connect to wallet"
- Verifica que MetaMask está instalado
- Asegúrate de estar en la red Mantle Sepolia

## Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver información del proyecto
vercel inspect

# Listar deployments
vercel ls

# Eliminar deployment
vercel rm [deployment-url]

# Ver variables de entorno
vercel env ls
```

## Actualizaciones Futuras

### Despliegue automático con GitHub
Una vez conectado a GitHub, cada push a `main` desplegará automáticamente:
```bash
git add .
git commit -m "Actualización de funcionalidad"
git push origin main
# Vercel desplegará automáticamente
```

### Preview Deployments
Cada Pull Request creará un preview deployment automático para testing.

## Checklist Final

Antes de considerar el despliegue completo:

- [ ] Proyecto subido a GitHub
- [ ] Cuenta de Vercel creada
- [ ] Credenciales de Pinata obtenidas
- [ ] Variables de entorno configuradas en Vercel
- [ ] Primer deployment exitoso
- [ ] Sitio accesible desde URL de Vercel
- [ ] MetaMask conecta correctamente
- [ ] IPFS funciona (prueba subiendo una denuncia)
- [ ] Responsive design funciona en móvil
- [ ] Custom domain configurado (opcional)

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de Pinata](https://docs.pinata.cloud/)
- [Mantle Network Docs](https://docs.mantle.xyz/)

---

¿Necesitas ayuda? Revisa los logs en Vercel Dashboard o contacta al equipo de desarrollo.
