const axios = require('axios');

const IMAGE_CID = 'QmQdSkiGmjq4phfcAjLEBkq2NbCNrc9tNCdPZ6HUpfNUUj';

async function testImageCID() {
  console.log(`🖼️ Probando CID de imagen: ${IMAGE_CID}\n`);
  
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://jade-payable-nightingale-723.mypinata.cloud/ipfs/'
  ];
  
  for (const gateway of gateways) {
    const url = gateway + IMAGE_CID;
    console.log(`🌐 Probando: ${url}`);
    
    try {
      // Probar HEAD request primero
      const headResponse = await axios.head(url, { 
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500; // No fallar en 4xx
        }
      });
      
      console.log(`   HEAD Status: ${headResponse.status}`);
      console.log(`   Content-Type: ${headResponse.headers['content-type'] || 'No especificado'}`);
      console.log(`   Content-Length: ${headResponse.headers['content-length'] || 'No especificado'}`);
      
      if (headResponse.status === 200) {
        // Si HEAD funciona, probar GET para imagen
        try {
          const getResponse = await axios.get(url, { 
            timeout: 15000,
            responseType: 'arraybuffer',
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          if (getResponse.status === 200) {
            console.log(`   ✅ GET exitoso: ${getResponse.data.length} bytes`);
            
            // Verificar si es una imagen
            const contentType = getResponse.headers['content-type'];
            if (contentType && contentType.startsWith('image/')) {
              console.log(`   🖼️ ¡Es una imagen!: ${contentType}`);
              
              // Guardar la imagen para verificar
              const fs = require('fs');
              const extension = contentType.split('/')[1] || 'jpg';
              const fileName = `downloaded-image-${IMAGE_CID.slice(-8)}.${extension}`;
              fs.writeFileSync(fileName, getResponse.data);
              console.log(`   💾 Imagen guardada como: ${fileName}`);
              console.log(`   📏 Tamaño: ${(getResponse.data.length / 1024).toFixed(2)} KB`);
              
              // Verificar que es una imagen válida
              const imageHeader = getResponse.data.slice(0, 10);
              const headerHex = Buffer.from(imageHeader).toString('hex');
              console.log(`   🔍 Header hex: ${headerHex}`);
              
              if (headerHex.startsWith('ffd8ff')) {
                console.log(`   ✅ Formato JPEG válido`);
              } else if (headerHex.startsWith('89504e47')) {
                console.log(`   ✅ Formato PNG válido`);
              } else {
                console.log(`   ⚠️ Formato de imagen desconocido`);
              }
              
            } else {
              console.log(`   📄 No es imagen. Tipo: ${contentType}`);
            }
          } else {
            console.log(`   ❌ GET falló: ${getResponse.status}`);
          }
        } catch (getError) {
          console.log(`   ❌ Error en GET: ${getError.message}`);
        }
      } else {
        console.log(`   ⚠️ HEAD no exitoso: ${headResponse.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Crear HTML de prueba para verificar en navegador
  console.log('🌐 Creando HTML de prueba...\n');
  
  const fs = require('fs');
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test IPFS Image</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .gateway { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        img { max-width: 300px; max-height: 300px; border: 1px solid #ddd; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Test IPFS Image: ${IMAGE_CID}</h1>
    
    ${gateways.map(gateway => `
    <div class="gateway">
        <h3>${gateway}</h3>
        <p>URL: <a href="${gateway}${IMAGE_CID}" target="_blank">${gateway}${IMAGE_CID}</a></p>
        <img src="${gateway}${IMAGE_CID}" 
             alt="IPFS Image from ${gateway}" 
             onload="this.nextElementSibling.innerHTML='<span class=success>✅ Cargada exitosamente</span>'"
             onerror="this.nextElementSibling.innerHTML='<span class=error>❌ Error cargando imagen</span>'"
        />
        <p class="status">🔄 Cargando...</p>
    </div>
    `).join('')}
    
    <h2>Información del CID</h2>
    <ul>
        <li><strong>CID:</strong> ${IMAGE_CID}</li>
        <li><strong>Formato:</strong> ${IMAGE_CID.startsWith('Qm') ? 'CIDv0 (Base58)' : 'CIDv1'}</li>
        <li><strong>Longitud:</strong> ${IMAGE_CID.length} caracteres</li>
    </ul>
    
    <h2>Instrucciones</h2>
    <p>1. Abre este archivo HTML en tu navegador</p>
    <p>2. Verifica qué gateways cargan la imagen correctamente</p>
    <p>3. Si ninguna carga, puede ser que:</p>
    <ul>
        <li>La imagen no esté disponible en IPFS</li>
        <li>Los gateways estén bloqueando el acceso</li>
        <li>Haya problemas de CORS en el navegador</li>
    </ul>
</body>
</html>
  `;
  
  fs.writeFileSync('test-ipfs-image.html', htmlContent);
  console.log('✅ Archivo HTML creado: test-ipfs-image.html');
  console.log('   Abre este archivo en tu navegador para probar las imágenes');
  
  console.log('\n📋 Resumen:');
  console.log(`CID de imagen: ${IMAGE_CID}`);
  console.log(`URLs para probar:`);
  gateways.forEach(gateway => {
    console.log(`  - ${gateway}${IMAGE_CID}`);
  });
}

testImageCID().catch(console.error);