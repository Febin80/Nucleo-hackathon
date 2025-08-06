// Script para crear contenido cifrado de prueba
// Ejecuta este código en la consola del navegador después de cargar la aplicación

async function createEncryptedContent() {
  console.log('🔐 Creando contenido cifrado de prueba...');
  
  // Contenido de ejemplo
  const contenidoOriginal = {
    tipo: "acoso_laboral",
    descripcion: "Esta es una descripción confidencial de un caso de acoso laboral que incluye detalles sensibles que deben mantenerse privados.",
    fecha: "2024-01-15T10:30:00Z",
    testigo: "Persona X",
    evidencia: "Correos electrónicos y grabaciones",
    metadata: {
      version: "1.0",
      plataforma: "Nucleo - Denuncias Anónimas",
      cifrado: true
    }
  };

  const password = "MiContraseñaSegura123!";
  
  console.log('📄 Contenido original:', contenidoOriginal);
  console.log('🔑 Contraseña:', password);
  
  // Simular el proceso de cifrado (necesitarías importar EncryptionService)
  const contenidoCifrado = {
    version: '1.0',
    encrypted: true,
    algorithm: 'AES-256-CBC',
    data: 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y96Qsv2Lm+31cmzaAILwyt...',
    salt: 'a1b2c3d4e5f6g7h8',
    iv: '1a2b3c4d5e6f7g8h9i0j1k2l',
    timestamp: new Date().toISOString()
  };
  
  console.log('🔒 Contenido cifrado:', JSON.stringify(contenidoCifrado, null, 2));
  
  console.log('\n📋 Para probar el descifrado:');
  console.log('1. Copia el contenido cifrado a un archivo IPFS');
  console.log('2. Usa la contraseña:', password);
  console.log('3. El visor IPFS debería poder descifrarlo');
  
  return {
    original: contenidoOriginal,
    encrypted: contenidoCifrado,
    password: password
  };
}

// Ejecutar la función
createEncryptedContent();