// Test con el ejemplo real que proporcionaste
const CryptoJS = require('crypto-js');

class EncryptionService {
  static generateKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
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

// Tu ejemplo real
const realExample = `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\n  \"version\": \"1.0\",\n  \"encrypted\": true,\n  \"algorithm\": \"AES-256-CBC\",\n  \"data\": \"U2FsdGVkX18qmEeJ5qVCVzYMLalkJMytVRSKcsUKr9G1Hf/BhV6NcP54upSf13TUhy+J4k2sb8uZ5Yh701pVBzLoTl5q0aqz2/3nBJNhgNeIJ0gS3QB71ponNoyUfzqFEi3niUSWtqYaHNxzQoJBWaOY/ntrrucCllEDSXjK99gFG4uKGVcjaEgGhloLZzdiyegoc7XONhBaKN6CTZPgsLGZfnp10iuemFN3InxpT1OhG/A+CumY71pkl76ZLADpHKQaVO3+j2rz1NzvPl0w+g==\",\n  \"salt\": \"912f74cf0a0ad73b3ff35f941263cccc\",\n  \"iv\": \"d7ae90fb0a40dfc54747f3195ed10510\",\n  \"timestamp\": \"2025-08-06T03:32:29.146Z\"\n}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-06T03:32:34.162Z"
  }
}`;

function simulateComponentLogic(ipfsContent) {
  console.log('🔧 === SIMULANDO LÓGICA DEL COMPONENTE ===');
  
  let contentToProcess = ipfsContent;
  let encrypted = EncryptionService.isEncrypted(contentToProcess);
  
  console.log('🔍 Contenido principal cifrado:', encrypted);
  
  // Verificar si tiene estructura especial con contenido_cifrado
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(ipfsContent);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        // El contenido_cifrado puede ser un string JSON escapado
        let extractedContent = parsedContent.contenido_cifrado;
        console.log('📦 Contenido extraído (tipo):', typeof extractedContent);
        console.log('📦 Contenido extraído (primeros 100 chars):', extractedContent.substring(0, 100));
        
        // Si es un string, intentar parsearlo como JSON
        if (typeof extractedContent === 'string') {
          try {
            // Intentar parsear el string JSON escapado
            const firstParse = JSON.parse(extractedContent);
            console.log('✅ Primer parseo exitoso, tipo:', typeof firstParse);
            
            // Si el resultado es un string, necesita otro parseo (doble escape)
            if (typeof firstParse === 'string') {
              console.log('🔄 Es string, intentando segundo parseo...');
              try {
                const secondParse = JSON.parse(firstParse);
                console.log('✅ Segundo parseo exitoso, propiedades:', Object.keys(secondParse));
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
                console.log('❌ Segundo parseo falló:', secondParseError.message);
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
            console.log('❌ Error parseando JSON escapado:', unescapeError.message);
            console.log('⚠️ No se pudo parsear como JSON escapado, usando como string');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted);
        console.log('📦 Contenido final para descifrado (primeros 100 chars):', contentToProcess.substring(0, 100));
        
        // Debug adicional
        if (!encrypted) {
          console.log('❌ Contenido extraído no detectado como cifrado');
          console.log('🔍 Contenido completo extraído:', contentToProcess);
          
          // Intentar detectar manualmente
          try {
            const testParse = JSON.parse(contentToProcess);
            console.log('🧪 Test manual - propiedades:', Object.keys(testParse));
            console.log('🧪 Test manual - encrypted:', testParse.encrypted);
            console.log('🧪 Test manual - algorithm:', testParse.algorithm);
            console.log('🧪 Test manual - data:', !!testParse.data);
          } catch (testError) {
            console.log('❌ Test manual falló:', testError.message);
          }
        }
      }
    } catch (parseError) {
      console.log('❌ Error parseando contenido principal:', parseError.message);
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  return { encrypted, contentToProcess };
}

function testRealExample() {
  console.log('🧪 === TEST CON EJEMPLO REAL ===\n');
  
  console.log('📄 Contenido IPFS recibido:');
  console.log(realExample);
  console.log();
  
  const result = simulateComponentLogic(realExample);
  
  if (result.encrypted) {
    console.log('\n✅ ¡DETECCIÓN EXITOSA!');
    console.log('El componente debería mostrar la interfaz de contraseña');
    
    // Intentar descifrar con una contraseña de prueba
    console.log('\n🔓 Intentando descifrar con contraseña de prueba...');
    try {
      // Nota: necesitarías la contraseña real para descifrar
      console.log('⚠️ Para descifrar necesitas la contraseña original');
      console.log('📦 Contenido listo para descifrado:', result.contentToProcess.substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  } else {
    console.log('\n❌ PROBLEMA DETECTADO');
    console.log('El componente NO detecta el contenido como cifrado');
    console.log('Por eso no muestra la interfaz de contraseña');
  }
}

testRealExample();