# 🔐 Guía: Cómo Acceder al Contenido Cifrado en IPFS

## 📋 **Resumen del Sistema de Cifrado**

El sistema utiliza **cifrado AES-256-CBC** para proteger el contenido sensible almacenado en IPFS. El contenido cifrado se estructura como un paquete JSON que incluye todos los datos necesarios para el descifrado.

---

## 🔧 **Estructura del Contenido Cifrado**

### **Formato del Paquete Cifrado:**
```json
{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=",
  "salt": "a1b2c3d4e5f6g7h8",
  "iv": "1234567890abcdef",
  "timestamp": "2025-08-05T18:00:00.000Z"
}
```

### **Componentes:**
- **`version`**: Versión del formato de cifrado
- **`encrypted`**: Indica que el contenido está cifrado
- **`algorithm`**: Algoritmo de cifrado utilizado
- **`data`**: Contenido cifrado en Base64
- **`salt`**: Salt único para derivación de clave
- **`iv`**: Vector de inicialización único
- **`timestamp`**: Fecha de cifrado

---

## 🌐 **Métodos para Acceder al Contenido Cifrado**

### **1. A través de la Interfaz Web (Recomendado)**

#### **Paso a Paso:**
1. **Localizar la Denuncia**:
   - Ve a la lista de denuncias
   - Busca denuncias que muestren "🔒 Cifrado" en el badge

2. **Abrir el Visor de Contenido**:
   - Haz clic en "Ver descripción completa"
   - El sistema detectará automáticamente si está cifrado

3. **Introducir la Contraseña**:
   - Aparecerá un campo de contraseña
   - Ingresa la contraseña que se te proporcionó al crear la denuncia
   - Haz clic en "🔓 Descifrar"

4. **Ver el Contenido**:
   - El contenido se descifrará y mostrará en texto plano
   - También se mostrará el contenido cifrado original para referencia

#### **Ejemplo Visual:**
```
┌─────────────────────────────────────┐
│ 🔒 Contenido cifrado                │
│                                     │
│ Este contenido está cifrado.        │
│ Ingresa la contraseña para          │
│ descifrarlo.                        │
│                                     │
│ Contraseña: [________________]      │
│                                     │
│ [🔓 Descifrar]                      │
└─────────────────────────────────────┘
```

---

### **2. Acceso Directo via IPFS Gateway**

#### **URLs de Ejemplo:**
```
Gateway Pinata: https://gateway.pinata.cloud/ipfs/QmHashDelContenidoCifrado
dweb.link: https://dweb.link/ipfs/QmHashDelContenidoCifrado
```

#### **Lo que Verás:**
```json
{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=",
  "salt": "a1b2c3d4e5f6g7h8",
  "iv": "1234567890abcdef",
  "timestamp": "2025-08-05T18:00:00.000Z"
}
```

---

### **3. Descifrado Manual (Para Desarrolladores)**

#### **Usando JavaScript:**
```javascript
import { EncryptionService } from './services/encryption';

// Obtener el contenido cifrado de IPFS
const encryptedContent = `{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=",
  "salt": "a1b2c3d4e5f6g7h8",
  "iv": "1234567890abcdef",
  "timestamp": "2025-08-05T18:00:00.000Z"
}`;

// Descifrar con la contraseña
const password = "tu-contraseña-aqui";
try {
  const decryptedContent = EncryptionService.decryptPackage(encryptedContent, password);
  console.log('Contenido descifrado:', decryptedContent);
} catch (error) {
  console.error('Error al descifrar:', error.message);
}
```

#### **Usando Node.js:**
```javascript
const CryptoJS = require('crypto-js');

function decryptIPFSContent(packageContent, password) {
  const package_ = JSON.parse(packageContent);
  
  if (!package_.encrypted) {
    return packageContent; // No está cifrado
  }
  
  // Generar la clave usando PBKDF2
  const key = CryptoJS.PBKDF2(password, package_.salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  
  // Descifrar
  const decrypted = CryptoJS.AES.decrypt(package_.data, key, {
    iv: CryptoJS.enc.Hex.parse(package_.iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Uso
const encryptedContent = '...'; // Contenido de IPFS
const password = 'tu-contraseña';
const decrypted = decryptIPFSContent(encryptedContent, password);
console.log(decrypted);
```

---

### **4. Herramienta de Línea de Comandos**

Voy a crear una herramienta CLI para descifrar contenido:

```javascript
// decrypt-ipfs.js
const axios = require('axios');
const CryptoJS = require('crypto-js');

async function decryptFromIPFS(cid, password) {
  try {
    // Obtener contenido de IPFS
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    const encryptedContent = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    
    // Verificar si está cifrado
    const package_ = JSON.parse(encryptedContent);
    if (!package_.encrypted) {
      console.log('El contenido no está cifrado');
      return encryptedContent;
    }
    
    // Descifrar
    const key = CryptoJS.PBKDF2(password, package_.salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
    
    const decrypted = CryptoJS.AES.decrypt(package_.data, key, {
      iv: CryptoJS.enc.Hex.parse(package_.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Contraseña incorrecta');
    }
    
    return decryptedText;
    
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

// Uso desde línea de comandos
if (require.main === module) {
  const [,, cid, password] = process.argv;
  
  if (!cid || !password) {
    console.log('Uso: node decrypt-ipfs.js <CID> <contraseña>');
    process.exit(1);
  }
  
  decryptFromIPFS(cid, password)
    .then(content => {
      console.log('✅ Contenido descifrado:');
      console.log(content);
    })
    .catch(error => {
      console.error('❌', error.message);
    });
}
```

