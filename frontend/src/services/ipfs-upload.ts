// Servicio para subir contenido real a IPFS usando servicios públicos
export class IPFSUploadService {
  
  // Subir contenido usando web3.storage (servicio gratuito)
  static async uploadToWeb3Storage(content: string): Promise<string> {
    try {
      // Usar el endpoint público de web3.storage
      const formData = new FormData();
      const blob = new Blob([content], { type: 'application/json' });
      formData.append('file', blob, 'denuncia.json');
      
      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQwNzlEMTU5MzZkNDM5NzM5MzM5MzM5MzM5MzM5MzM5MzM5MzM5MzMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MjAyNjEyNzcsIm5hbWUiOiJkZW51bmNpYS1jaGFpbiJ9'
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.cid;
      } else {
        throw new Error('Failed to upload to web3.storage');
      }
    } catch (error) {
      console.error('Error uploading to web3.storage:', error);
      throw error;
    }
  }
  
  // Subir usando NFT.Storage (alternativo)
  static async uploadToNFTStorage(content: string): Promise<string> {
    try {
      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQwNzlEMTU5MzZkNDM5NzM5MzM5MzM5MzM5MzM5MzM5MzM5MzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyMDI2MTI3NywibmFtZSI6ImRlbnVuY2lhLWNoYWluIn0',
          'Content-Type': 'application/json'
        },
        body: content
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.value.cid;
      } else {
        throw new Error('Failed to upload to NFT.Storage');
      }
    } catch (error) {
      console.error('Error uploading to NFT.Storage:', error);
      throw error;
    }
  }
  
  // Función principal que intenta múltiples servicios
  static async uploadContent(content: string): Promise<string> {
    console.log('🚀 Intentando subir contenido real a IPFS...');
    
    // Intentar web3.storage primero
    try {
      const cid = await this.uploadToWeb3Storage(content);
      console.log('✅ Contenido subido exitosamente a web3.storage:', cid);
      return cid;
    } catch (error) {
      console.warn('⚠️ web3.storage falló, intentando NFT.Storage...');
    }
    
    // Intentar NFT.Storage como fallback
    try {
      const cid = await this.uploadToNFTStorage(content);
      console.log('✅ Contenido subido exitosamente a NFT.Storage:', cid);
      return cid;
    } catch (error) {
      console.error('❌ Todos los servicios de upload fallaron');
      throw new Error('No se pudo subir el contenido a IPFS');
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
      metadata: {
        created_by: 'DenunciaChain',
        encrypted: data.encrypted || false,
        network: 'Mantle',
        contract_version: '1.0'
      },
      evidencias: [
        {
          tipo: 'texto',
          contenido: data.descripcion
        }
      ],
      hash_verification: {
        algorithm: 'SHA-256',
        created_at: new Date().toISOString()
      }
    };
    
    return JSON.stringify(denunciaContent, null, 2);
  }
}