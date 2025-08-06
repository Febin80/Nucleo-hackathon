// Crear contenido cifrado de prueba y subirlo a IPFS
const CryptoJS = require('crypto-js');

// Servicio de cifrado
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

      const key = this.generateKey(password, package_.salt);
      
      const decrypted = CryptoJS.AES.decrypt(package_.data, key, {
        iv: CryptoJS.enc.Hex.parse(package_.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Contraseña incorrecta o contenido corrupto');
      }

      return decryptedText;
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

async function createAndTestEncryptedContent() {
  console.log('🧪 === CREANDO CONTENIDO CIFRADO DE PRUEBA ===\n');

  // Contenido original de la denuncia
  const originalContent = JSON.stringify({
    titulo: "Denuncia Confidencial de Prueba",
    descripcion: "Esta es una denuncia confidencial que contiene información sensible que debe estar cifrada",
    categoria: "corrupcion",
    ubicacion: "Ubicación confidencial",
    evidencia: {
      archivos: ["QmTestEvidence1", "QmTestEvidence2"],
      tipos: ["document", "image"]
    },
    metadata: {
      esPublica: false,
      timestamp: new Date().toISOString(),
      confidencial: true
    }
  }, null, 2);

  const password = "mi-password-super-secreto-123";

  console.log('📄 Contenido original:');
  console.log(originalContent);
  console.log('\n🔐 Cifrando contenido...');

  // Cifrar el contenido
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  
  console.log('✅ Contenido cifrado creado');
  console.log('🔍 Es cifrado:', EncryptionService.isEncrypted(encryptedPackage));
  console.log('📦 Tamaño del paquete cifrado:', encryptedPackage.length, 'bytes');

  // Mostrar el paquete cifrado (truncado)
  console.log('\n🔒 Paquete cifrado (primeros 300 chars):');
  console.log(encryptedPackage.substring(0, 300) + '...');

  // Verificar que se puede descifrar
  console.log('\n🔓 Verificando descifrado...');
  try {
    const decrypted = EncryptionService.decryptPackage(encryptedPackage, password);
    const matches = decrypted === originalContent;
    console.log('✅ Descifrado exitoso');
    console.log('🎯 Coincide con original:', matches);
  } catch (error) {
    console.log('❌ Error al descifrar:', error.message);
    return;
  }

  // Simular diferentes estructuras que podrían venir de IPFS
  console.log('\n📋 SIMULANDO ESTRUCTURAS DE IPFS...');

  // Estructura 1: Contenido cifrado directo
  console.log('\n1️⃣ Estructura directa:');
  testStructure(encryptedPackage, password, 'directa');

  // Estructura 2: Contenido anidado
  console.log('\n2️⃣ Estructura anidada:');
  const nestedStructure = {
    contenido_cifrado: encryptedPackage,
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0"
    }
  };
  testStructure(JSON.stringify(nestedStructure, null, 2), password, 'anidada');

  // Estructura 3: JSON escapado
  console.log('\n3️⃣ Estructura con JSON escapado:');
  const escapedStructure = {
    contenido_cifrado: JSON.stringify(encryptedPackage)
  };
  testStructure(JSON.stringify(escapedStructure, null, 2), password, 'escapada');

  console.log('\n💡 Contraseña para pruebas:', password);
}

function testStructure(content, password, type) {
  console.log(`📄 Probando estructura ${type}...`);
  
  // Simular la lógica del componente IPFSContentViewer
  let contentToProcess = content;
  let encrypted = EncryptionService.isEncrypted(contentToProcess);
  
  console.log('🔍 Contenido principal cifrado:', encrypted);
  
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(contentToProcess);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        let extractedContent = parsedContent.contenido_cifrado;
        
        if (typeof extractedContent === 'string') {
          try {
            const unescapedContent = JSON.parse(extractedContent);
            extractedContent = JSON.stringify(unescapedContent);
            console.log('✅ String JSON escapado parseado correctamente');
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
  
  if (encrypted) {
    try {
      const decrypted = EncryptionService.decryptPackage(contentToProcess, password);
      console.log('✅ Descifrado exitoso para estructura', type);
    } catch (error) {
      console.log('❌ Error descifrado:', error.message);
    }
  } else {
    console.log('❌ Contenido no detectado como cifrado');
  }
}

createAndTestEncryptedContent().catch(console.error);