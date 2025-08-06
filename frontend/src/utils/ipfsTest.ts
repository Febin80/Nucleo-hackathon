// Utilidad para probar IPFS directamente
export async function testIPFSDirectly(hash: string): Promise<{
  success: boolean;
  content?: string;
  error?: string;
  gateway?: string;
}> {
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  for (const gateway of gateways) {
    try {
      console.log(`🔍 Probando gateway: ${gateway}${hash}`);
      
      const response = await fetch(gateway + hash, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, application/json, */*'
        }
      });

      if (response.ok) {
        const content = await response.text();
        console.log(`✅ Éxito con gateway: ${gateway}`);
        return {
          success: true,
          content,
          gateway
        };
      } else {
        console.log(`❌ Error HTTP ${response.status} en: ${gateway}`);
      }
    } catch (error) {
      console.log(`❌ Error de red en: ${gateway}`, error);
    }
  }

  return {
    success: false,
    error: 'Todos los gateways fallaron'
  };
}

// Función para probar múltiples hashes
export async function testMultipleHashes(): Promise<void> {
  const testHashes = [
    'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
    'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
  ];

  console.log('🧪 Probando múltiples hashes IPFS...');
  
  for (const hash of testHashes) {
    console.log(`\n📋 Probando hash: ${hash}`);
    const result = await testIPFSDirectly(hash);
    
    if (result.success) {
      console.log(`✅ Contenido obtenido de: ${result.gateway}`);
      console.log(`📄 Contenido: ${result.content?.substring(0, 100)}...`);
    } else {
      console.log(`❌ Falló: ${result.error}`);
    }
  }
}