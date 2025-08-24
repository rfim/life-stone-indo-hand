import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div 
        className={cn(
          "grid min-h-screen transition-all duration-200",
          "grid-cols-[var(--sidebar-width,264px)_1fr]"
        )}
        style={{
          gridTemplateColumns: 'var(--sidebar-width, 264px) 1fr'
        }}
      >
        {children}
      </div>
    </div>
  )
}