// Test específico para debuggear isEncrypted

// Simulación exacta del EncryptionService
const EncryptionService = {
  isEncrypted: function(content) {
    console.log('🔍 isEncrypted llamado con:', typeof content);
    console.log('📄 Contenido (primeros 100 chars):', content.substring(0, 100));
    
    try {
      const parsed = JSON.parse(content);
      console.log('✅ JSON parseado, propiedades:', Object.keys(parsed));
      console.log('🔐 encrypted:', parsed.encrypted);
      console.log('🔧 algorithm:', parsed.algorithm);
      console.log('📦 data:', !!parsed.data);
      
      const result = parsed.encrypted === true && parsed.algorithm && parsed.data;
      console.log('🎯 Resultado isEncrypted:', result);
      return result;
    } catch (error) {
      console.log('❌ Error parseando JSON:', error.message);
      return false;
    }
  }
};

// Contenido cifrado extraído (después del parsing)
const contenidoCifradoExtraido = `{"version":"1.0","encrypted":true,"algorithm":"AES-256-CBC","data":"U2FsdGVkX1+3mqA50839Hjzr0+ffaDqykEMn8cgNbk4MXErze7cZh+Lj2QN+u0PoIo+MD9wQ3xlT82DGwSjMew/wv82zAPvEU7+EFpiaWVU7Kb715UuI2PwJbOw89c3MoUx70VwhaI+/BnAuqFBUWYl7nke+wBTSomGtB3fktntdZOMS+lNLjHRNZXSKoKc21KUjFtOJkfTHi5p0BWjexCgLBFSBjwUq6F73O59XuUYtqyEgxBOVDV7wiRGAXn4VN/JhBPrRCVC4Bzzb5O29Ck1AV0cVanlquNitVX7IQ88=","salt":"f25935a153738f8ed6a1b9ca8cbbde7f","iv":"b70ce63ee0d634711d03fb220aeb54b5","timestamp":"2025-08-05T17:55:45.355Z"}`;

function testIsEncrypted() {
  console.log('🧪 Test específico de isEncrypted...\n');
  
  console.log('📋 Probando con contenido cifrado extraído:');
  console.log('═'.repeat(60));
  
  const resultado = EncryptionService.isEncrypted(contenidoCifradoExtraido);
  
  console.log('═'.repeat(60));
  console.log('🎯 RESULTADO FINAL:', resultado);
  console.log('🎯 TIPO DEL RESULTADO:', typeof resultado);
  
  if (resultado === true) {
    console.log('✅ ¡PERFECTO! isEncrypted devuelve true');
    console.log('✅ El campo de contraseña DEBERÍA aparecer');
  } else {
    console.log('❌ PROBLEMA: isEncrypted no devuelve true');
    console.log('❌ El campo de contraseña NO aparecerá');
    console.log('🔍 Valor devuelto:', resultado);
  }
  
  console.log('\n📋 Verificación manual:');
  try {
    const parsed = JSON.parse(contenidoCifradoExtraido);
    console.log('- parsed.encrypted:', parsed.encrypted, '(tipo:', typeof parsed.encrypted, ')');
    console.log('- parsed.algorithm:', parsed.algorithm, '(tipo:', typeof parsed.algorithm, ')');
    console.log('- parsed.data:', !!parsed.data, '(existe:', !!parsed.data, ')');
    
    const manualCheck = parsed.encrypted === true && parsed.algorithm && parsed.data;
    console.log('- Verificación manual:', manualCheck);
    
    console.log('\n🔍 Comparaciones detalladas:');
    console.log('- parsed.encrypted === true:', parsed.encrypted === true);
    console.log('- !!parsed.algorithm:', !!parsed.algorithm);
    console.log('- !!parsed.data:', !!parsed.data);
    console.log('- Resultado AND:', parsed.encrypted === true && !!parsed.algorithm && !!parsed.data);
    
  } catch (error) {
    console.log('❌ Error en verificación manual:', error.message);
  }
}

testIsEncrypted();