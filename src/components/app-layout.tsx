import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useSidebarContext } from '@/components/sidebar-provider'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isHidden } = useSidebarContext()

  return (
    <div 
      className={cn(
        "min-h-screen bg-background transition-all duration-200",
        "grid grid-cols-[var(--sidebar-width)_1fr]",
        isHidden && "grid-cols-[0px_1fr]",
        className
      )}
      style={{
        gridTemplateColumns: isHidden 
          ? '0px 1fr' 
          : 'var(--sidebar-width) 1fr'
      }}
    >
      {/* Sidebar space - handled by Sidebar component */}
      <div className="relative" />
      
      {/* Main content */}
      <main className="min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}