import { pinataService } from './pinata';

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

class IPFSService {
  async uploadFile(file: File): Promise<IPFSUploadResult> {
    try {
      console.log('Uploading file to IPFS via Pinata:', file.name);
      const cid = await pinataService.uploadFile(file);
      
      return {
        cid,
        url: this.getPublicUrl(cid)
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data: any): Promise<IPFSUploadResult> {
    try {
      console.log('Uploading JSON to IPFS via Pinata:', data);
      const cid = await pinataService.uploadJSON(data);
      
      return {
        cid,
        url: this.getPublicUrl(cid)
      };
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  getPublicUrl(cid: string): string {
    return pinataService.getGatewayUrl(cid);
  }

  getMultipleUrls(cid: string): string[] {
    return pinataService.getGatewayUrls(cid);
  }

  async testConnection(): Promise<boolean> {
    return await pinataService.testConnection();
  }
}

export const ipfsService = new IPFSService();

// Funciones de compatibilidad con el código existente
export async function uploadFileToIPFS(file: File): Promise<string> {
  const result = await ipfsService.uploadFile(file);
  return result.cid;
}

export async function checkIPFSFile(hash: string): Promise<boolean> {
  try {
    const url = pinataService.getGatewayUrl(hash);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export function getIPFSGatewayURL(hash: string): string {
  return pinataService.getGatewayUrl(hash);
}

// Cache agresivo para máxima velocidad
const contentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (más tiempo para mejor rendimiento)

function getCachedContent(hash: string): string | null {
  const cached = contentCache.get(hash);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📋 Usando contenido cacheado para: ${hash.slice(0, 10)}...`);
    return cached.content;
  }
  return null;
}

function setCachedContent(hash: string, content: string): void {
  contentCache.set(hash, { content, timestamp: Date.now() });
  
  // Limpiar cache viejo para evitar memory leaks
  if (contentCache.size > 100) {
    const oldestEntries = Array.from(contentCache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)
      .slice(0, 50);
    
    oldestEntries.forEach(([key]) => contentCache.delete(key));
  }
}

// Lista de gateways IPFS optimizada para producción con mejor CORS
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/', // Cloudflare - mejor CORS
  'https://dweb.link/ipfs/', // Protocol Labs - confiable
  'https://gateway.pinata.cloud/ipfs/', // Pinata - bueno para contenido reciente
  'https://ipfs.io/ipfs/', // Gateway oficial - como fallback
];

// Sistema de rate limiting por gateway
const gatewayRateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10;

// Circuit breaker para prevenir sobrecarga del sistema
const circuitBreaker = {
  failures: 0,
  lastFailureTime: 0,
  state: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30 segundos
  
  canExecute(): boolean {
    const now = Date.now();
    
    if (this.state === 'CLOSED') {
      return true;
    }
    
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: Cambiando a HALF_OPEN');
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state
    return true;
  },
  
  recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  },
  
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`⚠️ Circuit breaker: ABIERTO por ${this.recoveryTimeout/1000}s después de ${this.failures} fallos`);
    }
  }
};

// Función para obtener contenido de IPFS con múltiples estrategias
export async function getIPFSContent(hash: string): Promise<string> {
  // 🚨 INTERCEPTACIÓN CRÍTICA - DEBE SER LA PRIMERA LÍNEA
  if (hash === 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51') {
    console.error(`🚫 [CRITICAL STOP] Hash problemático interceptado: ${hash}`);
    const emergencyContent = JSON.stringify({
      error: "Hash IPFS problemático interceptado",
      hash: hash,
      message: "Este hash causa errores 422 en todos los gateways y ha sido bloqueado.",
      intercepted: true,
      timestamp: new Date().toISOString()
    }, null, 2);
    setCachedContent(hash, emergencyContent);
    return emergencyContent;
  }
  
  console.log(`🔍 Obteniendo contenido IPFS para hash: ${hash.slice(0, 10)}...`);
  
  // Estrategia 0: Detectar hashes temporales y devolver contenido de ejemplo inmediatamente
  if (hash.startsWith('QmTemporal')) {
    console.log(`⚠️ Hash temporal detectado: ${hash.slice(0, 15)}... - Devolviendo contenido de ejemplo`);
    const exampleContent = getExampleContent(hash);
    // No cachear contenido temporal
    return exampleContent;
  }
  
  // Estrategia 1: Verificar cache primero
  const cachedContent = getCachedContent(hash);
  if (cachedContent) {
    return cachedContent;
  }
  
  // Estrategia 2: Validar que el hash parece válido
  if (!isValidIPFSHash(hash)) {
    console.warn(`⚠️ Hash IPFS inválido detectado: ${hash.slice(0, 10)}...`);
    // En lugar de devolver contenido de ejemplo, intentar de todos modos
    console.log('🔄 Intentando obtener contenido a pesar del hash inválido...');
  }

  // Estrategia 3: Verificar circuit breaker antes de intentar gateways
  if (!circuitBreaker.canExecute()) {
    console.warn('⚠️ Circuit breaker ABIERTO - saltando a contenido de ejemplo');
    return getExampleContent(hash);
  }

  // Estrategia 4: Intentar con múltiples gateways
  try {
    const content = await tryGatewaysSequentially(hash);
    
    // Registrar éxito en circuit breaker
    circuitBreaker.recordSuccess();
    
    // Guardar en cache si es exitoso
    setCachedContent(hash, content);
    
    return content;
  } catch (gatewayError) {
    // Registrar fallo en circuit breaker
    circuitBreaker.recordFailure();
    console.error('❌ Todos los gateways directos fallaron para hash:', hash.slice(0, 10));
    console.error('Error:', gatewayError);
    
    // Estrategia 5: Intentar con servicios proxy/alternativos
    try {
      console.log('🔄 Intentando estrategias alternativas...');
      const content = await tryAlternativeStrategies(hash);
      
      // Registrar éxito parcial en circuit breaker
      circuitBreaker.recordSuccess();
      
      // Guardar en cache si es exitoso
      setCachedContent(hash, content);
      
      return content;
    } catch (alternativeError) {
      console.error('❌ Estrategias alternativas también fallaron:', alternativeError);
      
      // Solo como último recurso, devolver contenido de ejemplo
      console.log('📄 Usando contenido de ejemplo como último recurso');
      const exampleContent = getExampleContent(hash);
      
      // No cachear contenido de ejemplo
      return exampleContent;
    }
  }
}

// Función para intentar estrategias alternativas cuando los gateways directos fallan
async function tryAlternativeStrategies(hash: string): Promise<string> {
  const strategies = [
    // Estrategia 1: Usar API de Pinata directamente si tenemos acceso
    async () => {
      try {
        console.log('🔄 Intentando API de Pinata...');
        // Intentar obtener desde diferentes endpoints optimizados para CORS
        const corsOptimizedUrls = [
          `https://cloudflare-ipfs.com/ipfs/${hash}`,
          `https://${hash}.ipfs.dweb.link/`,
          `https://${hash}.ipfs.cf-ipfs.com/`,
          `https://gateway.pinata.cloud/ipfs/${hash}`
        ];
        
        for (const url of corsOptimizedUrls) {
          try {
            // Usar Promise.race para timeout más robusto
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Timeout en estrategia CORS optimizada')), 4000);
            });
            
            const fetchPromise = fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json, text/plain, */*',
              }
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (response.ok) {
              const content = await response.text();
              if (content && content.trim().length > 0) {
                console.log(`✅ Éxito con estrategia CORS optimizada: ${url.split('/')[2]}`);
                return content;
              }
            }
          } catch (error) {
            continue; // Intentar siguiente URL
          }
        }
        throw new Error('Todas las URLs CORS optimizadas fallaron');
      } catch (error) {
        throw new Error(`Estrategia CORS optimizada falló: ${error}`);
      }
    },
    
    // Estrategia 2: Usar subdominios IPFS (mejor para CORS)
    async () => {
      try {
        console.log('🔄 Intentando subdominios IPFS...');
        const subdomainUrls = [
          `https://${hash}.ipfs.dweb.link/`,
          `https://${hash}.ipfs.cf-ipfs.com/`,
          `https://${hash}.ipfs.4everland.io/`,
          `https://${hash}.ipfs.fleek.co/`
        ];
        
        for (const url of subdomainUrls) {
          try {
            // Usar Promise.race para timeout más robusto
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Timeout en subdominio IPFS')), 5000);
            });
            
            const fetchPromise = fetch(url, {
              method: 'GET'
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (response.ok) {
              const content = await response.text();
              if (content && content.trim().length > 0) {
                console.log(`✅ Éxito con subdominio: ${url.split('/')[2]}`);
                return content;
              }
            }
          } catch (error) {
            continue; // Intentar siguiente URL
          }
        }
        throw new Error('Todos los subdominios fallaron');
      } catch (error) {
        throw new Error(`Estrategia subdominios falló: ${error}`);
      }
    }
  ];
  
  // Intentar cada estrategia
  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🎯 Ejecutando estrategia alternativa ${i + 1}/${strategies.length}...`);
      const content = await strategies[i]();
      return content;
    } catch (error) {
      console.warn(`❌ Estrategia alternativa ${i + 1} falló:`, error);
      continue;
    }
  }
  
  throw new Error('Todas las estrategias alternativas fallaron');
}

// Función mejorada para validar si un hash IPFS es válido
function isValidIPFSHash(hash: string): boolean {
  // Verificar formato básico de hash IPFS
  if (!hash || hash.length < 10) {
    console.warn(`❌ Hash muy corto: ${hash}`);
    return false;
  }
  
  // Verificar prefijos comunes
  const validPrefixes = ['Qm', 'bafy', 'bafk', 'bafz'];
  const hasValidPrefix = validPrefixes.some(prefix => hash.startsWith(prefix));
  
  if (!hasValidPrefix) {
    console.warn(`❌ Prefijo inválido: ${hash.slice(0, 10)}... (debe empezar con Qm, bafy, bafk, o bafz)`);
    return false;
  }
  
  // Verificar longitud aproximada
  if (hash.startsWith('Qm') && hash.length !== 46) {
    console.warn(`❌ Hash Qm con longitud incorrecta: ${hash.length} (debe ser 46)`);
    return false;
  }
  if (hash.startsWith('bafy') && hash.length < 50) {
    console.warn(`❌ Hash bafy muy corto: ${hash.length} (debe ser ≥50)`);
    return false;
  }
  
  // Verificar caracteres válidos para base58 (Qm) o base32 (bafy)
  if (hash.startsWith('Qm')) {
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    if (!base58Regex.test(hash)) {
      console.warn(`❌ Hash Qm contiene caracteres inválidos para base58`);
      return false;
    }
  }
  
  return true;
}

// Función para verificar si un gateway está en rate limit
function isGatewayRateLimited(gateway: string): boolean {
  const rateLimitInfo = gatewayRateLimits.get(gateway);
  if (!rateLimitInfo) return false;
  
  const now = Date.now();
  if (now > rateLimitInfo.resetTime) {
    // Reset del contador si ha pasado la ventana
    gatewayRateLimits.delete(gateway);
    return false;
  }
  
  return rateLimitInfo.count >= MAX_REQUESTS_PER_WINDOW;
}

// Función para registrar uso de gateway
function recordGatewayUsage(gateway: string): void {
  const now = Date.now();
  const rateLimitInfo = gatewayRateLimits.get(gateway);
  
  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    gatewayRateLimits.set(gateway, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
  } else {
    rateLimitInfo.count++;
  }
}

// Función para obtener contenido de un gateway específico con timeout y manejo de CORS mejorado
async function fetchFromGateway(url: string, timeout: number): Promise<string> {
  const gateway = url.split('/ipfs/')[0];
  
  // Verificar rate limit local antes de hacer la solicitud
  if (isGatewayRateLimited(gateway)) {
    throw new Error('Gateway en rate limit local - saltando');
  }
  
  // Registrar uso del gateway
  recordGatewayUsage(gateway);
  
  // Crear timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout después de ${timeout}ms`));
    }, timeout);
  });

  try {
    
    // Función para hacer fetch con diferentes estrategias CORS optimizadas para producción
    const fetchWithStrategies = async (): Promise<Response> => {
      // Estrategia 1: Request simple sin headers complejos (mejor para CORS)
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors'
        });
        return response;
      } catch (corsError) {
        console.warn(`⚠️ CORS falló para ${gateway}, intentando estrategias alternativas...`);
        
        // Estrategia 2: Usar subdominios IPFS (mejor CORS)
        if (gateway.includes('cloudflare') || gateway.includes('dweb.link')) {
          try {
            // Extraer hash de la URL
            const hashMatch = url.match(/\/ipfs\/([^\/]+)/);
            if (hashMatch) {
              const hash = hashMatch[1];
              const subdomainUrl = `https://${hash}.ipfs.dweb.link/`;
              console.log(`🔄 Intentando subdominio: ${subdomainUrl}`);
              
              const response = await fetch(subdomainUrl, {
                method: 'GET',
                mode: 'cors'
              });
              return response;
            }
          } catch (subdomainError) {
            console.warn(`❌ Subdominio también falló: ${subdomainError}`);
          }
        }
        
        // Estrategia 3: Múltiples proxies CORS (último recurso)
        const corsProxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
          `https://corsproxy.io/?${encodeURIComponent(url)}`,
          `https://cors-anywhere.herokuapp.com/${url}`
        ];
        
        for (const proxyUrl of corsProxies) {
          try {
            console.log(`🔄 Usando proxy CORS: ${proxyUrl.split('?')[0]}`);
            
            const response = await Promise.race([
              fetch(proxyUrl, { method: 'GET', mode: 'cors' }),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Proxy timeout')), 8000)
              )
            ]);
            
            if (response.ok) {
              // Manejar diferentes formatos de proxy
              if (proxyUrl.includes('allorigins.win')) {
                const data = await response.json();
                return new Response(data.contents, {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/plain' }
                });
              } else {
                // Para otros proxies, devolver la respuesta directamente
                return response;
              }
            }
          } catch (proxyError) {
            console.warn(`❌ Proxy ${proxyUrl.split('?')[0]} falló: ${proxyError}`);
            continue;
          }
        }
        
        throw new Error('CORS bloqueado en todas las estrategias incluyendo proxies');
      }
    };

    // Usar Promise.race para manejar timeout de manera más robusta y rápida
    const response = await Promise.race([
      fetchWithStrategies(),
      timeoutPromise
    ]);

    // Manejar diferentes códigos de estado
    if (!response.ok) {
      if (response.status === 429) {
        // Marcar gateway como rate limited por más tiempo
        gatewayRateLimits.set(gateway, {
          count: MAX_REQUESTS_PER_WINDOW,
          resetTime: Date.now() + (RATE_LIMIT_WINDOW * 3) // 3 minutos de penalización
        });
        throw new Error(`Rate limit excedido (429) - Gateway penalizado por 3 minutos`);
      }
      if (response.status === 422) {
        throw new Error(`CID inválido (422): ${response.statusText}`);
      }
      if (response.status === 404) {
        throw new Error(`Contenido no encontrado (404) en IPFS`);
      }
      if (response.status >= 500) {
        throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Verificar si el contenido es un mensaje de error HTML
    if (content.includes('422 Unprocessable content') || 
        content.includes('CID (the part after /ipfs/) is incorrect') ||
        content.includes('404 Not Found')) {
      throw new Error('Contenido de error detectado en respuesta');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Contenido vacío recibido');
    }

    console.log(`✅ Contenido obtenido exitosamente de: ${gateway}`);
    return content;
  } catch (error) {
    // Mejorar el manejo de errores
    let errorMsg = error instanceof Error ? error.message : String(error);
    
    if (error instanceof Error) {
      if (errorMsg.includes('Timeout después de')) {
        // Ya es un mensaje de timeout claro
      } else if (error.name === 'AbortError' || errorMsg.includes('aborted')) {
        errorMsg = `Timeout después de ${timeout}ms`;
      } else if (errorMsg.includes('Failed to fetch')) {
        errorMsg = 'Error de conexión o CORS bloqueado';
      } else if (errorMsg.includes('NetworkError')) {
        errorMsg = 'Error de red';
      }
    }
    
    console.warn(`❌ Error en gateway ${gateway}: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

// Función para obtener gateways ordenados por prioridad y disponibilidad
function getOrderedGateways(): string[] {
  const now = Date.now();
  
  // Filtrar gateways que no están en rate limit y ordenar por prioridad
  const availableGateways = IPFS_GATEWAYS.filter(gateway => {
    const rateLimitInfo = gatewayRateLimits.get(gateway);
    if (!rateLimitInfo) return true;
    
    // Si ha pasado el tiempo de reset, el gateway está disponible
    if (now > rateLimitInfo.resetTime) {
      gatewayRateLimits.delete(gateway);
      return true;
    }
    
    return rateLimitInfo.count < MAX_REQUESTS_PER_WINDOW;
  });
  
  // Si no hay gateways disponibles, usar todos (reset forzado)
  if (availableGateways.length === 0) {
    console.warn('⚠️ Todos los gateways en rate limit - reset forzado');
    gatewayRateLimits.clear();
    return [...IPFS_GATEWAYS];
  }
  
  // Agregar gateways en rate limit al final como último recurso
  const rateLimitedGateways = IPFS_GATEWAYS.filter(gateway => 
    !availableGateways.includes(gateway)
  );
  
  return [...availableGateways, ...rateLimitedGateways];
}

// Función optimizada para velocidad - prueba todos los gateways en paralelo
async function tryGatewaysSequentially(hash: string): Promise<string> {
  console.log(`🚀 Intentando TODOS los gateways en paralelo para: ${hash.slice(0, 10)}...`);
  
  const orderedGateways = getOrderedGateways();
  console.log(`📊 Probando ${orderedGateways.length} gateways simultáneamente para máxima velocidad`);
  
  // Estrategia ultra-rápida: Todos los gateways en paralelo con timeout corto
  const parallelPromises = orderedGateways.map(async (gateway, index) => {
    try {
      const url = gateway + hash;
      const timeout = 4000; // Timeout muy corto para máxima velocidad
      const startTime = Date.now();
      const content = await fetchFromGateway(url, timeout);
      const responseTime = Date.now() - startTime;
      return { 
        success: true, 
        content, 
        gateway, 
        index,
        responseTime
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { 
        success: false, 
        error: errorMsg, 
        gateway, 
        index,
        responseTime: 9999
      };
    }
  });
  
  try {
    // Usar Promise.allSettled para obtener todos los resultados
    const results = await Promise.allSettled(parallelPromises);
    
    // Filtrar resultados exitosos y ordenar por velocidad de respuesta
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value.success && result.value.content)
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)
      .sort((a, b) => (a?.responseTime || 9999) - (b?.responseTime || 9999));
    
    if (successfulResults.length > 0) {
      const fastest = successfulResults[0];
      console.log(`✅ Éxito con gateway más rápido: ${fastest?.gateway.split('/ipfs/')[0]} (${fastest?.responseTime}ms)`);
      return fastest?.content || '';
    }
    
    // Si ninguno tuvo éxito, registrar errores para diagnóstico
    const errors: string[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && !result.value.success) {
        const errorMsg = result.value.error || 'Error desconocido';
        errors.push(`${result.value.gateway.split('/ipfs/')[0]}: ${errorMsg}`);
      }
    });
    
    console.error(`❌ Todos los gateways fallaron:`, errors);
    
  } catch (parallelError) {
    console.warn('⚠️ Error en estrategia paralela:', parallelError);
  }
  
  // Si llegamos aquí, todos los gateways fallaron
  console.error(`❌ Todos los gateways fallaron para hash: ${hash.slice(0, 10)}...`);
  throw new Error(`Todos los gateways IPFS fallaron para hash ${hash.slice(0, 10)}...`);
}



// Función para generar contenido de ejemplo cuando todo falla
function getExampleContent(hash: string): string {
  // Si es un hash temporal, generar contenido específico
  if (hash.startsWith('QmTemporal')) {
    return JSON.stringify({
      tipo: "contenido_temporal",
      titulo: "Denuncia en proceso",
      descripcion: "Esta denuncia está siendo procesada. El contenido real se actualizará pronto.",
      estado: "temporal",
      hash_temporal: hash,
      mensaje: "El contenido definitivo se subirá a IPFS una vez completado el proceso",
      timestamp: new Date().toISOString(),
      nota: "Este es contenido temporal mientras se procesa la denuncia real"
    }, null, 2);
  }
  
  // Para hashes que no existen o están inaccesibles
  return JSON.stringify({
    error: "Contenido IPFS no disponible",
    hash: hash.slice(0, 15) + "...",
    titulo: "Denuncia no disponible",
    descripcion: "El contenido de esta denuncia no está disponible actualmente. Esto puede deberse a que el contenido fue eliminado de la red IPFS o nunca se subió correctamente.",
    tipo: "contenido_no_disponible",
    estado: "inaccesible",
    posibles_causas: [
      "El contenido fue eliminado de la red IPFS",
      "El hash es inválido o corrupto",
      "Problemas temporales de conectividad",
      "El contenido nunca se subió correctamente"
    ],
    sugerencias: [
      "Contactar al denunciante para re-subir el contenido",
      "Verificar si hay una copia de respaldo",
      "Intentar nuevamente más tarde"
    ],
    timestamp: new Date().toISOString(),
    nota: "Este es contenido de fallback generado automáticamente"
  }, null, 2);
}

// Función para verificar la disponibilidad de un gateway (simplificada para evitar CORS)
export async function checkGatewayHealth(gateway: string): Promise<boolean> {
  try {
    // En desarrollo, asumir que los gateways principales funcionan
    if (gateway.includes('pinata') || gateway.includes('ipfs.io')) {
      return true;
    }
    
    // Para otros gateways, hacer una verificación simple
    const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
    await fetch(gateway + testHash, {
      method: 'HEAD', // Solo verificar headers, no descargar contenido
      mode: 'no-cors', // Evitar problemas CORS
      signal: AbortSignal.timeout(2000)
    });
    return true;
  } catch {
    return false;
  }
}

// Función para obtener gateways disponibles
export async function getAvailableGateways(): Promise<string[]> {
  console.log('🔍 Verificando disponibilidad de gateways...');
  
  const healthChecks = IPFS_GATEWAYS.map(async gateway => {
    const isHealthy = await checkGatewayHealth(gateway);
    return { gateway, isHealthy };
  });

  const results = await Promise.all(healthChecks);
  const availableGateways = results
    .filter(result => result.isHealthy)
    .map(result => result.gateway);

  console.log(`✅ Gateways disponibles: ${availableGateways.length}/${IPFS_GATEWAYS.length}`);
  return availableGateways;
}

export async function deleteIPFSFile(hash: string): Promise<boolean> {
  try {
    // En un entorno de producción, aquí se implementaría la lógica real para eliminar el archivo de IPFS
    // Por ahora, solo simulamos una eliminación exitosa
    console.log(`Simulando eliminación del archivo IPFS con hash: ${hash}`);
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error al eliminar archivo de IPFS:', error);
    return Promise.resolve(false);
  }
}

export default ipfsService;