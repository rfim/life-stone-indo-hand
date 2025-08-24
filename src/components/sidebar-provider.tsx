import { createContext, useContext } from 'react'
import { useSidebar, SidebarState } from '@/hooks/use-sidebar'

interface SidebarContextType {
  state: SidebarState
  width: number
  updateState: (state: SidebarState) => void
  updateWidth: (width: number) => void
  toggle: () => void
  cycle: () => void
  expand: () => void
  collapse: () => void
  hide: () => void
  show: () => void
  isExpanded: boolean
  isCollapsed: boolean
  isHidden: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar()

  return (
    <SidebarContext.Provider value={sidebar}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}