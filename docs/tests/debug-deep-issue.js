// Debug profundo del problema de descifrado
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
      const result = !!(parsed.encrypted === true && parsed.algorithm && parsed.data);
      console.log('🔍 isEncrypted check:', {
        hasEncrypted: !!parsed.encrypted,
        encryptedValue: parsed.encrypted,
        hasAlgorithm: !!parsed.algorithm,
        algorithmValue: parsed.algorithm,
        hasData: !!parsed.data,
        finalResult: result
      });
      return result;
    } catch (error) {
      console.log('❌ isEncrypted failed to parse JSON:', error.message);
      return false;
    }
  }
}

function debugEscapedContent() {
  console.log('🔍 === DEBUG PROFUNDO DEL CONTENIDO ESCAPADO ===\n');

  const originalContent = '{"titulo": "Test", "descripcion": "Contenido de prueba"}';
  const password = "test-password";

  // Crear paquete cifrado
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  console.log('1️⃣ Paquete cifrado original:');
  console.log('Es cifrado:', EncryptionService.isEncrypted(encryptedPackage));
  console.log('Contenido (primeros 150 chars):', encryptedPackage.substring(0, 150) + '...\n');

  // Crear estructura escapada
  const escapedStructure = {
    contenido_cifrado: JSON.stringify(encryptedPackage)
  };
  const escapedJson = JSON.stringify(escapedStructure, null, 2);
  
  console.log('2️⃣ Estructura escapada completa:');
  console.log('Es cifrado:', EncryptionService.isEncrypted(escapedJson));
  console.log('Contenido (primeros 200 chars):', escapedJson.substring(0, 200) + '...\n');

  // Extraer contenido_cifrado
  const parsedEscaped = JSON.parse(escapedJson);
  const extractedString = parsedEscaped.contenido_cifrado;
  
  console.log('3️⃣ String extraído (contenido_cifrado):');
  console.log('Tipo:', typeof extractedString);
  console.log('Es cifrado (antes de parsear):', EncryptionService.isEncrypted(extractedString));
  console.log('Contenido (primeros 150 chars):', extractedString.substring(0, 150) + '...\n');

  // Parsear el string escapado
  try {
    const unescapedContent = JSON.parse(extractedString);
    console.log('4️⃣ Contenido parseado (unescaped):');
    console.log('Tipo:', typeof unescapedContent);
    console.log('Propiedades:', Object.keys(unescapedContent));
    console.log('encrypted:', unescapedContent.encrypted);
    console.log('algorithm:', unescapedContent.algorithm);
    console.log('data exists:', !!unescapedContent.data);
    
    // Verificar si es un paquete cifrado
    const isEncryptedPackage = unescapedContent && typeof unescapedContent === 'object' && 
                              unescapedContent.encrypted && unescapedContent.algorithm;
    console.log('Es paquete cifrado:', isEncryptedPackage);
    
    if (isEncryptedPackage) {
      console.log('\n5️⃣ Usando string original (extractedString):');
      console.log('Es cifrado:', EncryptionService.isEncrypted(extractedString));
      
      console.log('\n6️⃣ Usando objeto reformateado:');
      const reformatted = JSON.stringify(unescapedContent);
      console.log('Es cifrado:', EncryptionService.isEncrypted(reformatted));
      console.log('Reformateado (primeros 150 chars):', reformatted.substring(0, 150) + '...');
      
      console.log('\n7️⃣ Usando objeto reformateado con espacios:');
      const reformattedSpaced = JSON.stringify(unescapedContent, null, 2);
      console.log('Es cifrado:', EncryptionService.isEncrypted(reformattedSpaced));
      console.log('Reformateado con espacios (primeros 150 chars):', reformattedSpaced.substring(0, 150) + '...');
      
      // Comparar strings
      console.log('\n8️⃣ Comparación de strings:');
      console.log('Original === Reformateado:', extractedString === reformatted);
      console.log('Original === Reformateado con espacios:', extractedString === reformattedSpaced);
      console.log('Longitud original:', extractedString.length);
      console.log('Longitud reformateado:', reformatted.length);
      console.log('Longitud reformateado con espacios:', reformattedSpaced.length);
    }
    
  } catch (parseError) {
    console.log('❌ Error parseando string escapado:', parseError.message);
  }
}

debugEscapedContent();