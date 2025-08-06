# 🎯 Historial de Denuncias Solucionado

## ✅ **Problema Identificado y Solucionado**

### **Error Original:**
```
❌ could not decode result data (BAD_DATA)
```

### **Causa Raíz:**
- **Incompatibilidad de ABI**: El contrato devuelve un `struct` pero el frontend esperaba valores individuales
- **Desestructuración incorrecta**: Se intentaba acceder a propiedades como array en lugar de objeto

---

## 🔧 **Solución Implementada**

### **Antes (Incorrecto):**
```typescript
// ❌ Tratando el resultado como valores individuales
contract.obtenerDenuncia(i).then(async (denuncia: any) => {
  // Acceso directo a propiedades que no existían
  if (denuncia.ipfsHash) { ... }
});
```

### **Después (Correcto):**
```typescript
// ✅ Tratando el resultado como struct
contract.obtenerDenuncia(i).then(async (denunciaStruct: any) => {
  // Extraer datos del struct correctamente
  const denuncia = {
    denunciante: denunciaStruct.denunciante,
    tipoAcoso: denunciaStruct.tipoAcoso,
    ipfsHash: denunciaStruct.ipfsHash,
    timestamp: denunciaStruct.timestamp,
    proof: denunciaStruct.proof,
    publicSignals: denunciaStruct.publicSignals
  };
  
  if (denuncia.ipfsHash) { ... }
});
```

---

## 📊 **Estructura del Contrato**

### **ABI Correcto:**
```json
{
  "name": "obtenerDenuncia",
  "outputs": [
    {
      "components": [
        { "name": "denunciante", "type": "address" },
        { "name": "tipoAcoso", "type": "string" },
        { "name": "ipfsHash", "type": "string" },
        { "name": "timestamp", "type": "uint256" },
        { "name": "proof", "type": "bytes" },
        { "name": "publicSignals", "type": "uint256[]" }
      ],
      "internalType": "struct DenunciaAnonima.Denuncia",
      "name": "",
      "type": "tuple"
    }
  ]
}
```

### **Struct en Solidity:**
```solidity
struct Denuncia {
    address denunciante;
    string tipoAcoso;
    string ipfsHash;
    uint256 timestamp;
    bytes proof;
    uint256[] publicSignals;
}
```

---

## 🧪 **Pruebas Realizadas**

### **Diagnóstico Inicial:**
```bash
✅ Conexión a red Mantle Sepolia
✅ Contrato accesible (63 denuncias)
❌ Error decodificando datos: BAD_DATA
```

### **Después de la Corrección:**
```bash
✅ Conexión a red Mantle Sepolia
✅ Contrato accesible (63 denuncias)
✅ Denuncias leídas correctamente
✅ Estructura de datos válida
```

### **Datos de Prueba Obtenidos:**
```
📄 Denuncia 0:
  Denunciante: 0x325FdDB63443c7069A9D0e03412728535aFD5f0c
  Tipo de Acoso: prueba
  IPFS Hash: hash
  Timestamp: 5/17/2025, 1:47:21 AM

📄 Denuncia 1:
  Denunciante: 0x325FdDB63443c7069A9D0e03412728535aFD5f0c
  Tipo de Acoso: prueba
  IPFS Hash: QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ
  Timestamp: 5/17/2025, 1:48:21 AM
```

---

## 🔄 **Flujo de Funcionamiento Corregido**

### **1. Obtención de Denuncias:**
```typescript
const obtenerDenuncias = async () => {
  const total = await contract.totalDenuncias();
  
  for (let i = 0; i < total; i++) {
    const denunciaStruct = await contract.obtenerDenuncia(i);
    
    // ✅ Extraer correctamente del struct
    const denuncia = {
      denunciante: denunciaStruct.denunciante,
      tipoAcoso: denunciaStruct.tipoAcoso,
      ipfsHash: denunciaStruct.ipfsHash,
      timestamp: denunciaStruct.timestamp,
      proof: denunciaStruct.proof,
      publicSignals: denunciaStruct.publicSignals
    };
    
    // Procesar denuncia...
  }
};
```

### **2. Procesamiento de Preview IPFS:**
```typescript
let descripcionPreview = "No se proporcionó descripción";
if (denuncia.ipfsHash) {
  try {
    const contenidoIPFS = await getIPFSContent(denuncia.ipfsHash);
    const jsonContent = JSON.parse(contenidoIPFS);
    
    if (jsonContent.descripcion) {
      descripcionPreview = jsonContent.descripcion.length > 150 
        ? jsonContent.descripcion.substring(0, 150) + "..."
        : jsonContent.descripcion;
    }
  } catch (error) {
    descripcionPreview = "Contenido almacenado en IPFS";
  }
}
```

### **3. Estructura Final para Frontend:**
```typescript
const denunciaFrontend = {
  denunciante: denuncia.denunciante,
  tipoAcoso: denuncia.tipoAcoso,
  descripcion: descripcionPreview,
  ipfsHash: denuncia.ipfsHash,
  proof: denuncia.proof,
  publicSignals: denuncia.publicSignals,
  timestamp: new Date(Number(denuncia.timestamp) * 1000),
  blockNumber: currentBlock,
  esPublica: true
};
```

---

## 📋 **Estado Actual del Sistema**

### **Componentes Funcionando:**
- ✅ **Conexión a Blockchain**: Mantle Sepolia accesible
- ✅ **Lectura de Contrato**: 63 denuncias disponibles
- ✅ **Decodificación de Datos**: Struct procesado correctamente
- ✅ **Preview IPFS**: Contenido recuperado cuando está disponible
- ✅ **Eventos en Tiempo Real**: Listener funcionando
- ✅ **Compilación Frontend**: Sin errores

### **Datos Disponibles:**
- **Total de denuncias**: 63
- **Eventos recientes**: 3 eventos DenunciaCreada detectados
- **Acceso IPFS**: Funcional para hashes válidos
- **Timestamps**: Correctamente convertidos a fechas

---

## 🎯 **Mejoras Implementadas**

### **1. Manejo Robusto de Errores:**
```typescript
try {
  const denunciaStruct = await contract.obtenerDenuncia(i);
  // Procesar struct...
} catch (error) {
  console.error(`Error obteniendo denuncia ${i}:`, error);
  return null; // Continuar con las siguientes
}
```

### **2. Preview Inteligente de IPFS:**
- Intenta obtener contenido real
- Parsea JSON cuando es posible
- Fallback a mensaje genérico si falla
- Límite de 150 caracteres para preview

### **3. Compatibilidad con Eventos:**
- Listener de eventos en tiempo real
- Actualización automática de la lista
- Notificaciones de nuevas denuncias

---

## 🔗 **Archivos Modificados**

### **Principal:**
- ✅ `frontend/src/hooks/useDenunciaAnonima.ts` - Corrección de desestructuración

### **Scripts de Diagnóstico:**
- ✅ `test-historial-debug.js` - Identificación del problema
- ✅ `test-historial-fixed.js` - Verificación de la solución

---

## ✅ **Resultado Final**

### **Antes:**
```
❌ Error: could not decode result data
❌ Historial no se carga
❌ Lista de denuncias vacía
```

### **Después:**
```
✅ 63 denuncias disponibles
✅ Datos decodificados correctamente
✅ Preview de contenido IPFS
✅ Timestamps convertidos a fechas
✅ Eventos en tiempo real funcionando
```

---

**🎉 El historial de denuncias ahora funciona completamente. Los usuarios pueden ver todas las denuncias registradas en la blockchain con sus respectivos detalles y contenido IPFS.**