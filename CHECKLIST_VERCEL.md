# ✅ Checklist de Despliegue en Vercel

## Pre-Despliegue

### 1. Preparación del Código
- [ ] Todo el código está commiteado en git
- [ ] No hay errores de TypeScript (`cd frontend && npm run build`)
- [ ] Las dependencias están actualizadas
- [ ] El archivo `vercel.json` está configurado

### 2. Credenciales de Pinata
- [ ] Cuenta creada en https://pinata.cloud
- [ ] API Key obtenida
- [ ] API Secret obtenida
- [ ] JWT Token obtenido
- [ ] Credenciales guardadas de forma segura

### 3. Repositorio Git
- [ ] Proyecto subido a GitHub/GitLab/Bitbucket
- [ ] Rama `main` actualizada
- [ ] README.md actualizado
- [ ] .gitignore configurado (no subir .env)

## Durante el Despliegue

### 4. Configuración en Vercel
- [ ] Cuenta de Vercel creada
- [ ] Repositorio importado en Vercel
- [ ] Framework detectado como Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### 5. Variables de Entorno
Agregar en Vercel Dashboard > Settings > Environment Variables:

- [ ] `VITE_PINATA_JWT`
- [ ] `VITE_PINATA_API_KEY`
- [ ] `VITE_PINATA_SECRET_API_KEY`
- [ ] `VITE_PINATA_GATEWAY` = `https://gateway.pinata.cloud`
- [ ] `VITE_IPFS_GATEWAY` = `https://ipfs.io/ipfs/`
- [ ] `VITE_CLOUDFLARE_GATEWAY` = `https://cloudflare-ipfs.com/ipfs/`
- [ ] `VITE_DWEB_GATEWAY` = `https://dweb.link/ipfs/`
- [ ] `VITE_NETWORK_NAME` = `mantle`
- [ ] `VITE_NETWORK_RPC` = `https://rpc.mantle.xyz`
- [ ] `VITE_CHAIN_ID` = `5000`

### 6. Primer Despliegue
- [ ] Click en "Deploy"
- [ ] Build completado sin errores
- [ ] Deployment URL generada
- [ ] Sitio accesible desde la URL

## Post-Despliegue

### 7. Verificación Básica
- [ ] Página principal carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Estilos se ven correctamente
- [ ] Responsive funciona en móvil
- [ ] Todas las páginas son accesibles

### 8. Verificación de Funcionalidad
- [ ] MetaMask detecta la aplicación
- [ ] Botón "Conectar Wallet" funciona
- [ ] Se puede cambiar a red Mantle Sepolia
- [ ] Wallet se conecta correctamente
- [ ] Balance de MNT se muestra

### 9. Verificación de IPFS
- [ ] Formulario de denuncia carga
- [ ] Se pueden seleccionar archivos
- [ ] Archivos se suben a IPFS (verificar en consola)
- [ ] CID se genera correctamente
- [ ] Denuncia se crea en blockchain
- [ ] Denuncia aparece en historial

### 10. Verificación de Historial
- [ ] Lista de denuncias carga
- [ ] Denuncias se muestran correctamente
- [ ] Archivos IPFS se pueden ver/descargar
- [ ] Timestamps son correctos
- [ ] Estados de verificación funcionan

### 11. Testing en Diferentes Dispositivos
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)
- [ ] Tablet

### 12. Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] Lighthouse Score > 80
- [ ] No hay memory leaks
- [ ] Imágenes optimizadas

## Configuración Avanzada (Opcional)

### 13. Custom Domain
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Dominio agregado en Vercel
- [ ] SSL/HTTPS funcionando
- [ ] Redirects configurados

### 14. Analytics
- [ ] Vercel Analytics habilitado
- [ ] Google Analytics configurado (opcional)
- [ ] Error tracking configurado (opcional)

### 15. CI/CD
- [ ] Auto-deploy desde GitHub habilitado
- [ ] Preview deployments funcionando
- [ ] Branch protection rules configuradas
- [ ] Tests automáticos (si aplica)

## Monitoreo Continuo

### 16. Post-Launch
- [ ] Monitorear logs de Vercel
- [ ] Revisar errores en Sentry/similar
- [ ] Verificar uso de Pinata
- [ ] Monitorear costos de gas
- [ ] Backup de datos importante

### 17. Documentación
- [ ] README actualizado con URL de producción
- [ ] Guía de usuario creada
- [ ] Documentación técnica actualizada
- [ ] Changelog mantenido

## Comandos Útiles

```bash
# Verificar build local
cd frontend && npm run build

# Desplegar con CLI
vercel --prod

# Ver logs
vercel logs

# Ver deployments
vercel ls

# Rollback si es necesario
vercel rollback
```

## Contactos de Emergencia

- **Vercel Support**: https://vercel.com/support
- **Pinata Support**: https://pinata.cloud/support
- **Mantle Network**: https://discord.gg/mantlenetwork

## Notas Importantes

⚠️ **Seguridad**
- NUNCA subas archivos .env a git
- Usa variables de entorno de Vercel
- Mantén tus API keys seguras
- Rota credenciales periódicamente

⚠️ **Costos**
- Vercel: Plan gratuito incluye 100GB bandwidth
- Pinata: Plan gratuito incluye 1GB storage
- Mantle: Gas fees en MNT (muy bajo)

⚠️ **Backup**
- Mantén backup del código en GitHub
- Documenta todas las configuraciones
- Guarda credenciales en password manager

---

**Estado del Despliegue**: [ ] No iniciado | [ ] En progreso | [ ] Completado

**Fecha de Despliegue**: _______________

**URL de Producción**: _______________

**Notas Adicionales**:
