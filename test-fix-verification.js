// Test para verificar la corrección del problema de descifrado
const CryptoJS = require('crypto-js');

// Servicio de cifrado (igual que en el frontend)
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

// Simular la lógica CORREGIDA del componente
function simulateFixedIPFSContentViewer(ipfsContent, password) {
  console.log('🔧 === SIMULANDO LÓGICA CORREGIDA ===');
  
  let contentToProcess = ipfsContent;
  let encrypted = EncryptionService.isEncrypted(contentToProcess);
  
  console.log('🔍 Contenido principal cifrado:', encrypted);
  
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(contentToProcess);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        let extractedContent = parsedContent.contenido_cifrado;
        
        // LÓGICA CORREGIDA
        if (typeof extractedContent === 'string') {
          try {
            // Intentar parsear el string JSON escapado
            const unescapedContent = JSON.parse(extractedContent);
            // NO reformatear con JSON.stringify, usar el contenido parseado directamente
            // si es un objeto con estructura de cifrado
            if (unescapedContent && typeof unescapedContent === 'object' && 
                unescapedContent.encrypted && unescapedContent.algorithm) {
              // Es un paquete cifrado, mantener la estructura original
              extractedContent = extractedContent; // Usar el string original
              console.log('✅ Paquete cifrado detectado en JSON escapado');
            } else {
              // No es un paquete cifrado, reformatear
              extractedContent = JSON.stringify(unescapedContent);
              console.log('✅ String JSON escapado parseado correctamente');
            }
          } catch (unescapeError) {
            console.log('⚠️ No se pudo parsear como JSON escapado, usando como string');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted);
      }
    } catch (parseError) {
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  
  if (encrypted) {
    try {
      const decrypted = EncryptionService.decryptPackage(contentToProcess, password);
      console.log('✅ Descifrado exitoso');
      return { success: true, decrypted };
    } catch (error) {
      console.log('❌ Error descifrado:', error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log('❌ Contenido no detectado como cifrado');
    return { success: false, error: 'Contenido no cifrado' };
  }
}

async function testFix() {
  console.log('🧪 === TEST DE CORRECCIÓN ===\n');

  const originalContent = JSON.stringify({
    titulo: "Denuncia Confidencial",
    descripcion: "Información sensible cifrada",
    categoria: "corrupcion"
  }, null, 2);

  const password = "mi-password-123";

  // Crear contenido cifrado
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  
  // Crear estructura con JSON escapado (el caso problemático)
  const escapedStructure = {
    contenido_cifrado: JSON.stringify(encryptedPackage) // JSON escapado
  };
  const escapedJson = JSON.stringify(escapedStructure, null, 2);
  
  console.log('📋 Probando estructura con JSON escapado...');
  console.log('📄 Estructura (primeros 200 chars):');
  console.log(escapedJson.substring(0, 200) + '...\n');
  
  // Probar con la lógica corregida
  const result = simulateFixedIPFSContentViewer(escapedJson, password);
  
  if (result.success) {
    console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
    console.log('✅ El contenido se descifró correctamente');
    console.log('🔍 Contenido descifrado coincide:', result.decrypted === originalContent);
  } else {
    console.log('\n❌ La corrección no funcionó');
    console.log('Error:', result.error);
  }
}

testFix().catch(console.error);