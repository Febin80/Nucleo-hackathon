const axios = require('axios');

// CID de la denuncia principal
const DENUNCIA_CID = 'QmZRDatU45jY6e8NtqsPBSQZ1XQchzzLWZtzAPCXh4zP7c';

async function debugMediaViewer() {
  console.log('🔍 Debuggeando MediaViewer flow...\n');
  
  try {
    // Paso 1: Obtener el contenido de la denuncia (como lo hace IPFSContentViewer)
    console.log('1️⃣ Obteniendo contenido de la denuncia...');
    const denunciaUrl = `https://gateway.pinata.cloud/ipfs/${DENUNCIA_CID}`;
    console.log(`URL: ${denunciaUrl}`);
    
    const response = await axios.get(denunciaUrl, { timeout: 10000 });
    const content = response.data;
    
    console.log('✅ Contenido obtenido');
    console.log('Tipo:', typeof content);
    console.log('Contenido raw:', JSON.stringify(content, null, 2));
    
    // Paso 2: Simular el parsing del IPFSContentViewer
    console.log('\n2️⃣ Simulando parsing del IPFSContentViewer...');
    
    let jsonContent;
    try {
      // Si ya es objeto, no necesita parsing
      if (typeof content === 'object') {
        jsonContent = content;
        console.log('✅ Contenido ya es objeto JSON');
      } else {
        jsonContent = JSON.parse(content);
        console.log('✅ Contenido parseado como JSON');
      }
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError.message);
      return;
    }
    
    console.log('JSON parseado:', JSON.stringify(jsonContent, null, 2));
    
    // Paso 3: Verificar estructura de evidencia
    console.log('\n3️⃣ Verificando estructura de evidencia...');
    
    if (jsonContent.evidencia) {
      console.log('✅ Tiene propiedad "evidencia"');
      console.log('Evidencia:', JSON.stringify(jsonContent.evidencia, null, 2));
      
      if (jsonContent.evidencia.archivos) {
        console.log('✅ Tiene propiedad "archivos"');
        console.log('Archivos:', jsonContent.evidencia.archivos);
        console.log('Tipo de archivos:', typeof jsonContent.evidencia.archivos);
        console.log('Es array:', Array.isArray(jsonContent.evidencia.archivos));
        console.log('Longitud:', jsonContent.evidencia.archivos.length);
        
        if (jsonContent.evidencia.tipos) {
          console.log('✅ Tiene propiedad "tipos"');
          console.log('Tipos:', jsonContent.evidencia.tipos);
        } else {
          console.log('⚠️ No tiene propiedad "tipos"');
        }
        
        // Paso 4: Simular lo que recibe MediaViewer
        console.log('\n4️⃣ Simulando props para MediaViewer...');
        const mediaHashes = jsonContent.evidencia.archivos;
        const mediaTypes = jsonContent.evidencia.tipos || [];
        
        console.log('Props que recibiría MediaViewer:');
        console.log('- mediaHashes:', mediaHashes);
        console.log('- mediaTypes:', mediaTypes);
        console.log('- title: "Evidencia de la Denuncia"');
        
        // Paso 5: Verificar cada imagen
        console.log('\n5️⃣ Verificando cada imagen...');
        
        for (let i = 0; i < mediaHashes.length; i++) {
          const hash = mediaHashes[i];
          const type = mediaTypes[i] || 'unknown';
          
          console.log(`\n📷 Imagen ${i + 1}:`);
          console.log(`   Hash: ${hash}`);
          console.log(`   Tipo: ${type}`);
          
          // Probar acceso a la imagen
          const gateways = [
            'https://gateway.pinata.cloud/ipfs/',
            'https://dweb.link/ipfs/'
          ];
          
          for (const gateway of gateways) {
            const imageUrl = gateway + hash;
            console.log(`   🌐 Probando: ${imageUrl}`);
            
            try {
              const imageResponse = await axios.head(imageUrl, { timeout: 5000 });
              if (imageResponse.status === 200) {
                console.log(`   ✅ Accesible (${imageResponse.status})`);
                console.log(`   📄 Content-Type: ${imageResponse.headers['content-type']}`);
                console.log(`   📏 Content-Length: ${imageResponse.headers['content-length']}`);
                break; // Si funciona uno, no probar los demás
              }
            } catch (error) {
              console.log(`   ❌ Error: ${error.message}`);
            }
          }
        }
        
        // Paso 6: Generar código React simulado
        console.log('\n6️⃣ Código React que se generaría...');
        console.log(`
// En IPFSContentViewer:
const jsonContent = ${JSON.stringify(jsonContent, null, 2)};

if (jsonContent.evidencia && jsonContent.evidencia.archivos && jsonContent.evidencia.archivos.length > 0) {
  return (
    <MediaViewer
      mediaHashes={${JSON.stringify(mediaHashes)}}
      mediaTypes={${JSON.stringify(mediaTypes)}}
      title="Evidencia de la Denuncia"
    />
  );
}
        `);
        
        // Paso 7: URLs finales para el navegador
        console.log('\n7️⃣ URLs finales para el navegador...');
        mediaHashes.forEach((hash, index) => {
          console.log(`Imagen ${index + 1}:`);
          console.log(`  - Gateway Pinata: https://gateway.pinata.cloud/ipfs/${hash}`);
          console.log(`  - dweb.link: https://dweb.link/ipfs/${hash}`);
        });
        
      } else {
        console.log('❌ No tiene propiedad "archivos"');
      }
    } else {
      console.log('❌ No tiene propiedad "evidencia"');
    }
    
    console.log('\n✅ Debug completado');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugMediaViewer().catch(console.error);