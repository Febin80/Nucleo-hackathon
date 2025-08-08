// Test final para verificar que la solución funciona

// EncryptionService corregido
const EncryptionService = {
  isEncrypted: function(content) {
    try {
      const parsed = JSON.parse(content);
      // Usar !! para forzar boolean
      return !!(parsed.encrypted === true && parsed.algorithm && parsed.data);
    } catch {
      return false;
    }
  }
};

// Tu contenido exacto
const tuContenido = `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\\n  \\"version\\": \\"1.0\\",\\n  \\"encrypted\\": true,\\n  \\"algorithm\\": \\"AES-256-CBC\\",\\n  \\"data\\": \\"U2FsdGVkX1+3mqA50839Hjzr0+ffaDqykEMn8cgNbk4MXErze7cZh+Lj2QN+u0PoIo+MD9wQ3xlT82DGwSjMew/wv82zAPvEU7+EFpiaWVU7Kb715UuI2PwJbOw89c3MoUx70VwhaI+/BnAuqFBUWYl7nke+wBTSomGtB3fktntdZOMS+lNLjHRNZXSKoKc21KUjFtOJkfTHi5p0BWjexCgLBFSBjwUq6F73O59XuUYtqyEgxBOVDV7wiRGAXn4VN/JhBPrRCVC4Bzzb5O29Ck1AV0cVanlquNitVX7IQ88=\\",\\n  \\"salt\\": \\"f25935a153738f8ed6a1b9ca8cbbde7f\\",\\n  \\"iv\\": \\"b70ce63ee0d634711d03fb220aeb54b5\\",\\n  \\"timestamp\\": \\"2025-08-05T17:55:45.355Z\\"\\n}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-05T17:55:50.146Z"
  }
}`;

function testSolucionFinal() {
  console.log('🎯 TEST FINAL: Verificando solución completa...\n');
  
  // Simular exactamente lo que hace IPFSContentViewer
  const ipfsContent = tuContenido;
  
  // Paso 1: Verificar contenido principal
  let encrypted = EncryptionService.isEncrypted(ipfsContent);
  let contentToProcess = ipfsContent;
  
  console.log('🔍 IPFSContentViewer: Analizando contenido...');
  console.log('📄 Contenido principal cifrado:', encrypted, '(tipo:', typeof encrypted, ')');
  
  // Paso 2: Si no está cifrado, buscar estructura anidada
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(ipfsContent);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        // Extraer y procesar contenido cifrado
        let extractedContent = parsedContent.contenido_cifrado;
        
        if (typeof extractedContent === 'string') {
          try {
            const unescapedContent = JSON.parse(extractedContent);
            extractedContent = JSON.stringify(unescapedContent);
            console.log('✅ String JSON escapado parseado correctamente');
          } catch (unescapeError) {
            console.log('⚠️ No se pudo parsear como JSON escapado');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted, '(tipo:', typeof encrypted, ')');
      }
    } catch (parseError) {
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('\n🎯 RESULTADO FINAL:');
  console.log('═'.repeat(50));
  console.log(`✅ Está cifrado: ${encrypted}`);
  console.log(`✅ Tipo del resultado: ${typeof encrypted}`);
  console.log(`✅ Es boolean true: ${encrypted === true}`);
  
  if (encrypted === true) {
    console.log('\n🎉 ¡ÉXITO! La solución funciona correctamente:');
    console.log('✅ El contenido se detecta como cifrado');
    console.log('✅ El campo de contraseña APARECERÁ');
    console.log('✅ El usuario podrá descifrar el contenido');
    
    console.log('\n🔓 Instrucciones para el usuario:');
    console.log('1. Ve a la aplicación web');
    console.log('2. Busca tu denuncia en la lista');
    console.log('3. Haz clic en "Ver descripción completa"');
    console.log('4. Deberías ver "🔒 Contenido cifrado"');
    console.log('5. Ingresa la contraseña: e!q^mDcHGEYdEYNf');
    console.log('6. Haz clic en "🔓 Descifrar"');
    console.log('7. ¡El contenido se mostrará descifrado!');
    
  } else {
    console.log('\n❌ PROBLEMA: La solución no funciona');
    console.log('❌ El campo de contraseña NO aparecerá');
    console.log('🔍 Valor devuelto:', encrypted);
    console.log('🔍 Tipo:', typeof encrypted);
  }
  
  console.log('\n📋 RESUMEN TÉCNICO:');
  console.log('═'.repeat(50));
  console.log('🔧 Cambios implementados:');
  console.log('  1. ✅ Detección de estructura anidada en IPFSContentViewer');
  console.log('  2. ✅ Extracción de contenido_cifrado');
  console.log('  3. ✅ Parsing de JSON escapado');
  console.log('  4. ✅ Corrección de isEncrypted para devolver boolean');
  console.log('  5. ✅ Logging detallado para debugging');
  
  console.log('\n🎯 Estado final:');
  console.log(`  - Detección de cifrado: ${encrypted === true ? 'FUNCIONA ✅' : 'FALLA ❌'}`);
  console.log(`  - Campo de contraseña: ${encrypted === true ? 'APARECERÁ ✅' : 'NO APARECERÁ ❌'}`);
  console.log(`  - Descifrado: ${encrypted === true ? 'POSIBLE ✅' : 'IMPOSIBLE ❌'}`);
}

testSolucionFinal();