**Uso:**
```bash
node decrypt-ipfs.js QmHashDelContenidoCifrado mi-contraseña-secreta
```

---

## 🔑 **Gestión de Contraseñas**

### **¿Dónde se Almacenan las Contraseñas?**
- **NO se almacenan en la blockchain**
- **NO se almacenan en IPFS**
- **Se muestran al usuario una sola vez** al crear la denuncia cifrada
- **El usuario debe guardarlas de forma segura**

### **Formato de Contraseñas Generadas:**
```
Ejemplo: K7mN9pQ2rT5vW8xA1bC4dE6fG9hJ2kL5
- Longitud: 32 caracteres
- Incluye: letras mayúsculas, minúsculas, números y símbolos
- Generadas criptográficamente seguras
```

### **¿Qué Pasa si Pierdo la Contraseña?**
- ⚠️ **No hay forma de recuperar el contenido**
- ⚠️ **El cifrado es irreversible sin la contraseña**
- ⚠️ **Ni los administradores pueden acceder**

---

## 🛡️ **Seguridad del Sistema**

### **Características de Seguridad:**
- **AES-256-CBC**: Cifrado de grado militar
- **PBKDF2**: 10,000 iteraciones para derivación de clave
- **Salt único**: Previene ataques de diccionario
- **IV único**: Previene patrones en el cifrado
- **Sin almacenamiento de claves**: Zero-knowledge

### **Buenas Prácticas:**
1. **Guarda la contraseña de forma segura**
2. **No compartas la contraseña por canales inseguros**
3. **Usa un gestor de contraseñas**
4. **Haz copias de seguridad de la contraseña**

---

## 🧪 **Ejemplos Prácticos**

### **Ejemplo 1: Denuncia Cifrada Completa**
```json
{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=...",
  "salt": "a1b2c3d4e5f6g7h8",
  "iv": "1234567890abcdef",
  "timestamp": "2025-08-05T18:00:00.000Z"
}
```

**Contenido Original (después del descifrado):**
```json
{
  "tipo": "acoso_sexual",
  "descripcion": "Descripción detallada y sensible del incidente...",
  "fecha": "2025-08-05T15:30:00.000Z",
  "ubicacion": "Oficina principal, piso 3",
  "testigos": ["Persona A", "Persona B"],
  "evidencia": "Documentos y grabaciones adjuntas",
  "metadata": {
    "version": "1.0",
    "plataforma": "Nucleo - Denuncias Anónimas",
    "confidencial": true
  }
}
```

### **Ejemplo 2: Verificar si Está Cifrado**
```javascript
function isContentEncrypted(content) {
  try {
    const parsed = JSON.parse(content);
    return parsed.encrypted === true && parsed.algorithm && parsed.data;
  } catch {
    return false;
  }
}

// Uso
const content = '{"encrypted": true, "algorithm": "AES-256-CBC", ...}';
console.log(isContentEncrypted(content)); // true
```

---

## 🔧 **Solución de Problemas**

### **Error: "Contraseña incorrecta"**
- ✅ Verifica que la contraseña sea exacta (case-sensitive)
- ✅ Asegúrate de no tener espacios extra
- ✅ Verifica que el contenido esté realmente cifrado

### **Error: "Contenido corrupto"**
- ✅ Verifica que el CID sea correcto
- ✅ Intenta con diferentes gateways IPFS
- ✅ Verifica que el JSON esté bien formado

### **Error: "No se puede acceder al contenido"**
- ✅ Verifica conectividad a IPFS
- ✅ Prueba diferentes gateways
- ✅ Verifica que el CID exista

---

## 📱 **Interfaz de Usuario**

### **Indicadores Visuales:**
- 🔒 **Badge "Cifrado"** en denuncias cifradas
- 🔓 **Botón "Descifrar"** en el visor
- ⚠️ **Advertencias** sobre contraseñas perdidas
- ✅ **Confirmación** de descifrado exitoso

### **Flujo de Usuario:**
```
1. Usuario ve denuncia con badge "🔒 Cifrado"
2. Hace clic en "Ver descripción completa"
3. Sistema detecta contenido cifrado
4. Muestra campo de contraseña
5. Usuario ingresa contraseña
6. Sistema descifra y muestra contenido
7. Usuario puede ver tanto el contenido original como el cifrado
```

---

**🎯 Con esta guía puedes acceder a cualquier contenido cifrado almacenado en IPFS, ya sea a través de la interfaz web, programáticamente, o usando herramientas de línea de comandos.**