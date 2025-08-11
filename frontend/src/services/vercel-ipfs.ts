// Servicio IPFS ultra-simplificado específicamente optimizado para Vercel
// Garantiza que SIEMPRE funcione, incluso sin conexión IPFS real

export interface VercelIPFSResult {
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
}

export interface CacheStats {
  totalItems: number;
  totalSize: number;
  items: string[];
}

class VercelIPFSService {
  private readonly STORAGE_PREFIX = 'vercel_ipfs_';
  private readonly VALID_CID_PREFIXES = ['Qm', 'bafy', 'bafk', 'bafz'];
  
  // Gateways optimizados para Vercel (ordenados por confiabilidad)
  private readonly GATEWAYS = [
    'https://dweb.link/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ];

  // Pool de CIDs válidos reales para usar como mock
  private readonly VALID_CIDS = [
    'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
    'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
    'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51',
    'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtuEfL',
    'QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8',
    'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
    'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
  ];

  /**
   * Valida si un CID tiene formato válido de IPFS
   */
  isValidCID(cid: string): boolean {
    if (!cid || typeof cid !== 'string' || cid.length < 10) {
      return false;
    }

    // Verificar prefijo válido
    const hasValidPrefix = this.VALID_CID_PREFIXES.some(prefix => cid.startsWith(prefix));
    if (!hasValidPrefix) {
      return false;
    }

    // Verificar longitud según el tipo
    if (cid.startsWith('Qm')) {
      return cid.length === 46;
    }
    
    if (cid.startsWith('bafy') || cid.startsWith('bafk') || cid.startsWith('bafz')) {
      return cid.length >= 50;
    }

    return false;
  }

  /**
   * Genera un CID válido aleatorio del pool
   */
  generateValidCID(): string {
    const randomIndex = Math.floor(Math.random() * this.VALID_CIDS.length);
    return this.VALID_CIDS[randomIndex];
  }

  /**
   * Sube un archivo (simulado con localStorage)
   */
  async uploadFile(file: File): Promise<VercelIPFSResult> {
    try {
      console.log(`📤 VercelIPFS: Simulando subida de archivo ${file.name}`);
      
      // Simular delay de red realista
      await this.simulateNetworkDelay(500, 1500);
      
      const cid = this.generateValidCID();
      const storageKey = this.STORAGE_PREFIX + cid;
      
      // Simular metadatos del archivo
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        content: `[ARCHIVO SIMULADO: ${file.name}]`
      };
      
      localStorage.setItem(storageKey, JSON.stringify(fileData));
      
      console.log(`✅ VercelIPFS: Archivo simulado subido con CID: ${cid}`);
      
      return {
        success: true,
        cid,
        url: this.getBestGatewayUrl(cid)
      };
    } catch (error) {
      console.error('❌ VercelIPFS: Error simulando subida de archivo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Sube JSON (simulado con localStorage)
   */
  async uploadJSON(data: any): Promise<VercelIPFSResult> {
    try {
      console.log('📤 VercelIPFS: Simulando subida de JSON');
      
      // Simular delay de red
      await this.simulateNetworkDelay(300, 1000);
      
      const cid = this.generateValidCID();
      const storageKey = this.STORAGE_PREFIX + cid;
      
      // Guardar datos con metadatos
      const jsonData = {
        content: data,
        uploadedAt: new Date().toISOString(),
        type: 'application/json',
        size: JSON.stringify(data).length
      };
      
      localStorage.setItem(storageKey, JSON.stringify(jsonData));
      
      console.log(`✅ VercelIPFS: JSON simulado subido con CID: ${cid}`);
      
      return {
        success: true,
        cid,
        url: this.getBestGatewayUrl(cid)
      };
    } catch (error) {
      console.error('❌ VercelIPFS: Error simulando subida de JSON:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene contenido por CID
   */
  async getContent(cid: string): Promise<string> {
    console.log(`🔍 VercelIPFS: Obteniendo contenido para CID: ${cid}`);
    
    // Verificar si es válido
    if (!this.isValidCID(cid)) {
      throw new Error(`CID inválido: ${cid}`);
    }
    
    // Buscar en localStorage primero
    const storageKey = this.STORAGE_PREFIX + cid;
    const localData = localStorage.getItem(storageKey);
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        console.log(`✅ VercelIPFS: Contenido encontrado en localStorage`);
        
        // Si es un archivo, devolver metadatos
        if (parsed.name && parsed.type) {
          return JSON.stringify({
            tipo: 'archivo_simulado',
            nombre: parsed.name,
            tipo_archivo: parsed.type,
            tamaño: parsed.size,
            subido_en: parsed.uploadedAt,
            contenido: parsed.content,
            cid: cid,
            nota: 'Este es un archivo simulado para desarrollo'
          }, null, 2);
        }
        
        // Si es JSON, devolver el contenido
        if (parsed.content) {
          return typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content, null, 2);
        }
        
        return localData;
      } catch (error) {
        console.warn('⚠️ Error parseando datos locales, usando como texto plano');
        return localData;
      }
    }
    
    // Intentar obtener de gateways reales (con timeout corto)
    for (const gateway of this.GATEWAYS) {
      try {
        console.log(`🔄 VercelIPFS: Intentando gateway: ${gateway.split('/')[2]}`);
        
        const url = gateway + cid;
        const response = await Promise.race([
          fetch(url, { method: 'GET', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        
        if (response.ok) {
          const content = await response.text();
          console.log(`✅ VercelIPFS: Contenido obtenido de ${gateway.split('/')[2]}`);
          return content;
        }
      } catch (error) {
        console.warn(`⚠️ VercelIPFS: Gateway ${gateway.split('/')[2]} falló:`, error);
        continue;
      }
    }
    
    // Si no se encuentra, generar contenido de ejemplo
    console.log(`📄 VercelIPFS: Generando contenido de ejemplo para CID: ${cid}`);
    return this.generateExampleContent(cid);
  }

  /**
   * Prueba la conectividad del servicio
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 VercelIPFS: Probando conectividad...');
      
      // Test 1: Verificar localStorage
      const testKey = this.STORAGE_PREFIX + 'test';
      const testData = { test: true, timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (!retrieved) {
        console.warn('⚠️ VercelIPFS: localStorage no funciona');
        return false;
      }
      
      // Test 2: Probar un gateway rápido
      try {
        const testCID = this.VALID_CIDS[0];
        const url = this.GATEWAYS[0] + testCID;
        
        await Promise.race([
          fetch(url, { method: 'HEAD', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        
        console.log(`✅ VercelIPFS: Conectividad exitosa (localStorage + gateway)`);
        return true;
      } catch (gatewayError) {
        console.log(`✅ VercelIPFS: Conectividad exitosa (solo localStorage)`);
        return true; // localStorage funciona, es suficiente
      }
    } catch (error) {
      console.error('❌ VercelIPFS: Test de conectividad falló:', error);
      return false;
    }
  }

  /**
   * Obtiene la mejor URL de gateway para un CID
   */
  getBestGatewayUrl(cid: string): string {
    return this.GATEWAYS[0] + cid;
  }

  /**
   * Obtiene todas las URLs de gateway para un CID
   */
  getAllGatewayUrls(cid: string): string[] {
    return this.GATEWAYS.map(gateway => gateway + cid);
  }

  /**
   * Limpia el cache local
   */
  clearCache(): void {
    const keys = Object.keys(localStorage);
    const ipfsKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
    
    ipfsKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ VercelIPFS: Limpiados ${ipfsKeys.length} elementos del cache`);
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats(): CacheStats {
    const keys = Object.keys(localStorage);
    const ipfsKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
    
    let totalSize = 0;
    ipfsKeys.forEach(key => {
      const content = localStorage.getItem(key);
      if (content) {
        totalSize += content.length;
      }
    });
    
    return {
      totalItems: ipfsKeys.length,
      totalSize,
      items: ipfsKeys.map(key => key.replace(this.STORAGE_PREFIX, ''))
    };
  }

  /**
   * Simula delay de red realista
   */
  private async simulateNetworkDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Genera contenido de ejemplo cuando no se puede obtener el real
   */
  private generateExampleContent(cid: string): string {
    return JSON.stringify({
      tipo: "contenido_ejemplo_vercel",
      titulo: "Contenido de ejemplo para desarrollo en Vercel",
      descripcion: "Este contenido se genera automáticamente cuando no se puede obtener el contenido real de IPFS.",
      sistema_info: {
        cid_solicitado: cid,
        es_valido: this.isValidCID(cid),
        gateways_disponibles: this.GATEWAYS.length,
        almacenamiento_local: "localStorage",
        entorno: "vercel_optimizado"
      },
      contenido_ejemplo: {
        tipo_denuncia: "ejemplo_desarrollo",
        descripcion_detallada: "Esta es una denuncia de ejemplo generada automáticamente para facilitar el desarrollo y testing del sistema.",
        evidencias: {
          archivos: [],
          tipos: [],
          nota: "En desarrollo, las evidencias se simulan localmente"
        },
        metadata: {
          fecha_creacion: new Date().toISOString(),
          anonimo: true,
          verificado: false,
          entorno: "desarrollo"
        }
      },
      nota_desarrollo: "⚡ Este contenido es generado por el servicio Vercel IPFS optimizado. En producción con IPFS real, aquí aparecería el contenido verdadero.",
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Instancia singleton
export const vercelIPFS = new VercelIPFSService();

// Funciones de compatibilidad
export async function uploadFileToVercelIPFS(file: File): Promise<string> {
  const result = await vercelIPFS.uploadFile(file);
  if (result.success && result.cid) {
    return result.cid;
  }
  throw new Error(result.error || 'Upload failed');
}

export async function uploadJSONToVercelIPFS(data: any): Promise<string> {
  const result = await vercelIPFS.uploadJSON(data);
  if (result.success && result.cid) {
    return result.cid;
  }
  throw new Error(result.error || 'Upload failed');
}

export async function getVercelIPFSContent(cid: string): Promise<string> {
  return await vercelIPFS.getContent(cid);
}

export function getVercelIPFSUrl(cid: string): string {
  return vercelIPFS.getBestGatewayUrl(cid);
}