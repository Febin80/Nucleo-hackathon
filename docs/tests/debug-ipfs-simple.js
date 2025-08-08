// Script simple para debuggear IPFS
// Ejecuta este código en la consola del navegador

async function debugIPFS() {
  console.log('🔍 Debuggeando IPFS...');
  
  // Hash de prueba conocido
  const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
  
  console.log(`📋 Probando hash: ${testHash}`);
  
  // Probar gateway directo
  try {
    console.log('🌐 Probando gateway directo...');
    const response = await fetch(`https://ipfs.io/ipfs/${testHash}`);
    
    if (response.ok) {
      const content = await response.text();
      console.log('✅ Gateway directo funciona!');
      console.log('📄 Contenido:', content);
    } else {
      console.log('❌ Gateway directo falló:', response.status);
    }
  } catch (error) {
    console.log('❌ Error en gateway directo:', error);
  }
  
  // Probar función de la aplicación
  try {
    console.log('🔧 Probando función de la aplicación...');
    
    // Simular lo que hace la aplicación
    const simulatedContent = getSimulatedContent(testHash);
    if (simulatedContent) {
      console.log('✅ Contenido simulado encontrado!');
      console.log('📄 Contenido:', simulatedContent);
    } else {
      console.log('❌ No hay contenido simulado para este hash');
    }
  } catch (error) {
    console.log('❌ Error en función de aplicación:', error);
  }
  
  console.log('\n💡 Para probar en la aplicación:');
  console.log('1. Haz clic en "Ver descripción completa" en cualquier denuncia');
  console.log('2. Usa el botón "Debug" en el modal para ver información detallada');
  console.log('3. Revisa la consola del navegador para logs detallados');
}

// Función simulada (copia de la aplicación)
function getSimulatedContent(hash) {
  const knownHashes = {
    'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG': 'Hello World',
    'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o': JSON.stringify({
      message: "Este es un ejemplo de contenido JSON en IPFS",
      timestamp: "2024-01-15T10:30:00Z",
      type: "example"
    }, null, 2),
    'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ': JSON.stringify({
      tipo: "acoso_laboral",
      descripcion: "Descripción detallada del caso de acoso laboral reportado.",
      fecha: "2024-01-15T10:30:00Z",
      metadata: {
        version: "1.0",
        plataforma: "Nucleo - Denuncias Anónimas"
      }
    }, null, 2)
  };

  return knownHashes[hash] || null;
}

// Ejecutar debug
debugIPFS();

console.log('\n🎯 Comandos disponibles:');
console.log('• debugIPFS() - Ejecutar debug completo');
console.log('• getSimulatedContent("hash") - Probar contenido simulado');