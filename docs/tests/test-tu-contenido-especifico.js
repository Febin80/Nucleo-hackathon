// Test específico para tu contenido cifrado

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

// Tu contenido exacto
const tuContenido = `{
  "tipo": "acoso_escolar",
  "contenido_cifrado": "{\\n  \\"version\\": \\"1.0\\",\\n  \\"encrypted\\": true,\\n  \\"algorithm\\": \\"AES-256-CBC\\",\\n  \\"data\\": \\"U2FsdGVkX1+3mqA50839Hjzr0+ffaDqykEMn8cgNbk4MXErze7cZh+Lj2QN+u0PoIo+MD9wQ3xlT82DGwSjMew/wv82zAPvEU7+EFpiaWVU7Kb715UuI2PwJbOw89c3MoUx70VwhaI+/BnAuqFBUWYl7nke+wBTSomGtB3fktntdZOMS+lNLjHRNZXSKoKc21KUjFtOJkfTHi5p0BWjexCgLBFSBjwUq6F73O59XuUYtqyEgxBOVDV7wiRGAXn4VN/JhBPrRCVC4Bzzb5O29Ck1AV0cVanlquNitVX7IQ88=\\",\\n  \\"salt\\": \\"f25935a153738f8ed6a1b9ca8cbbde7f\\",\\n  \\"iv\\": \\"b70ce63ee0d634711d03fb220aeb54b5\\",\\n  \\"timestamp\\": \\"2025-08-05T17:55:45.355Z\\"\\n}",
  "metadata": {
    "cifrado": true,
    "timestamp": "2025-08-05T17:55:50.146Z"
  }
}`;

function testLogicaCorregida() {
  console.log('🧪 Probando lógica corregida con tu contenido específico...\n');
  
  // Simular la lógica del IPFSContentViewer corregida
  const ipfsContent = tuContenido;
  
  // Paso 1: Verificar contenido principal
  let encrypted = EncryptionService.isEncrypted(ipfsContent);
  let contentToProcess = ipfsContent;
  
  console.log('🔍 IPFSContentViewer: Analizando contenido...');
  console.log('📄 Contenido principal cifrado:', encrypted);
  
  // Paso 2: Si no está cifrado, buscar estructura anidada
  if (!encrypted) {
    try {
      const parsedContent = JSON.parse(ipfsContent);
      console.log('✅ Contenido parseado como JSON, propiedades:', Object.keys(parsedContent));
      
      if (parsedContent.contenido_cifrado) {
        console.log('🔍 Detectada estructura con contenido_cifrado anidado');
        
        // El contenido_cifrado puede ser un string JSON escapado
        let extractedContent = parsedContent.contenido_cifrado;
        console.log('📦 Contenido extraído (tipo):', typeof extractedContent);
        console.log('📦 Contenido extraído (primeros 100 chars):', extractedContent.substring(0, 100));
        
        // Si es un string, intentar parsearlo como JSON
        if (typeof extractedContent === 'string') {
          try {
            // Intentar parsear el string JSON escapado
            const unescapedContent = JSON.parse(extractedContent);
            extractedContent = JSON.stringify(unescapedContent);
            console.log('✅ String JSON escapado parseado correctamente');
            console.log('📄 Contenido después del parsing:', extractedContent.substring(0, 100));
          } catch (unescapeError) {
            console.log('⚠️ No se pudo parsear como JSON escapado, usando como string');
          }
        }
        
        contentToProcess = extractedContent;
        encrypted = EncryptionService.isEncrypted(contentToProcess);
        console.log('🔐 Contenido anidado cifrado:', encrypted);
        
        // Debug adicional
        if (!encrypted) {
          console.log('❌ Contenido extraído no detectado como cifrado');
          console.log('🔍 Contenido completo extraído:');
          console.log(contentToProcess);
          
          // Intentar detectar manualmente
          try {
            const testParse = JSON.parse(contentToProcess);
            console.log('🧪 Test manual - propiedades:', Object.keys(testParse));
            console.log('🧪 Test manual - encrypted:', testParse.encrypted);
            console.log('🧪 Test manual - algorithm:', testParse.algorithm);
            console.log('🧪 Test manual - data:', !!testParse.data);
          } catch (testError) {
            console.log('❌ Test manual falló:', testError.message);
          }
        }
      }
    } catch (parseError) {
      console.log('📄 Contenido no es JSON, procesando como texto plano');
    }
  }
  
  console.log('\n🎯 Resultado final - Está cifrado:', encrypted);
  
  if (encrypted) {
    console.log('🔐 Configurando contenido cifrado para descifrado');
    console.log('✅ El usuario debería ver el campo de contraseña');
    console.log('✅ Al ingresar la contraseña, el contenido se descifrará');
  } else {
    console.log('📄 Configurando contenido como texto plano');
    console.log('❌ El usuario NO verá el campo de contraseña');
  }
  
  console.log('\n📋 RESUMEN:');
  console.log(`- Contenido principal cifrado: ${EncryptionService.isEncrypted(ipfsContent)}`);
  console.log(`- Tiene contenido_cifrado anidado: ${JSON.parse(ipfsContent).contenido_cifrado ? 'Sí' : 'No'}`);
  console.log(`- Contenido anidado cifrado: ${encrypted}`);
  console.log(`- Campo de contraseña aparecerá: ${encrypted ? 'SÍ ✅' : 'NO ❌'}`);
  
  if (encrypted) {
    console.log('\n🔓 Para descifrar en la aplicación:');
    console.log('1. Haz clic en "Ver descripción completa"');
    console.log('2. Deberías ver "🔒 Contenido cifrado"');
    console.log('3. Ingresa la contraseña: e!q^mDcHGEYdEYNf');
    console.log('4. Haz clic en "🔓 Descifrar"');
    console.log('5. El contenido se mostrará descifrado');
  } else {
    console.log('\n❌ PROBLEMA: El contenido no se detecta como cifrado');
    console.log('Esto significa que el campo de contraseña no aparecerá');
  }
}

testLogicaCorregida();