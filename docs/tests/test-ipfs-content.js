// Script para probar contenido IPFS
// Puedes ejecutar este código en la consola del navegador

async function testIPFSContent() {
  console.log('🧪 Probando contenido IPFS...');
  
  // Algunos hashes IPFS reales con contenido de ejemplo
  const testHashes = [
    {
      hash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      description: 'Archivo "hello world" clásico'
    },
    {
      hash: 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
      description: 'Contenido JSON de ejemplo'
    },
    {
      hash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      description: 'Texto simple'
    }
  ];

  console.log('📋 Hashes de prueba disponibles:');
  testHashes.forEach((item, index) => {
    console.log(`${index + 1}. ${item.hash} - ${item.description}`);
    console.log(`   URL: https://ipfs.io/ipfs/${item.hash}`);
  });

  console.log('\n🔗 Puedes probar estos hashes en el visor IPFS de la aplicación');
  console.log('💡 También puedes crear tu propio contenido en https://pinata.cloud');
}

testIPFSContent();