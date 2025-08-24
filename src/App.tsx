import { useEffect } from 'react'
import { SidebarProvider } from '@/components/sidebar-provider'
import { AppLayout } from '@/components/app-layout'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { AppRouter } from '@/components/app-router'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { Toaster } from '@/components/ui/sonner'

function AppContent() {
  useKeyboardShortcuts()

  useEffect(() => {
    // Set initial CSS variable for sidebar width
    const savedState = localStorage.getItem('ls.sidebar.state')
    const savedWidth = localStorage.getItem('ls.sidebar.width') || '264'
    
    const root = document.documentElement
    if (savedState === 'hidden') {
      root.style.setProperty('--sidebar-width', '0px')
    } else if (savedState === 'collapsed') {
      root.style.setProperty('--sidebar-width', '72px')
    } else {
      root.style.setProperty('--sidebar-width', `${savedWidth}px`)
    }
  }, [])

  return (
    <AppLayout>
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <AppRouter />
        </div>
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <SidebarProvider>
      <AppContent />
      <Toaster />
    </SidebarProvider>
  )
}

export default App