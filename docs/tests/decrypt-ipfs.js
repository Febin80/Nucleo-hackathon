#!/usr/bin/env node

const axios = require('axios');
const CryptoJS = require('crypto-js');

/**
 * Herramienta CLI para descifrar contenido IPFS cifrado
 * Uso: node decrypt-ipfs.js <CID> <contraseña>
 */

class IPFSDecryptor {
  constructor() {
    this.gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://dweb.link/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://gateway.ipfs.io/ipfs/'
    ];
  }

  async getContentFromIPFS(cid) {
    console.log(`🔍 Obteniendo contenido de IPFS para CID: ${cid}`);
    
    for (const gateway of this.gateways) {
      try {
        const url = gateway + cid;
        console.log(`🌐 Intentando: ${url}`);
        
        const response = await axios.get(url, { 
          timeout: 10000,
          validateStatus: status => status < 500
        });
        
        if (response.status === 200) {
          console.log(`✅ Contenido obtenido desde: ${gateway}`);
          return typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);
        } else {
          console.log(`⚠️ Gateway respondió con status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error en ${gateway}: ${error.message}`);
      }
    }
    
    throw new Error('No se pudo obtener el contenido desde ningún gateway IPFS');
  }

  isEncrypted(content) {
    try {
      const parsed = JSON.parse(content);
      return parsed.encrypted === true && parsed.algorithm && parsed.data;
    } catch {
      return false;
    }
  }

  decryptContent(encryptedPackage, password) {
    try {
      const package_ = JSON.parse(encryptedPackage);
      
      if (!package_.encrypted) {
        console.log('ℹ️ El contenido no está cifrado');
        return encryptedPackage;
      }
      
      console.log(`🔐 Descifrando contenido...`);
      console.log(`   Algoritmo: ${package_.algorithm}`);
      console.log(`   Versión: ${package_.version}`);
      console.log(`   Timestamp: ${package_.timestamp}`);
      
      if (package_.version !== '1.0' || package_.algorithm !== 'AES-256-CBC') {
        throw new Error('Versión de cifrado no soportada');
      }
      
      // Generar la clave usando PBKDF2
      const key = CryptoJS.PBKDF2(password, package_.salt, {
        keySize: 256 / 32,
        iterations: 10000
      }).toString();
      
      // Descifrar
      const decrypted = CryptoJS.AES.decrypt(package_.data, key, {
        iv: CryptoJS.enc.Hex.parse(package_.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Contraseña incorrecta o contenido corrupto');
      }
      
      console.log('✅ Contenido descifrado exitosamente');
      return decryptedText;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('El contenido no es un JSON válido');
      }
      throw error;
    }
  }

  async decryptFromIPFS(cid, password) {
    try {
      // Validar CID
      if (!cid || cid.length < 10) {
        throw new Error('CID inválido');
      }
      
      // Validar contraseña
      if (!password || password.length < 8) {
        throw new Error('Contraseña debe tener al menos 8 caracteres');
      }
      
      // Obtener contenido
      const encryptedContent = await this.getContentFromIPFS(cid);
      
      // Verificar si está cifrado
      if (!this.isEncrypted(encryptedContent)) {
        console.log('ℹ️ El contenido no está cifrado, mostrando tal como está:');
        return encryptedContent;
      }
      
      // Descifrar
      const decryptedContent = this.decryptContent(encryptedContent, password);
      
      return decryptedContent;
      
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  displayContent(content, title = 'Contenido') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 ${title}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Intentar formatear como JSON
      const parsed = JSON.parse(content);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      // Si no es JSON, mostrar como texto
      console.log(content);
    }
    
    console.log(`${'='.repeat(60)}\n`);
  }

  showUsage() {
    console.log(`
🔐 Herramienta de Descifrado IPFS
================================

Uso:
  node decrypt-ipfs.js <CID> <contraseña>

Ejemplos:
  node decrypt-ipfs.js QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG mi-contraseña-secreta
  node decrypt-ipfs.js QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o "contraseña con espacios"

Opciones:
  --help, -h    Mostrar esta ayuda
  --info, -i    Mostrar información del contenido sin descifrar

Gateways IPFS utilizados:
${this.gateways.map(g => `  - ${g}`).join('\n')}

Nota: La contraseña es case-sensitive y debe ser exacta.
    `);
  }

  async showInfo(cid) {
    try {
      const content = await this.getContentFromIPFS(cid);
      
      console.log(`\n📋 Información del CID: ${cid}`);
      console.log(`${'─'.repeat(50)}`);
      console.log(`Tamaño: ${content.length} caracteres`);
      console.log(`Cifrado: ${this.isEncrypted(content) ? '🔒 Sí' : '🔓 No'}`);
      
      if (this.isEncrypted(content)) {
        const package_ = JSON.parse(content);
        console.log(`Algoritmo: ${package_.algorithm}`);
        console.log(`Versión: ${package_.version}`);
        console.log(`Timestamp: ${package_.timestamp}`);
      }
      
      console.log(`\nPrimeros 200 caracteres:`);
      console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      
    } catch (error) {
      console.error(`❌ Error obteniendo información: ${error.message}`);
    }
  }
}

// Función principal
async function main() {
  const decryptor = new IPFSDecryptor();
  const args = process.argv.slice(2);
  
  // Verificar argumentos
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    decryptor.showUsage();
    return;
  }
  
  if (args.includes('--info') || args.includes('-i')) {
    const cid = args.find(arg => !arg.startsWith('--') && arg !== '-i');
    if (!cid) {
      console.error('❌ Debes proporcionar un CID para mostrar información');
      return;
    }
    await decryptor.showInfo(cid);
    return;
  }
  
  if (args.length < 2) {
    console.error('❌ Faltan argumentos. Usa --help para ver la ayuda.');
    return;
  }
  
  const [cid, password] = args;
  
  try {
    console.log('🚀 Iniciando descifrado...\n');
    
    const decryptedContent = await decryptor.decryptFromIPFS(cid, password);
    
    decryptor.displayContent(decryptedContent, 'Contenido Descifrado');
    
    console.log('🎉 Descifrado completado exitosamente!');
    
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  });
}

module.exports = { IPFSDecryptor };