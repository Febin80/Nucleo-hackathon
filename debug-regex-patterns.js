// Debug específico de los patrones regex
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

function debugRegexPatterns() {
  console.log('🔍 === DEBUG DE PATRONES REGEX ===\n');
  
  console.log('📄 Contenido a analizar:');
  console.log(problematicContent);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const cifradoPatterns = [
    { name: 'Patrón con escapes', regex: /"contenido_cifrado":\s*"([^"]+(?:\\.[^"]*)*)"/ },
    { name: 'JSON con saltos de línea dentro de comillas', regex: /"contenido_cifrado":\s*"(\{[\s\S]*?\})"/ },
    { name: 'JSON directo sin comillas', regex: /"contenido_cifrado":\s*(\{[\s\S]*?\})(?=\s*[,}])/ },
    { name: 'Patrón mixto simple', regex: /"contenido_cifrado":\s*"([^"]*\{[^}]*\}[^"]*)"/ },
    { name: 'Patrón más específico', regex: /"contenido_cifrado":\s*"(\{[\s\S]*?\})"\s*,/ },
    { name: 'Patrón greedy', regex: /"contenido_cifrado":\s*"(\{.*?\})"\s*,/s }
  ];
  
  cifradoPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. Probando: ${pattern.name}`);
    console.log(`   Regex: ${pattern.regex}`);
    
    const match = problematicContent.match(pattern.regex);
    if (match) {
      console.log('   ✅ MATCH ENCONTRADO');
      console.log('   📦 Contenido capturado:');
      console.log('   ' + match[1].substring(0, 100) + (match[1].length > 100 ? '...' : ''));
      console.log('   📏 Longitud:', match[1].length);
      
      // Verificar si es JSON válido
      try {
        const parsed = JSON.parse(match[1]);
        console.log('   ✅ Es JSON válido');
        console.log('   🔐 Propiedades:', Object.keys(parsed));
        console.log('   🎯 Es paquete cifrado:', !!(parsed.encrypted && parsed.algorithm && parsed.data));
      } catch (parseError) {
        console.log('   ❌ No es JSON válido:', parseError.message);
      }
    } else {
      console.log('   ❌ No hay match');
    }
    console.log();
  });
  
  // Intentar una extracción manual más específica
  console.log('🔧 Intentando extracción manual línea por línea...');
  const lines = problematicContent.split('\n');
  let inCifrado = false;
  let cifradoLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Línea ${i}: "${line}"`);
    
    if (line.includes('"contenido_cifrado":')) {
      console.log('  → Inicio de contenido_cifrado detectado');
      inCifrado = true;
      continue;
    }
    
    if (inCifrado) {
      if (line === '}",') {
        console.log('  → Fin de contenido_cifrado detectado');
        break;
      } else {
        console.log('  → Agregando línea al contenido cifrado');
        cifradoLines.push(line);
      }
    }
  }
  
  if (cifradoLines.length > 0) {
    const manualExtracted = cifradoLines.join('\n');
    console.log('\n📦 Contenido extraído manualmente:');
    console.log(manualExtracted);
    
    try {
      const parsed = JSON.parse(manualExtracted);
      console.log('✅ Extracción manual exitosa');
      console.log('🔐 Es paquete cifrado:', !!(parsed.encrypted && parsed.algorithm && parsed.data));
    } catch (parseError) {
      console.log('❌ Extracción manual falló:', parseError.message);
    }
  }
}

debugRegexPatterns();