# 🚀 Despliegue Rápido en Vercel - 5 Minutos

## Opción 1: Despliegue desde GitHub (MÁS FÁCIL)

### Paso 1: Commitear cambios
```bash
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### Paso 2: Importar en Vercel
1. Ve a: https://vercel.com/new
2. Click en "Import Git Repository"
3. Selecciona tu repo: `Nucleo-hackathon`
4. Configura:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detectado)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Paso 3: Variables de Entorno
En Vercel, agrega estas variables (Settings > Environment Variables):

```
VITE_PINATA_JWT=<tu-jwt-de-pinata>
VITE_PINATA_API_KEY=<tu-api-key>
VITE_PINATA_SECRET_API_KEY=<tu-secret-key>
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_CLOUDFLARE_GATEWAY=https://cloudflare-ipfs.com/ipfs/
VITE_DWEB_GATEWAY=https://dweb.link/ipfs/
VITE_NETWORK_NAME=mantle
VITE_NETWORK_RPC=https://rpc.mantle.xyz
VITE_CHAIN_ID=5000
```

### Paso 4: Deploy
Click en "Deploy" y espera 2-3 minutos.

✅ ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

---

## Opción 2: Despliegue con CLI (MÁS RÁPIDO)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Login
```bash
vercel login
```

### Paso 3: Deploy
```bash
# Desde la raíz del proyecto
vercel --prod
```

Sigue las instrucciones en pantalla y listo!

---

## ¿No tienes credenciales de Pinata?

### Obtener en 2 minutos:
1. Ve a: https://pinata.cloud
2. Crea cuenta gratuita
3. Ve a: https://app.pinata.cloud/developers/api-keys
4. Click "New Key"
5. Selecciona permisos: `pinFileToIPFS`, `pinJSONToIPFS`
6. Copia: API Key, API Secret, JWT

---

## Verificación Post-Despliegue

1. Abre la URL de Vercel
2. Conecta MetaMask
3. Crea una denuncia de prueba
4. Verifica que aparece en el historial

---

## Problemas Comunes

### "Build failed"
```bash
# Verifica localmente
cd frontend
npm install
npm run build
```

### "Environment variables not found"
- Asegúrate de agregar TODAS las variables en Vercel Dashboard
- Deben empezar con `VITE_`

### "IPFS upload failed"
- Verifica tus credenciales de Pinata
- Asegúrate de que la API key tiene permisos

---

## Comandos Útiles

```bash
# Ver logs
vercel logs

# Listar deployments
vercel ls

# Rollback
vercel rollback

# Ver info del proyecto
vercel inspect
```

---

## Recursos

- [Dashboard de Vercel](https://vercel.com/dashboard)
- [Pinata Dashboard](https://app.pinata.cloud)
- [Documentación completa](./GUIA_DESPLIEGUE_VERCEL.md)
- [Checklist completo](./CHECKLIST_VERCEL.md)

---

**¿Listo para desplegar?** Ejecuta:
```bash
./deploy-vercel.sh
```
