// Servicio para subir contenido real a IPFS usando servicios públicos
export class IPFSUploadService {
  
  // Subir usando IPFS HTTP API público
  static async uploadToIPFSHTTP(content: string): Promise<string> {
    try {
      console.log('🚀 Intentando subir a IPFS HTTP API...');
      
      const formData = new FormData();
      const blob = new Blob([content], { type: 'application/json' });
      formData.append('file', blob, `denuncia-${Date.now()}.json`);
      
      // Usar API pública de IPFS
      const response = await fetch('https://ipfs.infura.io:5001/api/v0/add?pin=true', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subido exitosamente a IPFS HTTP:', result.Hash);
        return result.Hash;
      } else {
        const errorText = await response.text();
        throw new Error(`IPFS HTTP error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error subiendo a IPFS HTTP:', error);
      throw error;
    }
  }
  
  // Subir usando Lighthouse Storage (servicio gratuito)
  static async uploadToLighthouse(content: string): Promise<string> {
    try {
      console.log('🚀 Intentando subir a Lighthouse...');
      
      const formData = new FormData();
      const blob = new Blob([content], { type: 'application/json' });
      formData.append('file', blob, `denuncia-${Date.now()}.json`);
      
      const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subido exitosamente a Lighthouse:', result.Hash);
        return result.Hash;
      } else {
        const errorText = await response.text();
        throw new Error(`Lighthouse error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error subiendo a Lighthouse:', error);
      throw error;
    }
  }
  
  // Subir usando Filebase (IPFS compatible)
  static async uploadToFilebase(content: string): Promise<string> {
    try {
      console.log('🚀 Intentando subir a Filebase...');
      
      const response = await fetch('https://api.filebase.io/v1/ipfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          filename: `denuncia-${Date.now()}.json`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subido exitosamente a Filebase:', result.cid);
        return result.cid;
      } else {
        const errorText = await response.text();
        throw new Error(`Filebase error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error subiendo a Filebase:', error);
      throw error;
    }
  }
  
  // Función principal que intenta múltiples servicios reales
  static async uploadContent(content: string): Promise<string> {
    console.log('🚀 Intentando subir contenido real a IPFS con múltiples servicios...');
    
    const services = [
      { name: 'IPFS HTTP', method: this.uploadToIPFSHTTP },
      { name: 'Lighthouse', method: this.uploadToLighthouse },
      { name: 'Filebase', method: this.uploadToFilebase }
    ];
    
    for (const service of services) {
      try {
        console.log(`🔄 Intentando ${service.name}...`);
        const cid = await service.method.call(this, content);
        console.log(`✅ Contenido subido exitosamente a ${service.name}:`, cid);
        return cid;
      } catch (error) {
        console.warn(`⚠️ ${service.name} falló:`, error);
      }
    }
    
    console.error('❌ Todos los servicios de upload fallaron');
    throw new Error('No se pudo subir el contenido a IPFS - todos los servicios fallaron');
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
        contract_version: '1.0',
        upload_method: 'real_ipfs'
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