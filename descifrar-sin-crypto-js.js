const crypto = require('crypto');
const fs = require('fs');

const PASSWORD = 'e!q^mDcHGEYdEYNf';

function descifrarContenido() {
  console.log('🔓 Descifrando contenido con Node.js crypto...\n');
  
  try {
    // Leer el contenido cifrado
    const contenidoCifrado = fs.readFileSync('contenido-cifrado-extraido.json', 'utf8');
    const package_ = JSON.parse(contenidoCifrado);
    
    console.log('📋 Información del paquete cifrado:');
    console.log(`- Versión: ${package_.version}`);
    console.log(`- Algoritmo: ${package_.algorithm}`);
    console.log(`- Timestamp: ${package_.timestamp}`);
    console.log(`- Salt: ${package_.salt}`);
    console.log(`- IV: ${package_.iv}\n`);
    
    // Convertir salt e IV de hex a Buffer
    const salt = Buffer.from(package_.salt, 'hex');
    const iv = Buffer.from(package_.iv, 'hex');
    
    // Derivar la clave usando PBKDF2 (igual que crypto-js)
    console.log('🔑 Derivando clave con PBKDF2...');
    const key = crypto.pbkdf2Sync(PASSWORD, salt, 10000, 32, 'sha1');
    
    // Descifrar usando AES-256-CBC
    console.log('🔓 Descifrando con AES-256-CBC...');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    // El data viene en formato base64 (formato de crypto-js)
    const encryptedData = Buffer.from(package_.data, 'base64');
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const decryptedText = decrypted.toString('utf8');
    
    console.log('✅ Descifrado exitoso!\n');
    console.log('📄 CONTENIDO DESCIFRADO:');
    console.log('═'.repeat(60));
    
    try {
      // Intentar formatear como JSON
      const jsonContent = JSON.parse(decryptedText);
      console.log(JSON.stringify(jsonContent, null, 2));
    } catch {
      // Si no es JSON, mostrar como texto
      console.log(decryptedText);
    }
    
    console.log('═'.repeat(60));
    console.log('\n🎉 ¡Contenido descifrado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al descifrar:', error.message);
    
    if (error.message.includes('bad decrypt')) {
      console.log('\n💡 Posibles causas:');
      console.log('- Contraseña incorrecta');
      console.log('- Datos corruptos');
      console.log('- Formato de cifrado incompatible');
    }
  }
}

descifrarContenido();