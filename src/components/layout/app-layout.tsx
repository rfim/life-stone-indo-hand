import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div 
      className="min-h-screen bg-background text-foreground"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div 
        className={cn(
          "grid min-h-screen transition-all duration-200",
          isMobile 
            ? "grid-cols-1" 
            : "grid-cols-[var(--sidebar-width,264px)_1fr]"
        )}
        style={{
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'var(--sidebar-width, 264px) 1fr',
          '--app-header-height': isMobile ? '56px' : '64px'
        }}
      >
        {children}
      </div>
    </div>
  )
}