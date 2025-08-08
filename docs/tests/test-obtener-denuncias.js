// Test para verificar si el sistema de obtener denuncias funciona
const { ethers } = require('ethers');

// RPCs de Mantle Sepolia
const MANTLE_SEPOLIA_RPCS = [
  'https://mantle-sepolia.drpc.org',
  'https://mantle-sepolia.gateway.tenderly.co', 
  'https://rpc.sepolia.mantle.xyz',
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',
];

const CONTRACT_ADDRESS = '0x7B339806c5Bf0bc8e12758D9E65b8806361b66f5';

// ABI simplificado para testing
const SIMPLE_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256) view returns (tuple(address denunciante, string tipoAcoso, string ipfsHash, uint256 timestamp, bytes proof, uint256[] publicSignals, bool esPublica))"
];

async function testObtenerDenuncias() {
  console.log('🔍 Probando obtención de denuncias sin MetaMask...\n');
  
  let workingProvider = null;
  
  // Probar cada RPC hasta encontrar uno que funcione
  for (let i = 0; i < MANTLE_SEPOLIA_RPCS.length; i++) {
    const rpcUrl = MANTLE_SEPOLIA_RPCS[i];
    
    try {
      console.log(`[${i + 1}/${MANTLE_SEPOLIA_RPCS.length}] Probando RPC: ${rpcUrl.split('/')[2]}`);
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verificar que el RPC funciona
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(5003)) {
        console.log(`❌ Chain ID incorrecto: ${network.chainId}`);
        continue;
      }
      
      // Verificar que el contrato existe
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        console.log(`❌ Contrato no encontrado en ${CONTRACT_ADDRESS}`);
        continue;
      }
      
      console.log(`✅ RPC funcional: ${rpcUrl.split('/')[2]}`);
      console.log(`   - Chain ID: ${network.chainId}`);
      console.log(`   - Contrato existe: ${code.length > 2 ? 'Sí' : 'No'}`);
      
      workingProvider = provider;
      break;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      continue;
    }
  }
  
  if (!workingProvider) {
    console.log('\n❌ FALLO: Ningún RPC está funcionando');
    return false;
  }
  
  console.log('\n📋 Probando funciones del contrato...');
  
  try {
    // Crear instancia del contrato
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, workingProvider);
    
    // Probar obtener total de denuncias
    console.log('🔍 Obteniendo total de denuncias...');
    const total = await contract.totalDenuncias();
    const totalNumber = Number(total);
    
    console.log(`✅ Total de denuncias: ${totalNumber}`);
    
    if (totalNumber === 0) {
      console.log('ℹ️ No hay denuncias en el contrato (esto es normal para un contrato nuevo)');
      return true;
    }
    
    // Probar obtener una denuncia específica
    console.log(`🔍 Obteniendo denuncia 0...`);
    
    try {
      const denuncia = await contract.obtenerDenuncia(0);
      console.log('✅ Denuncia obtenida exitosamente:');
      console.log(`   - Denunciante: ${denuncia.denunciante.slice(0, 10)}...`);
      console.log(`   - Tipo: ${denuncia.tipoAcoso}`);
      console.log(`   - IPFS Hash: ${denuncia.ipfsHash.slice(0, 15)}...`);
      console.log(`   - Timestamp: ${new Date(Number(denuncia.timestamp) * 1000).toLocaleString()}`);
      console.log(`   - Es Pública: ${denuncia.esPublica}`);
      
    } catch (denunciaError) {
      if (denunciaError.code === 'CALL_EXCEPTION') {
        console.log('⚠️ Denuncia 0 no existe (esto puede ser normal)');
      } else {
        console.log(`❌ Error al obtener denuncia: ${denunciaError.message}`);
        return false;
      }
    }
    
    return true;
    
  } catch (contractError) {
    console.log(`❌ Error en contrato: ${contractError.message}`);
    return false;
  }
}

// Ejecutar test
testObtenerDenuncias()
  .then(success => {
    console.log('\n🎯 RESULTADO FINAL:');
    if (success) {
      console.log('✅ El sistema de obtener denuncias SIN MetaMask está funcionando');
      console.log('💡 Si hay problemas en la app, pueden ser de UI o manejo de errores');
    } else {
      console.log('❌ El sistema de obtener denuncias tiene problemas');
      console.log('🔧 Necesita revisión de la configuración de RPCs o contrato');
    }
  })
  .catch(error => {
    console.error('❌ Error crítico en el test:', error);
  });