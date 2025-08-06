const axios = require('axios');

const CID_TO_TEST = 'QmZRDatU45jY6e8NtqsPBSQZ1XQchzzLWZtzAPCXh4zP7c';

async function testSpecificCID() {
  console.log(`🔍 Probando CID específico: ${CID_TO_TEST}\n`);
  
  const gateways = [
    'https://jade-payable-nightingale-723.mypinata.cloud/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://cf-ipfs.com/ipfs/'
  ];
  
  for (const gateway of gateways) {
    const url = gateway + CID_TO_TEST;
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
        // Si HEAD funciona, probar GET
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
              console.log(`   🖼️ Es una imagen: ${contentType}`);
              
              // Guardar una muestra para verificar
              const fs = require('fs');
              const fileName = `test-image-${CID_TO_TEST.slice(-8)}.${contentType.split('/')[1]}`;
              fs.writeFileSync(fileName, getResponse.data);
              console.log(`   💾 Imagen guardada como: ${fileName}`);
            } else {
              console.log(`   📄 Tipo de contenido: ${contentType}`);
              
              // Si no es imagen, mostrar contenido como texto
              const content = getResponse.data.toString('utf8', 0, Math.min(200, getResponse.data.length));
              console.log(`   📝 Contenido (primeros 200 chars): ${content}`);
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
  
  // Probar con curl para comparar
  console.log('🔧 Probando con curl para comparación...\n');
  
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  for (const gateway of gateways.slice(0, 3)) { // Solo los primeros 3
    const url = gateway + CID_TO_TEST;
    console.log(`🌐 curl: ${url}`);
    
    try {
      const { stdout, stderr } = await execPromise(`curl -I -s -m 10 "${url}"`, { timeout: 15000 });
      
      if (stdout) {
        const lines = stdout.split('\n').slice(0, 5); // Primeras 5 líneas
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`   ${line.trim()}`);
          }
        });
      }
      
      if (stderr) {
        console.log(`   Error: ${stderr.trim()}`);
      }
      
    } catch (curlError) {
      console.log(`   ❌ curl error: ${curlError.message}`);
    }
    
    console.log('');
  }
  
  // Verificar si el CID es válido
  console.log('🔍 Verificando validez del CID...\n');
  
  function isValidIPFSHash(hash) {
    // Verificar formato básico de hash IPFS
    if (!hash || hash.length < 10) return false;
    
    // Verificar prefijos comunes
    const validPrefixes = ['Qm', 'bafy', 'bafk', 'bafz'];
    const hasValidPrefix = validPrefixes.some(prefix => hash.startsWith(prefix));
    
    if (!hasValidPrefix) return false;
    
    // Verificar longitud aproximada
    if (hash.startsWith('Qm') && hash.length !== 46) return false;
    if (hash.startsWith('bafy') && hash.length < 50) return false;
    
    return true;
  }
  
  const isValid = isValidIPFSHash(CID_TO_TEST);
  console.log(`CID válido: ${isValid ? '✅ Sí' : '❌ No'}`);
  console.log(`Longitud: ${CID_TO_TEST.length} caracteres`);
  console.log(`Prefijo: ${CID_TO_TEST.substring(0, 4)}`);
  
  if (CID_TO_TEST.startsWith('Qm')) {
    console.log('Formato: CIDv0 (Base58)');
  } else if (CID_TO_TEST.startsWith('bafy')) {
    console.log('Formato: CIDv1 (Base32)');
  }
  
  // Sugerencias
  console.log('\n💡 Posibles causas si no funciona:');
  console.log('1. El contenido no está disponible en la red IPFS');
  console.log('2. Los gateways están bloqueando el acceso');
  console.log('3. El CID es inválido o corrupto');
  console.log('4. El contenido fue eliminado o no se propagó');
  console.log('5. Problemas de conectividad temporal');
  
  console.log('\n🔧 Soluciones recomendadas:');
  console.log('1. Verificar que el contenido se subió correctamente');
  console.log('2. Probar con diferentes gateways');
  console.log('3. Esperar unos minutos para la propagación');
  console.log('4. Usar un gateway IPFS local si está disponible');
}

testSpecificCID().catch(console.error);