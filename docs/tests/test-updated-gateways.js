// Test para verificar la lista actualizada de gateways IPFS
const UPDATED_GATEWAYS = [
  'https://dweb.link/ipfs/',
  'https://cf-ipfs.com/ipfs/', // URL corregida
  'https://4everland.io/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://w3s.link/ipfs/',
  'https://ipfs.filebase.io/ipfs/',
  'https://crustipfs.xyz/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

async function testUpdatedGateways() {
  console.log('🔍 Probando lista actualizada de gateways IPFS...\n');
  console.log(`Total de gateways: ${UPDATED_GATEWAYS.length}`);
  console.log('');
  
  // Usar un hash conocido que funciona
  const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
  
  const results = [];
  
  for (let i = 0; i < UPDATED_GATEWAYS.length; i++) {
    const gateway = UPDATED_GATEWAYS[i];
    const url = gateway + testHash;
    const startTime = Date.now();
    
    try {
      console.log(`[${i + 1}/${UPDATED_GATEWAYS.length}] Probando: ${gateway.split('/ipfs/')[0]}`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout después de 5000ms')), 5000);
      });
      
      const fetchPromise = fetch(url, {
        method: 'HEAD', // Solo verificar que existe
        headers: {
          'Accept': '*/*',
        }
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ Funcional - ${responseTime}ms`);
        results.push({
          gateway: gateway.split('/ipfs/')[0],
          status: 'success',
          responseTime
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
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
      } else if (errorMsg.includes('fetch failed') || errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
        errorType = 'dns_error';
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
    
    console.log('');
    
    // Pequeña pausa
    if (i < UPDATED_GATEWAYS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Análisis de resultados
  console.log('📊 RESUMEN DE GATEWAYS ACTUALIZADOS:');
  console.log('====================================');
  
  const successful = results.filter(r => r.status === 'success');
  const timeouts = results.filter(r => r.errorType === 'timeout');
  const dnsErrors = results.filter(r => r.errorType === 'dns_error');
  const rateLimits = results.filter(r => r.errorType === 'rate_limit');
  const otherErrors = results.filter(r => r.status === 'error' && !['timeout', 'dns_error', 'rate_limit'].includes(r.errorType));
  
  console.log(`✅ Funcionales: ${successful.length}/${results.length}`);
  console.log(`⏰ Timeouts: ${timeouts.length}`);
  console.log(`🌐 Errores DNS: ${dnsErrors.length}`);
  console.log(`🚫 Rate limits: ${rateLimits.length}`);
  console.log(`❌ Otros errores: ${otherErrors.length}`);
  
  if (successful.length > 0) {
    console.log('\n🚀 GATEWAYS FUNCIONALES (ordenados por velocidad):');
    successful
      .sort((a, b) => a.responseTime - b.responseTime)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.gateway} - ${result.responseTime}ms`);
      });
  }
  
  if (dnsErrors.length > 0) {
    console.log('\n🌐 GATEWAYS CON PROBLEMAS DNS:');
    dnsErrors.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  if (rateLimits.length > 0) {
    console.log('\n🚫 GATEWAYS CON RATE LIMIT:');
    rateLimits.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  console.log('\n💡 RECOMENDACIONES:');
  if (successful.length >= 5) {
    console.log('✅ Suficientes gateways funcionales para fallback robusto');
  } else if (successful.length >= 3) {
    console.log('⚠️ Gateways funcionales limitados - considerar agregar más');
  } else {
    console.log('❌ Muy pocos gateways funcionales - revisar configuración');
  }
  
  if (dnsErrors.length > 0) {
    console.log('🔧 Corregir URLs de gateways con errores DNS');
  }
  
  return {
    total: results.length,
    functional: successful.length,
    results
  };
}

// Ejecutar test
testUpdatedGateways()
  .then(result => {
    console.log(`\n🎯 RESULTADO FINAL:`);
    console.log(`Gateways funcionales: ${result.functional}/${result.total}`);
    
    if (result.functional >= 5) {
      console.log('✅ Lista de gateways actualizada y funcional');
    } else {
      console.log('⚠️ Necesita más gateways funcionales');
    }
  })
  .catch(error => {
    console.error('❌ Error en el test:', error);
  });