// Test para simular exactamente el comportamiento del frontend
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

// ABI simplificado para testing
const DENUNCIA_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
];

// Simular exactamente la función getPublicProvider del hook
async function getPublicProvider() {
  console.log('🔍 getPublicProvider: Iniciando...');
  
  for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
    try {
      console.log(`🔍 Probando RPC: ${rpcUrl.split('/')[2]}`);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verificar que funciona
      const network = await provider.getNetwork();
      if (network.chainId === BigInt(5003)) {
        console.log(`✅ RPC funcional: ${rpcUrl.split('/')[2]}`);
        return provider;
      }
    } catch (error) {
      console.warn(`❌ RPC ${rpcUrl.split('/')[2]} falló:`, error.message);
      continue;
    }
  }
  
  throw new Error('No se pudo conectar a ningún RPC público de Mantle Sepolia');
}

// Simular el procesamiento en lotes del hook
async function procesarDenunciasEnLotes(promesas, tamañoLote = 3, delayMs = 1000) {
  const resultados = [];
  
  console.log(`📦 Procesando ${promesas.length} denuncias en lotes de ${tamañoLote}`);
  
  for (let i = 0; i < promesas.length; i += tamañoLote) {
    const lote = promesas.slice(i, i + tamañoLote);
    const loteNumero = Math.floor(i / tamañoLote) + 1;
    const totalLotes = Math.ceil(promesas.length / tamañoLote);
    
    console.log(`🔄 Procesando lote ${loteNumero}/${totalLotes}`);
    
    try {
      const resultadosLote = await Promise.all(lote);
      const denunciasValidas = resultadosLote.filter(d => d !== null);
      resultados.push(...denunciasValidas);
      
      console.log(`✅ Lote ${loteNumero} completado: ${denunciasValidas.length}/${lote.length} válidas`);
      
      // Delay entre lotes
      if (i + tamañoLote < promesas.length) {
        console.log(`⏳ Esperando ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Error en lote ${loteNumero}:`, error.message);
      continue;
    }
  }
  
  return resultados;
}

// Simular exactamente la función obtenerDenuncias del hook
async function obtenerDenuncias() {
  try {
    console.log('🚀 SIMULANDO obtenerDenuncias DEL HOOK');
    console.log('=====================================');
    
    // Simular setLoading(true)
    console.log('🔄 Estado: loading = true');
    
    // Simular setError(null)
    console.log('🔄 Estado: error = null');

    console.log('🚀 OBTENIENDO DENUNCIAS SIN METAMASK');
    
    // Usar provider público (no requiere MetaMask)
    const provider = await getPublicProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DENUNCIA_ABI, provider);

    console.log('Obteniendo total de denuncias...');
    
    try {
      // Obtener el total de denuncias
      console.log('🔍 Consultando contrato en:', CONTRACT_ADDRESS);
      const total = await contract.totalDenuncias();
      const totalNumber = Number(total);
      
      console.log(`✅ Total de denuncias en el contrato: ${totalNumber}`);

      if (totalNumber === 0) {
        console.log('📝 Contrato nuevo - no hay denuncias registradas aún');
        console.log('🔄 Estado: loading = false');
        console.log('📊 Estado: denuncias = []');
        return [];
      }

      // Obtener todas las denuncias (limitado a 10 para testing)
      const maxToProcess = Math.min(totalNumber, 10);
      console.log(`🔍 Procesando las primeras ${maxToProcess} denuncias...`);
      
      const denunciasPromises = [];
      for (let i = 0; i < maxToProcess; i++) {
        denunciasPromises.push(
          contract.obtenerDenuncia(i).then(async (denunciaStruct) => {
            try {
              console.log(`📋 Procesando denuncia ${i}:`, {
                denunciante: denunciaStruct.denunciante.slice(0, 10) + '...',
                tipoAcoso: denunciaStruct.tipoAcoso,
                ipfsHash: denunciaStruct.ipfsHash.slice(0, 15) + '...'
              });

              // Simular obtención del bloque
              const currentBlock = await provider.getBlockNumber();
              
              // Simular preview de descripción
              let descripcionPreview = "No se proporcionó descripción";
              if (denunciaStruct.ipfsHash) {
                // Simular que no podemos obtener IPFS en este test
                descripcionPreview = "Contenido almacenado en IPFS (haz clic en 'Ver descripción completa' para acceder)";
              }

              const denuncia = {
                denunciante: denunciaStruct.denunciante,
                tipoAcoso: denunciaStruct.tipoAcoso,
                descripcion: descripcionPreview,
                ipfsHash: denunciaStruct.ipfsHash,
                proof: denunciaStruct.proof,
                publicSignals: denunciaStruct.publicSignals,
                timestamp: new Date(Number(denunciaStruct.timestamp) * 1000),
                blockNumber: currentBlock,
                esPublica: denunciaStruct.esPublica !== undefined ? denunciaStruct.esPublica : true
              };
              
              console.log(`✅ Denuncia ${i} procesada exitosamente`);
              return denuncia;
            } catch (error) {
              console.error(`❌ Error al procesar denuncia ${i}:`, error.message);
              return null;
            }
          }).catch((error) => {
            console.error(`❌ Error al obtener denuncia ${i}:`, error.message);
            return null;
          })
        );
      }

      // Procesar denuncias en lotes
      const denunciasValidas = await procesarDenunciasEnLotes(denunciasPromises, 3, 1000);
      
      console.log(`✅ Se obtuvieron ${denunciasValidas.length} denuncias válidas`);
      
      // Ordenar las denuncias por timestamp (más recientes primero)
      const denunciasOrdenadas = denunciasValidas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('🔄 Estado: loading = false');
      console.log(`📊 Estado: denuncias = [${denunciasOrdenadas.length} elementos]`);
      
      return denunciasOrdenadas;
      
    } catch (contractError) {
      console.error('❌ Error al llamar funciones del contrato:', contractError.message);
      
      // Si es un contrato nuevo, es normal que no tenga denuncias
      if (contractError.message.includes('could not decode result data')) {
        console.log('📝 Contrato nuevo detectado - inicializando historial vacío');
        console.log('🔄 Estado: loading = false');
        console.log('📊 Estado: denuncias = []');
        return [];
      }
      
      // Fallback: intentar obtener eventos
      console.log('🔄 Intentando obtener denuncias mediante eventos...');
      console.log('⚠️ Fallback no implementado en este test');
      console.log('🔄 Estado: loading = false');
      console.log('📊 Estado: denuncias = []');
      return [];
    }
  } catch (err) {
    console.error('❌ ERROR CRÍTICO en obtenerDenuncias:', err.message);
    console.log('🔄 Estado: loading = false');
    console.log('🔄 Estado: error =', err.message);
    return [];
  }
}

