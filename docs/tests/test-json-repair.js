// Test para la reparación de JSON malformado
function repairMalformedJSON(ipfsContent) {
  console.log('🔧 === REPARANDO JSON MALFORMADO ===');
  console.log('📄 Contenido original (primeros 200 chars):');
  console.log(ipfsContent.substring(0, 200));
  
  try {
    // Intentar parsear directamente
    const testParse = JSON.parse(ipfsContent);
    console.log('✅ JSON ya está bien formado');
    return JSON.stringify(testParse);
  } catch (cleanError) {
    console.log('⚠️ JSON malformado, intentando reparar...');
    
    // Intentar reparar JSON malformado común en contenido cifrado
    let repairedContent = ipfsContent;
    
    // Reparar saltos de línea en strings JSON anidados
    repairedContent = repairedContent.replace(
      /"contenido_cifrado":\s*"([^"]*(?:\\.[^"]*)*)"([^}]*)/g,
      (match, content, rest) => {
        console.log('🔍 Encontrado contenido_cifrado para reparar');
        console.log('📦 Contenido original:', content.substring(0, 100) + '...');
        
        // Escapar saltos de línea reales en el contenido cifrado
        const escapedContent = content
          .replace(/\r\n/g, '\\n')
          .replace(/\r/g, '\\n')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t');
          
        console.log('🔧 Contenido reparado:', escapedContent.substring(0, 100) + '...');
        return `"contenido_cifrado": "${escapedContent}"${rest}`;
      }
    );
    
    console.log('📄 Contenido después de reparación (primeros 200 chars):');
    console.log(repairedContent.substring(0, 200));
    
    // Intentar parsear el contenido reparado
    try {
      const repairedParse = JSON.parse(repairedContent);
      console.log('✅ Contenido reparado exitosamente');
      return JSON.stringify(repairedParse);
    } catch (repairError) {
      console.log('❌ No se pudo reparar el JSON:', repairError.message);
      return ipfsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
  }
}

// Test con contenido problemático
const problematicContent = `{
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
}`;

function testRepair() {
  console.log('🧪 === TEST DE REPARACIÓN DE JSON ===\n');
  
  const repairedContent = repairMalformedJSON(problematicContent);
  
  console.log('\n🔍 Verificando si el contenido reparado es válido...');
  try {
    const parsed = JSON.parse(repairedContent);
    console.log('✅ JSON reparado es válido');
    console.log('📋 Propiedades:', Object.keys(parsed));
    
    if (parsed.contenido_cifrado) {
      console.log('🔍 Verificando contenido_cifrado...');
      try {
        const cifradoParsed = JSON.parse(parsed.contenido_cifrado);
        console.log('✅ contenido_cifrado es JSON válido');
        console.log('🔐 Propiedades del paquete cifrado:', Object.keys(cifradoParsed));
        console.log('🎯 Es paquete cifrado válido:', !!(cifradoParsed.encrypted && cifradoParsed.algorithm && cifradoParsed.data));
      } catch (cifradoError) {
        console.log('❌ contenido_cifrado no es JSON válido:', cifradoError.message);
      }
    }
  } catch (finalError) {
    console.log('❌ JSON reparado sigue siendo inválido:', finalError.message);
  }
}

testRepair();