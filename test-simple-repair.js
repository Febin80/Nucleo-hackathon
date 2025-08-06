// Test de reparación simple y efectiva
function simpleRepairJSON(content) {
  console.log('🔧 === REPARACIÓN SIMPLE ===');
  
  try {
    // Intentar parsear directamente
    JSON.parse(content);
    console.log('✅ JSON ya está bien formado');
    return content;
  } catch (error) {
    console.log('⚠️ JSON malformado, aplicando reparación simple...');
    
    // Estrategia simple: buscar el patrón problemático y extraer manualmente
    const lines = content.split('\n');
    let inContenidoCifrado = false;
    let cifradoContent = '';
    let repairedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('"contenido_cifrado":')) {
        // Encontramos el inicio del contenido cifrado
        if (line.includes('"contenido_cifrado": "{')) {
          // El contenido cifrado empieza en la misma línea
          inContenidoCifrado = true;
          cifradoContent = '';
          repairedLines.push('  "contenido_cifrado": "');
        } else {
          repairedLines.push(line);
        }
      } else if (inContenidoCifrado) {
        if (line === '}",') {
          // Fin del contenido cifrado
          inContenidoCifrado = false;
          // Escapar el contenido cifrado acumulado
          const escapedContent = cifradoContent
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t');
          repairedLines[repairedLines.length - 1] += escapedContent + '",';
        } else {
          // Acumular contenido cifrado
          cifradoContent += line + '\n';
        }
      } else {
        repairedLines.push(line);
      }
    }
    
    const repairedContent = repairedLines.join('\n');
    console.log('📄 Contenido reparado (primeros 200 chars):');
    console.log(repairedContent.substring(0, 200));
    
    try {
      JSON.parse(repairedContent);
      console.log('✅ Reparación exitosa');
      return repairedContent;
    } catch (repairError) {
      console.log('❌ Reparación falló:', repairError.message);
      return content;
    }
  }
}

// Contenido problemático de prueba
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

function testSimpleRepair() {
  console.log('🧪 === TEST DE REPARACIÓN SIMPLE ===\n');
  
  const repairedContent = simpleRepairJSON(problematicContent);
  
  console.log('\n🔍 Verificando resultado...');
  try {
    const parsed = JSON.parse(repairedContent);
    console.log('✅ JSON válido después de reparación');
    
    if (parsed.contenido_cifrado) {
      try {
        const cifrado = JSON.parse(parsed.contenido_cifrado);
        console.log('✅ contenido_cifrado también es JSON válido');
        console.log('🔐 Es paquete cifrado:', !!(cifrado.encrypted && cifrado.algorithm));
      } catch (cifradoError) {
        console.log('❌ contenido_cifrado no es JSON válido');
      }
    }
  } catch (finalError) {
    console.log('❌ Resultado final no es JSON válido:', finalError.message);
  }
}

testSimpleRepair();