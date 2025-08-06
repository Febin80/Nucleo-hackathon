// Debug del problema de doble escape
const CryptoJS = require('crypto-js');

class EncryptionService {
  static generateKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }

  static encrypt(content, password) {
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const iv = CryptoJS.lib.WordArray.random(128/8).toString();
    
    const key = this.generateKey(password, salt);
    
    const encrypted = CryptoJS.AES.encrypt(content, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      encryptedContent: encrypted.toString(),
      salt,
      iv
    };
  }

  static createEncryptedPackage(content, password) {
    const { encryptedContent, salt, iv } = this.encrypt(content, password);
    
    const package_ = {
      version: '1.0',
      encrypted: true,
      algorithm: 'AES-256-CBC',
      data: encryptedContent,
      salt,
      iv,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(package_, null, 2);
  }

  static isEncrypted(content) {
    try {
      const parsed = JSON.parse(content);
      return !!(parsed.encrypted === true && parsed.algorithm && parsed.data);
    } catch {
      return false;
    }
  }
}

function debugDoubleEscape() {
  console.log('🔍 === DEBUG DOBLE ESCAPE ===\n');

  const originalContent = '{"titulo": "Test"}';
  const password = "test-password";

  // Crear paquete cifrado
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  console.log('1️⃣ Paquete cifrado original:');
  console.log('Tipo:', typeof encryptedPackage);
  console.log('Es cifrado:', EncryptionService.isEncrypted(encryptedPackage));
  console.log();

  // Simular lo que hace JSON.stringify() cuando se guarda en IPFS
  const stringifiedOnce = JSON.stringify(encryptedPackage);
  console.log('2️⃣ Después de JSON.stringify() (una vez):');
  console.log('Tipo:', typeof stringifiedOnce);
  console.log('Contenido (primeros 100 chars):', stringifiedOnce.substring(0, 100) + '...');
  console.log('Es cifrado:', EncryptionService.isEncrypted(stringifiedOnce));
  console.log();

  // Crear estructura con contenido_cifrado
  const structure = {
    contenido_cifrado: stringifiedOnce
  };
  const finalJson = JSON.stringify(structure, null, 2);
  
  console.log('3️⃣ Estructura final en IPFS:');
  console.log('Tipo:', typeof finalJson);
  console.log('Es cifrado:', EncryptionService.isEncrypted(finalJson));
  console.log();

  // Simular extracción del componente
  console.log('4️⃣ Simulando extracción del componente:');
  const parsed = JSON.parse(finalJson);
  const extracted = parsed.contenido_cifrado;
  
  console.log('Tipo extraído:', typeof extracted);
  console.log('Contenido extraído (primeros 100 chars):', extracted.substring(0, 100) + '...');
  console.log('Es cifrado (extraído):', EncryptionService.isEncrypted(extracted));
  console.log();

  // Intentar parsear el contenido extraído
  console.log('5️⃣ Parseando contenido extraído:');
  try {
    const parsedExtracted = JSON.parse(extracted);
    console.log('Tipo después de parsear:', typeof parsedExtracted);
    console.log('Es string después de parsear:', typeof parsedExtracted === 'string');
    
    if (typeof parsedExtracted === 'string') {
      console.log('Es un string, intentando parsear de nuevo...');
      try {
        const doubleParsed = JSON.parse(parsedExtracted);
        console.log('Tipo después de doble parseo:', typeof doubleParsed);
        console.log('Propiedades:', Object.keys(doubleParsed));
        console.log('Es cifrado (doble parseado):', EncryptionService.isEncrypted(JSON.stringify(doubleParsed)));
      } catch (doubleError) {
        console.log('❌ Error en doble parseo:', doubleError.message);
      }
    } else {
      console.log('Es un objeto, propiedades:', Object.keys(parsedExtracted));
      console.log('Es cifrado (objeto):', EncryptionService.isEncrypted(JSON.stringify(parsedExtracted)));
    }
  } catch (parseError) {
    console.log('❌ Error parseando:', parseError.message);
  }

  // Probar la solución correcta
  console.log('\n6️⃣ SOLUCIÓN CORRECTA:');
  console.log('El contenido extraído ya es el JSON string del paquete cifrado');
  console.log('No necesita ser parseado, solo verificado directamente');
  console.log('Es cifrado (directo):', EncryptionService.isEncrypted(extracted));
}

debugDoubleEscape();