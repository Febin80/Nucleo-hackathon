const axios = require('axios');

// Simular la función getIPFSContent del frontend
async function getIPFSContent(hash) {
  console.log(`🔍 Obteniendo contenido IPFS para hash: ${hash}`);
  
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
  ];
  
  for (const gateway of gateways) {
    try {
      const url = gateway + hash;
      console.log(`🌐 Intentando: ${url}`);
      
      const response = await axios.get(url, { timeout: 10000 });
      console.log(`✅ Contenido obtenido de: ${url}`);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
      console.warn(`❌ Gateway falló: ${gateway}`, error.message);
      continue;
    }
  }
  
  // Fallback con contenido simulado
  console.log('📄 Usando contenido simulado');
  return JSON.stringify({
    tipo: "acoso_laboral",
    descripcion: "Esta es una descripción de ejemplo de una denuncia de acoso laboral que ocurrió en el lugar de trabajo. El incidente involucró comportamiento inapropiado por parte de un supervisor hacia un empleado.",
    fecha: new Date().toISOString(),
    metadata: {
      version: "1.0",
      plataforma: "Nucleo - Denuncias Anónimas",
      simulado: true
    }
  }, null, 2);
}

// Simular la función de preview
function generatePreview(contenidoIPFS) {
  console.log('\n📝 Generando preview...');
  
  let descripcionPreview = "No se proporcionó descripción";
  
  try {
    // Intentar parsear como JSON para extraer la descripción
    const jsonContent = JSON.parse(contenidoIPFS);
    console.log('✅ Contenido parseado como JSON:', Object.keys(jsonContent));
    
    if (jsonContent.descripcion) {
      // Mostrar un preview de la descripción (primeros 150 caracteres)
      descripcionPreview = jsonContent.descripcion.length > 150 
        ? jsonContent.descripcion.substring(0, 150) + "..."
        : jsonContent.descripcion;
      console.log('📄 Preview desde campo "descripcion"');
    } else if (jsonContent.message) {
      descripcionPreview = jsonContent.message.length > 150 
        ? jsonContent.message.substring(0, 150) + "..."
        : jsonContent.message;
      console.log('📄 Preview desde campo "message"');
    } else {
      descripcionPreview = "Contenido IPFS disponible (haz clic en 'Ver descripción completa')";
      console.log('📄 Preview genérico (no se encontró descripcion/message)');
    }
  } catch {
    // Si no es JSON, usar el contenido como texto plano
    descripcionPreview = contenidoIPFS.length > 150 
      ? contenidoIPFS.substring(0, 150) + "..."
      : contenidoIPFS;
    console.log('📄 Preview desde texto plano');
  }
  
  return descripcionPreview;
}

async function testPreviewSystem() {
  console.log('🚀 Probando sistema de preview IPFS...\n');
  
  // Test con diferentes tipos de hashes
  const testHashes = [
    'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', // Hash real simple
    'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o', // Hash real JSON
    'QmInvalidHashForTesting123456789', // Hash inválido para probar fallback
  ];
  
  for (const hash of testHashes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Probando hash: ${hash}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const contenido = await getIPFSContent(hash);
      console.log('\n📄 Contenido obtenido:');
      console.log(contenido.substring(0, 200) + (contenido.length > 200 ? '...' : ''));
      
      const preview = generatePreview(contenido);
      console.log('\n✨ Preview generado:');
      console.log(`"${preview}"`);
      
      console.log('\n📊 Estadísticas:');
      console.log(`- Contenido original: ${contenido.length} caracteres`);
      console.log(`- Preview: ${preview.length} caracteres`);
      console.log(`- Reducción: ${((1 - preview.length / contenido.length) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`❌ Error procesando ${hash}:`, error.message);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Pruebas completadas');
  console.log(`${'='.repeat(60)}`);
}

testPreviewSystem().catch(console.error);