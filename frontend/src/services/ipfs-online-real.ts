// Servicio IPFS ONLINE REAL - Usa gateways públicos que realmente funcionan

export interface OnlineIPFSResult {
  success: boolean;
  content: string;
  cid: string;
  source: 'gateway' | 'subdomain' | 'proxy' | 'cache';
  gateway?: string;
  responseTime?: number;
  error?: string;
}

class OnlineIPFSRealService {
  private readonly CACHE_PREFIX = 'online_ipfs_';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  
  // Gateways IPFS públicos REALES que funcionan (verificados manualmente)
  private readonly WORKING_GATEWAYS = [
    'https://ipfs.io/ipfs/',                    // Gateway oficial - SIEMPRE funciona
    'https://dweb.link/ipfs/',                  // Protocol Labs - muy confiable
    'https://gateway.ipfs.io/ipfs/',            // Gateway oficial alternativo
    'https://cloudflare-ipfs.com/ipfs/',        // Cloudflare - puede funcionar
    'https://gateway.pinata.cloud/ipfs/',       // Pinata público
    'https://4everland.io/ipfs/',               // 4everland
    'https://nftstorage.link/ipfs/',            // NFT.Storage
    'https://w3s.link/ipfs/',                   // Web3.Storage
  ];

  // Subdominios IPFS (mejor para CORS)
  private readonly SUBDOMAIN_GATEWAYS = [
    (cid: string) => `https://${cid}.ipfs.dweb.link/`,
    (cid: string) => `https://${cid}.ipfs.cf-ipfs.com/`,
    (cid: string) => `https://${cid}.ipfs.4everland.io/`,
  ];

  // Proxies CORS públicos
  private readonly CORS_PROXIES = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  // Cache de gateways funcionales
  private workingGateways: string[] = [...this.WORKING_GATEWAYS];
  private lastGatewayTest = 0;
  private readonly GATEWAY_TEST_INTERVAL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener contenido IPFS online real
   */
  async getContent(cid: string): Promise<OnlineIPFSResult> {
    console.log(`🌐 [Online Real] Obteniendo contenido para CID: ${cid}`);

    // Estrategia 1: Verificar cache local
    const cachedContent = this.getCachedContent(cid);
    if (cachedContent) {
      console.log(`✅ [Cache] Contenido encontrado en cache`);
      return {
        success: true,
        content: cachedContent,
        cid: cid,
        source: 'cache'
      };
    }

    // Estrategia 2: Probar gateways directos en paralelo
    try {
      const gatewayResult = await this.fetchFromGateways(cid);
      if (gatewayResult.success) {
        console.log(`✅ [Gateway] Contenido obtenido de: ${gatewayResult.gateway}`);
        this.setCachedContent(cid, gatewayResult.content);
        return gatewayResult;
      }
    } catch (error) {
      console.warn(`⚠️ [Gateway] Gateways directos fallaron: ${error}`);
    }

    // Estrategia 3: Probar subdominios IPFS
    try {
      const subdomainResult = await this.fetchFromSubdomains(cid);
      if (subdomainResult.success) {
        console.log(`✅ [Subdomain] Contenido obtenido via subdominio`);
        this.setCachedContent(cid, subdomainResult.content);
        return subdomainResult;
      }
    } catch (error) {
      console.warn(`⚠️ [Subdomain] Subdominios fallaron: ${error}`);
    }

    // Estrategia 4: Usar proxies CORS
    try {
      const proxyResult = await this.fetchViaProxies(cid);
      if (proxyResult.success) {
        console.log(`✅ [Proxy] Contenido obtenido via proxy`);
        this.setCachedContent(cid, proxyResult.content);
        return proxyResult;
      }
    } catch (error) {
      console.warn(`⚠️ [Proxy] Proxies fallaron: ${error}`);
    }

    // Si todo falla, devolver error
    return {
      success: false,
      content: '',
      cid: cid,
      source: 'gateway',
      error: 'No se pudo obtener contenido de ningún gateway online'
    };
  }

