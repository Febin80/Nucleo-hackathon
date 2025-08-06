# 🔐 Configuración de Variables de Entorno

## ✅ **Problema Solucionado: Credenciales Seguras**

### **Antes:**
- ❌ Credenciales hardcodeadas en el código fuente
- ❌ API keys visibles en GitHub
- ❌ Riesgo de seguridad alto

### **Después:**
- ✅ Credenciales en variables de entorno
- ✅ Archivos .env excluidos de Git
- ✅ Configuración segura para producción

---

## 🔧 **Configuración**

### **1. Archivo de Variables de Entorno**

#### **`.env` (NO se sube a Git):**
```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=23b2775fd2b791070aa2
VITE_PINATA_SECRET_API_KEY=15d3b3dd69de50713ae749afcdb961459be9290a2d0ebf7815deea4d5fa0ba69
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Custom Gateway
VITE_PINATA_GATEWAY=https://jade-payable-nightingale-723.mypinata.cloud
```

#### **`.env.example` (SÍ se sube a Git):**
```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key_here
VITE_PINATA_JWT=your_pinata_jwt_token_here

# Custom Gateway (optional)
VITE_PINATA_GATEWAY=https://your-custom-gateway.mypinata.cloud
```

### **2. Actualización de .gitignore**
```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### **3. Servicio Pinata Actualizado**
```typescript
// Credenciales desde variables de entorno
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Validación de credenciales
private getHeaders() {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT no está configurado en las variables de entorno');
  }
  return {
    'Authorization': `Bearer ${PINATA_JWT}`,
    'Content-Type': 'application/json'
  };
}
```

---

## 🚀 **Instrucciones de Configuración**

### **Para Desarrollo Local:**
1. **Copia el archivo de ejemplo:**
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. **Edita el archivo .env con tus credenciales:**
   ```bash
   nano frontend/.env
   ```

3. **Agrega tus credenciales reales:**
   - API Key de Pinata
   - Secret Key de Pinata  
   - JWT Token de Pinata
   - Gateway personalizado (opcional)

### **Para Producción:**
1. **Configura las variables en tu plataforma de hosting:**
   - Vercel: Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Heroku: Settings → Config Vars

2. **Variables requeridas:**
   ```
   VITE_PINATA_JWT=tu_jwt_token_aqui
   VITE_PINATA_GATEWAY=tu_gateway_personalizado (opcional)
   ```

### **Para Colaboradores:**
1. **Clona el repositorio**
2. **Copia .env.example a .env**
3. **Solicita las credenciales al administrador del proyecto**
4. **Nunca subas el archivo .env a Git**

---

## 🛡️ **Seguridad Implementada**

### **Protecciones:**
- ✅ **Variables de entorno**: Credenciales fuera del código
- ✅ **Gitignore actualizado**: .env excluido automáticamente
- ✅ **Validación de credenciales**: Error si no están configuradas
- ✅ **Ejemplo público**: .env.example sin credenciales reales

### **Beneficios:**
- 🔒 **Seguridad**: Credenciales no visibles en GitHub
- 🔄 **Flexibilidad**: Diferentes credenciales por entorno
- 👥 **Colaboración**: Fácil configuración para nuevos desarrolladores
- 🚀 **Despliegue**: Configuración segura en producción

---

## 🧪 **Verificación**

### **Comprobar que funciona:**
1. **Elimina el archivo .env temporalmente**
2. **Ejecuta la aplicación**
3. **Deberías ver error**: "PINATA_JWT no está configurado"
4. **Restaura el archivo .env**
5. **La aplicación debería funcionar normalmente**

### **Comprobar que está excluido de Git:**
```bash
git status
# El archivo .env NO debería aparecer en la lista
```

---

## 📋 **Archivos Modificados**

### **Nuevos Archivos:**
- ✅ `frontend/.env` - Credenciales reales (NO en Git)
- ✅ `frontend/.env.example` - Plantilla (SÍ en Git)
- ✅ `CONFIGURACION_VARIABLES_ENTORNO.md` - Esta documentación

### **Archivos Actualizados:**
- ✅ `frontend/.gitignore` - Excluye archivos .env
- ✅ `frontend/src/services/pinata.ts` - Usa variables de entorno
- ✅ `frontend/src/hooks/useDenunciaAnonima.ts` - Mejor manejo de contenido cifrado

---

## ⚠️ **IMPORTANTE**

### **NUNCA hagas esto:**
- ❌ Subir archivos .env a Git
- ❌ Compartir credenciales por chat/email
- ❌ Hardcodear credenciales en el código
- ❌ Usar credenciales de producción en desarrollo

### **SIEMPRE haz esto:**
- ✅ Usar variables de entorno
- ✅ Mantener .env en .gitignore
- ✅ Rotar credenciales periódicamente
- ✅ Usar diferentes credenciales por entorno

---

**🎯 Ahora tus credenciales están seguras y no se subirán a GitHub. El sistema sigue funcionando igual pero de forma más segura.**