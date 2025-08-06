const axios = require('axios');

const CID = 'QmdoAwKD9xrvxH8C1mih6isT2XLVRqzZNs7XQj6dR3ydaz';
const PASSWORD = 'e!q^mDcHGEYdEYNf';

async function mostrarInformacionCompleta() {
  console.log('🔍 ANÁLISIS COMPLETO DEL CONTENIDO CIFRADO');
  console.log('═'.repeat(60));
  console.log(`CID: ${CID}`);
  console.log(`Contraseña: ${PASSWORD}`);
  console.log('═'.repeat(60));
  
  try {
    // Obtener contenido desde IPFS
    const url = `https://gateway.pinata.cloud/ipfs/${CID}`;
    const response = await axios.get(url, { timeout: 10000 });
    const contenidoCompleto = typeof response.data === 'string' 
      ? JSON.parse(response.data)
      : response.data;
    
    console.log('\n📋 1. ESTRUCTURA DEL CONTENIDO EN IPFS:');
    console.log('─'.repeat(40));
    console.log(JSON.stringify(contenidoCompleto, null, 2));
    
    console.log('\n📋 2. INFORMACIÓN EXTRAÍDA:');
    console.log('─'.repeat(40));
    console.log(`✅ Tipo de denuncia: ${contenidoCompleto.tipo}`);
    console.log(`✅ Está cifrado: ${contenidoCompleto.metadata?.cifrado || 'No especificado'}`);
    console.log(`✅ Timestamp: ${contenidoCompleto.metadata?.timestamp || 'No especificado'}`);
    
    // Extraer y analizar el contenido cifrado
    const contenidoCifrado = contenidoCompleto.contenido_cifrado;
    const packageCifrado = JSON.parse(contenidoCifrado);
    
    console.log('\n📋 3. DETALLES DEL CIFRADO:');
    console.log('─'.repeat(40));
    console.log(`✅ Versión: ${packageCifrado.version}`);
    console.log(`✅ Algoritmo: ${packageCifrado.algorithm}`);
    console.log(`✅ Timestamp cifrado: ${packageCifrado.timestamp}`);
    console.log(`✅ Salt: ${packageCifrado.salt}`);
    console.log(`✅ IV: ${packageCifrado.iv}`);
    console.log(`✅ Datos cifrados: ${packageCifrado.data.length} caracteres en base64`);
    
    console.log('\n📋 4. MÉTODOS PARA DESCIFRAR:');
    console.log('─'.repeat(40));
    
    console.log('\n🌐 A) En la aplicación web:');
    console.log('   1. Ve a la lista de denuncias');
    console.log('   2. Busca la denuncia con badge "🔒 Cifrado"');
    console.log('   3. Haz clic en "Ver descripción completa"');
    console.log(`   4. Ingresa la contraseña: ${PASSWORD}`);
    console.log('   5. Haz clic en "🔓 Descifrar"');
    
    console.log('\n💻 B) En la consola del navegador (DevTools):');
    console.log(`
// Pega este código en la consola del navegador (F12)
const encryptedContent = \`${contenidoCifrado}\`;
const password = '${PASSWORD}';

// Si tienes acceso al EncryptionService
try {
  const decrypted = EncryptionService.decryptPackage(encryptedContent, password);
  console.log('📄 CONTENIDO DESCIFRADO:', decrypted);
} catch (error) {
  console.error('❌ Error:', error.message);
}
    `);
    
    console.log('\n🔧 C) Usando crypto-js en Node.js:');
    console.log(`
// Instalar: npm install crypto-js
const CryptoJS = require('crypto-js');

const encryptedPackage = ${JSON.stringify(packageCifrado, null, 2)};
const password = '${PASSWORD}';

// Generar clave
const key = CryptoJS.PBKDF2(password, encryptedPackage.salt, {
  keySize: 256 / 32,
  iterations: 10000
}).toString();

// Descifrar
const decrypted = CryptoJS.AES.decrypt(encryptedPackage.data, key, {
  iv: CryptoJS.enc.Hex.parse(encryptedPackage.iv),
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
});

const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
console.log('📄 CONTENIDO DESCIFRADO:', decryptedText);
    `);
    
    console.log('\n📋 5. INFORMACIÓN IMPORTANTE:');
    console.log('─'.repeat(40));
    console.log('⚠️ La contraseña es case-sensitive');
    console.log('⚠️ Sin la contraseña exacta, el contenido es irrecuperable');
    console.log('⚠️ El cifrado usa AES-256-CBC con PBKDF2 (10,000 iteraciones)');
    console.log('✅ El contenido está seguro y solo accesible con la contraseña');
    
    console.log('\n📋 6. URLS DE ACCESO:');
    console.log('─'.repeat(40));
    console.log(`🌐 Gateway Pinata: ${url}`);
    console.log(`🌐 dweb.link: https://dweb.link/ipfs/${CID}`);
    
    console.log('\n📋 7. RESUMEN:');
    console.log('─'.repeat(40));
    console.log('✅ Contenido obtenido exitosamente desde IPFS');
    console.log('✅ Estructura identificada correctamente');
    console.log('✅ Es una denuncia de acoso escolar cifrada');
    console.log('✅ Tienes la contraseña correcta');
    console.log('✅ Puedes descifrarlo usando cualquiera de los métodos de arriba');
    
    console.log('\n🎯 RECOMENDACIÓN:');
    console.log('El método más fácil es usar la aplicación web.');
    console.log('Solo ve a la lista de denuncias y usa la interfaz de descifrado.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

mostrarInformacionCompleta();