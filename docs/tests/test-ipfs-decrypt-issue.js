// Test para simular el problema específico de descifrado en IPFS
const CryptoJS = require('crypto-js');

// Simulamos el servicio de cifrado (igual que en el frontend)
class EncryptionService {
  static generateKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }

  static encrypt(content, password) {
    try {
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
    } catch (error) {
      console.error('Error al cifrar:', error);
      throw new Error('Error al cifrar el contenido');
    }
  }

  static decrypt(encryptedContent, password, salt, iv) {
    try {
      const key = this.generateKey(password, salt);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Contraseña incorrecta o contenido corrupto');
      }

      return decryptedText;
    } catch (error) {
      console.error('Error al descifrar:', error);
      throw new Error('Error al descifrar el contenido. Verifica la contraseña.');
    }
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

  static decryptPackage(packageContent, password) {
    try {
      const package_ = JSON.parse(packageContent);
      
      if (!package_.encrypted) {
        return packageContent;
      }

      if (package_.version !== '1.0' || package_.algorithm !== 'AES-256-CBC') {
        throw new Error('Versión de cifrado no soportada');
      }

      return this.decrypt(package_.data, password, package_.salt, package_.iv);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return packageContent;
      }
      throw error;
    }
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

// Simulamos diferentes escenarios problemáticos
async function testProblematicScenarios() {
  console.log('🧪 === TEST DE ESCENARIOS PROBLEMÁTICOS ===\n');

  const originalContent = JSON.stringify({
    titulo: "Denuncia de prueba",
    descripcion: "Esta es una denuncia de prueba",
    categoria: "corrupcion"
  }, null, 2);

  const password = "mi-password-123";

  // Escenario 1: Contenido cifrado normal
  console.log('📋 ESCENARIO 1: Contenido cifrado normal');
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  console.log('✅ Cifrado creado');
  console.log('🔍 Es cifrado:', EncryptionService.isEncrypted(encryptedPackage));
  
  try {
    const decrypted = EncryptionService.decryptPackage(encryptedPackage, password);
    console.log('✅ Descifrado exitoso\n');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }

  // Escenario 2: Contenido con estructura anidada (como viene de IPFS)
  console.log('📋 ESCENARIO 2: Contenido con estructura anidada');
  const nestedStructure = {
    contenido_cifrado: encryptedPackage,
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0"
    }
  };
  const nestedJson = JSON.stringify(nestedStructure, null, 2);
  
  console.log('🔍 Estructura anidada es cifrada:', EncryptionService.isEncrypted(nestedJson));
  
  // Simulamos la lógica del componente
  let contentToProcess = nestedJson;
  let encrypted = EncryptionService.isEncrypted(contentToProcess);
  
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(contentToProcess);
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        contentToProcess = parsedContent.contenido_cifrado;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted);
      }
    } catch (parseError) {
      console.log('❌ Error parseando:', parseError.message);
    }
  }
  
  if (encrypted) {
    try {
      const decrypted = EncryptionService.decryptPackage(contentToProcess, password);
      console.log('✅ Descifrado exitoso del contenido anidado\n');
    } catch (error) {
      console.log('❌ Error descifrado anidado:', error.message, '\n');
    }
  }

  // Escenario 3: Contenido con JSON escapado (doble stringify)
  console.log('📋 ESCENARIO 3: Contenido con JSON escapado');
  const doubleStringified = {
    contenido_cifrado: JSON.stringify(encryptedPackage) // JSON escapado
  };
  const doubleJson = JSON.stringify(doubleStringified, null, 2);
  
  console.log('🔍 JSON escapado es cifrado:', EncryptionService.isEncrypted(doubleJson));
  
  // Simulamos la lógica del componente para JSON escapado
  contentToProcess = doubleJson;
  encrypted = EncryptionService.isEncrypted(contentToProcess);
  
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(contentToProcess);
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado escapado');
        let extractedContent = parsedContent.contenido_cifrado;
        
        // Si es un string, intentar parsearlo como JSON
        if (typeof extractedContent === 'string') {
          try {
            const unescapedContent = JSON.parse(extractedContent);
            extractedContent = JSON.stringify(unescapedContent);
            console.log('✅ String JSON escapado parseado correctamente');
          } catch (unescapeError) {
            console.log('⚠️ No se pudo parsear como JSON escapado');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido escapado cifrado:', encrypted);
      }
    } catch (parseError) {
      console.log('❌ Error parseando JSON escapado:', parseError.message);
    }
  }
  
  if (encrypted) {
    try {
      const decrypted = EncryptionService.decryptPackage(contentToProcess, password);
      console.log('✅ Descifrado exitoso del contenido escapado\n');
    } catch (error) {
      console.log('❌ Error descifrado escapado:', error.message, '\n');
    }
  }

  // Escenario 4: Contenido corrupto o malformado
  console.log('📋 ESCENARIO 4: Contenido corrupto');
  const corruptedContent = encryptedPackage.substring(0, encryptedPackage.length - 50) + '"}';
  console.log('🔍 Contenido corrupto es cifrado:', EncryptionService.isEncrypted(corruptedContent));
  
  try {
    const decrypted = EncryptionService.decryptPackage(corruptedContent, password);
    console.log('❌ ERROR: No debería haber funcionado');
  } catch (error) {
    console.log('✅ Correctamente falló con contenido corrupto:', error.message, '\n');
  }

  // Escenario 5: Contraseña con caracteres especiales
  console.log('📋 ESCENARIO 5: Contraseña con caracteres especiales');
  const specialPassword = "mi-contraseña-con-ñ-y-símbolos-@#$%&*()";
  const specialEncrypted = EncryptionService.createEncryptedPackage(originalContent, specialPassword);
  
  try {
    const decrypted = EncryptionService.decryptPackage(specialEncrypted, specialPassword);
    console.log('✅ Descifrado exitoso con contraseña especial');
  } catch (error) {
    console.log('❌ Error con contraseña especial:', error.message);
  }
}

testProblematicScenarios().catch(console.error);