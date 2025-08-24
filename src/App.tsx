import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Header } from '@/components/layout/header'
import { AppRouter } from '@/components/app-router'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useIsMobile } from '@/hooks/use-mobile'
import { Toaster } from '@/components/ui/sonner'

function AppContent() {
  const isMobile = useIsMobile()
  useKeyboardShortcuts()

  useEffect(() => {
    // Set initial CSS variable for sidebar width
    const savedState = localStorage.getItem('ls.sidebar.state')
    const savedWidth = localStorage.getItem('ls.sidebar.width') || '264'
    
    const root = document.documentElement
    
    // Mobile devices use drawer instead of persistent sidebar
    if (isMobile) {
      root.style.setProperty('--sidebar-width', '0px')
    } else {
      if (savedState === 'hidden') {
        root.style.setProperty('--sidebar-width', '0px')
      } else if (savedState === 'collapsed') {
        root.style.setProperty('--sidebar-width', '72px')
      } else {
        root.style.setProperty('--sidebar-width', `${savedWidth}px`)
      }
    }
  }, [isMobile])

  return (
    <AppLayout>
      {/* Sidebar is hidden on mobile, shown via drawer instead */}
      {!isMobile && <Sidebar />}
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
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
