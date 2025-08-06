// Script para agregar Mantle Sepolia a MetaMask
// Ejecuta este código en la consola del navegador con MetaMask instalado

async function addMantleSepolia() {
  if (typeof window.ethereum === 'undefined') {
    console.error('❌ MetaMask no está instalado');
    return;
  }

  try {
    console.log('🔄 Agregando Mantle Sepolia Testnet...');
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x138b', // 5003 en decimal
        chainName: 'Mantle Sepolia Testnet',
        nativeCurrency: {
          name: 'Mantle',
          symbol: 'MNT',
          decimals: 18
        },
        rpcUrls: [
          'https://rpc.sepolia.mantle.xyz'
        ],
        blockExplorerUrls: [
          'https://explorer.sepolia.mantle.xyz/'
        ]
      }]
    });
    
    console.log('✅ Mantle Sepolia Testnet agregada exitosamente');
    
    // Intentar cambiar a la red
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x138b' }]
    });
    
    console.log('✅ Cambiado a Mantle Sepolia Testnet');
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 4902) {
      console.log('ℹ️  La red ya existe o hay un problema con la configuración');
    } else if (error.code === 4001) {
      console.log('ℹ️  Usuario canceló la operación');
    } else {
      console.log('ℹ️  Agrega la red manualmente con estos datos:');
      console.log('   Nombre: Mantle Sepolia Testnet');
      console.log('   RPC URL: https://rpc.sepolia.mantle.xyz');
      console.log('   Chain ID: 5003');
      console.log('   Símbolo: MNT');
      console.log('   Explorador: https://explorer.sepolia.mantle.xyz/');
    }
  }
}

// Ejecutar la función
addMantleSepolia();

console.log(`
📋 Configuración Manual de Mantle Sepolia:
   • Nombre: Mantle Sepolia Testnet
   • RPC URL: https://rpc.sepolia.mantle.xyz
   • Chain ID: 5003 (0x138b en hex)
   • Símbolo: MNT
   • Explorador: https://explorer.sepolia.mantle.xyz/

🔗 Contrato: 0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B
`);