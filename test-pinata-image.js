const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmQ4OTYxNy0wNmQ4LTQ1ZDMtYTgwMS04YWRkMDk0OTM4ZDEiLCJlbWFpbCI6Imtldmlua3VvQGhvdG1haWwuY29tLmFyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIzYjI3NzVmZDJiNzkxMDcwYWEyIiwic2NvcGVkS2V5U2VjcmV0IjoiMTVkM2IzZGQ2OWRlNTA3MTNhZTc0OWFmY2RiOTYxNDU5YmU5MjkwYTJkMGViZjc4MTVkZWVhNGQ1ZmEwYmE2OSIsImV4cCI6MTc4NTg2NjY1MH0.4HFKflkM4GigAatqpJGG_opu67l-WYJNk4Wy-0fIrbY';

const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Crear una imagen de prueba simple (1x1 pixel PNG)
function createTestImage() {
  // PNG de 1x1 pixel transparente en base64
  const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('test-image.png', pngData);
  return 'test-image.png';
}

async function uploadImageToPinata() {
  console.log('🖼️ Creando imagen de prueba...');
  const imagePath = createTestImage();
  
  try {
    console.log('📤 Subiendo imagen a Pinata...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    const metadata = JSON.stringify({
      name: 'test-image.png',
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: 'image/png',
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

    console.log('✅ Imagen subida exitosamente!');
    console.log('CID:', response.data.IpfsHash);
    
    // Probar acceso a la imagen
    await testImageAccess(response.data.IpfsHash);
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.response?.data || error.message);
    return null;
  } finally {
    // Limpiar archivo temporal
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
}

async function testImageAccess(cid) {
  console.log(`\n🔍 Probando acceso a imagen con CID: ${cid}`);
  
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://jade-payable-nightingale-723.mypinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/'
  ];
  
  for (const gateway of gateways) {
    try {
      const url = gateway + cid;
      console.log(`🌐 Probando: ${url}`);
      
      const response = await axios.head(url, { timeout: 10000 });
      console.log(`✅ Accesible! Status: ${response.status}, Content-Type: ${response.headers['content-type']}`);
      
      // Si es el gateway público de Pinata, también probar GET
      if (gateway.includes('gateway.pinata.cloud')) {
        const getResponse = await axios.get(url, { 
          timeout: 10000,
          responseType: 'arraybuffer'
        });
        console.log(`📊 Tamaño de imagen: ${getResponse.data.length} bytes`);
      }
      
    } catch (error) {
      console.log(`❌ No accesible: ${error.message}`);
    }
  }
}

async function testCompleteFlow() {
  console.log('🚀 Iniciando prueba completa de subida de imagen...\n');
  
  const cid = await uploadImageToPinata();
  
  if (cid) {
    console.log('\n📋 Resumen:');
    console.log(`- CID generado: ${cid}`);
    console.log(`- URL pública: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`- URL personalizada: https://jade-payable-nightingale-723.mypinata.cloud/ipfs/${cid}`);
    
    // Simular estructura de datos como en DenunciaForm
    const denunciaData = {
      tipo: "acoso_laboral",
      descripcion: "Denuncia de prueba con imagen adjunta",
      evidencia: {
        archivos: [cid],
        tipos: ['image/png']
      },
      metadata: {
        timestamp: new Date().toISOString(),
        tieneMultimedia: true,
        cantidadArchivos: 1
      }
    };
    
    console.log('\n📄 Estructura de datos simulada:');
    console.log(JSON.stringify(denunciaData, null, 2));
    
  } else {
    console.log('\n❌ La prueba falló - no se pudo subir la imagen');
  }
}

testCompleteFlow().catch(console.error);