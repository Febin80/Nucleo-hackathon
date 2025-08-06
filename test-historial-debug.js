const { ethers } = require('ethers');

// Configuración del contrato
const CONTRACT_ADDRESS = '0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B';
const MANTLE_SEPOLIA_RPC = 'https://rpc.sepolia.mantle.xyz';

// ABI simplificado para las funciones que necesitamos
const SIMPLE_ABI = [
  "function totalDenuncias() view returns (uint256)",
  "function obtenerDenuncia(uint256 index) view returns (address denunciante, string tipoAcoso, string ipfsHash, bytes proof, uint256[] publicSignals, uint256 timestamp)",
  "event DenunciaCreada(address indexed denunciante, string tipoAcoso, string ipfsHash, bytes proof, uint256[] publicSignals)"
];

async function diagnosticarHistorial() {
  console.log('🔍 Diagnosticando problemas del historial...\n');
  
  try {
    // 1. Probar conexión a la red
    console.log('1️⃣ Probando conexión a Mantle Sepolia...');
    const provider = new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
    
    try {
      const network = await provider.getNetwork();
      console.log(`✅ Conectado a red: ${network.name} (Chain ID: ${network.chainId})`);
      
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ Bloque actual: ${blockNumber}`);
    } catch (networkError) {
      console.error('❌ Error de conexión a la red:', networkError.message);
      return;
    }
    
    // 2. Probar conexión al contrato
    console.log('\n2️⃣ Probando conexión al contrato...');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, provider);
    
    try {
      const total = await contract.totalDenuncias();
      console.log(`✅ Total de denuncias en el contrato: ${total}`);
      
      if (total === 0n) {
        console.log('⚠️ No hay denuncias registradas en el contrato');
        return;
      }
    } catch (contractError) {
      console.error('❌ Error accediendo al contrato:', contractError.message);
      console.error('   Posibles causas:');
      console.error('   - Dirección del contrato incorrecta');
      console.error('   - ABI incompatible');
      console.error('   - Contrato no desplegado en esta red');
      return;
    }
    
    // 3. Probar obtención de denuncias individuales
    console.log('\n3️⃣ Probando obtención de denuncias individuales...');
    const totalNumber = Number(await contract.totalDenuncias());
    
    for (let i = 0; i < Math.min(totalNumber, 3); i++) { // Probar solo las primeras 3
      try {
        console.log(`\n📄 Obteniendo denuncia ${i}...`);
        const denuncia = await contract.obtenerDenuncia(i);
        
        console.log(`   Denunciante: ${denuncia.denunciante}`);
        console.log(`   Tipo: ${denuncia.tipoAcoso}`);
        console.log(`   IPFS Hash: ${denuncia.ipfsHash}`);
        console.log(`   Timestamp: ${new Date(Number(denuncia.timestamp) * 1000).toLocaleString()}`);
        
        // Verificar si el hash IPFS es válido
        if (denuncia.ipfsHash && denuncia.ipfsHash.length > 10) {
          console.log(`   ✅ Hash IPFS válido`);
        } else {
          console.log(`   ⚠️ Hash IPFS inválido o vacío`);
        }
        
      } catch (denunciaError) {
        console.error(`   ❌ Error obteniendo denuncia ${i}:`, denunciaError.message);
      }
    }
    
    // 4. Probar eventos históricos
    console.log('\n4️⃣ Probando eventos históricos...');
    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Últimos 10k bloques
      
      console.log(`   Buscando eventos desde bloque ${fromBlock} hasta ${currentBlock}...`);
      
      const filter = contract.filters.DenunciaCreada();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);
      
      console.log(`   ✅ Encontrados ${events.length} eventos DenunciaCreada`);
      
      if (events.length > 0) {
        console.log('\n   📋 Últimos eventos:');
        events.slice(-3).forEach((event, index) => {
          console.log(`   Evento ${index + 1}:`);
          console.log(`     Bloque: ${event.blockNumber}`);
          console.log(`     TX: ${event.transactionHash}`);
          if (event.args) {
            console.log(`     Denunciante: ${event.args[0]}`);
            console.log(`     Tipo: ${event.args[1]}`);
            console.log(`     IPFS: ${event.args[2]}`);
          }
        });
      }
      
    } catch (eventsError) {
      console.error('   ❌ Error obteniendo eventos:', eventsError.message);
    }
    
    // 5. Probar acceso a contenido IPFS
    console.log('\n5️⃣ Probando acceso a contenido IPFS...');
    
    if (totalNumber > 0) {
      try {
        const primeraDenuncia = await contract.obtenerDenuncia(0);
        const ipfsHash = primeraDenuncia.ipfsHash;
        
        if (ipfsHash && ipfsHash.length > 10) {
          console.log(`   Probando acceso a IPFS hash: ${ipfsHash}`);
          
          const gateways = [
            'https://dweb.link/ipfs/',
            'https://gateway.pinata.cloud/ipfs/',
            'https://ipfs.io/ipfs/'
          ];
          
          for (const gateway of gateways) {
            try {
              const url = gateway + ipfsHash;
              const response = await fetch(url, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
              });
              
              if (response.ok) {
                console.log(`   ✅ ${gateway}: Accesible (${response.status})`);
              } else {
                console.log(`   ❌ ${gateway}: Error ${response.status}`);
              }
            } catch (fetchError) {
              console.log(`   ❌ ${gateway}: ${fetchError.message}`);
            }
          }
        } else {
          console.log('   ⚠️ No hay hash IPFS válido para probar');
        }
      } catch (ipfsError) {
        console.error('   ❌ Error probando IPFS:', ipfsError.message);
      }
    }
    
    // 6. Resumen de diagnóstico
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
    console.log('================================');
    
    const issues = [];
    const successes = [];
    
    // Verificar cada componente
    try {
      await provider.getNetwork();
      successes.push('✅ Conexión a red Mantle Sepolia');
    } catch {
      issues.push('❌ Conexión a red Mantle Sepolia');
    }
    
    try {
      const total = await contract.totalDenuncias();
      if (total > 0n) {
        successes.push(`✅ Contrato accesible (${total} denuncias)`);
      } else {
        issues.push('⚠️ Contrato accesible pero sin denuncias');
      }
    } catch {
      issues.push('❌ Contrato no accesible');
    }
    
    console.log('\n🎯 Componentes funcionando:');
    successes.forEach(success => console.log(`   ${success}`));
    
    if (issues.length > 0) {
      console.log('\n⚠️ Problemas detectados:');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log('\n🔧 Posibles soluciones:');
      console.log('   1. Verificar que MetaMask esté conectado a Mantle Sepolia');
      console.log('   2. Verificar que la dirección del contrato sea correcta');
      console.log('   3. Verificar que haya denuncias creadas en el contrato');
      console.log('   4. Verificar conectividad a internet');
      console.log('   5. Probar recargar la página');
    } else {
      console.log('\n🎉 Todo parece estar funcionando correctamente!');
    }
    
  } catch (error) {
    console.error('❌ Error general en el diagnóstico:', error);
  }
}

diagnosticarHistorial().catch(console.error);