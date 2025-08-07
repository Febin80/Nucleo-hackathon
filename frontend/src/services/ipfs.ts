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

// Cache simple para evitar solicitudes repetidas
const contentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

// Lista de gateways IPFS optimizada para producción
const IPFS_GATEWAYS = [
  'https://dweb.link/ipfs/', // Gateway más confiable para CORS
  'https://cloudflare-ipfs.com/ipfs/', // Cloudflare es muy confiable
  'https://ipfs.io/ipfs/', // Gateway oficial
  'https://gateway.ipfs.io/ipfs/', // Gateway oficial alternativo
  'https://gateway.pinata.cloud/ipfs/', // Pinata (puede tener rate limits)
];

// Función para obtener contenido de IPFS con múltiples estrategias
export async function getIPFSContent(hash: string): Promise<string> {
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

  // Estrategia 3: Intentar con múltiples gateways secuencialmente
  try {
    const content = await tryGatewaysSequentially(hash);
    
    // Guardar en cache si es exitoso
    setCachedContent(hash, content);
    
    return content;
  } catch (error) {
    console.error('❌ Todos los gateways fallaron para hash:', hash.slice(0, 10));
    console.error('Error:', error);
    
    // Solo como último recurso, devolver contenido de ejemplo
    console.log('📄 Usando contenido de ejemplo como último recurso');
    const exampleContent = getExampleContent(hash);
    
    // No cachear contenido de ejemplo
    return exampleContent;
  }
}

// Función para validar si un hash IPFS parece válido
function isValidIPFSHash(hash: string): boolean {
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

// Función para obtener contenido de un gateway específico con timeout y manejo de CORS
async function fetchFromGateway(url: string, timeout: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Intentar primero con CORS habilitado
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
        }
      });
    } catch (corsError) {
      console.warn(`⚠️ CORS falló para ${url}, intentando sin CORS...`);
      // Si CORS falla, intentar sin CORS (para algunos gateways)
      response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      // Con no-cors, no podemos leer el contenido, así que asumimos que falló
      throw new Error('CORS bloqueado y no-cors no permite leer contenido');
    }

    clearTimeout(timeoutId);

    // Manejar diferentes códigos de estado
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit excedido (429) - Demasiadas solicitudes`);
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

    console.log(`✅ Contenido obtenido exitosamente de: ${url.split('/ipfs/')[0]}`);
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`❌ Error en gateway ${url.split('/ipfs/')[0]}: ${errorMsg}`);
    throw error;
  }
}

// Función para intentar gateways secuencialmente con estrategia inteligente
async function tryGatewaysSequentially(hash: string): Promise<string> {
  console.log(`🔄 Intentando gateways secuencialmente para: ${hash.slice(0, 10)}...`);
  
  const errors: string[] = [];
  let rateLimitedGateways = 0;
  
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    const gateway = IPFS_GATEWAYS[i];
    try {
      const url = gateway + hash;
      console.log(`🌐 [${i + 1}/${IPFS_GATEWAYS.length}] Intentando: ${gateway.split('/ipfs/')[0]}`);
      
      // Timeout más corto para los primeros intentos, más largo para los últimos
      const timeout = i < 2 ? 10000 : 20000;
      const content = await fetchFromGateway(url, timeout);
      
      console.log(`✅ Éxito con gateway: ${gateway.split('/ipfs/')[0]}`);
      return content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Contar rate limits para estadísticas
      if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
        rateLimitedGateways++;
      }
      
      console.warn(`❌ Gateway ${i + 1} falló: ${errorMsg}`);
      errors.push(`${gateway.split('/ipfs/')[0]}: ${errorMsg}`);
      
      // Si es rate limit, esperar un poco antes del siguiente intento
      if (errorMsg.includes('429') && i < IPFS_GATEWAYS.length - 1) {
        console.log('⏳ Rate limit detectado, esperando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      continue;
    }
  }

  // Estadísticas de fallo
  console.error(`❌ Todos los gateways fallaron para hash: ${hash.slice(0, 10)}...`);
  console.error(`📊 Estadísticas: ${rateLimitedGateways}/${IPFS_GATEWAYS.length} gateways con rate limit`);
  
  // Si todos fallan, lanzar error con detalles
  const errorSummary = `${errors.length} gateways fallaron. Rate limits: ${rateLimitedGateways}`;
  throw new Error(`Todos los gateways IPFS fallaron para hash ${hash.slice(0, 10)}... (${errorSummary})`);
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
  
  // Para otros hashes, contenido de error estándar
  return JSON.stringify({
    error: "No se pudo obtener el contenido original de IPFS",
    hash: hash,
    message: "Este es contenido de ejemplo generado localmente",
    suggestion: "Los gateways IPFS pueden estar temporalmente no disponibles",
    timestamp: new Date().toISOString(),
    note: "En un entorno de producción, el contenido estaría disponible en IPFS"
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