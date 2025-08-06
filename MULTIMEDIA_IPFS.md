# 📸 Multimedia en IPFS - Fotos y Videos

## 🎉 **¡Nueva Funcionalidad Agregada!**

### 📱 **Soporte Multimedia Completo:**

- ✅ **Fotos**: JPG, PNG, GIF, WebP
- ✅ **Videos**: MP4, AVI, MOV, WMV, WebM
- ✅ **Múltiples archivos**: Hasta 5 archivos por denuncia
- ✅ **Archivos grandes**: Hasta 100MB por archivo
- ✅ **Almacenamiento real**: IPFS descentralizado via Pinata

### 🔧 **Componentes Nuevos:**

#### 1. **MediaUploader** (`frontend/src/components/MediaUploader.tsx`)
- 📁 Selector de archivos con drag & drop
- 🖼️ Vista previa de imágenes
- 📊 Validación de tipos y tamaños
- 🗑️ Eliminación individual de archivos
- 📋 Resumen de archivos seleccionados

#### 2. **MediaViewer** (`frontend/src/components/MediaViewer.tsx`)
- 🖼️ Galería de evidencia multimedia
- 🔍 Vista en tamaño completo (modal)
- 🎥 Reproductor de video integrado
- 🔗 Enlaces directos a IPFS
- 📋 Copia de URLs

#### 3. **Servicios Pinata Extendidos** (`frontend/src/services/pinata.ts`)
- `uploadFileToPinata()` - Sube archivos individuales
- `uploadMultipleFilesToPinata()` - Sube múltiples archivos
- `uploadDenunciaWithMediaToIPFS()` - Denuncia con evidencia
- `getDenunciaWithMediaInfo()` - Info detallada

### 🚀 **Flujo de Trabajo:**

```
Usuario selecciona archivos
        ↓
MediaUploader valida y muestra previews
        ↓
Usuario envía denuncia
        ↓
Archivos se suben a IPFS via Pinata
        ↓
Denuncia se crea con hashes de evidencia
        ↓
MediaViewer muestra evidencia en la lista
```

### 🧪 **Cómo Probar:**

#### **1. Subir Evidencia:**
1. Ve al formulario de denuncia
2. Busca la sección "📎 Evidencia Multimedia"
3. Haz clic en "📁 Seleccionar Archivos"
4. Elige fotos o videos (máx 5 archivos, 100MB c/u)
5. Verás previews de los archivos
6. Envía la denuncia normalmente

#### **2. Ver Evidencia:**
1. En la lista de denuncias, busca denuncias con evidencia
2. Haz clic en "👁️ Ver Contenido"
3. Verás la galería de evidencia multimedia
4. Haz clic en cualquier elemento para verlo en grande

#### **3. Test de Pinata:**
1. Haz clic en "📌 Test Pinata"
2. Prueba "🖼️ Test Multimedia"
3. Debería subir una imagen de prueba

### 📊 **Estructura de Datos:**

```json
{
  "tipo": "acoso_laboral",
  "descripcion": "Descripción de la denuncia...",
  "fecha": "2024-01-15T10:30:00Z",
  "evidencia": {
    "archivos": [
      "QmHash1...", 
      "QmHash2..."
    ],
    "cantidad": 2,
    "tipos": ["image/jpeg", "video/mp4"]
  },
  "metadata": {
    "version": "1.0",
    "plataforma": "Nucleo - Denuncias Anónimas",
    "con_evidencia": true
  }
}
```

### 🔗 **URLs de Acceso:**

Los archivos multimedia se pueden acceder en:
- `https://gateway.pinata.cloud/ipfs/{hash}`
- `https://ipfs.io/ipfs/{hash}`
- Cualquier gateway IPFS público

### ⚡ **Ventajas:**

- **🌐 Descentralizado**: Archivos almacenados en IPFS
- **🔒 Inmutable**: No se pueden modificar una vez subidos
- **🌍 Global**: Accesible desde cualquier parte del mundo
- **📱 Responsive**: Funciona en móviles y desktop
- **🚀 Rápido**: Gateways optimizados de Pinata

### 🛡️ **Seguridad:**

- ✅ **Validación de tipos**: Solo imágenes y videos permitidos
- ✅ **Límite de tamaño**: Máximo 100MB por archivo
- ✅ **Límite de cantidad**: Máximo 5 archivos por denuncia
- ✅ **Sanitización**: Nombres de archivos seguros
- ✅ **Metadatos**: Información de tracking y auditoría

### 🎯 **Casos de Uso:**

1. **Acoso Laboral**: Capturas de pantalla de mensajes
2. **Acoso Sexual**: Fotos de evidencia física
3. **Acoso Escolar**: Videos de incidentes
4. **Discriminación**: Documentos o imágenes probatorias
5. **Cualquier denuncia**: Evidencia visual de apoyo

## 🎉 **Resultado Final:**

**¡Tu sistema de denuncias ahora soporta evidencia multimedia completa!**

- ✅ **Subida**: Fotos y videos a IPFS real
- ✅ **Almacenamiento**: Descentralizado y permanente
- ✅ **Visualización**: Galería integrada
- ✅ **Acceso**: URLs directas a contenido
- ✅ **Validación**: Tipos y tamaños controlados

### 🚀 **¡Listo para Usar!**

El sistema está completamente funcional y listo para recibir denuncias con evidencia multimedia real almacenada en IPFS.