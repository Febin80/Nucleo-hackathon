// Test script para verificar el sistema de fallback de RPCs
const { ethers } = require('ethers');

const MANTLE_SEPOLIA_RPCS = [
  'https://rpc.sepolia.mantle.xyz',
  'https://sepolia.mantlenetwork.io',
  'https://mantle-sepolia.publicnode.com',
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
  'https://rpc.testnet.mantle.xyz',
  'https://mantle-sepolia.drpc.org',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia.gateway.tenderly.co',
];

async function testRpcEndpoints() {
  console.log('🔍 Probando endpoints RPC de Mantle Sepolia...\n');
  
  const results = [];
  
  for (let i = 0; i < MANTLE_SEPOLIA_RPCS.length; i++) {
    const rpcUrl = MANTLE_SEPOLIA_RPCS[i];
    const startTime = Date.now();
    
    try {
      console.log(`[${i + 1}/${MANTLE_SEPOLIA_RPCS.length}] Probando: ${rpcUrl.split('/')[2]}`);
      
      // Test 1: Verificar chain ID
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(8000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      if (data.result === '0x138b') {
        console.log(`✅ Funcional - ${responseTime}ms`);
        
        // Test 2: Verificar que puede obtener el último bloque
        try {
          const blockResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_blockNumber',
              params: [],
              id: 2
            }),
            signal: AbortSignal.timeout(5000)
          });
          
          const blockData = await blockResponse.json();
          const blockNumber = parseInt(blockData.result, 16);
          
          console.log(`   📊 Último bloque: ${blockNumber}`);
          
          results.push({
            url: rpcUrl,
            status: 'success',
            responseTime,
            blockNumber
          });
        } catch (blockError) {
          console.log(`   ⚠️ Chain ID OK pero fallo en bloque: ${blockError.message}`);
          results.push({
            url: rpcUrl,
            status: 'partial',
            responseTime,
            error: blockError.message
          });
        }
      } else {
        console.log(`❌ Chain ID incorrecto: ${data.result}`);
        results.push({
          url: rpcUrl,
          status: 'wrong_chain',
          responseTime,
          chainId: data.result
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.log(`❌ Error: ${error.message} (${responseTime}ms)`);
      results.push({
        url: rpcUrl,
        status: 'error',
        responseTime,
        error: error.message
      });
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen
  console.log('📊 RESUMEN DE RESULTADOS:');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 'success');
  const partial = results.filter(r => r.status === 'partial');
  const failed = results.filter(r => r.status === 'error');
  const wrongChain = results.filter(r => r.status === 'wrong_chain');
  
  console.log(`✅ Completamente funcionales: ${successful.length}`);
  console.log(`⚠️ Parcialmente funcionales: ${partial.length}`);
  console.log(`❌ Con errores: ${failed.length}`);
  console.log(`🔗 Chain ID incorrecto: ${wrongChain.length}`);
  
  if (successful.length > 0) {
    console.log('\n🚀 RPCs recomendados (ordenados por velocidad):');
    successful
      .sort((a, b) => a.responseTime - b.responseTime)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.url.split('/')[2]} - ${result.responseTime}ms`);
      });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ RPCs con problemas:');
    failed.forEach(result => {
      const isRateLimit = result.error.includes('429') || result.error.includes('Too Many Requests');
      const icon = isRateLimit ? '⏱️' : '❌';
      console.log(`${icon} ${result.url.split('/')[2]}: ${result.error}`);
    });
  }
  
  return results;
}

// Ejecutar test
testRpcEndpoints()
  .then(results => {
    const workingRpcs = results.filter(r => r.status === 'success' || r.status === 'partial').length;
    console.log(`\n🎯 Resultado final: ${workingRpcs}/${results.length} RPCs disponibles`);
    
    if (workingRpcs === 0) {
      console.log('⚠️ ADVERTENCIA: Ningún RPC está funcionando correctamente');
      process.exit(1);
    } else if (workingRpcs < 3) {
      console.log('⚠️ ADVERTENCIA: Pocos RPCs disponibles, puede haber problemas de rate limiting');
    } else {
      console.log('✅ Suficientes RPCs disponibles para fallback robusto');
    }
  })
  .catch(error => {
    console.error('❌ Error en el test:', error);
    process.exit(1);
  });