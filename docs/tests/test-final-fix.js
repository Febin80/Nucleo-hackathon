// Test final de la corrección
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

  static decrypt(encryptedContent, password, salt, iv) {
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

// Simular la lógica FINAL CORREGIDA del componente
function simulateFinalFixedLogic(ipfsContent, password) {
  console.log('🔧 === SIMULANDO LÓGICA FINAL CORREGIDA ===');
  
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
        
        // LÓGICA FINAL CORREGIDA
        if (typeof extractedContent === 'string') {
          try {
            // Intentar parsear el string JSON escapado
            const firstParse = JSON.parse(extractedContent);
            
            // Si el resultado es un string, necesita otro parseo (doble escape)
            if (typeof firstParse === 'string') {
              try {
                const secondParse = JSON.parse(firstParse);
                // Verificar si es un paquete cifrado
                if (secondParse && typeof secondParse === 'object' && 
                    secondParse.encrypted && secondParse.algorithm) {
                  // Es un paquete cifrado, usar el string del primer parseo
                  extractedContent = firstParse;
                  console.log('✅ Paquete cifrado detectado con doble escape');
                } else {
                  // No es cifrado, usar el objeto parseado
                  extractedContent = JSON.stringify(secondParse);
                  console.log('✅ Contenido con doble escape parseado');
                }
              } catch (secondParseError) {
                // Si falla el segundo parseo, usar el primer resultado
                extractedContent = firstParse;
                console.log('⚠️ Segundo parseo falló, usando primer resultado');
              }
            } else if (firstParse && typeof firstParse === 'object' && 
                      firstParse.encrypted && firstParse.algorithm) {
              // Es un paquete cifrado directo
              extractedContent = extractedContent; // Usar el string original
              console.log('✅ Paquete cifrado detectado en JSON escapado');
            } else {
              // No es un paquete cifrado, reformatear
              extractedContent = JSON.stringify(firstParse);
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

async function testFinalFix() {
  console.log('🧪 === TEST FINAL DE LA CORRECCIÓN ===\n');

  const originalContent = JSON.stringify({
    titulo: "Denuncia Confidencial Final",
    descripcion: "Información sensible que debe estar cifrada",
    categoria: "corrupcion",
    evidencia: {
      archivos: ["QmTest1", "QmTest2"],
      tipos: ["image", "document"]
    }
  }, null, 2);

  const password = "mi-password-final-123";

  // Crear contenido cifrado
  const encryptedPackage = EncryptionService.createEncryptedPackage(originalContent, password);
  
  // Simular el doble escape que ocurre en IPFS
  const doubleEscapedStructure = {
    contenido_cifrado: JSON.stringify(encryptedPackage) // Esto crea el doble escape
  };
  const finalIpfsContent = JSON.stringify(doubleEscapedStructure, null, 2);
  
  console.log('📋 Probando estructura con doble escape (como viene de IPFS)...');
  console.log('📄 Estructura (primeros 200 chars):');
  console.log(finalIpfsContent.substring(0, 200) + '...\n');
  
  // Probar con la lógica final corregida
  const result = simulateFinalFixedLogic(finalIpfsContent, password);
  
  if (result.success) {
    console.log('\n🎉 ¡CORRECCIÓN FINAL EXITOSA!');
    console.log('✅ El contenido se descifró correctamente');
    console.log('🔍 Contenido descifrado coincide:', result.decrypted === originalContent);
    console.log('\n📄 Contenido descifrado:');
    console.log(result.decrypted.substring(0, 200) + '...');
  } else {
    console.log('\n❌ La corrección final no funcionó');
    console.log('Error:', result.error);
  }

  console.log('\n💡 Contraseña para pruebas:', password);
}

testFinalFix().catch(console.error);