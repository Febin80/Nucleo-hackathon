// Test de diagnóstico completo para identificar exactamente por qué el historial no funciona
const { ethers } = require('ethers');

// Configuración exacta del hook
const MANTLE_SEPOLIA_RPCS = [
  'https://mantle-sepolia.drpc.org',
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.gateway.tenderly.co',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
];

const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// ABI completo del contrato
const DENUNCIA_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))",
  "event DenunciaCreada(address indexed denunciante, string tipoAcoso, string ipfsHash, bytes proof, uint256[] publicSignals)"
];

// Función para probar cada RPC individualmente
async function testRPCs() {
  console.log('🔍 DIAGNÓSTICO 1: PROBANDO CADA RPC INDIVIDUALMENTE');
  console.log('='.repeat(60));
  
  const resultados = [];
  
  for (let i = 0; i < MANTLE_SEPOLIA_RPCS.length; i++) {
    const rpcUrl = MANTLE_SEPOLIA_RPCS[i];
    const rpcName = rpcUrl.split('/')[2];
    
    console.log(`\n${i + 1}. Probando RPC: ${rpcName}`);
    console.log(`   URL: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test 1: Conexión básica
      console.log('   🔄 Test 1: Conexión básica...');
      const network = await provider.getNetwork();
      console.log(`   ✅ Conectado - Chain ID: ${network.chainId}`);
      
      if (network.chainId !== BigInt(5003)) {
        console.log(`   ❌ Chain ID incorrecto. Esperado: 5003, Obtenido: ${network.chainId}`);
        resultados.push({ rpc: rpcName, status: 'FAIL', error: 'Chain ID incorrecto' });
        continue;
      }
      
      // Test 2: Bloque actual
      console.log('   🔄 Test 2: Obteniendo bloque actual...');
      const blockNumber = await provider.getBlockNumber();
      console.log(`   ✅ Bloque actual: ${blockNumber}`);
      
      // Test 3: Código del contrato
      console.log('   🔄 Test 3: Verificando contrato...');
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        console.log(`   ❌ Contrato no encontrado en ${CONTRACT_ADDRESS}`);
        resultados.push({ rpc: rpcName, status: 'FAIL', error: 'Contrato no encontrado' });
        continue;
      }
      console.log(`   ✅ Contrato encontrado - Tamaño del código: ${code.length} bytes`);
      
      // Test 4: Función totalDenuncias
      console.log('   🔄 Test 4: Llamando totalDenuncias...');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DENUNCIA_ABI, provider);
      const total = await contract.totalDenuncias();
      console.log(`   ✅ Total de denuncias: ${total}`);
      
      // Test 5: Obtener primera denuncia (si existe)
      if (Number(total) > 0) {
        console.log('   🔄 Test 5: Obteniendo primera denuncia...');
        const denuncia = await contract.obtenerDenuncia(0);
        console.log(`   ✅ Primera denuncia obtenida:`);
        console.log(`      - Tipo: ${denuncia.tipoAcoso}`);
        console.log(`      - Denunciante: ${denuncia.denunciante.slice(0, 10)}...`);
        console.log(`      - IPFS: ${denuncia.ipfsHash.slice(0, 20)}...`);
      } else {
        console.log('   ⚠️ Test 5: No hay denuncias para probar');
      }
      
      resultados.push({ 
        rpc: rpcName, 
        status: 'SUCCESS', 
        blockNumber, 
        totalDenuncias: Number(total),
        contractSize: code.length
      });
      
      console.log(`   🎉 RPC ${rpcName} - TODOS LOS TESTS PASARON`);
      
    } catch (error) {
      console.log(`   ❌ Error en RPC ${rpcName}: ${error.message}`);
      resultados.push({ rpc: rpcName, status: 'FAIL', error: error.message });
    }
  }
  
  return resultados;
}

// Función para probar el procesamiento secuencial
async function testProcesamiento() {
  console.log('\n🔍 DIAGNÓSTICO 2: PROBANDO PROCESAMIENTO SECUENCIAL');
  console.log('='.repeat(60));
  
  try {
    // Usar el primer RPC que funcione
    let provider = null;
    for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        if (network.chainId === BigInt(5003)) {
          console.log(`✅ Usando RPC: ${rpcUrl.split('/')[2]}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!provider) {
      throw new Error('No se pudo conectar a ningún RPC');
    }
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DENUNCIA_ABI, provider);
    const total = await contract.totalDenuncias();
    const totalNumber = Number(total);
    
    console.log(`📊 Total de denuncias a procesar: ${totalNumber}`);
    
    if (totalNumber === 0) {
      console.log('⚠️ No hay denuncias para procesar');
      return { success: true, denuncias: [] };
    }
    
    // Procesar las primeras 3 denuncias con diferentes estrategias
    const maxToTest = Math.min(totalNumber, 3);
    console.log(`🔄 Procesando las primeras ${maxToTest} denuncias...`);
    
    const resultados = [];
    
    // Estrategia 1: Sin delay
    console.log('\n📋 Estrategia 1: Sin delay entre llamadas');
    try {
      const promesas = [];
      for (let i = 0; i < maxToTest; i++) {
        promesas.push(contract.obtenerDenuncia(i));
      }
      const resultadosSimultaneos = await Promise.all(promesas);
      console.log(`✅ Estrategia 1 exitosa: ${resultadosSimultaneos.length} denuncias obtenidas`);
    } catch (error) {
      console.log(`❌ Estrategia 1 falló: ${error.message}`);
      
      // Estrategia 2: Con delay
      console.log('\n📋 Estrategia 2: Con delay de 500ms entre llamadas');
      try {
        for (let i = 0; i < maxToTest; i++) {
          console.log(`   🔄 Obteniendo denuncia ${i + 1}/${maxToTest}`);
          const denuncia = await contract.obtenerDenuncia(i);
          resultados.push({
            id: i,
            tipoAcoso: denuncia.tipoAcoso,
            denunciante: denuncia.denunciante,
            ipfsHash: denuncia.ipfsHash,
            timestamp: new Date(Number(denuncia.timestamp) * 1000)
          });
          console.log(`   ✅ Denuncia ${i} obtenida: ${denuncia.tipoAcoso}`);
          
          if (i < maxToTest - 1) {
            console.log(`   ⏳ Esperando 500ms...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        console.log(`✅ Estrategia 2 exitosa: ${resultados.length} denuncias obtenidas`);
      } catch (error2) {
        console.log(`❌ Estrategia 2 también falló: ${error2.message}`);
        throw error2;
      }
    }
    
    return { success: true, denuncias: resultados };
    
  } catch (error) {
    console.log(`❌ Error en procesamiento: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Función para probar el listener de eventos
async function testListener() {
  console.log('\n🔍 DIAGNÓSTICO 3: PROBANDO LISTENER DE EVENTOS');
  console.log('='.repeat(60));
  
  try {
    // Usar el primer RPC que funcione
    let provider = null;
    for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        if (network.chainId === BigInt(5003)) {
          console.log(`✅ Usando RPC: ${rpcUrl.split('/')[2]}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!provider) {
      throw new Error('No se pudo conectar a ningún RPC');
    }
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DENUNCIA_ABI, provider);
    
    // Test 1: Crear filtro de eventos
    console.log('🔄 Test 1: Creando filtro de eventos...');
    const filter = contract.filters.DenunciaCreada();
    console.log('✅ Filtro de eventos creado');
    
    // Test 2: Buscar eventos históricos
    console.log('🔄 Test 2: Buscando eventos históricos...');
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 1000);
    
    console.log(`   Buscando desde bloque ${startBlock} hasta ${currentBlock}`);
    const eventos = await contract.queryFilter(filter, startBlock, currentBlock);
    console.log(`✅ Encontrados ${eventos.length} eventos históricos`);
    
    if (eventos.length > 0) {
      console.log('📋 Primeros eventos encontrados:');
      eventos.slice(0, 3).forEach((evento, index) => {
        const args = evento.args;
        console.log(`   ${index + 1}. Bloque ${evento.blockNumber}:`);
        console.log(`      - Tipo: ${args.tipoAcoso}`);
        console.log(`      - Denunciante: ${args.denunciante.slice(0, 10)}...`);
      });
    }
    
    // Test 3: Configurar listener (simulado)
    console.log('🔄 Test 3: Configurando listener...');
    let listenerFunciona = false;
    
    const handleEvent = (...args) => {
      console.log('🆕 Evento detectado:', args);
      listenerFunciona = true;
    };
    
    contract.on('DenunciaCreada', handleEvent);
    console.log('✅ Listener configurado (no se detectarán eventos nuevos en este test)');
    
    // Limpiar listener
    contract.removeAllListeners('DenunciaCreada');
    
    return { success: true, eventosHistoricos: eventos.length };
    
  } catch (error) {
    console.log(`❌ Error en listener: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Función principal de diagnóstico
async function diagnosticoCompleto() {
  console.log('🎯 DIAGNÓSTICO COMPLETO DEL HISTORIAL SIN METAMASK');
  console.log('='.repeat(70));
  console.log(`Fecha: ${new Date().toLocaleString()}`);
  console.log(`Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`RPCs a probar: ${MANTLE_SEPOLIA_RPCS.length}`);
  console.log('='.repeat(70));
  
  const resultados = {
    rpcs: [],
    procesamiento: null,
    listener: null,
    resumen: {
      rpcsExitosos: 0,
      procesamientoExitoso: false,
      listenerExitoso: false,
      denunciasEncontradas: 0
    }
  };
  
  try {
    // Diagnóstico 1: RPCs
    resultados.rpcs = await testRPCs();
    resultados.resumen.rpcsExitosos = resultados.rpcs.filter(r => r.status === 'SUCCESS').length;
    
    // Diagnóstico 2: Procesamiento
    resultados.procesamiento = await testProcesamiento();
    resultados.resumen.procesamientoExitoso = resultados.procesamiento.success;
    if (resultados.procesamiento.denuncias) {
      resultados.resumen.denunciasEncontradas = resultados.procesamiento.denuncias.length;
    }
    
    // Diagnóstico 3: Listener
    resultados.listener = await testListener();
    resultados.resumen.listenerExitoso = resultados.listener.success;
    
    // Resumen final
    console.log('\n🎉 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(70));
    console.log(`📊 RPCs exitosos: ${resultados.resumen.rpcsExitosos}/${MANTLE_SEPOLIA_RPCS.length}`);
    console.log(`📊 Procesamiento: ${resultados.resumen.procesamientoExitoso ? '✅ EXITOSO' : '❌ FALLÓ'}`);
    console.log(`📊 Listener: ${resultados.resumen.listenerExitoso ? '✅ EXITOSO' : '❌ FALLÓ'}`);
    console.log(`📊 Denuncias encontradas: ${resultados.resumen.denunciasEncontradas}`);
    
    // Diagnóstico del problema
    console.log('\n🔍 DIAGNÓSTICO DEL PROBLEMA:');
    
    if (resultados.resumen.rpcsExitosos === 0) {
      console.log('❌ PROBLEMA CRÍTICO: Ningún RPC funciona');
      console.log('   Posibles causas:');
      console.log('   • Problemas de conectividad a internet');
      console.log('   • Todos los RPCs de Mantle Sepolia están caídos');
      console.log('   • Firewall bloqueando las conexiones');
    } else if (!resultados.resumen.procesamientoExitoso) {
      console.log('❌ PROBLEMA: Los RPCs funcionan pero el procesamiento falla');
      console.log('   Posibles causas:');
      console.log('   • Rate limiting en los RPCs');
      console.log('   • Problemas con el ABI del contrato');
      console.log('   • Errores en la lógica de procesamiento');
    } else if (resultados.resumen.denunciasEncontradas === 0) {
      console.log('⚠️ ADVERTENCIA: Todo funciona pero no hay denuncias');
      console.log('   Posibles causas:');
      console.log('   • El contrato es nuevo y no tiene denuncias');
      console.log('   • Las denuncias están en otro contrato');
      console.log('   • Problemas con la función obtenerDenuncia');
    } else {
      console.log('✅ TODO FUNCIONA CORRECTAMENTE');
      console.log(`   Se encontraron ${resultados.resumen.denunciasEncontradas} denuncias`);
      console.log('   El problema debe estar en el frontend de React');
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    
    if (resultados.resumen.rpcsExitosos > 0 && resultados.resumen.procesamientoExitoso) {
      console.log('1. ✅ El backend funciona correctamente');
      console.log('2. 🔍 Revisar el hook de React para errores');
      console.log('3. 🔍 Verificar que el componente ListaDenuncias use el hook correctamente');
      console.log('4. 🔍 Revisar la consola del navegador para errores de JavaScript');
      console.log('5. 🔍 Verificar que no haya errores de CORS');
    } else {
      console.log('1. ❌ Hay problemas en el backend que deben solucionarse primero');
      console.log('2. 🔧 Revisar la conectividad de red');
      console.log('3. 🔧 Probar con diferentes RPCs');
      console.log('4. 🔧 Verificar la configuración del contrato');
    }
    
    return resultados;
    
  } catch (error) {
    console.log(`\n💥 ERROR CRÍTICO EN EL DIAGNÓSTICO: ${error.message}`);
    return null;
  }
}

// Ejecutar diagnóstico
diagnosticoCompleto()
  .then(resultados => {
    if (resultados) {
      console.log('\n' + '='.repeat(70));
      console.log('🎯 DIAGNÓSTICO COMPLETADO');
      
      if (resultados.resumen.rpcsExitosos > 0 && resultados.resumen.procesamientoExitoso) {
        console.log('🎉 RESULTADO: El sistema backend funciona correctamente');
        console.log('🔍 SIGUIENTE PASO: Revisar el frontend de React');
      } else {
        console.log('❌ RESULTADO: Hay problemas en el sistema backend');
        console.log('🔧 SIGUIENTE PASO: Solucionar los problemas identificados');
      }
      
      console.log('='.repeat(70));
    }
  })
  .catch(error => {
    console.error('\n💥 ERROR FATAL:', error.message);
  });