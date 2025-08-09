import React, { createContext, useContext, useState } from 'react'

interface NavigationContextType {
  activeTab: number
  setActiveTab: (index: number) => void
  navigateToHistorial: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0)

  const navigateToHistorial = () => {
    setActiveTab(2) // Índice del tab "Historial"
  }

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, navigateToHistorial }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}