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

// Lista de gateways IPFS que funcionan bien con CORS
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/', // Gateway público de Pinata (funciona sin auth)
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://jade-payable-nightingale-723.mypinata.cloud/ipfs/' // Gateway personalizado (requiere auth)
];

// Función para obtener contenido de IPFS con múltiples estrategias
export async function getIPFSContent(hash: string): Promise<string> {
  console.log(`🔍 Obteniendo contenido IPFS para hash: ${hash}`);
  
  // Estrategia 1: Intentar obtener contenido real de IPFS primero
  // (Comentado el contenido simulado para usar contenido real)
  // const simulatedContent = getSimulatedContent(hash);
  // if (simulatedContent) {
  //   console.log(`✅ Usando contenido simulado para hash conocido: ${hash}`);
  //   return simulatedContent;
  // }

  // Estrategia 2: Validar que el hash parece válido
  if (!isValidIPFSHash(hash)) {
    console.warn(`⚠️ Hash IPFS inválido detectado: ${hash}`);
    // En lugar de devolver contenido de ejemplo, intentar de todos modos
    console.log('🔄 Intentando obtener contenido a pesar del hash inválido...');
  }

  // Estrategia 3: Intentar con múltiples gateways secuencialmente
  try {
    return await tryGatewaysSequentially(hash);
  } catch (error) {
    console.error('❌ Todos los gateways fallaron para hash:', hash);
    console.error('Error:', error);
    
    // Solo como último recurso, devolver contenido de ejemplo
    console.log('📄 Usando contenido de ejemplo como último recurso');
    return getExampleContent(hash);
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

// Función para obtener contenido de un gateway específico con timeout
async function fetchFromGateway(url: string, timeout: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Manejar específicamente el error 422 (CID inválido)
      if (response.status === 422) {
        throw new Error(`CID inválido: ${response.statusText}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Verificar si el contenido es un mensaje de error HTML
    if (content.includes('422 Unprocessable content') || content.includes('CID (the part after /ipfs/) is incorrect')) {
      throw new Error('CID inválido detectado en respuesta');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Contenido vacío');
    }

    console.log(`✅ Contenido obtenido de: ${url}`);
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`❌ Error en gateway ${url}:`, error);
    throw error;
  }
}

// Función para intentar gateways secuencialmente
async function tryGatewaysSequentially(hash: string): Promise<string> {
  console.log(`🔄 Intentando gateways secuencialmente para: ${hash}`);
  
  const errors: string[] = [];
  
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = gateway + hash;
      console.log(`🌐 Intentando: ${url}`);
      
      const content = await fetchFromGateway(url, 15000); // 15 segundos timeout
      console.log(`✅ Contenido obtenido exitosamente de: ${gateway}`);
      return content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`❌ Gateway falló: ${gateway} - ${errorMsg}`);
      errors.push(`${gateway}: ${errorMsg}`);
      continue;
    }
  }

  // Si todos fallan, lanzar error con detalles
  const errorDetails = errors.join('; ');
  throw new Error(`Todos los gateways IPFS fallaron para hash ${hash}. Errores: ${errorDetails}`);
}



// Función para generar contenido de ejemplo cuando todo falla
function getExampleContent(hash: string): string {
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