// Sistema de almacenamiento alternativo cuando IPFS falla
export class StorageFallbackService {
  
  // Simular hash IPFS pero almacenar localmente
  static generateMockHash(content: string): string {
    // Crear un hash simulado basado en el contenido
    const timestamp = Date.now().toString();
    const contentHash = btoa(content.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '');
    return `QmMock${contentHash}${timestamp}`.slice(0, 46);
  }
  
  // Almacenar contenido en localStorage con hash simulado
  static storeContent(content: string): string {
    const mockHash = this.generateMockHash(content);
    const storageKey = `ipfs_content_${mockHash}`;
    
    try {
      localStorage.setItem(storageKey, content);
      console.log(`✅ Contenido almacenado localmente con hash: ${mockHash}`);
      return mockHash;
    } catch (error) {
      console.error('❌ Error almacenando contenido:', error);
      throw new Error('No se pudo almacenar el contenido');
    }
  }
  
  // Recuperar contenido usando hash simulado
  static retrieveContent(hash: string): string | null {
    const storageKey = `ipfs_content_${hash}`;
    
    try {
      const content = localStorage.getItem(storageKey);
      if (content) {
        console.log(`✅ Contenido recuperado localmente para hash: ${hash}`);
        return content;
      } else {
        console.warn(`⚠️ No se encontró contenido para hash: ${hash}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error recuperando contenido:', error);
      return null;
    }
  }
  
  // Crear contenido de denuncia estructurado
  static createDenunciaContent(data: {
    tipo: string;
    descripcion: string;
    timestamp: string;
    encrypted?: boolean;
  }): string {
    const denunciaContent = {
      version: '1.0',
      tipo: 'denuncia_anonima',
      categoria: data.tipo,
      descripcion: data.descripcion,
      timestamp: data.timestamp,
      storage_method: 'local_fallback',
      metadata: {
        created_by: 'DenunciaChain',
        encrypted: data.encrypted || false,
        network: 'Mantle',
        contract_version: '1.0',
        note: 'Almacenado localmente debido a problemas de conectividad IPFS'
      }
    };
    
    return JSON.stringify(denunciaContent, null, 2);
  }
}