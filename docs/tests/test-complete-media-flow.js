const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmQ4OTYxNy0wNmQ4LTQ1ZDMtYTgwMS04YWRkMDk0OTM4ZDEiLCJlbWFpbCI6Imtldmlua3VvQGhvdG1haWwuY29tLmFyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIzYjI3NzVmZDJiNzkxMDcwYWEyIiwic2NvcGVkS2V5U2VjcmV0IjoiMTVkM2IzZGQ2OWRlNTA3MTNhZTc0OWFmY2RiOTYxNDU5YmU5MjkwYTJkMGViZjc4MTVkZWVhNGQ1ZmEwYmE2OSIsImV4cCI6MTc4NTg2NjY1MH0.4HFKflkM4GigAatqpJGG_opu67l-WYJNk4Wy-0fIrbY';

const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Crear múltiples imágenes de prueba
function createTestImages() {
  const images = [];
  
  // Imagen 1: PNG pequeño (rojo)
  const redPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('test-red.png', redPng);
  images.push({ path: 'test-red.png', type: 'image/png', name: 'Evidencia Roja' });
  
  // Imagen 2: PNG pequeño (verde)
  const greenPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('test-green.png', greenPng);
  images.push({ path: 'test-green.png', type: 'image/png', name: 'Evidencia Verde' });
  
  return images;
}

async function uploadFileToPinata(filePath, fileName, fileType) {
  try {
    console.log(`📤 Subiendo ${fileName}...`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: fileType,
        testFile: 'true'
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log(`✅ ${fileName} subido con CID: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error(`❌ Error subiendo ${fileName}:`, error.response?.data || error.message);
    return null;
  }
}

async function uploadJSONToPinata(data, fileName) {
  try {
    console.log(`📤 Subiendo JSON: ${fileName}...`);
    
    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ JSON subido con CID: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error(`❌ Error subiendo JSON:`, error.response?.data || error.message);
    return null;
  }
}

async function testImageAccess(cid, description) {
  console.log(`\n🔍 Probando acceso a ${description} (CID: ${cid})`);
  
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
  ];
  
  let accessibleGateways = 0;
  
  for (const gateway of gateways) {
    try {
      const url = gateway + cid;
      const response = await axios.head(url, { timeout: 5000 });
      console.log(`✅ ${gateway}: Status ${response.status}`);
      accessibleGateways++;
    } catch (error) {
      console.log(`❌ ${gateway}: ${error.message}`);
    }
  }
  
  console.log(`📊 Gateways accesibles: ${accessibleGateways}/${gateways.length}`);
  return accessibleGateways > 0;
}

async function simulateCompleteFlow() {
  console.log('🚀 Simulando flujo completo de denuncia con multimedia...\n');
  
  // Paso 1: Crear imágenes de prueba
  console.log('📸 Creando imágenes de prueba...');
  const testImages = createTestImages();
  
  // Paso 2: Subir cada imagen a IPFS
  console.log('\n📤 Subiendo imágenes a IPFS...');
  const mediaHashes = [];
  const mediaTipos = [];
  
  for (const image of testImages) {
    const cid = await uploadFileToPinata(image.path, image.name, image.type);
    if (cid) {
      mediaHashes.push(cid);
      mediaTipos.push(image.type);
    }
  }
  
  if (mediaHashes.length === 0) {
    console.log('❌ No se pudieron subir las imágenes. Terminando prueba.');
    return;
  }
  
  // Paso 3: Crear estructura de denuncia como en DenunciaForm
  console.log('\n📋 Creando estructura de denuncia...');
  const denunciaData = {
    tipo: "acoso_laboral",
    descripcion: "Denuncia de prueba con evidencia multimedia adjunta. Esta denuncia incluye imágenes que demuestran el caso reportado.",
    evidencia: {
      archivos: mediaHashes,
      tipos: mediaTipos
    },
    metadata: {
      esPublica: true,
      timestamp: new Date().toISOString(),
      tieneMultimedia: true,
      cantidadArchivos: mediaHashes.length
    }
  };
  
  console.log('📄 Estructura creada:');
  console.log(JSON.stringify(denunciaData, null, 2));
  
  // Paso 4: Subir la denuncia completa a IPFS
  console.log('\n📤 Subiendo denuncia completa a IPFS...');
  const denunciaCID = await uploadJSONToPinata(denunciaData, 'denuncia-completa.json');
  
  if (!denunciaCID) {
    console.log('❌ No se pudo subir la denuncia completa.');
    return;
  }
  
  // Paso 5: Probar acceso a todos los archivos
  console.log('\n🧪 Probando acceso a archivos...');
  
  // Probar acceso a la denuncia principal
  await testImageAccess(denunciaCID, 'Denuncia Principal (JSON)');
  
  // Probar acceso a cada imagen
  for (let i = 0; i < mediaHashes.length; i++) {
    await testImageAccess(mediaHashes[i], `Imagen ${i + 1}`);
  }
  
  // Paso 6: Simular cómo el frontend accedería a los datos
  console.log('\n🖥️ Simulando acceso desde frontend...');
  
  try {
    // Obtener la denuncia principal
    const denunciaUrl = `https://gateway.pinata.cloud/ipfs/${denunciaCID}`;
    console.log(`📥 Obteniendo denuncia desde: ${denunciaUrl}`);
    
    const denunciaResponse = await axios.get(denunciaUrl, { timeout: 10000 });
    const denunciaRecuperada = denunciaResponse.data;
    
    console.log('✅ Denuncia recuperada exitosamente');
    console.log('📊 Archivos multimedia encontrados:', denunciaRecuperada.evidencia?.archivos?.length || 0);
    
    // Simular MediaViewer
    if (denunciaRecuperada.evidencia?.archivos) {
      console.log('\n🎨 Simulando MediaViewer...');
      for (let i = 0; i < denunciaRecuperada.evidencia.archivos.length; i++) {
        const hash = denunciaRecuperada.evidencia.archivos[i];
        const tipo = denunciaRecuperada.evidencia.tipos?.[i] || 'unknown';
        console.log(`📷 Imagen ${i + 1}: ${hash} (${tipo})`);
        console.log(`   URL: https://gateway.pinata.cloud/ipfs/${hash}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error simulando acceso desde frontend:', error.message);
  }
  
  // Paso 7: Resumen final
  console.log('\n📋 RESUMEN FINAL:');
  console.log(`✅ Imágenes subidas: ${mediaHashes.length}`);
  console.log(`✅ Denuncia principal: ${denunciaCID}`);
  console.log(`✅ Estructura correcta para MediaViewer: ${denunciaData.evidencia ? 'Sí' : 'No'}`);
  
  console.log('\n🔗 URLs para probar manualmente:');
  console.log(`- Denuncia: https://gateway.pinata.cloud/ipfs/${denunciaCID}`);
  mediaHashes.forEach((hash, i) => {
    console.log(`- Imagen ${i + 1}: https://gateway.pinata.cloud/ipfs/${hash}`);
  });
  
  // Limpiar archivos temporales
  testImages.forEach(image => {
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }
  });
  
  console.log('\n✅ Prueba completa finalizada');
}

simulateCompleteFlow().catch(console.error);