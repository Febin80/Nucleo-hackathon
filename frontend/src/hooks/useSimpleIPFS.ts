import { useState, useCallback } from 'react'
import { simpleIPFS, SimpleIPFSResult } from '../services/ipfs-simple'

export interface UseSimpleIPFSResult {
  // Estados
  uploading: boolean
  loading: boolean
  error: string | null
  
  // Funciones
  uploadFile: (file: File) => Promise<SimpleIPFSResult>
  uploadJSON: (data: any) => Promise<SimpleIPFSResult>
  getContent: (cid: string) => Promise<string>
  testConnection: () => Promise<boolean>
  clearCache: () => void
  
  // Utilidades
  isValidCID: (cid: string) => boolean
  getBestUrl: (cid: string) => string
  getAllUrls: (cid: string) => string[]
}

export const useSimpleIPFS = (): UseSimpleIPFSResult => {
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<SimpleIPFSResult> => {
    setUploading(true)
    setError(null)
    
    try {
      console.log(`🔄 useSimpleIPFS: Subiendo archivo ${file.name}`)
      const result = await simpleIPFS.uploadFile(file)
      
      if (result.success) {
        console.log(`✅ useSimpleIPFS: Archivo subido exitosamente`)
      } else {
        console.error(`❌ useSimpleIPFS: Error subiendo archivo:`, result.error)
        setError(result.error || 'Error desconocido')
      }
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`❌ useSimpleIPFS: Excepción subiendo archivo:`, err)
      setError(errorMsg)
      
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setUploading(false)
    }
  }, [])

  const uploadJSON = useCallback(async (data: any): Promise<SimpleIPFSResult> => {
    setUploading(true)
    setError(null)
    
    try {
      console.log(`🔄 useSimpleIPFS: Subiendo JSON`)
      const result = await simpleIPFS.uploadJSON(data)
      
      if (result.success) {
        console.log(`✅ useSimpleIPFS: JSON subido exitosamente`)
      } else {
        console.error(`❌ useSimpleIPFS: Error subiendo JSON:`, result.error)
        setError(result.error || 'Error desconocido')
      }
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`❌ useSimpleIPFS: Excepción subiendo JSON:`, err)
      setError(errorMsg)
      
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setUploading(false)
    }
  }, [])

  const getContent = useCallback(async (cid: string): Promise<string> => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`🔄 useSimpleIPFS: Obteniendo contenido para CID: ${cid}`)
      const content = await simpleIPFS.getContent(cid)
      console.log(`✅ useSimpleIPFS: Contenido obtenido exitosamente`)
      return content
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`❌ useSimpleIPFS: Error obteniendo contenido:`, err)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const testConnection = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`🔄 useSimpleIPFS: Probando conectividad`)
      const result = await simpleIPFS.testConnection()
      console.log(`${result ? '✅' : '⚠️'} useSimpleIPFS: Test de conectividad ${result ? 'exitoso' : 'falló'}`)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`❌ useSimpleIPFS: Error en test de conectividad:`, err)
      setError(errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(() => {
    try {
      console.log(`🗑️ useSimpleIPFS: Limpiando cache`)
      simpleIPFS.clearLocalCache()
      console.log(`✅ useSimpleIPFS: Cache limpiado`)
    } catch (err) {
      console.error(`❌ useSimpleIPFS: Error limpiando cache:`, err)
      setError(err instanceof Error ? err.message : 'Error limpiando cache')
    }
  }, [])

  const isValidCID = useCallback((cid: string): boolean => {
    return simpleIPFS.isValidCID(cid)
  }, [])

  const getBestUrl = useCallback((cid: string): string => {
    return simpleIPFS.getBestGatewayUrl(cid)
  }, [])

  const getAllUrls = useCallback((cid: string): string[] => {
    return simpleIPFS.getAllGatewayUrls(cid)
  }, [])

  return {
    // Estados
    uploading,
    loading,
    error,
    
    // Funciones
    uploadFile,
    uploadJSON,
    getContent,
    testConnection,
    clearCache,
    
    // Utilidades
    isValidCID,
    getBestUrl,
    getAllUrls
  }
}