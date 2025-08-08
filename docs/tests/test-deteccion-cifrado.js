// Simulación de la lógica de detección de cifrado corregida

// Simulación del EncryptionService
const EncryptionService = {
  isEncrypted: function(content) {
    try {
      const parsed = JSON.parse(content);
      return parsed.encrypted === true && parsed.algorithm && parsed.data;
    } catch {
      return false;
    }
  }
};

// Contenido de ejemplo (como el que tienes)
const contenidoIPFS = `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\\n  \\"version\\": \\"1.0\\",\\n  \\"encrypted\\": true,\\n  \\"algorithm\\": \\"AES-256-CBC\\",\\n  \\"data\\": \\"U2FsdGVkX1+3mqA50839Hjzr0+ffaDqykEMn8cgNbk4MXErze7cZh+Lj2QN+u0PoIo+MD9wQ3xlT82DGwSjMew/wv82zAPvEU7+EFpiaWVU7Kb715UuI2PwJbOw89c3MoUx70VwhaI+/BnAuqFBUWYl7nke+wBTSomGtB3fktntdZOMS+lNLjHRNZXSKoKc21KUjFtOJkfTHi5p0BWjexCgLBFSBjwUq6F73O59XuUYtqyEgxBOVDV7wiRGAXn4VN/JhBPrRCVC4Bzzb5O29Ck1AV0cVanlquNitVX7IQ88=\\",\\n  \\"salt\\": \\"f25935a153738f8ed6a1b9ca8cbbde7f\\",\\n  \\"iv\\": \\"b70ce63ee0d634711d03fb220aeb54b5\\",\\n  \\"timestamp\\": \\"2025-08-05T17:55:45.355Z\\"\\n}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-05T17:55:50.146Z"
  }
}`;

function testDeteccionCifrado() {
  console.log('🧪 Probando lógica de detección de cifrado corregida...\n');
  
  console.log('📄 Contenido IPFS original:');
  console.log(contenidoIPFS.substring(0, 200) + '...\n');
  
  // Paso 1: Verificar si el contenido principal está cifrado
  let encrypted = EncryptionService.isEncrypted(contenidoIPFS);
  let contentToProcess = contenidoIPFS;
  
  console.log(`🔍 ¿Contenido principal cifrado? ${encrypted}`);
  
  // Paso 2: Si no está cifrado, verificar estructura especial
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(contenidoIPFS);
      console.log('✅ Contenido parseado como JSON');
      console.log(`📋 Propiedades: ${Object.keys(parsedContent).join(', ')}`);
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        contentToProcess = parsedContent.contenido_cifrado;
        
        // Verificar si el contenido anidado está cifrado
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log(`🔐 ¿Contenido anidado cifrado? ${encrypted}`);
        
        if (encrypted) {
          console.log('✅ Contenido cifrado extraído exitosamente');
          console.log('📄 Contenido cifrado:');
          console.log(contentToProcess.substring(0, 200) + '...');
        }
      } else {
        console.log('⚠️ No se encontró campo contenido_cifrado');
      }
    } catch (parseError) {
      console.log('❌ Error parseando JSON:', parseError.message);
    }
  }
  
  console.log('\n📋 RESULTADO FINAL:');
  console.log(`✅ Está cifrado: ${encrypted}`);
  console.log(`✅ Contenido a procesar: ${encrypted ? 'Contenido cifrado extraído' : 'Contenido original'}`);
  
  if (encrypted) {
    console.log('\n🔓 Para descifrar:');
    console.log('1. El usuario verá el campo de contraseña');
    console.log('2. Al ingresar la contraseña, se descifrará el contenido extraído');
    console.log('3. El contenido descifrado se mostrará en la interfaz');
  }
  
  console.log('\n🎯 COMPARACIÓN:');
  console.log('ANTES (lógica antigua):');
  console.log('  - Solo verificaba el contenido principal');
  console.log('  - No detectaba contenido_cifrado anidado');
  console.log('  - Mostraba todo como texto plano');
  
  console.log('\nDESPUÉS (lógica corregida):');
  console.log('  - Verifica contenido principal primero');
  console.log('  - Si no está cifrado, busca contenido_cifrado anidado');
  console.log('  - Extrae y verifica el contenido cifrado real');
  console.log('  - Permite descifrado correcto');
}

testDeteccionCifrado();