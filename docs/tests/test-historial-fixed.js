const { ethers } = require('ethers');

// Configuración del contrato
const CONTRACT_ADDRESS = '0x70ACEE597cC63C5beda2C9760CbaE1b1f242e13B';
const MANTLE_SEPOLIA_RPC = 'https://rpc.sepolia.mantle.xyz';

// ABI correcto basado en el struct
const CORRECT_ABI = [
  "function totalDenuncias() view returns (uint256)",
  {
    "inputs": [
      { "internalType": "uint256", "name": "_denunciaId", "type": "uint256" }
    ],
    "name": "obtenerDenuncia",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "denunciante", "type": "address" },
          { "internalType": "string", "name": "tipoAcoso", "type": "string" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bytes", "name": "proof", "type": "bytes" },
          { "internalType": "uint256[]", "name": "publicSignals", "type": "uint256[]" }
        ],
        "internalType": "struct DenunciaAnonima.Denuncia",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testHistorialFixed() {
  console.log('🔧 Probando historial con estructura corregida...\n');
  
  try {
    const provider = new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CORRECT_ABI, provider);
    
    // Obtener total de denuncias
    const total = await contract.totalDenuncias();
    console.log(`📊 Total de denuncias: ${total}`);
    
    if (total === 0n) {
      console.log('⚠️ No hay denuncias para mostrar');
      return;
    }
    
    // Probar obtener las primeras 3 denuncias
    const totalNumber = Number(total);
    const denunciasToTest = Math.min(totalNumber, 3);
    
    console.log(`\n🧪 Probando las primeras ${denunciasToTest} denuncias:\n`);
    
    for (let i = 0; i < denunciasToTest; i++) {
      try {
        console.log(`📄 Denuncia ${i}:`);
        console.log('─'.repeat(50));
        
        const denunciaStruct = await contract.obtenerDenuncia(i);
        
        // Extraer datos del struct
        const denuncia = {
          denunciante: denunciaStruct.denunciante,
          tipoAcoso: denunciaStruct.tipoAcoso,
          ipfsHash: denunciaStruct.ipfsHash,
          timestamp: denunciaStruct.timestamp,
          proof: denunciaStruct.proof,
          publicSignals: denunciaStruct.publicSignals
        };
        
        console.log(`Denunciante: ${denuncia.denunciante}`);
        console.log(`Tipo de Acoso: ${denuncia.tipoAcoso}`);
        console.log(`IPFS Hash: ${denuncia.ipfsHash}`);
        console.log(`Timestamp: ${new Date(Number(denuncia.timestamp) * 1000).toLocaleString()}`);
        console.log(`Proof Length: ${denuncia.proof.length} bytes`);
        console.log(`Public Signals: ${denuncia.publicSignals.length} elementos`);
        
        // Verificar acceso a IPFS
        if (denuncia.ipfsHash && denuncia.ipfsHash.length > 10) {
          console.log('\n🔍 Probando acceso a IPFS...');
          
          try {
            const response = await fetch(`https://dweb.link/ipfs/${denuncia.ipfsHash}`, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
              console.log(`✅ IPFS accesible (${response.status})`);
              
              // Intentar obtener el contenido
              try {
                const contentResponse = await fetch(`https://dweb.link/ipfs/${denuncia.ipfsHash}`, {
                  signal: AbortSignal.timeout(10000)
                });
                
                if (contentResponse.ok) {
                  const content = await contentResponse.text();
                  console.log(`📄 Contenido (${content.length} chars): ${content.substring(0, 100)}...`);
                  
                  // Intentar parsear como JSON
                  try {
                    const jsonContent = JSON.parse(content);
                    if (jsonContent.descripcion) {
                      const preview = jsonContent.descripcion.length > 100 
                        ? jsonContent.descripcion.substring(0, 100) + "..."
                        : jsonContent.descripcion;
                      console.log(`📝 Preview: "${preview}"`);
                    }
                  } catch {
                    console.log('📝 Contenido no es JSON válido');
                  }
                }
              } catch (contentError) {
                console.log(`⚠️ No se pudo obtener contenido: ${contentError.message}`);
              }
            } else {
              console.log(`❌ IPFS no accesible (${response.status})`);
            }
          } catch (ipfsError) {
            console.log(`❌ Error accediendo a IPFS: ${ipfsError.message}`);
          }
        }
        
        console.log('\n');
        
      } catch (denunciaError) {
        console.error(`❌ Error obteniendo denuncia ${i}:`, denunciaError.message);
      }
    }
    
    // Simular la estructura que usaría el frontend
    console.log('🖥️ Simulando estructura del frontend:\n');
    
    const denunciasParaFrontend = [];
    
    for (let i = 0; i < Math.min(totalNumber, 2); i++) {
      try {
        const denunciaStruct = await contract.obtenerDenuncia(i);
        
        const denuncia = {
          denunciante: denunciaStruct.denunciante,
          tipoAcoso: denunciaStruct.tipoAcoso,
          ipfsHash: denunciaStruct.ipfsHash,
          timestamp: denunciaStruct.timestamp,
          proof: denunciaStruct.proof,
          publicSignals: denunciaStruct.publicSignals
        };
        
        // Simular obtención de preview IPFS
        let descripcionPreview = "No se proporcionó descripción";
        if (denuncia.ipfsHash) {
          try {
            const response = await fetch(`https://dweb.link/ipfs/${denuncia.ipfsHash}`, {
              signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
              const contenidoIPFS = await response.text();
              
              try {
                const jsonContent = JSON.parse(contenidoIPFS);
                if (jsonContent.descripcion) {
                  descripcionPreview = jsonContent.descripcion.length > 150 
                    ? jsonContent.descripcion.substring(0, 150) + "..."
                    : jsonContent.descripcion;
                }
              } catch {
                descripcionPreview = contenidoIPFS.length > 150 
                  ? contenidoIPFS.substring(0, 150) + "..."
                  : contenidoIPFS;
              }
            }
          } catch {
            descripcionPreview = "Contenido almacenado en IPFS (haz clic en 'Ver descripción completa' para acceder)";
          }
        }
        
        const denunciaFrontend = {
          denunciante: denuncia.denunciante,
          tipoAcoso: denuncia.tipoAcoso,
          descripcion: descripcionPreview,
          ipfsHash: denuncia.ipfsHash,
          proof: denuncia.proof,
          publicSignals: denuncia.publicSignals,
          timestamp: new Date(Number(denuncia.timestamp) * 1000),
          blockNumber: await provider.getBlockNumber(),
          esPublica: true
        };
        
        denunciasParaFrontend.push(denunciaFrontend);
        
      } catch (error) {
        console.error(`Error procesando denuncia ${i} para frontend:`, error.message);
      }
    }
    
    console.log(`✅ Procesadas ${denunciasParaFrontend.length} denuncias para el frontend`);
    
    denunciasParaFrontend.forEach((denuncia, index) => {
      console.log(`\nDenuncia ${index}:`);
      console.log(`  Tipo: ${denuncia.tipoAcoso}`);
      console.log(`  Descripción: "${denuncia.descripcion}"`);
      console.log(`  Fecha: ${denuncia.timestamp.toLocaleString()}`);
      console.log(`  Denunciante: ${denuncia.denunciante.slice(0, 6)}...${denuncia.denunciante.slice(-4)}`);
    });
    
    console.log('\n🎉 ¡Historial funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testHistorialFixed().catch(console.error);