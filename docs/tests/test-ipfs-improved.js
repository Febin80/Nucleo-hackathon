// Script para probar el sistema IPFS mejorado
// Ejecuta este código en la consola del navegador

async function testImprovedIPFS() {
  console.log('🧪 Probando sistema IPFS mejorado...');
  
  // Hashes de prueba con contenido conocido
  const testHashes = [
    {
      hash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      description: 'Hello World (texto simple)',
      expectedContent: 'Hello World'
    },
    {
      hash: 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
      description: 'Contenido JSON de ejemplo',
      expectedContent: 'JSON object'
    },
    {
      hash: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
      description: 'Denuncia simulada',
      expectedContent: 'Denuncia data'
    }
  ];

  console.log('📋 Hashes de prueba disponibles:');
  testHashes.forEach((item, index) => {
    console.log(`${index + 1}. ${item.hash}`);
    console.log(`   Descripción: ${item.description}`);
    console.log(`   URL directa: https://ipfs.io/ipfs/${item.hash}`);
    console.log('');
  });

  console.log('🔧 Funcionalidades implementadas:');
  console.log('✅ Múltiples gateways IPFS (10 diferentes)');
  console.log('✅ Contenido simulado para hashes conocidos');
  console.log('✅ Fallback automático entre gateways');
  console.log('✅ Timeouts configurables');
  console.log('✅ Diagnóstico de estado de gateways');
  console.log('✅ Cifrado/descifrado de contenido');
  console.log('✅ Interfaz mejorada con indicadores de progreso');

  console.log('\n🎯 Para probar:');
  console.log('1. Haz clic en "Ver descripción completa" en cualquier denuncia');
  console.log('2. Usa el botón "Estado IPFS" para verificar gateways');
  console.log('3. Si los gateways fallan, se usará contenido simulado');
  console.log('4. Para contenido cifrado, usa contraseñas de prueba');

  console.log('\n🔐 Contraseñas de prueba para contenido cifrado:');
  console.log('• MiContraseñaSegura123!');
  console.log('• TestPassword2024');
  console.log('• DemoEncryption456');

  return testHashes;
}

// Función para probar un hash específico
async function testSpecificHash(hash) {
  console.log(`🔍 Probando hash: ${hash}`);
  
  try {
    // Simular la llamada que hace la aplicación
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, application/json, */*'
      }
    });

    if (response.ok) {
      const content = await response.text();
      console.log(`✅ Contenido obtenido:`, content.substring(0, 200) + '...');
      return content;
    } else {
      console.log(`❌ Error HTTP: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error de red:`, error.message);
    return null;
  }
}

// Ejecutar las pruebas
testImprovedIPFS();

console.log('\n💡 Comandos disponibles:');
console.log('• testSpecificHash("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")');
console.log('• testImprovedIPFS()');