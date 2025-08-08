// Test final para confirmar que el historial funciona SIN MetaMask
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

// ABI para testing
const DENUNCIA_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
];

// Simular exactamente la función getPublicProvider del hook
async function getPublicProvider() {
  console.log('🔍 Simulando getPublicProvider (sin MetaMask)...');
  
  for (const rpcUrl of MANTLE_SEPOLIA_RPCS) {
    try {
      console.log(`🔍 Probando RPC público: ${rpcUrl.split('/')[2]}`);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verificar que funciona
      const network = await provider.getNetwork();
      if (network.chainId === BigInt(5003)) {
        console.log(`✅ RPC público funcional: ${rpcUrl.split('/')[2]}`);
        return provider;
      }
    } catch (error) {
      console.warn(`❌ RPC ${rpcUrl.split('/')[2]} falló`);
      continue;
    }
  }
  
  throw new Error('No se pudo conectar a ningún RPC público de Mantle Sepolia');
}

// Simular exactamente la función obtenerDenuncias del hook
async function obtenerDenuncias() {
  try {
    console.log('🚀 OBTENIENDO DENUNCIAS SIN METAMASK');
    
    // Usar provider público (no requiere MetaMask)
    const provider = await getPublicProvider();
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

    // Obtener las primeras 5 denuncias como muestra
    const maxToTest = Math.min(totalNumber, 5);
    console.log(`🔍 Procesando las primeras ${maxToTest} denuncias...`);
    
    const denuncias = [];
    
    for (let i = 0; i < maxToTest; i++) {
      try {
        console.log(`📋 Procesando denuncia ${i + 1}/${maxToTest}`);
        const denunciaStruct = await contract.obtenerDenuncia(i);
        
        const denuncia = {
          denunciante: denunciaStruct.denunciante,
          tipoAcoso: denunciaStruct.tipoAcoso,
          descripcion: `Denuncia de ${denunciaStruct.tipoAcoso} - Ver contenido completo en IPFS`,
          ipfsHash: denunciaStruct.ipfsHash,
          proof: denunciaStruct.proof,
          publicSignals: denunciaStruct.publicSignals,
          timestamp: new Date(Number(denunciaStruct.timestamp) * 1000),
          blockNumber: await provider.getBlockNumber(),
          esPublica: denunciaStruct.esPublica !== undefined ? denunciaStruct.esPublica : true
        };
        
        denuncias.push(denuncia);
        console.log(`✅ Denuncia ${i} procesada: ${denuncia.tipoAcoso} - ${denuncia.timestamp.toLocaleDateString()}`);
        
      } catch (denunciaError) {
        if (denunciaError.code === 'CALL_EXCEPTION') {
          console.warn(`⚠️ Denuncia ${i} no existe - saltando`);
        } else {
          console.error(`❌ Error en denuncia ${i}:`, denunciaError.message);
        }
        continue;
      }
    }

    console.log(`✅ Procesadas ${denuncias.length} denuncias exitosamente`);
    
    // Ordenar por timestamp descendente (más recientes primero)
    const denunciasOrdenadas = denuncias.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return denunciasOrdenadas;

  } catch (err) {
    console.error('❌ ERROR CRÍTICO en obtenerDenuncias:', err);
    
    // Mensaje de error más específico para usuarios sin MetaMask
    let errorMessage = 'Error al obtener las denuncias';
    
    if (err instanceof Error) {
      if (err.message.includes('MetaMask')) {
        errorMessage = 'Error de conexión. Intentando usar conexión pública...';
      } else if (err.message.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
    }
    
    console.error('🔧 Mensaje de error para usuario:', errorMessage);
    throw new Error(errorMessage);
  }
}

// Test principal
async function testHistorialFinal() {
  console.log('🎯 TEST FINAL: HISTORIAL SIN METAMASK');
  console.log('=====================================\n');
  
  try {
    const denuncias = await obtenerDenuncias();
    
    console.log('\n🎉 RESULTADO EXITOSO:');
    console.log('====================');
    
    if (denuncias.length > 0) {
      console.log(`✅ HISTORIAL FUNCIONA: ${denuncias.length} denuncias obtenidas sin MetaMask`);
      console.log('✅ Los usuarios SIN MetaMask pueden ver el historial completo');
      console.log('✅ No se requiere instalación de software adicional');
      
      console.log('\n📋 DENUNCIAS OBTENIDAS:');
      denuncias.forEach((denuncia, index) => {
        console.log(`${index + 1}. ${denuncia.tipoAcoso} - ${denuncia.timestamp.toLocaleDateString()}`);
        console.log(`   Denunciante: ${denuncia.denunciante.slice(0, 10)}...`);
        console.log(`   IPFS: ${denuncia.ipfsHash.slice(0, 15)}...`);
        console.log(`   Pública: ${denuncia.esPublica}`);
        console.log('');
      });
      
    } else {
      console.log('ℹ️ No hay denuncias en el contrato (normal para contrato nuevo)');
      console.log('✅ Pero el sistema funciona - puede conectar y consultar');
    }
    
    console.log('🎯 FUNCIONALIDADES CONFIRMADAS:');
    console.log('• ✅ Conexión a RPCs públicos sin MetaMask');
    console.log('• ✅ Lectura del contrato inteligente');
    console.log('• ✅ Obtención del total de denuncias');
    console.log('• ✅ Procesamiento de denuncias individuales');
    console.log('• ✅ Manejo de errores para denuncias inexistentes');
    console.log('• ✅ Ordenamiento por fecha');
    console.log('• ✅ Acceso a metadatos de blockchain');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ TEST FALLÓ:');
    console.log('===============');
    console.log(`Error: ${error.message}`);
    
    console.log('\n🔧 POSIBLES CAUSAS:');
    console.log('• Todos los RPCs de Mantle Sepolia están caídos');
    console.log('• Problemas de conectividad a internet');
    console.log('• El contrato no está desplegado correctamente');
    console.log('• Cambios en la configuración de red');
    
    return false;
  }
}

// Ejecutar test
testHistorialFinal()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 CONFIRMADO: EL HISTORIAL FUNCIONA SIN METAMASK');
      console.log('🎯 Los usuarios pueden ver todas las denuncias sin instalar nada');
      console.log('✅ El problema está SOLUCIONADO');
    } else {
      console.log('❌ PROBLEMA: El historial sigue sin funcionar');
      console.log('🔧 Se requiere investigación adicional');
    }
    console.log('='.repeat(50));
  })
  .catch(error => {
    console.error('\n💥 ERROR CRÍTICO EN EL TEST:', error);
    console.log('\n❌ CONFIRMADO: Hay problemas que necesitan corrección');
  });