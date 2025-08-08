const axios = require('axios');

const CID = 'QmdoAwKD9xrvxH8C1mih6isT2XLVRqzZNs7XQj6dR3ydaz';
const PASSWORD = 'e!q^mDcHGEYdEYNf';

async function descifrarContenidoReal() {
  console.log('🔍 Obteniendo y descifrando contenido...');
  console.log(`CID: ${CID}`);
  console.log(`Contraseña: ${PASSWORD}\n`);
  
  try {
    // Obtener contenido desde IPFS
    const url = `https://gateway.pinata.cloud/ipfs/${CID}`;
    const response = await axios.get(url, { timeout: 10000 });
    const contenidoCompleto = typeof response.data === 'string' 
      ? JSON.parse(response.data)
      : response.data;
    
    console.log('📄 Estructura del contenido:');
    console.log(`- Tipo: ${contenidoCompleto.tipo}`);
    console.log(`- Tiene contenido_cifrado: ${!!contenidoCompleto.contenido_cifrado}`);
    console.log(`- Metadata: ${JSON.stringify(contenidoCompleto.metadata)}`);
    
    // Extraer el contenido cifrado real
    const contenidoCifradoReal = contenidoCompleto.contenido_cifrado;
    console.log('\n🔐 Contenido cifrado extraído:');
    
    // Parsear el JSON del contenido cifrado
    let packageCifrado;
    try {
      packageCifrado = JSON.parse(contenidoCifradoReal);
    } catch (error) {
      console.error('❌ Error parseando contenido cifrado:', error.message);
      return;
    }
    
    console.log(`- Versión: ${packageCifrado.version}`);
    console.log(`- Algoritmo: ${packageCifrado.algorithm}`);
    console.log(`- Timestamp: ${packageCifrado.timestamp}`);
    console.log(`- Salt: ${packageCifrado.salt}`);
    console.log(`- IV: ${packageCifrado.iv}`);
    console.log(`- Datos cifrados (primeros 50 chars): ${packageCifrado.data.substring(0, 50)}...`);
    
    console.log('\n💡 Para descifrar este contenido, necesitas:');
    console.log('1. Instalar crypto-js: npm install crypto-js');
    console.log('2. Usar el servicio de cifrado del frontend');
    
    // Crear un archivo temporal con el contenido cifrado para usar con decrypt-ipfs.js
    const fs = require('fs');
    fs.writeFileSync('contenido-cifrado-temp.json', contenidoCifradoReal);
    console.log('\n📁 Contenido cifrado guardado en: contenido-cifrado-temp.json');
    
    console.log('\n🔓 Intentando descifrar (simulación sin crypto-js):');
    console.log('El contenido original contiene información sobre:');
    console.log(`- Tipo de denuncia: ${contenidoCompleto.tipo}`);
    console.log('- Descripción detallada (cifrada)');
    console.log('- Fecha y ubicación del incidente');
    console.log('- Posible evidencia o testigos');
    
    console.log('\n🌐 URLs para acceder:');
    console.log(`- Gateway Pinata: ${url}`);
    console.log(`- dweb.link: https://dweb.link/ipfs/${CID}`);
    
    console.log('\n📋 Resumen:');
    console.log('✅ Contenido obtenido exitosamente');
    console.log('✅ Estructura identificada correctamente');
    console.log('✅ Contenido cifrado extraído');
    console.log('⚠️ Necesitas crypto-js para descifrar completamente');
    
    console.log('\n💻 Para descifrar completamente, ejecuta en el frontend:');
    console.log(`
import { EncryptionService } from './services/encryption';

const encryptedContent = \`${contenidoCifradoReal}\`;
const password = '${PASSWORD}';

try {
  const decrypted = EncryptionService.decryptPackage(encryptedContent, password);
  console.log('Contenido descifrado:', decrypted);
} catch (error) {
  console.error('Error:', error.message);
}
    `);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

descifrarContenidoReal();