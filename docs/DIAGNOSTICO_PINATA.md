# 🔧 Diagnóstico de Error Pinata 401

## ❌ **Error Actual:**
```
GET https://api.pinata.cloud/data/testAuthentication 401 (Unauthorized)
🔑 Error de autenticación: Verifica tu JWT token o API keys
```

## 🔍 **Posibles Causas:**

### 1. **JWT Token Expirado**
- Los JWT tokens de Pinata tienen fecha de expiración
- El token actual expira: `"exp":1785866650` (2026)
- **Solución**: Verificar si el token sigue siendo válido

### 2. **Credenciales Incorrectas**
- API Key o Secret Key pueden haber cambiado
- **Credenciales actuales en código:**
  - JWT Token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. **Permisos Insuficientes**
- El token puede no tener permisos para `testAuthentication`
- **Solución**: Verificar permisos en Pinata Dashboard

## 🛠️ **Pasos para Solucionar:**

### **Opción 1: Verificar Token Actual**
1. Ve a [Pinata Dashboard](https://app.pinata.cloud/)
2. Inicia sesión con tu cuenta
3. Ve a "API Keys" en el menú lateral
4. Verifica que el token siga activo

### **Opción 2: Crear Nuevo JWT Token**
1. En Pinata Dashboard → "API Keys"
2. Haz clic en "New Key"
3. Selecciona permisos:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
   - ✅ `testAuthentication`
   - ✅ `pinList`
4. Copia el nuevo JWT token
5. Reemplaza en `frontend/src/services/pinata.ts`

### **Opción 3: Usar API Key + Secret**
Si prefieres usar API Key + Secret en lugar de JWT:

```typescript
// En pinata.ts
const PINATA_API_KEY = 'tu_api_key_aqui';
const PINATA_SECRET_API_KEY = 'tu_secret_key_aqui';

const pinataAxios = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_API_KEY,
  }
});
```

## 🧪 **Para Probar:**

1. **Actualiza las credenciales** en `pinata.ts`
2. **Recarga la aplicación**
3. **Haz clic en "📌 Test Pinata"**
4. **Prueba "🔍 Probar Conexión"**
5. **Debería mostrar "✅ Conectado"**

## 📋 **Información Actual:**

- **Archivo**: `frontend/src/services/pinata.ts`
- **Método**: JWT Bearer Token
- **Endpoint**: `https://api.pinata.cloud/data/testAuthentication`
- **Estado**: ❌ 401 Unauthorized

## 🎯 **Resultado Esperado:**

Cuando las credenciales sean correctas, deberías ver:
```
✅ Conexión con Pinata exitosa
Congratulations! You are communicating with the Pinata API!
```

## 🔑 **Próximos Pasos:**

1. **Verifica tu cuenta Pinata**
2. **Obtén credenciales válidas**
3. **Actualiza el archivo pinata.ts**
4. **Prueba la conexión**

¿Puedes verificar tu dashboard de Pinata y obtener un JWT token nuevo o confirmar las credenciales actuales?