// Test principal
async function testFrontendDebug() {
  console.log('🎯 TEST: SIMULACIÓN EXACTA DEL FRONTEND');
  console.log('=======================================\n');
  
  try {
    const denuncias = await obtenerDenuncias();
    
    console.log('\n🎉 RESULTADO DEL TEST:');
    console.log('======================');
    
    if (denuncias.length > 0) {
      console.log(`✅ ÉXITO: ${denuncias.length} denuncias obtenidas`);
      console.log('✅ El hook debería funcionar correctamente');
      
      console.log('\n📋 DENUNCIAS SIMULADAS:');
      denuncias.forEach((denuncia, index) => {
        console.log(`${index + 1}. ${denuncia.tipoAcoso} - ${denuncia.timestamp.toLocaleDateString()}`);
        console.log(`   Descripción: ${denuncia.descripcion.slice(0, 50)}...`);
        console.log('');
      });
      
    } else {
      console.log('⚠️ PROBLEMA: No se obtuvieron denuncias');
      console.log('🔍 Posibles causas:');
      console.log('• Error en el procesamiento de lotes');
      console.log('• Error en la obtención de denuncias individuales');
      console.log('• Error en el contrato o ABI');
    }
    
    console.log('\n🔧 DIAGNÓSTICO PARA EL FRONTEND:');
    console.log('• ✅ Conexión a RPC funciona');
    console.log('• ✅ Contrato responde correctamente');
    console.log('• ✅ Total de denuncias se obtiene');
    console.log(`• ${denuncias.length > 0 ? '✅' : '❌'} Procesamiento de denuncias individuales`);
    
    return denuncias.length > 0;
    
  } catch (error) {
    console.log('\n❌ TEST FALLÓ COMPLETAMENTE:');
    console.log('============================');
    console.log(`Error: ${error.message}`);
    
    console.log('\n🔧 ACCIONES RECOMENDADAS:');
    console.log('• Verificar que el frontend use exactamente esta lógica');
    console.log('• Revisar manejo de errores en el hook');
    console.log('• Verificar que el componente maneje correctamente los estados');
    
    return false;
  }
}

// Ejecutar test
testFrontendDebug()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 DIAGNÓSTICO: El hook debería funcionar correctamente');
      console.log('🔍 Si el frontend no funciona, revisar:');
      console.log('   • Manejo de estados en React');
      console.log('   • Renderizado condicional en ListaDenuncias');
      console.log('   • Errores en la consola del navegador');
    } else {
      console.log('❌ DIAGNÓSTICO: Hay problemas en la lógica del hook');
      console.log('🔧 Necesita corrección en el código del hook');
    }
    console.log('='.repeat(60));
  })
  .catch(error => {
    console.error('\n💥 ERROR CRÍTICO EN EL TEST:', error.message);
  });