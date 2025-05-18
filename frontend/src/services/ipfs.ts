// Servicio IPFS desactivado temporalmente para pruebas

export async function uploadFileToIPFS(file: File): Promise<string> {
  // Simula un hash de IPFS
  return Promise.resolve('QmSimuladoHashDePrueba1234567890');
}

export async function checkIPFSFile(hash: string): Promise<boolean> {
  // Simula que siempre está disponible
  return Promise.resolve(true);
}

export function getIPFSGatewayURL(hash: string): string {
  // Devuelve una URL simulada
  return `https://ipfs.io/ipfs/${hash}`;
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