// Script para configurar Pinata
// Ejecuta este código en la consola del navegador

console.log('🔧 Configuración de Pinata para IPFS');
console.log('');

console.log('📋 Información actual:');
console.log('• API Key:', 'a7ba81051da995924fe1');
console.log('• Estado: Configuración parcial');
console.log('');

console.log('⚠️  Para usar Pinata completamente necesitas:');
console.log('1. Tu Secret API Key de Pinata');
console.log('2. Actualizar el archivo frontend/src/services/pinata.ts');
console.log('');

console.log('🔗 Pasos para obtener las credenciales:');
console.log('1. Ve a https://app.pinata.cloud/');
console.log('2. Inicia sesión en tu cuenta');
console.log('3. Ve a "API Keys" en el menú');
console.log('4. Crea una nueva API Key o usa una existente');
console.log('5. Copia el "Secret API Key"');
console.log('');

console.log('📝 Actualiza el archivo pinata.ts con:');
console.log('const PINATA_SECRET_API_KEY = "tu_secret_key_aqui";');
console.log('');

console.log('🧪 Para probar Pinata:');
console.log('1. Haz clic en "Test Pinata" en la lista de denuncias');
console.log('2. Prueba la conexión');
console.log('3. Haz un test upload');
console.log('');

console.log('✨ Funcionalidades disponibles:');
console.log('• ✅ Subida real de contenido a IPFS');
console.log('• ✅ Cifrado de contenido antes de subir');
console.log('• ✅ Visualización de contenido desde IPFS');
console.log('• ✅ Múltiples gateways de respaldo');
console.log('• ✅ Gestión de pins en Pinata');
console.log('');

console.log('🎯 Próximos pasos:');
console.log('1. Configura tu Secret API Key');
console.log('2. Activa "Subir a IPFS real" en el formulario');
console.log('3. Crea una denuncia para probar');
console.log('4. Verifica el contenido en IPFS');

// Función para probar la configuración actual
async function testCurrentSetup() {
  console.log('\n🔍 Probando configuración actual...');
  
  try {
    // Simular una llamada a Pinata
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': 'a7ba81051da995924fe1',
        'pinata_secret_api_key': 'tu_secret_key_aqui'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta de Pinata:', data.message);
    } else {
      console.log('❌ Error de autenticación:', response.status);
      console.log('💡 Necesitas configurar tu Secret API Key');
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

console.log('\n💡 Ejecuta testCurrentSetup() para probar tu configuración');

// Hacer disponible la función globalmente
window.testCurrentSetup = testCurrentSetup;