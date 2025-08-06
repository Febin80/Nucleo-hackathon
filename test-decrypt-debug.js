// Test de debug para el descifrado
const CryptoJS = require('crypto-js');

// Simulamos el servicio de cifrado
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
      console.log('🔍 Intentando parsear paquete...');
      const package_ = JSON.parse(packageContent);
      
      console.log('✅ Paquete parseado:', {
        version: package_.version,
        encrypted: package_.encrypted,
        algorithm: package_.algorithm,
        hasData: !!package_.data,
        hasSalt: !!package_.salt,
        hasIv: !!package_.iv
      });
      
      if (!package_.encrypted) {
        console.log('📄 Contenido no cifrado, devolviendo tal como está');
        return packageContent;
      }

      if (package_.version !== '1.0' || package_.algorithm !== 'AES-256-CBC') {
        throw new Error('Versión de cifrado no soportada');
      }

      console.log('🔓 Intentando descifrar...');
      const result = this.decrypt(package_.data, password, package_.salt, package_.iv);
      console.log('✅ Descifrado exitoso');
      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.log('❌ No es JSON válido, devolviendo como texto plano');
        return packageContent;
      }
      console.error('❌ Error en descifrado:', error.message);
      throw error;
    }
  }

  static isEncrypted(content) {
    try {
      const parsed = JSON.parse(content);
      const isEnc = !!(parsed.encrypted === true && parsed.algorithm && parsed.data);
      console.log('🔍 Verificando si está cifrado:', isEnc);
      return isEnc;
    } catch {
      console.log('❌ No es JSON, no está cifrado');
      return false;
    }
  }
}

// Test completo
async function testEncryptionDecryption() {
  console.log('🧪 === TEST DE CIFRADO Y DESCIFRADO ===\n');

  const originalContent = JSON.stringify({
    titulo: "Denuncia de prueba",
    descripcion: "Esta es una denuncia de prueba para verificar el cifrado",
    categoria: "corrupcion",
    ubicacion: "Ciudad de prueba",
    evidencia: {
      archivos: ["QmTest1", "QmTest2"],
      tipos: ["image", "document"]
    }
  }, null, 2);

  const password = "mi-password-secreto-123";

  console.log('📄 Contenido original:');
  console.log(originalContent);
  console.log('\n🔐 Cifrando contenido...');

  // Cifrar
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  console.log('✅ Contenido cifrado:');
  console.log(encryptedPackage.substring(0, 200) + '...');

  // Verificar que está cifrado
  console.log('\n🔍 Verificando si está cifrado...');
  const isEncrypted = EncryptionService.isEncrypted(encryptedPackage);
  console.log('Resultado:', isEncrypted);

  // Descifrar
  console.log('\n🔓 Descifrando contenido...');
  try {
    const decryptedContent = EncryptionService.decryptPackage(encryptedPackage, password);
    console.log('✅ Contenido descifrado:');
    console.log(decryptedContent);

    // Verificar que coincide
    const matches = decryptedContent === originalContent;
    console.log('\n🎯 ¿Coincide con el original?', matches);

    if (!matches) {
      console.log('❌ DIFERENCIAS ENCONTRADAS:');
      console.log('Original length:', originalContent.length);
      console.log('Decrypted length:', decryptedContent.length);
    }
  } catch (error) {
    console.error('❌ Error al descifrar:', error.message);
  }

  // Test con contraseña incorrecta
  console.log('\n🧪 Probando con contraseña incorrecta...');
  try {
    const wrongDecrypt = EncryptionService.decryptPackage(encryptedPackage, "contraseña-incorrecta");
    console.log('❌ ERROR: No debería haber funcionado');
  } catch (error) {
    console.log('✅ Correctamente falló con contraseña incorrecta:', error.message);
  }
}

testEncryptionDecryption().catch(console.error);