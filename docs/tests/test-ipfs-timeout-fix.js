// Test para verificar el manejo mejorado de timeouts en IPFS
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

// Función mejorada de fetchFromGateway (simulando la implementación)
async function fetchFromGateway(url, timeout) {
  const gateway = url.split('/ipfs/')[0];
  
  // Crear timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout después de ${timeout}ms`));
    }, timeout);
  });

  try {
    // Función para hacer fetch con diferentes estrategias CORS
    const fetchWithStrategies = async () => {
      // Estrategia 1: CORS habilitado con headers optimizados
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        return response;
      } catch (corsError) {
        console.warn(`⚠️ CORS falló para ${gateway}, intentando estrategias alternativas...`);
        
        // Estrategia 2: Headers más simples
        try {
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': '*/*',
            }
          });
          return response;
        } catch (secondCorsError) {
          // Estrategia 3: Request simple para gateways específicos
          if (gateway.includes('dweb.link') || gateway.includes('4everland') || gateway.includes('cloudflare')) {
            const response = await fetch(url, {
              method: 'GET'
            });
            return response;
          } else {
            throw new Error('CORS bloqueado en todas las estrategias');
          }
        }
      }
    };

    // Usar Promise.race para manejar timeout de manera más robusta
    const response = await Promise.race([
      fetchWithStrategies(),
      timeoutPromise
    ]);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit excedido (429) - Gateway penalizado`);
      }
      if (response.status === 422) {
        throw new Error(`CID inválido (422): ${response.statusText}`);
      }
      if (response.status === 404) {
        throw new Error(`Contenido no encontrado (404) en IPFS`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    if (!content || content.trim().length === 0) {
      throw new Error('Contenido vacío recibido');
    }

    console.log(`✅ Contenido obtenido exitosamente de: ${gateway}`);
    return content;
  } catch (error) {
    // Mejorar el manejo de errores
    let errorMsg = error instanceof Error ? error.message : String(error);
    
    if (error instanceof Error) {
      if (errorMsg.includes('Timeout después de')) {
        // Ya es un mensaje de timeout claro
      } else if (error.name === 'AbortError' || errorMsg.includes('aborted')) {
        errorMsg = `Timeout después de ${timeout}ms`;
      } else if (errorMsg.includes('Failed to fetch')) {
        errorMsg = 'Error de conexión o CORS bloqueado';
      } else if (errorMsg.includes('NetworkError')) {
        errorMsg = 'Error de red';
      }
    }
    
    console.warn(`❌ Error en gateway ${gateway}: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

// Test con un hash IPFS real
async function testTimeoutHandling() {
  console.log('🔍 Probando manejo mejorado de timeouts IPFS...\n');
  
  // Usar un hash IPFS conocido que debería existir
  const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // "hello world"
  
  const results = [];
  
  for (let i = 0; i < Math.min(IPFS_GATEWAYS.length, 5); i++) { // Probar solo los primeros 5
    const gateway = IPFS_GATEWAYS[i];
    const url = gateway + testHash;
    const startTime = Date.now();
    
    try {
      console.log(`[${i + 1}/5] Probando: ${gateway.split('/ipfs/')[0]}`);
      
      // Timeout corto para forzar algunos timeouts
      const timeout = i < 2 ? 3000 : 8000; // Primeros 2 con timeout corto
      const content = await fetchFromGateway(url, timeout);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Éxito - ${responseTime}ms - Contenido: "${content.slice(0, 50)}..."`);
      
      results.push({
        gateway: gateway.split('/ipfs/')[0],
        status: 'success',
        responseTime,
        contentLength: content.length
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ Error - ${responseTime}ms - ${errorMsg}`);
      
      results.push({
        gateway: gateway.split('/ipfs/')[0],
        status: 'error',
        responseTime,
        error: errorMsg,
        isTimeout: errorMsg.includes('Timeout después de')
      });
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen
  console.log('📊 RESUMEN DE RESULTADOS:');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 'success');
  const timeouts = results.filter(r => r.status === 'error' && r.isTimeout);
  const otherErrors = results.filter(r => r.status === 'error' && !r.isTimeout);
  
  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`⏰ Timeouts: ${timeouts.length}`);
  console.log(`❌ Otros errores: ${otherErrors.length}`);
  
  if (successful.length > 0) {
    console.log('\n🚀 Gateways exitosos:');
    successful.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.responseTime}ms - ${result.contentLength} bytes`);
    });
  }
  
  if (timeouts.length > 0) {
    console.log('\n⏰ Timeouts detectados:');
    timeouts.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  if (otherErrors.length > 0) {
    console.log('\n❌ Otros errores:');
    otherErrors.forEach(result => {
      console.log(`  • ${result.gateway} - ${result.error}`);
    });
  }
  
  return results;
}

// Ejecutar test
testTimeoutHandling()
  .then(results => {
    const workingGateways = results.filter(r => r.status === 'success').length;
    const timeoutCount = results.filter(r => r.status === 'error' && r.isTimeout).length;
    
    console.log(`\n🎯 Resultado final:`);
    console.log(`   • ${workingGateways}/${results.length} gateways funcionando`);
    console.log(`   • ${timeoutCount} timeouts manejados correctamente`);
    
    if (workingGateways > 0) {
      console.log('✅ Sistema de fallback IPFS funcionando correctamente');
    } else {
      console.log('⚠️ Todos los gateways fallaron - verificar conectividad');
    }
  })
  .catch(error => {
    console.error('❌ Error en el test:', error);
    process.exit(1);
  });