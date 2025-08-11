// Servicio especializado para contenido multimedia IPFS optimizado para Vercel
export interface MediaGateway {
  url: string;
  name: string;
  priority: number;
  corsSupport: boolean;
  mediaOptimized: boolean;
}

// Gateways optimizados específicamente para multimedia
const MEDIA_GATEWAYS: MediaGateway[] = [
  {
    url: 'https://dweb.link/ipfs/',
    name: 'dweb.link',
    priority: 1,
    corsSupport: true,
    mediaOptimized: true
  },
  {
    url: 'https://cloudflare-ipfs.com/ipfs/',
    name: 'Cloudflare',
    priority: 2,
    corsSupport: true,
    mediaOptimized: true
  },
  {
    url: 'https://gateway.pinata.cloud/ipfs/',
    name: 'Pinata',
    priority: 3,
    corsSupport: true,
    mediaOptimized: false
  },
  {
    url: 'https://4everland.io/ipfs/',
    name: '4everland',
    priority: 4,
    corsSupport: true,
    mediaOptimized: true
  },
  {
    url: 'https://nftstorage.link/ipfs/',
    name: 'NFT.Storage',
    priority: 5,
    corsSupport: true,
    mediaOptimized: true
  }
];

// Cache para URLs que funcionan
const workingUrlCache = new Map<string, string>();
const failedUrlCache = new Set<string>();

export class IPFSMediaService {
  
  // Obtener URLs ordenadas por prioridad para un hash específico
  static getMediaUrls(hash: string): string[] {
    // Verificar cache primero
    const cachedUrl = workingUrlCache.get(hash);
    if (cachedUrl) {
      // Poner la URL que funciona primero, luego las demás
      const urls = MEDIA_GATEWAYS
        .sort((a, b) => a.priority - b.priority)
        .map(gateway => gateway.url + hash);
      
      const workingIndex = urls.indexOf(cachedUrl);
      if (workingIndex > 0) {
        // Mover la URL que funciona al principio
        urls.splice(workingIndex, 1);
        urls.unshift(cachedUrl);
      }
      return urls;
    }

    // Ordenar por prioridad y optimización para multimedia
    return MEDIA_GATEWAYS
      .sort((a, b) => {
        // Priorizar gateways optimizados para multimedia
        if (a.mediaOptimized && !b.mediaOptimized) return -1;
        if (!a.mediaOptimized && b.mediaOptimized) return 1;
        return a.priority - b.priority;
      })
      .map(gateway => gateway.url + hash)
      .filter(url => !failedUrlCache.has(url));
  }

  // Obtener la mejor URL para un hash (con verificación rápida)
  static async getBestMediaUrl(hash: string): Promise<string> {
    const urls = this.getMediaUrls(hash);
    
    // Si ya tenemos una URL en cache, usarla
    const cachedUrl = workingUrlCache.get(hash);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Probar URLs en paralelo con timeout corto
    const promises = urls.slice(0, 3).map(async (url) => {
      try {
        const response = await Promise.race([
          fetch(url, { method: 'HEAD', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        
        if (response.ok) {
          workingUrlCache.set(hash, url);
          return url;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        failedUrlCache.add(url);
        throw error;
      }
    });

    try {
      // Usar Promise.allSettled y obtener la primera que funcione
      const results = await Promise.allSettled(promises);
      const firstSuccess = results.find(result => result.status === 'fulfilled');
      
      if (firstSuccess && firstSuccess.status === 'fulfilled') {
        return firstSuccess.value;
      }
      
      throw new Error('Todas las URLs fallaron');
    } catch {
      // Si todas fallan, devolver la primera URL como fallback
      return urls[0] || `https://dweb.link/ipfs/${hash}`;
    }
  }

  // Verificar si un hash es válido para multimedia
  static isValidMediaHash(hash: string): boolean {
    if (!hash || hash.length < 10) return false;
    
    // Verificar prefijos IPFS válidos
    const validPrefixes = ['Qm', 'bafy', 'bafk', 'bafz'];
    return validPrefixes.some(prefix => hash.startsWith(prefix));
  }

  // Obtener información del tipo de contenido
  static async getContentInfo(hash: string): Promise<{
    contentType: string;
    size?: number;
    isAccessible: boolean;
  }> {
    try {
      const url = await this.getBestMediaUrl(hash);
      const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
      
      return {
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        size: parseInt(response.headers.get('content-length') || '0'),
        isAccessible: response.ok
      };
    } catch {
      return {
        contentType: 'application/octet-stream',
        isAccessible: false
      };
    }
  }

  // Limpiar cache (útil para debugging)
  static clearCache(): void {
    workingUrlCache.clear();
    failedUrlCache.clear();
  }

  // Obtener estadísticas del cache
  static getCacheStats(): {
    workingUrls: number;
    failedUrls: number;
    gateways: number;
  } {
    return {
      workingUrls: workingUrlCache.size,
      failedUrls: failedUrlCache.size,
      gateways: MEDIA_GATEWAYS.length
    };
  }
}

// Función de compatibilidad para el código existente
export function getOptimizedMediaUrls(hash: string): string[] {
  return IPFSMediaService.getMediaUrls(hash);
}

export async function getBestMediaUrl(hash: string): Promise<string> {
  return IPFSMediaService.getBestMediaUrl(hash);
}