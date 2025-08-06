// Test con el ejemplo real corregido
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

// Tu ejemplo real CORREGIDO (JSON válido)
const realExampleFixed = `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\\n  \\"version\\": \\"1.0\\",\\n  \\"encrypted\\": true,\\n  \\"algorithm\\": \\"AES-256-CBC\\",\\n  \\"data\\": \\"U2FsdGVkX18qmEeJ5qVCVzYMLalkJMytVRSKcsUKr9G1Hf/BhV6NcP54upSf13TUhy+J4k2sb8uZ5Yh701pVBzLoTl5q0aqz2/3nBJNhgNeIJ0gS3QB71ponNoyUfzqFEi3niUSWtqYaHNxzQoJBWaOY/ntrrucCllEDSXjK99gFG4uKGVcjaEgGhloLZzdiyegoc7XONhBaKN6CTZPgsLGZfnp10iuemFN3InxpT1OhG/A+CumY71pkl76ZLADpHKQaVO3+j2rz1NzvPl0w+g==\\",\\n  \\"salt\\": \\"912f74cf0a0ad73b3ff35f941263cccc\\",\\n  \\"iv\\": \\"d7ae90fb0a40dfc54747f3195ed10510\\",\\n  \\"timestamp\\": \\"2025-08-06T03:32:29.146Z\\"\\n}",
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
            
            // Si el resultado es un objeto, verificar si es cifrado
            if (firstParse && typeof firstParse === 'object' && 
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
      }
    } catch (parseError) {
      console.log('❌ Error parseando contenido principal:', parseError.message);
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('🎯 Resultado final - Está cifrado:', encrypted);
  return { encrypted, contentToProcess };
}

function testFixedExample() {
  console.log('🧪 === TEST CON EJEMPLO REAL CORREGIDO ===\n');
  
  console.log('📄 Contenido IPFS recibido (corregido):');
  console.log(realExampleFixed.substring(0, 200) + '...');
  console.log();
  
  const result = simulateComponentLogic(realExampleFixed);
  
  if (result.encrypted) {
    console.log('\n✅ ¡DETECCIÓN EXITOSA!');
    console.log('El componente debería mostrar la interfaz de contraseña');
    console.log('📦 Contenido listo para descifrado:', result.contentToProcess.substring(0, 100) + '...');
  } else {
    console.log('\n❌ PROBLEMA DETECTADO');
    console.log('El componente NO detecta el contenido como cifrado');
    console.log('Por eso no muestra la interfaz de contraseña');
  }
}

testFixedExample();