  /**
   * Probar gateways directos en paralelo
   */
  private async fetchFromGateways(cid: string): Promise<OnlineIPFSResult> {
    console.log(`🚀 Probando ${this.workingGateways.length} gateways en paralelo...`);

    const promises = this.workingGateways.map(async (gateway) => {
      const startTime = Date.now();
      try {
        const url = gateway + cid;
        console.log(`🔄 Probando: ${gateway.split('/')[2]}`);
        
        const response = await Promise.race([
          fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'Mozilla/5.0 (compatible; IPFS-Client/1.0)',
            }
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 6000)
          )
        ]);

        if (response.ok) {
          const content = await response.text();
          const responseTime = Date.now() - startTime;
          
          if (content && content.trim().length > 0 && !this.isErrorPage(content)) {
            console.log(`✅ Gateway exitoso: ${gateway.split('/')[2]} (${responseTime}ms)`);
            return {
              success: true,
              content,
              cid,
              source: 'gateway' as const,
              gateway: gateway.split('/')[2],
              responseTime
            };
          }
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.warn(`❌ Gateway ${gateway.split('/')[2]} falló: ${error} (${responseTime}ms)`);
        return {
          success: false,
          content: '',
          cid,
          source: 'gateway' as const,
          gateway: gateway.split('/')[2],
          responseTime,
          error: error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    });

    // Usar Promise.allSettled para obtener todos los resultados
    const results = await Promise.allSettled(promises);
    
    // Buscar el primer resultado exitoso
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        return result.value;
      }
    }

    throw new Error('Todos los gateways directos fallaron');
  }

  /**
   * Probar subdominios IPFS
   */
  private async fetchFromSubdomains(cid: string): Promise<OnlineIPFSResult> {
    console.log(`🔄 Probando subdominios IPFS para: ${cid.slice(0, 10)}...`);

    for (const subdomainFn of this.SUBDOMAIN_GATEWAYS) {
      try {
        const url = subdomainFn(cid);
        const startTime = Date.now();
        
        console.log(`🔄 Probando subdominio: ${url.split('/')[2]}`);
        
        const response = await Promise.race([
          fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json, text/plain, */*',
            }
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ]);

        if (response.ok) {
          const content = await response.text();
          const responseTime = Date.now() - startTime;
          
          if (content && content.trim().length > 0 && !this.isErrorPage(content)) {
            console.log(`✅ Subdominio exitoso: ${url.split('/')[2]} (${responseTime}ms)`);
            return {
              success: true,
              content,
              cid,
              source: 'subdomain',
              gateway: url.split('/')[2],
              responseTime
            };
          }
        }
      } catch (error) {
        console.warn(`❌ Subdominio falló: ${error}`);
        continue;
      }
    }

    throw new Error('Todos los subdominios fallaron');
  }

  /**
   * Usar proxies CORS
   */
  private async fetchViaProxies(cid: string): Promise<OnlineIPFSResult> {
    console.log(`🔄 Probando proxies CORS para: ${cid.slice(0, 10)}...`);

    for (const proxyFn of this.CORS_PROXIES) {
      // Usar solo los mejores gateways con proxies
      for (const gateway of this.workingGateways.slice(0, 3)) {
        try {
          const originalUrl = gateway + cid;
          const proxyUrl = proxyFn(originalUrl);
          const startTime = Date.now();
          
          console.log(`🔄 Probando proxy: ${proxyUrl.split('?')[0]}`);
          
          const response = await Promise.race([
            fetch(proxyUrl, { 
              method: 'GET', 
              mode: 'cors',
              headers: {
                'Accept': 'application/json, text/plain, */*',
              }
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Proxy timeout')), 10000)
            )
          ]);

          if (response.ok) {
            let content: string;
            const responseTime = Date.now() - startTime;
            
            // Manejar diferentes formatos de proxy
            if (proxyUrl.includes('allorigins.win')) {
              const data = await response.json();
              content = data.contents;
            } else {
              content = await response.text();
            }

            if (content && content.trim().length > 0 && !this.isErrorPage(content)) {
              console.log(`✅ Proxy exitoso: ${proxyUrl.split('?')[0]} (${responseTime}ms)`);
              return {
                success: true,
                content,
                cid,
                source: 'proxy',
                gateway: proxyUrl.split('?')[0],
                responseTime
              };
            }
          }
        } catch (error) {
          console.warn(`❌ Proxy falló: ${error}`);
          continue;
        }
      }
    }

    throw new Error('Todos los proxies fallaron');
  }

  /**
   * Verificar si el contenido es una página de error
   */
  private isErrorPage(content: string): boolean {
    const errorIndicators = [
      '404 Not Found',
      '422 Unprocessable',
      'CID (the part after /ipfs/) is incorrect',
      '<!DOCTYPE html>',
      '<html',
      '<title>Error',
      'Gateway Timeout',
      'Service Unavailable'
    ];

    const lowerContent = content.toLowerCase();
    return errorIndicators.some(indicator => 
      lowerContent.includes(indicator.toLowerCase())
    );
  }

  /**
   * Test de conectividad online
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Probando conectividad online IPFS...');
      
      // Probar con un CID conocido que existe
      const testCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      
      // Probar solo los primeros 3 gateways para el test
      const testGateways = this.workingGateways.slice(0, 3);
      
      for (const gateway of testGateways) {
        try {
          const url = gateway + testCid;
          const response = await Promise.race([
            fetch(url, { method: 'HEAD', mode: 'cors' }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]);
          
          if (response.ok) {
            console.log(`✅ Online IPFS: Gateway ${gateway.split('/')[2]} funcionando`);
            return true;
          }
        } catch (error) {
          console.warn(`⚠️ Gateway ${gateway.split('/')[2]} falló en test: ${error}`);
          continue;
        }
      }
      
      console.warn('⚠️ Todos los gateways fallaron en test de conectividad');
      return false;
    } catch (error) {
      console.error('❌ Error en test de conectividad online:', error);
      return false;
    }
  }

  /**
   * Actualizar lista de gateways funcionales
   */
  async updateWorkingGateways(): Promise<void> {
    const now = Date.now();
    if (now - this.lastGatewayTest < this.GATEWAY_TEST_INTERVAL) {
      return; // No probar muy frecuentemente
    }

    console.log('🔄 Actualizando lista de gateways funcionales...');
    this.lastGatewayTest = now;

    const testCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
    const workingGateways: string[] = [];

    for (const gateway of this.WORKING_GATEWAYS) {
      try {
        const url = gateway + testCid;
        const response = await Promise.race([
          fetch(url, { method: 'HEAD', mode: 'cors' }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        
        if (response.ok) {
          workingGateways.push(gateway);
          console.log(`✅ Gateway funcional: ${gateway.split('/')[2]}`);
        }
      } catch (error) {
        console.warn(`❌ Gateway no funcional: ${gateway.split('/')[2]}`);
      }
    }

    if (workingGateways.length > 0) {
      this.workingGateways = workingGateways;
      console.log(`📊 Gateways funcionales actualizados: ${workingGateways.length}/${this.WORKING_GATEWAYS.length}`);
    }
  }

  /**
   * Obtener contenido del cache
   */
  private getCachedContent(cid: string): string | null {
    try {
      const cacheKey = this.CACHE_PREFIX + cid;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const now = Date.now();
        
        if (now - parsedCache.timestamp < this.CACHE_DURATION) {
          return parsedCache.content;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Error accediendo al cache:', error);
    }
    
    return null;
  }

  /**
   * Guardar contenido en cache
   */
  private setCachedContent(cid: string, content: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + cid;
      const cacheData = {
        content: content,
        timestamp: Date.now(),
        cid: cid
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error guardando en cache:', error);
    }
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cache online limpiado: ${cacheKeys.length} elementos`);
    } catch (error) {
      console.warn('Error limpiando cache:', error);
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats(): { 
    totalGateways: number; 
    workingGateways: number; 
    cacheItems: number;
    lastTest: string | null;
  } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      return {
        totalGateways: this.WORKING_GATEWAYS.length,
        workingGateways: this.workingGateways.length,
        cacheItems: cacheKeys.length,
        lastTest: this.lastGatewayTest > 0 ? new Date(this.lastGatewayTest).toLocaleString() : null
      };
    } catch (error) {
      return {
        totalGateways: this.WORKING_GATEWAYS.length,
        workingGateways: this.workingGateways.length,
        cacheItems: 0,
        lastTest: null
      };
    }
  }
}

// Instancia singleton
export const onlineIPFSReal = new OnlineIPFSRealService();

// Funciones de compatibilidad
export async function getOnlineRealContent(cid: string): Promise<string> {
  const result = await onlineIPFSReal.getContent(cid);
  if (result.success) {
    return result.content;
  }
  throw new Error(result.error || 'Failed to get content from online IPFS');
}

export async function testOnlineReal(): Promise<boolean> {
  return await onlineIPFSReal.testConnection();
}

export function getOnlineRealUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}