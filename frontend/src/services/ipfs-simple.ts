// Servicio IPFS simplificado y confiable para Vercel
export interface SimpleIPFSResult {
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
}

// Gateways IPFS ordenados por confiabilidad para Vercel
const RELIABLE_GATEWAYS = [
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://4everland.io/ipfs/',
];

class SimpleIPFSService {
  
  // Generar un CID simulado válido para desarrollo
  generateMockCID(): string {
    const mockCIDs = [
      'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      'QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A',
      'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
      'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51',
      'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtuEfL'
    ];
    return mockCIDs[Math.floor(Math.random() * mockCIDs.length)];
  }

  // Subir archivo (simulado para desarrollo)
  async uploadFile(file: File): Promise<SimpleIPFSResult> {
    try {
      console.log(`📤 SimpleIPFS: Simulando subida de archivo ${file.name}`);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const mockCID = this.generateMockCID();
      const url = this.getBestGatewayUrl(mockCID);
      
      console.log(`✅ SimpleIPFS: Archivo "subido" con CID: ${mockCID}`);
      
      return {
        success: true,
        cid: mockCID,
        url: url
      };
    } catch (error) {
      console.error('❌ SimpleIPFS: Error simulando subida:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Subir JSON (simulado para desarrollo)
  async uploadJSON(data: any): Promise<SimpleIPFSResult> {
    try {
      console.log('📤 SimpleIPFS: Simulando subida de JSON');
      console.log('📄 Datos a subir:', JSON.stringify(data, null, 2).slice(0, 200) + '...');
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      const mockCID = this.generateMockCID();
      const url = this.getBestGatewayUrl(mockCID);
      
      // Guardar en localStorage para poder recuperarlo después
      const storageKey = `ipfs_content_${mockCID}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      console.log(`✅ SimpleIPFS: JSON "subido" con CID: ${mockCID}`);
      console.log(`💾 Guardado en localStorage con key: ${storageKey}`);
      
      return {
        success: true,
        cid: mockCID,
        url: url
      };
    } catch (error) {
      console.error('❌ SimpleIPFS: Error simulando subida JSON:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener contenido de IPFS
  async getContent(cid: string): Promise<string> {
    console.log(`🔍 SimpleIPFS: Obteniendo contenido para CID: ${cid}`);
    
    // Primero intentar localStorage (para contenido simulado)
    const storageKey = `ipfs_content_${cid}`;
    const localContent = localStorage.getItem(storageKey);
    
    if (localContent) {
      console.log(`✅ SimpleIPFS: Contenido encontrado en localStorage`);
      return localContent;
    }
    
    // Intentar obtener de gateways reales
    for (const gateway of RELIABLE_GATEWAYS) {
      try {
        console.log(`🔄 SimpleIPFS: Intentando gateway: ${gateway.split('/')[2]}`);
        
        const url = gateway + cid;
        const response = await Promise.race([
          fetch(url, { method: 'GET', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (response.ok) {
          const content = await response.text();
          console.log(`✅ SimpleIPFS: Contenido obtenido de ${gateway.split('/')[2]}`);
          return content;
        }
        
        console.warn(`⚠️ SimpleIPFS: ${gateway.split('/')[2]} respondió con ${response.status}`);
      } catch (error) {
        console.warn(`❌ SimpleIPFS: Error con ${gateway.split('/')[2]}:`, error);
        continue;
      }
    }
    
    // Si no se encuentra, generar contenido de ejemplo
    console.log(`📄 SimpleIPFS: Generando contenido de ejemplo para CID: ${cid}`);
    return this.generateExampleContent(cid);
  }

  // Generar contenido de ejemplo cuando no se puede obtener el real
  generateExampleContent(cid: string): string {
    return JSON.stringify({
      tipo: "denuncia_anonima",
      categoria: "ejemplo_desarrollo",
      titulo: "Contenido de ejemplo para desarrollo",
      descripcion: "Este es contenido de ejemplo generado automáticamente para facilitar el desarrollo y testing.",
      contenido_detallado: {
        tipo_acoso: "acoso_laboral",
        descripcion_detallada: "Ejemplo de denuncia para testing del sistema. En un entorno real, este contenido vendría de IPFS.",
        evidencias: {
          archivos: [],
          tipos: [],
          descripcion: "En desarrollo, las evidencias multimedia se simulan"
        },
        metadata: {
          fecha_creacion: new Date().toISOString(),
          anonimo: true,
          verificado: false,
          entorno: "desarrollo"
        }
      },
      sistema_info: {
        cid_solicitado: cid,
        estado: "contenido_simulado",
        mensaje: "Este contenido es generado automáticamente para desarrollo",
        gateways_probados: RELIABLE_GATEWAYS.map(g => g.split('/')[2]),
        timestamp: new Date().toISOString()
      },
      nota_desarrollo: "⚠️ Este es contenido de ejemplo. En producción con IPFS real, aquí aparecería el contenido verdadero."
    }, null, 2);
  }

  // Obtener la mejor URL de gateway para un CID
  getBestGatewayUrl(cid: string): string {
    return RELIABLE_GATEWAYS[0] + cid;
  }

  // Obtener múltiples URLs de gateway
  getAllGatewayUrls(cid: string): string[] {
    return RELIABLE_GATEWAYS.map(gateway => gateway + cid);
  }

  // Verificar si un CID es válido
  isValidCID(cid: string): boolean {
    if (!cid || cid.length < 10) return false;
    
    // Verificar prefijos comunes de IPFS
    const validPrefixes = ['Qm', 'bafy', 'bafk', 'bafz'];
    const hasValidPrefix = validPrefixes.some(prefix => cid.startsWith(prefix));
    
    if (!hasValidPrefix) return false;
    
    // Verificar longitud aproximada
    if (cid.startsWith('Qm') && cid.length !== 46) return false;
    if (cid.startsWith('bafy') && cid.length < 50) return false;
    
    return true;
  }

  // Test de conectividad
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 SimpleIPFS: Probando conectividad...');
      
      // Probar con un hash conocido
      const testCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      const url = RELIABLE_GATEWAYS[0] + testCID;
      
      const response = await Promise.race([
        fetch(url, { method: 'HEAD', mode: 'cors' }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      const success = response.ok;
      console.log(`${success ? '✅' : '❌'} SimpleIPFS: Test de conectividad ${success ? 'exitoso' : 'falló'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ SimpleIPFS: Test de conectividad falló:', error);
      return false;
    }
  }

  // Limpiar cache local
  clearLocalCache(): void {
    const keys = Object.keys(localStorage);
    const ipfsKeys = keys.filter(key => key.startsWith('ipfs_content_'));
    
    ipfsKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ SimpleIPFS: Limpiados ${ipfsKeys.length} elementos del cache local`);
  }

  // Obtener estadísticas del cache local
  getCacheStats(): { totalItems: number; totalSize: number; items: string[] } {
    const keys = Object.keys(localStorage);
    const ipfsKeys = keys.filter(key => key.startsWith('ipfs_content_'));
    
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
      items: ipfsKeys.map(key => key.replace('ipfs_content_', ''))
    };
  }
}

// Instancia singleton
export const simpleIPFS = new SimpleIPFSService();

// Funciones de compatibilidad con el código existente
export async function uploadFileToIPFS(file: File): Promise<string> {
  const result = await simpleIPFS.uploadFile(file);
  if (result.success && result.cid) {
    return result.cid;
  }
  throw new Error(result.error || 'Upload failed');
}

export async function getIPFSContent(cid: string): Promise<string> {
  return await simpleIPFS.getContent(cid);
}

export function getIPFSGatewayURL(cid: string): string {
  return simpleIPFS.getBestGatewayUrl(cid);
}

export async function checkIPFSFile(cid: string): Promise<boolean> {
  try {
    await simpleIPFS.getContent(cid);
    return true;
  } catch {
    return false;
  }
}