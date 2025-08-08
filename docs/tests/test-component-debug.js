// Test para debuggear por qué el componente no detecta contenido cifrado
const CryptoJS = require('crypto-js');

class EncryptionService {
  static isEncrypted(content) {
    try {
      console.log('🔍 Verificando si está cifrado...');
      console.log('📄 Contenido a verificar (primeros 100 chars):', content.substring(0, 100));
      
      const parsed = JSON.parse(content);
      const result = !!(parsed.encrypted === true && parsed.algorithm && parsed.data);
      
      console.log('✅ Parseo exitoso, propiedades:', Object.keys(parsed));
      console.log('🔍 Verificación de cifrado:', {
        hasEncrypted: !!parsed.encrypted,
        encryptedValue: parsed.encrypted,
        hasAlgorithm: !!parsed.algorithm,
        algorithmValue: parsed.algorithm,
        hasData: !!parsed.data,
        finalResult: result
      });
      
      return result;
    } catch (error) {
      console.log('❌ Error parseando JSON:', error.message);
      console.log('📄 Contenido que falló:', content.substring(0, 200));
      return false;
    }
  }
}

// Diferentes formatos que podrían venir de IPFS
const testCases = [
  {
    name: "Formato correcto con escape",
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
    name: "Formato con saltos de línea problemáticos",
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
  },
  {
    name: "Formato directo cifrado",
    content: `{
  "version": "1.0",
  "encrypted": true,
  "algorithm": "AES-256-CBC",
  "data": "U2FsdGVkX18test",
  "salt": "testsalt",
  "iv": "testiv"
}`
  }
];

function simulateComponentLogic(ipfsContent, caseName) {
  console.log(`\n🧪 === PROBANDO CASO: ${caseName} ===`);
  
  // Limpiar y normalizar el contenido IPFS antes de procesarlo
  let cleanedContent = ipfsContent;
  try {
    // Intentar parsear y reformatear para limpiar posibles errores de formato
    const testParse = JSON.parse(ipfsContent);
    cleanedContent = JSON.stringify(testParse);
    console.log('✅ Contenido IPFS limpiado y reformateado');
  } catch (cleanError) {
    console.log('⚠️ Contenido IPFS no es JSON válido:', cleanError.message);
    // Si no es JSON válido, intentar limpiar caracteres problemáticos
    cleanedContent = ipfsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    console.log('🧹 Contenido limpiado de caracteres problemáticos');
  }
  
  // Verificar si el contenido está cifrado
  let encrypted = EncryptionService.isEncrypted(cleanedContent);
  let contentToProcess = cleanedContent;
  
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
        console.log('📦 Tipo de contenido extraído:', typeof extractedContent);
        
        // Si es un string, intentar parsearlo como JSON
        if (typeof extractedContent === 'string') {
          try {
            // Intentar parsear el string JSON escapado
            const firstParse = JSON.parse(extractedContent);
            console.log('✅ Primer parseo exitoso, tipo:', typeof firstParse);
            
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
      }
    } catch (parseError) {
      console.log('❌ Error parseando contenido principal:', parseError.message);
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  console.log('📋 ¿Debería mostrar interfaz de contraseña?', encrypted ? 'SÍ' : 'NO');
  
  return { encrypted, contentToProcess };
}

function runAllTests() {
  console.log('🧪 === DEBUGGEANDO DETECCIÓN DE CONTENIDO CIFRADO ===');
  
  testCases.forEach(testCase => {
    const result = simulateComponentLogic(testCase.content, testCase.name);
    
    if (result.encrypted) {
      console.log(`✅ ${testCase.name}: DETECTADO CORRECTAMENTE`);
    } else {
      console.log(`❌ ${testCase.name}: NO DETECTADO - PROBLEMA AQUÍ`);
    }
  });
  
  console.log('\n💡 INSTRUCCIONES PARA DEBUGGEAR EN EL NAVEGADOR:');
  console.log('1. Abre las herramientas de desarrollador (F12)');
  console.log('2. Ve a la pestaña Console');
  console.log('3. Haz clic en "Ver contenido completo" en una denuncia');
  console.log('4. Haz clic en el botón "🐛 Debug" en el modal');
  console.log('5. Copia el contenido que aparece en la consola aquí');
}

runAllTests();