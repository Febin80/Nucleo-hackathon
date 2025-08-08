// Test de extracción robusta de contenido cifrado
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

function simulateRobustExtraction(ipfsContent) {
  console.log('🔧 === SIMULANDO EXTRACCIÓN ROBUSTA ===');
  
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
    
    // Para contenido malformado, intentar procesarlo directamente sin reparar
    // El componente manejará la extracción del contenido cifrado de forma más robusta
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
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        // El contenido_cifrado puede ser un string JSON escapado
        let extractedContent = parsedContent.contenido_cifrado;
        
        // Si es un string, intentar parsearlo como JSON
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
            console.log('⚠️ No se pudo parsear como JSON escapado, usando como string');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted);
        console.log('📦 Contenido cifrado extraído (primeros 100 chars):', contentToProcess.substring(0, 100));
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
      for (const pattern of cifradoPatterns) {
        const match = cleanedContent.match(pattern);
        if (match) {
          extractedContent = match[1];
          console.log('✅ Contenido cifrado extraído con patrón manual');
          console.log('📦 Contenido extraído (primeros 100 chars):', extractedContent.substring(0, 100));
          break;
        }
      }
      
      if (extractedContent) {
        // Intentar procesar el contenido extraído
        if (typeof extractedContent === 'string') {
          // Si parece ser JSON directo (empieza con {)
          if (extractedContent.trim().startsWith('{')) {
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
      }
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  console.log('📋 ¿Debería mostrar interfaz de contraseña?', encrypted ? 'SÍ' : 'NO');
  
  return { encrypted, contentToProcess };
}

// Casos de prueba
const testCases = [
  {
    name: "JSON bien formado",
    content: `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\\n  \\"version\\": \\"1.0\\",\\n  \\"encrypted\\": true,\\n  \\"algorithm\\": \\"AES-256-CBC\\",\\n  \\"data\\": \\"U2FsdGVkX18test\\",\\n  \\"salt\\": \\"testsalt\\",\\n  \\"iv\\": \\"testiv\\"\\n}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-06T03:32:34.162Z"
  }
}`
  },
  {
    name: "JSON malformado con saltos de línea",
    content: `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX18test",
  "salt": "testsalt",
  "iv": "testiv"
}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-06T03:32:34.162Z"
  }
}`
  }
];

function runRobustTests() {
  console.log('🧪 === TEST DE EXTRACCIÓN ROBUSTA ===\n');
  
  testCases.forEach(testCase => {
    console.log(`\n📋 Probando: ${testCase.name}`);
    console.log('=' .repeat(50));
    
    const result = simulateRobustExtraction(testCase.content);
    
    if (result.encrypted) {
      console.log(`✅ ${testCase.name}: DETECTADO CORRECTAMENTE`);
    } else {
      console.log(`❌ ${testCase.name}: NO DETECTADO - NECESITA MÁS TRABAJO`);
    }
  });
}

runRobustTests();