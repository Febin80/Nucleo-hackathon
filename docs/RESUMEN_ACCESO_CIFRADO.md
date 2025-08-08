# 🔐 RESUMEN: Cómo Acceder al Contenido Cifrado en IPFS

## 🎯 **Métodos Disponibles (de más fácil a más técnico)**

### **1. 📱 Interfaz Web (RECOMENDADO - MÁS FÁCIL)**
```
1. Ve a la aplicación web
2. Busca denuncias con badge "🔒 Cifrado"
3. Haz clic en "Ver descripción completa"
4. Ingresa tu contraseña en el campo que aparece
5. Haz clic en "🔓 Descifrar"
6. ¡Listo! El contenido se muestra descifrado
```

### **2. 🌐 Acceso Directo via Gateway IPFS**
```
URL: https://gateway.pinata.cloud/ipfs/TU_CID_AQUI
Resultado: JSON cifrado que necesitas descifrar manualmente
```

### **3. 💻 Herramienta de Línea de Comandos**
```bash
# Instalar dependencias (solo la primera vez)
npm install crypto-js axios

# Usar la herramienta
node decrypt-ipfs.js TU_CID_AQUI "tu-contraseña-aqui"

# Ejemplo
node decrypt-ipfs.js QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG "K7mN9pQ2rT5vW8xA1bC4dE6fG9hJ2kL5"
```

### **4. 🔧 Programáticamente (JavaScript)**
```javascript
// En el frontend
import { EncryptionService } from './services/encryption';

const encryptedContent = '...'; // Contenido de IPFS
const password = 'tu-contraseña';

try {
  const decrypted = EncryptionService.decryptPackage(encryptedContent, password);
  console.log('Contenido descifrado:', decrypted);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔑 **Sobre las Contraseñas**

### **Formato:**
- **Longitud**: 32 caracteres
- **Ejemplo**: `K7mN9pQ2rT5vW8xA1bC4dE6fG9hJ2kL5`
- **Incluye**: Letras (A-Z, a-z), números (0-9), símbolos (!@#$%^&*)

### **Importante:**
- ⚠️ **Se muestra UNA SOLA VEZ** al crear la denuncia
- ⚠️ **NO se almacena en ningún lugar** del sistema
- ⚠️ **Sin la contraseña, el contenido es IRRECUPERABLE**
- ⚠️ **Case-sensitive** (distingue mayúsculas/minúsculas)

---

## 🛡️ **Estructura del Contenido Cifrado**

### **Lo que ves en IPFS:**
```json
{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=...",
  "salt": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "iv": "1234567890abcdef1234567890abcdef",
  "timestamp": "2025-08-05T18:00:00.000Z"
}
```

### **Lo que obtienes después del descifrado:**
```json
{
  "tipo": "acoso_sexual",
  "descripcion": "Descripción detallada y confidencial...",
  "fecha": "2025-08-05T14:30:00.000Z",
  "ubicacion": "Oficina principal, sala de reuniones privada",
  "testigos": ["Colega A", "Colega B"],
  "evidencia": ["Grabación de audio", "Mensajes de texto"],
  "metadata": {
    "version": "1.0",
    "plataforma": "Nucleo - Denuncias Anónimas",
    "confidencial": true
  }
}
```

---

## 🧪 **Verificar si Está Cifrado**

### **Función JavaScript:**
```javascript
function isEncrypted(content) {
  try {
    const parsed = JSON.parse(content);
    return parsed.encrypted === true && 
           parsed.algorithm === 'AES-256-CBC' && 
           parsed.data;
  } catch {
    return false;
  }
}
```

### **Indicadores Visuales:**
- 🔒 **Badge "Cifrado"** en la lista de denuncias
- ⚠️ **Campo de contraseña** en el visor de contenido
- 🔓 **Botón "Descifrar"** para procesar

---

## 🔍 **Solución de Problemas**

### **"Contraseña incorrecta":**
- ✅ Verifica que no haya espacios extra al inicio o final
- ✅ Asegúrate de usar la contraseña exacta (case-sensitive)
- ✅ Copia y pega la contraseña en lugar de escribirla

### **"Contenido no disponible":**
- ✅ Verifica que el CID sea correcto y completo
- ✅ Prueba con diferentes gateways IPFS
- ✅ Verifica tu conexión a internet
- ✅ Espera unos minutos (propagación IPFS)

### **"Error de formato":**
- ✅ Verifica que el contenido sea JSON válido
- ✅ Asegúrate de que esté realmente cifrado
- ✅ Verifica que el CID apunte al contenido correcto

---

## 📚 **Archivos de Referencia**

### **Documentación:**
- `GUIA_CONTENIDO_CIFRADO_IPFS.md` - Guía completa
- `RESUMEN_ACCESO_CIFRADO.md` - Este archivo

### **Herramientas:**
- `decrypt-ipfs.js` - Herramienta CLI para descifrar
- `ejemplo-cifrado-simple.js` - Ejemplo educativo

### **Código Fuente:**
- `frontend/src/services/encryption.ts` - Servicio de cifrado
- `frontend/src/components/IPFSContentViewer.tsx` - Visor con descifrado

---

## 🎯 **Flujo Típico de Uso**

### **Crear Denuncia Cifrada:**
```
1. Usuario llena el formulario de denuncia
2. Usuario marca "Cifrar contenido"
3. Sistema genera contraseña automáticamente
4. Sistema muestra la contraseña AL USUARIO
5. Usuario DEBE GUARDAR la contraseña
6. Sistema cifra el contenido
7. Sistema sube contenido cifrado a IPFS
8. Sistema guarda CID en blockchain
```

### **Acceder a Denuncia Cifrada:**
```
1. Usuario ve la lista de denuncias
2. Usuario identifica denuncia con "🔒 Cifrado"
3. Usuario hace clic en "Ver descripción completa"
4. Sistema detecta contenido cifrado
5. Sistema pide contraseña
6. Usuario ingresa la contraseña guardada
7. Sistema descifra y muestra contenido
```

---

## ⚡ **Comandos Rápidos**

### **Verificar contenido:**
```bash
# Ver contenido cifrado
curl https://gateway.pinata.cloud/ipfs/TU_CID

# Descifrar con herramienta CLI
node decrypt-ipfs.js TU_CID "tu-contraseña"

# Ver información sin descifrar
node decrypt-ipfs.js --info TU_CID
```

### **En la consola del navegador:**
```javascript
// Verificar si está cifrado
const content = '...'; // Contenido de IPFS
console.log('¿Cifrado?', JSON.parse(content).encrypted);

// Descifrar (si tienes el servicio cargado)
const decrypted = EncryptionService.decryptPackage(content, 'contraseña');
console.log(decrypted);
```

---

**🎉 Con estos métodos puedes acceder a cualquier contenido cifrado almacenado en IPFS. ¡Elige el método que más te convenga!**