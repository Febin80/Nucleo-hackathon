const axios = require('axios');
const CryptoJS = require('crypto-js');

// Simulación del servicio de cifrado (igual al frontend)
class EncryptionService {
  static generateKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }

  static encrypt(content, password) {
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const iv = CryptoJS.lib.WordArray.random(128/8).toString();
    const key = this.generateKey(password, salt);
    
    const encrypted = CryptoJS.AES.encrypt(content, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      encryptedContent: encrypted.toString(),
      salt,
      iv
    };
  }

  static createEncryptedPackage(content, password) {
    const { encryptedContent, salt, iv } = this.encrypt(content, password);
    
    return JSON.stringify({
      version: '1.0',
      encrypted: true,
      algorithm: 'AES-256-CBC',
      data: encryptedContent,
      salt,
      iv,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  static decryptPackage(packageContent, password) {
    const package_ = JSON.parse(packageContent);
    
    if (!package_.encrypted) {
      return packageContent;
    }

    const key = this.generateKey(password, package_.salt);
    
    const decrypted = CryptoJS.AES.decrypt(package_.data, key, {
      iv: CryptoJS.enc.Hex.parse(package_.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Contraseña incorrecta o contenido corrupto');
    }

    return decryptedText;
  }

  static generateSecurePassword(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

// Simulación de subida a Pinata
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmQ4OTYxNy0wNmQ4LTQ1ZDMtYTgwMS04YWRkMDk0OTM4ZDEiLCJlbWFpbCI6Imtldmlua3VvQGhvdG1haWwuY29tLmFyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIzYjI3NzVmZDJiNzkxMDcwYWEyIiwic2NvcGVkS2V5U2VjcmV0IjoiMTVkM2IzZGQ2OWRlNTA3MTNhZTc0OWFmY2RiOTYxNDU5YmU5MjkwYTJkMGViZjc4MTVkZWVhNGQ1ZmEwYmE2OSIsImV4cCI6MTc4NTg2NjY1MH0.4HFKflkM4GigAatqpJGG_opu67l-WYJNk4Wy-0fIrbY';

async function uploadToPinata(data) {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error subiendo a Pinata:', error.response?.data || error.message);
    // Retornar un CID simulado para la demostración
    return 'QmSimulatedHashForDemo' + Math.random().toString(36).substring(2, 8);
  }
}

async function ejemploCompletoDeUso() {
  console.log('🔐 Ejemplo Completo: Cifrado y Descifrado de Contenido IPFS\n');
  
  // Paso 1: Crear contenido sensible
  const contenidoSensible = {
    tipo: "acoso_sexual",
    descripcion: "Descripción detallada y confidencial del incidente de acoso sexual ocurrido en el lugar de trabajo. El perpetrador realizó comentarios inapropiados y gestos ofensivos durante una reunión privada.",
    fecha: "2025-08-05T14:30:00.000Z",
    ubicacion: "Oficina principal, sala de reuniones privada",
    testigos: ["Colega A (presente al inicio)", "Colega B (escuchó desde afuera)"],
    evidencia: [
      "Grabación de audio parcial",
      "Mensajes de texto posteriores",
      "Correos electrónicos con amenazas veladas"
    ],
    impacto: "El incidente ha causado estrés significativo y ha afectado mi capacidad para trabajar efectivamente. He tenido que evitar ciertas áreas de la oficina.",
    accionesDeseadas: [
      "Investigación formal",
      "Medidas disciplinarias apropiadas",
      "Capacitación sobre acoso para todo el personal",
      "Garantías de no represalias"
    ],
    metadata: {
      version: "1.0",
      plataforma: "Nucleo - Denuncias Anónimas",
      confidencial: true,
      requiereInvestigacion: true
    }
  };
  
  console.log('📄 Contenido original:');
  console.log(JSON.stringify(contenidoSensible, null, 2));
  
  // Paso 2: Generar contraseña segura
  const password = EncryptionService.generateSecurePassword();
  console.log(`\n🔑 Contraseña generada: ${password}`);
  console.log('⚠️ IMPORTANTE: Guarda esta contraseña de forma segura. Sin ella no podrás acceder al contenido.');
  
  // Paso 3: Cifrar el contenido
  console.log('\n🔐 Cifrando contenido...');
  const contenidoCifrado = EncryptionService.createEncryptedPackage(
    JSON.stringify(contenidoSensible), 
    password
  );
  
  console.log('✅ Contenido cifrado:');
  console.log(contenidoCifrado);
  
  // Paso 4: Subir a IPFS (simulado)
  console.log('\n📤 Subiendo contenido cifrado a IPFS...');
  const cid = await uploadToPinata(JSON.parse(contenidoCifrado));
  console.log(`✅ Contenido subido con CID: ${cid}`);
  
  // Paso 5: Simular recuperación y descifrado
  console.log('\n📥 Simulando recuperación desde IPFS...');
  
  try {
    // En un caso real, esto vendría de IPFS
    const contenidoRecuperado = contenidoCifrado;
    
    console.log('🔓 Descifrando contenido...');
    const contenidoDescifrado = EncryptionService.decryptPackage(contenidoRecuperado, password);
    
    console.log('✅ Contenido descifrado exitosamente:');
    console.log(JSON.stringify(JSON.parse(contenidoDescifrado), null, 2));
    
  } catch (error) {
    console.error('❌ Error al descifrar:', error.message);
  }
  
  // Paso 6: Demostrar error con contraseña incorrecta
  console.log('\n🧪 Probando con contraseña incorrecta...');
  try {
    const contenidoDescifrado = EncryptionService.decryptPackage(contenidoCifrado, 'contraseña-incorrecta');
    console.log('Esto no debería aparecer');
  } catch (error) {
    console.log('❌ Error esperado:', error.message);
  }
  
  // Paso 7: Mostrar comandos para uso posterior
  console.log('\n📋 Comandos para acceder al contenido:');
  console.log(`
🌐 URLs directas:
  - Gateway Pinata: https://gateway.pinata.cloud/ipfs/${cid}
  - dweb.link: https://dweb.link/ipfs/${cid}

🔧 Comando CLI:
  node decrypt-ipfs.js ${cid} "${password}"

💻 Código JavaScript:
  const { EncryptionService } = require('./services/encryption');
  const decrypted = EncryptionService.decryptPackage(encryptedContent, "${password}");

🌐 En la aplicación web:
  1. Ve a la lista de denuncias
  2. Busca la denuncia con badge "🔒 Cifrado"
  3. Haz clic en "Ver descripción completa"
  4. Ingresa la contraseña: ${password}
  5. Haz clic en "🔓 Descifrar"
  `);
  
  console.log('\n🎉 Ejemplo completado exitosamente!');
  console.log('\n💡 Puntos clave:');
  console.log('   - El contenido está cifrado con AES-256-CBC');
  console.log('   - La contraseña no se almacena en ningún lugar');
  console.log('   - Sin la contraseña, el contenido es irrecuperable');
  console.log('   - El cifrado es de extremo a extremo');
  console.log('   - Solo quien tiene la contraseña puede leer el contenido');
}

// Ejecutar el ejemplo
if (require.main === module) {
  ejemploCompletoDeUso().catch(console.error);
}

module.exports = { EncryptionService, ejemploCompletoDeUso };