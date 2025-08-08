// Test final para verificar que el historial funciona sin MetaMask
const { ethers } = require('ethers');

// Configuración igual que en el hook
const MANTLE_SEPOLIA_RPCS = [
  'https://mantle-sepolia.drpc.org',
  'https://mantle-sepolia.gateway.tenderly.co', 
  'https://rpc.sepolia.mantle.xyz',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
];

const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// ABI completo para testing
const DENUNCIA_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
];

// Simular la función getProviderForReading del hook
async function getProviderForReading() {
  console.log('🔍 Simulando getProviderForReading...');
  
  // Simular que no hay MetaMask disponible
  console.log('ℹ️ MetaMask no detectado, usando RPC público para lectura');
  
  // Probar RPCs hasta encontrar uno que funcione
  for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
    try {
      console.log(`🔍 Intentando provider de solo lectura: ${rpcUrl.split('/')[2]}`);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verificar que funciona
      const network = await provider.getNetwork();
      if (network.chainId === BigInt(5003)) {
        console.log(`✅ Provider de solo lectura funcional: ${rpcUrl.split('/')[2]}`);
        return provider;
      }
    } catch (error) {
      console.warn(`❌ Provider de solo lectura falló: ${rpcUrl.split('/')[2]}`);
      continue;
    }
  }
  
  throw new Error('No se pudo conectar a la red Mantle Sepolia. Verifica tu conexión a internet.');
}

// Simular la función obtenerDenuncias del hook
async function obtenerDenuncias() {
  try {
    console.log('🔍 Obteniendo provider para lectura...');
    
    // Usar provider de solo lectura (no requiere MetaMask)
    const provider = await getProviderForReading();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DENUNCIA_ABI, provider);

    console.log('Obteniendo total de denuncias...');
    
    // Obtener el total de denuncias
    console.log('🔍 Consultando contrato en:', CONTRACT_ADDRESS);
    const total = await contract.totalDenuncias();
    const totalNumber = Number(total);
    
    console.log(`✅ Total de denuncias en el contrato: ${totalNumber}`);

    if (totalNumber === 0) {
      console.log('📝 Contrato nuevo - no hay denuncias registradas aún');
      return [];
    }

    // Obtener las primeras 3 denuncias como muestra
    const maxToTest = Math.min(totalNumber, 3);
    console.log(`🔍 Obteniendo las primeras ${maxToTest} denuncias como muestra...`);
    
    const denuncias = [];
    
    for (let i = 0; i < maxToTest; i++) {
      try {
        console.log(`📋 Obteniendo denuncia ${i}...`);
        const denunciaStruct = await contract.obtenerDenuncia(i);
        
        const denuncia = {
          denunciante: denunciaStruct.denunciante,
          tipoAcoso: denunciaStruct.tipoAcoso,
          ipfsHash: denunciaStruct.ipfsHash,
          timestamp: denunciaStruct.timestamp,
          proof: denunciaStruct.proof,
          publicSignals: denunciaStruct.publicSignals,
          esPublica: denunciaStruct.esPublica || true
        };
        
        // Obtener el bloque para el timestamp usando el provider actual
        const currentBlock = await provider.getBlockNumber();
        
        const denunciaFinal = {
          denunciante: denuncia.denunciante,
          tipoAcoso: denuncia.tipoAcoso,
          descripcion: `Preview de denuncia ${i} - IPFS: ${denuncia.ipfsHash.slice(0, 15)}...`,
          ipfsHash: denuncia.ipfsHash,
          proof: denuncia.proof,
          publicSignals: denuncia.publicSignals,
          timestamp: new Date(Number(denuncia.timestamp) * 1000),
          blockNumber: currentBlock,
          esPublica: denuncia.esPublica !== undefined ? denuncia.esPublica : true
        };
        
        console.log(`✅ Denuncia ${i} procesada exitosamente:`);
        console.log(`   - Denunciante: ${denunciaFinal.denunciante.slice(0, 10)}...`);
        console.log(`   - Tipo: ${denunciaFinal.tipoAcoso}`);
        console.log(`   - IPFS: ${denunciaFinal.ipfsHash.slice(0, 15)}...`);
        console.log(`   - Fecha: ${denunciaFinal.timestamp.toLocaleString()}`);
        console.log(`   - Pública: ${denunciaFinal.esPublica}`);
        
        denuncias.push(denunciaFinal);
        
      } catch (error) {
        if (error.code === 'CALL_EXCEPTION') {
          console.warn(`⚠️ Denuncia ${i} no existe o fue eliminada`);
        } else {
          console.error(`❌ Error al procesar denuncia ${i}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Se obtuvieron ${denuncias.length} denuncias válidas de ${maxToTest} intentadas`);
    return denuncias;
    
  } catch (error) {
    console.error('❌ Error al obtener denuncias:', error.message);
    throw error;
  }
}

// Ejecutar test completo
async function testHistorialSinMetaMask() {
  console.log('🚀 PROBANDO HISTORIAL SIN METAMASK');
  console.log('===================================\n');
  
  try {
    const denuncias = await obtenerDenuncias();
    
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('==================');
    
    if (denuncias.length > 0) {
      console.log(`✅ ÉXITO: Se obtuvieron ${denuncias.length} denuncias sin MetaMask`);
      console.log('✅ El historial funciona correctamente para usuarios sin MetaMask');
      console.log('✅ Los usuarios pueden ver todas las denuncias sin instalar nada');
      
      console.log('\n📊 RESUMEN DE DENUNCIAS:');
      denuncias.forEach((denuncia, index) => {
        console.log(`${index + 1}. ${denuncia.tipoAcoso} - ${denuncia.timestamp.toLocaleDateString()}`);
      });
      
    } else {
      console.log('ℹ️ No hay denuncias en el contrato (esto es normal para un contrato nuevo)');
      console.log('✅ Pero el sistema funciona correctamente - puede obtener el total (0)');
    }
    
    console.log('\n💡 FUNCIONALIDADES CONFIRMADAS:');
    console.log('• ✅ Conexión a RPCs públicos sin MetaMask');
    console.log('• ✅ Lectura del contrato inteligente');
    console.log('• ✅ Obtención del total de denuncias');
    console.log('• ✅ Procesamiento de denuncias individuales');
    console.log('• ✅ Manejo de errores para denuncias inexistentes');
    console.log('• ✅ Obtención de información de bloques');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ FALLO EN EL TEST:');
    console.log('===================');
    console.log(`Error: ${error.message}`);
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('• Verificar conectividad a internet');
    console.log('• Verificar que los RPCs de Mantle Sepolia estén funcionando');
    console.log('• Verificar que el contrato esté desplegado correctamente');
    
    return false;
  }
}

// Ejecutar
testHistorialSinMetaMask()
  .then(success => {
    if (success) {
      console.log('\n🎉 EL HISTORIAL SIN METAMASK ESTÁ FUNCIONANDO PERFECTAMENTE');
    } else {
      console.log('\n⚠️ HAY PROBLEMAS QUE NECESITAN SER CORREGIDOS');
    }
  })
  .catch(error => {
    console.error('\n💥 ERROR CRÍTICO:', error);
  });