// Test para el nuevo hash que está fallando
const IPFS_GATEWAYS = [
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://4everland.io/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://w3s.link/ipfs/',
  'https://ipfs.filebase.io/ipfs/',
  'https://crustipfs.xyz/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

async function testNewHash() {
  // El nuevo hash que está fallando
  const newHash = 'QmYHNYAaYK5hm3ZhZFx5W9H6xrCqQjz9Ry2o2BjnkiUuqg';
  
  console.log(`🔍 Probando nuevo hash: ${newHash.slice(0, 15)}...`);
  console.log('Este es el hash que está causando errores CORS y 429\n');
  
  const results = [];
  
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    const gateway = IPFS_GATEWAYS[i];
    const url = gateway + newHash;
    const startTime = Date.now();
    
    try {
      console.log(`[${i + 1}/${IPFS_GATEWAYS.length}] Probando: ${gateway.split('/ipfs/')[0]}`);
      
      // Timeout razonable
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout después de 8000ms')), 8000);
      });
      
      const fetchPromise = fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
        }
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      if (!content || content.trim().length === 0) {
        throw new Error('Contenido vacío');
      }
      
      console.log(`✅ Éxito - ${responseTime}ms - ${content.length} bytes`);
      
      // Mostrar preview del contenido
      const preview = content.slice(0, 100).replace(/\n/g, ' ');
      console.log(`   📄 Preview: "${preview}..."`);
      
      results.push({
        gateway: gateway.split('/ipfs/')[0],
        status: 'success',
        responseTime,
        contentLength: content.length,
        content: content.slice(0, 200) // Guardar preview
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      let errorType = 'unknown';
      if (errorMsg.includes('Timeout')) {
        errorType = 'timeout';
      } else if (errorMsg.includes('429')) {
        errorType = 'rate_limit';
      } else if (errorMsg.includes('404')) {
        errorType = 'not_found';
      } else if (errorMsg.includes('CORS') || errorMsg.includes('fetch failed')) {
        errorType = 'cors';
      }
      
      console.log(`❌ Error - ${responseTime}ms - ${errorMsg}`);
      
      results.push({
        gateway: gateway.split('/ipfs/')[0],
        status: 'error',
        responseTime,
        error: errorMsg,
        errorType
      });
    }
    
    console.log(''); // Línea en blanco
    
    // Pequeña pausa para evitar rate limiting
    if (i < IPFS_GATEWAYS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Análisis de resultados
  console.log('📊 ANÁLISIS DE RESULTADOS:');
  console.log('==========================');
  
  const successful = results.filter(r => r.status === 'success');
  const timeouts = results.filter(r => r.errorType === 'timeout');
  const rateLimits = results.filter(r => r.errorType === 'rate_limit');
  const corsErrors = results.filter(r => r.errorType === 'cors');
  const notFound = results.filter(r => r.errorType === 'not_found');
  const otherErrors = results.filter(r => r.status === 'error' && !['timeout', 'rate_limit', 'cors', 'not_found'].includes(r.errorType));
  
  console.log(`✅ Exitosos: ${successful.length}/${results.length}`);
  console.log(`⏰ Timeouts: ${timeouts.length}`);
  console.log(`🚫 Rate limits (429): ${rateLimits.length}`);
  console.log(`🔒 CORS errors: ${corsErrors.length}`);
  console.log(`❓ Not found (404): ${notFound.length}`);
  console.log(`❌ Otros errores: ${otherErrors.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 GATEWAYS EXITOSOS:');
    successful
      .sort((a, b) => a.responseTime - b.responseTime)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.gateway} - ${result.responseTime}ms - ${result.contentLength} bytes`);
      });
    
    // Verificar si el contenido parece ser JSON válido
    const firstSuccess = successful[0];
    try {
      const parsed = JSON.parse(firstSuccess.content);
      console.log('\n📋 CONTENIDO DETECTADO:');
      console.log('Tipo: JSON válido');
      if (parsed.tipo) console.log(`Tipo de denuncia: ${parsed.tipo}`);
      if (parsed.titulo) console.log(`Título: ${parsed.titulo}`);
      if (parsed.descripcion) console.log(`Descripción: ${parsed.descripcion.slice(0, 100)}...`);
    } catch (e) {
      console.log('\n📋 CONTENIDO DETECTADO:');
      console.log('Tipo: Texto plano o HTML');
    }
  }
  
  if (rateLimits.length > 0) {
    console.log('\n🚫 GATEWAYS CON RATE LIMIT:');
    rateLimits.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  if (corsErrors.length > 0) {
    console.log('\n🔒 GATEWAYS CON PROBLEMAS CORS:');
    corsErrors.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  return {
    hash: newHash,
    totalGateways: results.length,
    successful: successful.length,
    results
  };
}

// Ejecutar test
testNewHash()
  .then(result => {
    console.log(`\n🎯 RESULTADO FINAL:`);
    console.log(`Hash: ${result.hash.slice(0, 15)}...`);
    console.log(`Gateways exitosos: ${result.successful}/${result.totalGateways}`);
    
    if (result.successful > 0) {
      console.log('✅ El hash es accesible - el sistema de fallback debería funcionar');
      console.log('💡 Recomendación: Usar los gateways exitosos como prioritarios');
    } else {
      console.log('❌ El hash no es accesible desde ningún gateway');
      console.log('   Esto podría indicar que el contenido no existe o está corrupto');
    }
  })
  .catch(error => {
    console.error('❌ Error en el test:', error);
    process.exit(1);
  });