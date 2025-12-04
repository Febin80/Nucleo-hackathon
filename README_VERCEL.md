# 🚀 Desplegar DenunciaChain en Vercel

## Inicio Rápido (3 Pasos)

### 1️⃣ Verificar que todo está listo
```bash
./pre-deploy-check.sh
```

### 2️⃣ Commitear y pushear a GitHub
```bash
git add .
git commit -m "Listo para Vercel"
git push origin main
```

### 3️⃣ Desplegar en Vercel

**Opción A: Desde la Web (Más fácil)**
1. Ve a https://vercel.com/new
2. Importa tu repo: `Nucleo-hackathon`
3. Configura:
   - Root: `frontend`
   - Framework: `Vite`
   - Build: `npm run build`
   - Output: `dist`
4. Agrega variables de entorno (ver abajo)
5. Click "Deploy"

**Opción B: Con CLI (Más rápido)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Opción C: Script Automático**
```bash
./COMANDOS_DESPLIEGUE.sh
```

## 🔐 Variables de Entorno

Agrega en Vercel Dashboard > Settings > Environment Variables:

```
VITE_PINATA_JWT=tu_jwt_aqui
VITE_PINATA_API_KEY=tu_api_key_aqui
VITE_PINATA_SECRET_API_KEY=tu_secret_aqui
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_CLOUDFLARE_GATEWAY=https://cloudflare-ipfs.com/ipfs/
VITE_DWEB_GATEWAY=https://dweb.link/ipfs/
VITE_NETWORK_NAME=mantle
VITE_NETWORK_RPC=https://rpc.mantle.xyz
VITE_CHAIN_ID=5000
```

### Obtener Credenciales de Pinata
1. https://pinata.cloud → Crear cuenta
2. Dashboard → API Keys → New Key
3. Permisos: `pinFileToIPFS`, `pinJSONToIPFS`
4. Copiar: API Key, Secret, JWT

## 📚 Documentación

- **DESPLIEGUE_RAPIDO.md** - Guía de 5 minutos
- **GUIA_DESPLIEGUE_VERCEL.md** - Guía completa
- **CHECKLIST_VERCEL.md** - Checklist paso a paso
- **RESUMEN_DESPLIEGUE.md** - Resumen ejecutivo

## 🛠️ Scripts Disponibles

```bash
./pre-deploy-check.sh      # Verificar pre-despliegue
./deploy-vercel.sh          # Desplegar automáticamente
./COMANDOS_DESPLIEGUE.sh    # Menú interactivo
```

## ✅ Verificación Post-Despliegue

1. Abre la URL de Vercel
2. Conecta MetaMask
3. Crea denuncia de prueba
4. Verifica en historial

## 🆘 Problemas Comunes

**Build failed**
```bash
cd frontend && npm install && npm run build
```

**Variables no encontradas**
- Verifica que empiecen con `VITE_`
- Agrega en Vercel Dashboard

**IPFS no funciona**
- Verifica credenciales de Pinata
- Revisa permisos de API key

## 📞 Recursos

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Pinata Dashboard](https://app.pinata.cloud)
- [Tu Repo](https://github.com/Febin80/Nucleo-hackathon)

---

**¿Listo?** Ejecuta: `./COMANDOS_DESPLIEGUE.sh`
