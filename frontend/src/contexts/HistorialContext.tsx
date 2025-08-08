import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface HistorialContextType {
  shouldRefresh: boolean
  triggerRefresh: () => void
  clearRefresh: () => void
  lastUpdate: number
}

const HistorialContext = createContext<HistorialContextType | undefined>(undefined)

export const useHistorial = () => {
  const context = useContext(HistorialContext)
  if (!context) {
    throw new Error('useHistorial must be used within a HistorialProvider')
  }
  return context
}

interface HistorialProviderProps {
  children: ReactNode
}

export const HistorialProvider = ({ children }: HistorialProviderProps) => {
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const triggerRefresh = useCallback(() => {
    console.log('🔄 HistorialContext: Triggering refresh...')
    setShouldRefresh(true)
    setLastUpdate(Date.now())
  }, [])

  const clearRefresh = useCallback(() => {
    console.log('✅ HistorialContext: Clearing refresh flag...')
    setShouldRefresh(false)
  }, [])

  return (
    <HistorialContext.Provider value={{
      shouldRefresh,
      triggerRefresh,
      clearRefresh,
      lastUpdate
    }}>
      {children}
    </HistorialContext.Provider>
  )
}