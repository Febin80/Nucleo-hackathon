// Utilidades para validar CIDs de IPFS
export class IPFSValidator {
  
  // Validar si un string es un CID válido
  static isValidCID(cid: string): boolean {
    if (!cid || typeof cid !== 'string') {
      console.warn('❌ CID inválido: no es string o está vacío');
      return false;
    }
    
    // Verificar longitud mínima
    if (cid.length < 10) {
      console.warn(`❌ CID muy corto: ${cid.length} caracteres`);
      return false;
    }
    
    // CIDv0 (base58, empieza con Qm)
    if (cid.startsWith('Qm')) {
      return this.validateCIDv0(cid);
    }
    
    // CIDv1 (base32, empieza con bafy, bafk, bafz, etc.)
    if (cid.startsWith('baf') || cid.startsWith('bae')) {
      return this.validateCIDv1(cid);
    }
    
    console.warn(`❌ CID con prefijo inválido: ${cid.slice(0, 10)}...`);
    return false;
  }
  
  // Validar CIDv0 (formato Qm...)
  static validateCIDv0(cid: string): boolean {
    // CIDv0 debe tener exactamente 46 caracteres
    if (cid.length !== 46) {
      console.warn(`❌ CIDv0 longitud incorrecta: ${cid.length} (debe ser 46)`);
      return false;
    }
    
    // Verificar caracteres válidos para base58
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    if (!base58Regex.test(cid)) {
      console.warn('❌ CIDv0 contiene caracteres inválidos para base58');
      return false;
    }
    
    console.log(`✅ CIDv0 válido: ${cid.slice(0, 15)}...`);
    return true;
  }
  
  // Validar CIDv1 (formato bafy..., bafk..., etc.)
  static validateCIDv1(cid: string): boolean {
    // CIDv1 debe tener al menos 50 caracteres
    if (cid.length < 50) {
      console.warn(`❌ CIDv1 muy corto: ${cid.length} (debe ser ≥50)`);
      return false;
    }
    
    // Verificar caracteres válidos para base32
    const base32Regex = /^[a-z2-7]+$/;
    if (!base32Regex.test(cid)) {
      console.warn('❌ CIDv1 contiene caracteres inválidos para base32');
      return false;
    }
    
    console.log(`✅ CIDv1 válido: ${cid.slice(0, 15)}...`);
    return true;
  }
  
  // Extraer CID de una URL de IPFS
  static extractCIDFromURL(url: string): string | null {
    try {
      // Patrones comunes de URLs IPFS
      const patterns = [
        /\/ipfs\/([a-zA-Z0-9]+)/,           // https://gateway.com/ipfs/QmXXX
        /ipfs\.([^\/]+)\/([a-zA-Z0-9]+)/,   // https://QmXXX.ipfs.gateway.com
        /^(Qm[a-zA-Z0-9]{44})$/,            // Solo el CID
        /^(baf[a-z0-9]{50,})$/              // CIDv1 solo
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const cid = match[1] || match[2];
          if (cid && this.isValidCID(cid)) {
            console.log(`✅ CID extraído de URL: ${cid.slice(0, 15)}...`);
            return cid;
          }
        }
      }
      
      console.warn(`❌ No se pudo extraer CID válido de URL: ${url}`);
      return null;
    } catch (error) {
      console.error('❌ Error extrayendo CID de URL:', error);
      return null;
    }
  }
  
  // Validar URL completa de IPFS
  static isValidIPFSURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      console.warn('❌ URL inválida: no es string o está vacía');
      return false;
    }
    
    // Verificar que sea una URL válida
    try {
      new URL(url);
    } catch {
      // Si no es URL válida, verificar si es solo un CID
      return this.isValidCID(url);
    }
    
    // Extraer y validar CID de la URL
    const cid = this.extractCIDFromURL(url);
    if (!cid) {
      console.warn(`❌ URL no contiene CID válido: ${url}`);
      return false;
    }
    
    console.log(`✅ URL IPFS válida con CID: ${cid.slice(0, 15)}...`);
    return true;
  }
  
  // Normalizar CID (extraer solo el CID de una URL)
  static normalizeCID(input: string): string {
    // Si ya es un CID válido, devolverlo tal como está
    if (this.isValidCID(input)) {
      return input;
    }
    
    // Si es una URL, extraer el CID
    const cid = this.extractCIDFromURL(input);
    if (cid) {
      return cid;
    }
    
    // Si no se puede normalizar, devolver el input original
    console.warn(`⚠️ No se pudo normalizar: ${input}`);
    return input;
  }
  
  // Generar información detallada sobre un CID
  static getCIDInfo(cid: string): {
    isValid: boolean;
    version: string;
    format: string;
    length: number;
    prefix: string;
  } {
    const info = {
      isValid: false,
      version: 'unknown',
      format: 'unknown',
      length: cid.length,
      prefix: cid.slice(0, 4)
    };
    
    if (this.isValidCID(cid)) {
      info.isValid = true;
      
      if (cid.startsWith('Qm')) {
        info.version = 'CIDv0';
        info.format = 'base58';
      } else if (cid.startsWith('baf')) {
        info.version = 'CIDv1';
        info.format = 'base32';
      }
    }
    
    return info;
  }
}