const axios = require('axios');

const CID = 'QmdoAwKD9xrvxH8C1mih6isT2XLVRqzZNs7XQj6dR3ydaz';
const PASSWORD = 'e!q^mDcHGEYdEYNf';

async function descifrarContenido() {
  console.log('🔍 Obteniendo contenido cifrado desde IPFS...');
  console.log(`CID: ${CID}`);
  console.log(`Contraseña: ${PASSWORD}`);
  
  try {
    // Obtener contenido desde IPFS
    const url = `https://gateway.pinata.cloud/ipfs/${CID}`;
    console.log(`\n🌐 URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 10000 });
    const contenidoCifrado = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    
    console.log('\n📄 Contenido cifrado obtenido:');
    console.log(contenidoCifrado);
    
    // Verificar si está cifrado
    let package_;
    try {
      package_ = JSON.parse(contenidoCifrado);
    } catch (error) {
      console.log('\n❌ El contenido no es JSON válido');
      return;
    }
    
    if (!package_.encrypted) {
      console.log('\n❌ El contenido no está cifrado');
      console.log('Contenido:', contenidoCifrado);
      return;
    }
    
    console.log('\n🔐 Contenido está cifrado. Información:');
    console.log(`- Versión: ${package_.version}`);
    console.log(`- Algoritmo: ${package_.algorithm}`);
    console.log(`- Timestamp: ${package_.timestamp}`);
    
    console.log('\n🔓 Descifrando contenido...');
    console.log('(Nota: Necesitamos crypto-js para descifrar)');
    
    // Mostrar el comando para descifrar
    console.log('\n💻 Para descifrar, ejecuta:');
    console.log(`node decrypt-ipfs.js ${CID} "${PASSWORD}"`);
    
    // Mostrar URLs útiles
    console.log('\n🌐 URLs para acceder:');
    console.log(`- Gateway Pinata: https://gateway.pinata.cloud/ipfs/${CID}`);
    console.log(`- dweb.link: https://dweb.link/ipfs/${CID}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

descifrarContenido();