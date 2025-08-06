const crypto = require('crypto');
const fs = require('fs');

const PASSWORD = 'e!q^mDcHGEYdEYNf';

function descifrarCryptoJSFormat() {
  console.log('🔓 Descifrando formato crypto-js...\n');
  
  try {
    // Leer el contenido cifrado
    const contenidoCifrado = fs.readFileSync('contenido-cifrado-extraido.json', 'utf8');
    const package_ = JSON.parse(contenidoCifrado);
    
    console.log('📋 Información del paquete:');
    console.log(`- Algoritmo: ${package_.algorithm}`);
    console.log(`- Timestamp: ${package_.timestamp}`);
    console.log(`- Contraseña: ${PASSWORD}\n`);
    
    // crypto-js usa un formato específico
    // El data está en base64 pero puede incluir el prefijo "Salted__"
    const encryptedData = package_.data;
    console.log(`📦 Datos cifrados (primeros 50 chars): ${encryptedData.substring(0, 50)}...`);
    
    // Decodificar de base64
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    console.log(`📏 Tamaño del buffer cifrado: ${encryptedBuffer.length} bytes`);
    
    // Verificar si tiene el prefijo "Salted__" (crypto-js format)
    const saltedPrefix = Buffer.from('Salted__', 'utf8');
    let actualSalt, actualData;
    
    if (encryptedBuffer.subarray(0, 8).equals(saltedPrefix)) {
      console.log('✅ Formato crypto-js detectado (con prefijo Salted__)');
      actualSalt = encryptedBuffer.subarray(8, 16); // 8 bytes de salt
      actualData = encryptedBuffer.subarray(16); // Resto es data
      console.log(`🧂 Salt extraído: ${actualSalt.toString('hex')}`);
    } else {
      console.log('⚠️ Usando salt del JSON');
      actualSalt = Buffer.from(package_.salt, 'hex');
      actualData = encryptedBuffer;
    }
    
    // Derivar clave e IV usando el método de crypto-js
    console.log('🔑 Derivando clave e IV...');
    
    // crypto-js usa MD5 para derivar clave e IV
    const keyIv = deriveKeyAndIV(PASSWORD, actualSalt, 32, 16);
    const key = keyIv.key;
    const iv = keyIv.iv;
    
    console.log(`🔑 Clave derivada: ${key.toString('hex').substring(0, 20)}...`);
    console.log(`🎯 IV derivado: ${iv.toString('hex')}`);
    
    // Descifrar
    console.log('🔓 Descifrando...');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(actualData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const decryptedText = decrypted.toString('utf8');
    
    console.log('\n✅ ¡Descifrado exitoso!');
    console.log('═'.repeat(80));
    console.log('📄 CONTENIDO DESCIFRADO:');
    console.log('═'.repeat(80));
    
    try {
      const jsonContent = JSON.parse(decryptedText);
      console.log(JSON.stringify(jsonContent, null, 2));
    } catch {
      console.log(decryptedText);
    }
    
    console.log('═'.repeat(80));
    console.log('🎉 ¡Contenido descifrado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Intentar método alternativo
    console.log('\n🔄 Intentando método alternativo...');
    try {
      descifrarMetodoAlternativo();
    } catch (altError) {
      console.error('❌ Método alternativo también falló:', altError.message);
      
      console.log('\n💡 Información para debugging:');
      console.log('- El contenido está cifrado con crypto-js');
      console.log('- Usa AES-256-CBC con PBKDF2');
      console.log('- Puede requerir el frontend para descifrar correctamente');
    }
  }
}

function deriveKeyAndIV(password, salt, keyLength, ivLength) {
  // Implementación similar a crypto-js EvpKDF
  const hasher = crypto.createHash('md5');
  let derivedBytes = Buffer.alloc(0);
  let block = Buffer.alloc(0);
  
  while (derivedBytes.length < keyLength + ivLength) {
    if (block.length > 0) {
      hasher.update(block);
    }
    hasher.update(password, 'utf8');
    hasher.update(salt);
    block = hasher.digest();
    derivedBytes = Buffer.concat([derivedBytes, block]);
    
    // Crear nuevo hasher para la siguiente iteración
    if (derivedBytes.length < keyLength + ivLength) {
      hasher = crypto.createHash('md5');
    }
  }
  
  return {
    key: derivedBytes.subarray(0, keyLength),
    iv: derivedBytes.subarray(keyLength, keyLength + ivLength)
  };
}

function descifrarMetodoAlternativo() {
  console.log('🔄 Método alternativo: usando salt e IV del JSON...');
  
  const contenidoCifrado = fs.readFileSync('contenido-cifrado-extraido.json', 'utf8');
  const package_ = JSON.parse(contenidoCifrado);
  
  const salt = Buffer.from(package_.salt, 'hex');
  const iv = Buffer.from(package_.iv, 'hex');
  const encryptedData = Buffer.from(package_.data, 'base64');
  
  // Usar PBKDF2 como en crypto-js
  const key = crypto.pbkdf2Sync(PASSWORD, salt, 10000, 32, 'sha1');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  const decryptedText = decrypted.toString('utf8');
  
  console.log('✅ Método alternativo exitoso!');
  console.log('📄 CONTENIDO:');
  console.log(decryptedText);
}

descifrarCryptoJSFormat();