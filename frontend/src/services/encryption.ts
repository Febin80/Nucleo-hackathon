// Servicio de cifrado para contenido IPFS
import CryptoJS from 'crypto-js'

export class EncryptionService {
  private static readonly KEY_SIZE = 256

  /**
   * Genera una clave de cifrado basada en una contraseña
   */
  private static generateKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: 10000
    }).toString()
  }

  /**
   * Cifra contenido usando AES
   */
  static encrypt(content: string, password: string): {
    encryptedContent: string
    salt: string
    iv: string
  } {
    try {
      // Generar salt e IV aleatorios
      const salt = CryptoJS.lib.WordArray.random(128/8).toString()
      const iv = CryptoJS.lib.WordArray.random(128/8).toString()
      
      // Generar clave
      const key = this.generateKey(password, salt)
      
      // Cifrar contenido
      const encrypted = CryptoJS.AES.encrypt(content, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      return {
        encryptedContent: encrypted.toString(),
        salt,
        iv
      }
    } catch (error) {
      console.error('Error al cifrar:', error)
      throw new Error('Error al cifrar el contenido')
    }
  }

  /**
   * Descifra contenido usando AES
   */
  static decrypt(
    encryptedContent: string, 
    password: string, 
    salt: string, 
    iv: string
  ): string {
    try {
      // Generar la misma clave
      const key = this.generateKey(password, salt)
      
      // Descifrar contenido
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedText) {
        throw new Error('Contraseña incorrecta o contenido corrupto')
      }

      return decryptedText
    } catch (error) {
      console.error('Error al descifrar:', error)
      throw new Error('Error al descifrar el contenido. Verifica la contraseña.')
    }
  }

  /**
   * Crea un paquete cifrado completo para IPFS
   */
  static createEncryptedPackage(content: string, password: string): string {
    const { encryptedContent, salt, iv } = this.encrypt(content, password)
    
    const package_ = {
      version: '1.0',
      encrypted: true,
      algorithm: 'AES-256-CBC',
      data: encryptedContent,
      salt,
      iv,
      timestamp: new Date().toISOString()
    }

    return JSON.stringify(package_, null, 2)
  }

  /**
   * Descifra un paquete completo de IPFS
   */
  static decryptPackage(packageContent: string, password: string): string {
    try {
      const package_ = JSON.parse(packageContent)
      
      if (!package_.encrypted) {
        // Si no está cifrado, devolver tal como está
        return packageContent
      }

      if (package_.version !== '1.0' || package_.algorithm !== 'AES-256-CBC') {
        throw new Error('Versión de cifrado no soportada')
      }

      return this.decrypt(package_.data, password, package_.salt, package_.iv)
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Si no es JSON válido, asumir que es texto plano
        return packageContent
      }
      throw error
    }
  }

  /**
   * Verifica si el contenido está cifrado
   */
  static isEncrypted(content: string): boolean {
    try {
      const parsed = JSON.parse(content)
      return !!(parsed.encrypted === true && parsed.algorithm && parsed.data)
    } catch {
      return false
    }
  }

  /**
   * Genera una contraseña segura
   */
  static generateSecurePassword(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    return password
  }
}