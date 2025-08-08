// Test con el contenido real del usuario
const CryptoJS = require('crypto-js');

class EncryptionService {
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

// Contenido real del usuario
const realUserContent = `{"tipo":"acoso_sexual","contenido_cifrado":"{\n  \"version\": \"1.0\",\n  \"encrypted\": true,\n  \"algorithm\": \"AES-256-CBC\",\n  \"data\": \"U2FsdGVkX1+XSovdJ6Pg3qjg3aS3RVu+UBSic/C/abROSbNTr2xCMGGjeAkESwk0VpFNyJoR0zuzPYDvf0oFnrrdAyU+HFb27wRbAic9FO8IOJ/99SGRFDa/HU5vzL9EdwvCw4/uTdCQMSlfBw7tBqLK++Kw87QybVU0UhkSRWgZLtQltGcEAtxsKyMDYmiMKpFC2TwyW+4HD956fUVTMd8G2C2/FnDPHJ/OOzVj6qvzu2nEA9FtkjdKuJxXV8r+pqHgV+lqimIsuRhWAsaAow==\",\n  \"salt\": \"fb3df2e14b2c85f7f2a2b35aae1d6a6b\",\n  \"iv\": \"7acebc5b80171285cd7cef0641ae2902\",\n  \"timestamp\": \"2025-08-06T12:39:47.156Z\"\n}","metadata":{"cifrado":true,"timestamp":"2025-08-06T12:40:13.709Z"}}`;

function simulateComponentWithRealContent(ipfsContent) {
  console.log('🔧 === SIMULANDO COMPONENTE CON CONTENIDO REAL ===');
  
  // Limpiar y normalizar el contenido IPFS antes de procesarlo
  let cleanedContent = ipfsContent;
  try {
    // Intentar parsear y reformatear para limpiar posibles errores de formato
    const testParse = JSON.parse(ipfsContent);
    cleanedContent = JSON.stringify(testParse);
    console.log('✅ Contenido IPFS limpiado y reformateado');
  } catch (cleanError) {
    console.log('⚠️ Contenido IPFS no es JSON válido:', cleanError.message);
    console.log('📄 Contenido problemático (primeros 200 chars):', ipfsContent.substring(0, 200));
    cleanedContent = ipfsContent;
  }

  // Verificar si el contenido está cifrado
  let encrypted = EncryptionService.isEncrypted(cleanedContent);
  let contentToProcess = cleanedContent;
  
  console.log('🔍 Analizando contenido...');
  console.log('📄 Contenido recibido (primeros 200 chars):', cleanedContent.substring(0, 200));
  console.log('📄 Contenido principal cifrado:', encrypted);
  
  // Verificar si tiene estructura especial con contenido_cifrado
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(cleanedContent);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      // Debug específico para el problema del usuario
      console.log('🔍 Debug parseo raw:', {
        propiedades: Object.keys(parsedContent),
        tieneContenidoCifrado: !!parsedContent.contenido_cifrado,
        tipoContenidoCifrado: typeof parsedContent.contenido_cifrado
      });
      
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
            console.log('🔐 Propiedades del primer parseo:', Object.keys(firstParse));
            
            // Si el resultado es un string, necesita otro parseo (doble escape)
            if (typeof firstParse === 'string') {
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
        console.log('📦 Contenido cifrado extraído (primeros 100 chars):', contentToProcess.substring(0, 100));
        
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
      } else {
        console.log('❌ NO se encontró contenido_cifrado en las propiedades');
        console.log('🔍 Propiedades disponibles:', Object.keys(parsedContent));
      }
    } catch (parseError) {
      console.log('❌ Error parseando JSON:', parseError.message);
      console.log('🔍 Intentando extracción manual de contenido cifrado...');
      
      // Fallback: Extracción manual con regex para contenido malformado
      const cifradoPatterns = [
        /"contenido_cifrado":\s*"(\{[\s\S]*?\})"\s*,/, // Patrón más específico con coma
        /"contenido_cifrado":\s*"(\{[\s\S]*?\})"/, // JSON con saltos de línea dentro de comillas
        /"contenido_cifrado":\s*(\{[\s\S]*?\})(?=\s*[,}])/, // JSON directo sin comillas
        /"contenido_cifrado":\s*"([^"]+(?:\\.[^"]*)*)"/ // Patrón con escapes (último recurso)
      ];
      
      let extractedContent = null;
      for (let i = 0; i < cifradoPatterns.length; i++) {
        const pattern = cifradoPatterns[i];
        console.log(`🔍 Probando patrón ${i + 1}:`, pattern);
        const match = cleanedContent.match(pattern);
        if (match) {
          extractedContent = match[1];
          console.log('✅ Contenido cifrado extraído con patrón manual');
          console.log('📦 Contenido extraído (primeros 100 chars):', extractedContent.substring(0, 100));
          break;
        } else {
          console.log('❌ Patrón no coincide');
        }
      }
      
      if (extractedContent) {
        // Intentar procesar el contenido extraído
        if (typeof extractedContent === 'string') {
          // Si parece ser JSON directo (empieza con {)
          if (extractedContent.trim().startsWith('{')) {
            console.log('🔍 Contenido extraído parece ser JSON directo');
            encrypted = EncryptionService.isEncrypted(extractedContent);
            if (encrypted) {
              contentToProcess = extractedContent;
              console.log('✅ Contenido cifrado detectado en extracción manual');
            }
          } else {
            // Intentar parsear como JSON escapado
            try {
              const unescaped = JSON.parse(extractedContent);
              if (typeof unescaped === 'object' && unescaped.encrypted) {
                encrypted = true;
                contentToProcess = extractedContent;
                console.log('✅ Contenido cifrado detectado después de unescape manual');
              }
            } catch (unescapeError) {
              console.log('⚠️ No se pudo procesar contenido extraído manualmente');
            }
          }
        }
      } else {
        console.log('❌ No se pudo extraer contenido cifrado con ningún patrón');
      }
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  console.log('📋 ¿Debería mostrar interfaz de contraseña?', encrypted ? 'SÍ' : 'NO');
  
  return { encrypted, contentToProcess };
}

function testRealUserContent() {
  console.log('🧪 === TEST CON CONTENIDO REAL DEL USUARIO ===\n');
  
  console.log('📄 Contenido del usuario:');
  console.log(realUserContent.substring(0, 200) + '...');
  console.log();
  
  const result = simulateComponentWithRealContent(realUserContent);
  
  if (result.encrypted) {
    console.log('\n✅ ¡DETECCIÓN EXITOSA!');
    console.log('El componente debería mostrar la interfaz de contraseña');
  } else {
    console.log('\n❌ PROBLEMA DETECTADO');
    console.log('El componente NO detecta el contenido como cifrado');
    console.log('Esto explica por qué no aparece la interfaz de contraseña');
  }
}

testRealUserContent();