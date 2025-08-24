import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarState } from '@/hooks/use-sidebar-state'
import { NAV_TREE } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const location = useLocation()
  const { groupCollapsed, toggleGroupCollapsed } = useSidebarState()
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (open) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      
      // Focus on close button
      closeButtonRef.current?.focus()
      
      // Focus trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
        
        if (e.key === 'Tab') {
          const drawer = drawerRef.current
          if (!drawer) return
          
          const focusableElements = drawer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [open, onClose])

  if (!open) return null

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const handleNavClick = () => {
    onClose()
  }

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <div 
        ref={drawerRef}
        className="fixed left-0 top-0 h-full w-72 bg-card border-r shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Life Stone Indonesia" 
              className="w-8 h-8 rounded"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Life Stone Indonesia</span>
              <span className="text-xs text-muted-foreground">ERP Admin</span>
            </div>
          </div>
          
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {NAV_TREE.map((group) => {
              const isGroupCollapsed = groupCollapsed[group.group]

              return (
                <div key={group.group}>
                  {/* Group Header */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-4 py-2 h-auto font-medium text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted/50"
                    onClick={() => toggleGroupCollapsed(group.group)}
                  >
                    <span>{group.group}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Group Items */}
                  {!isGroupCollapsed && (
                    <div className="space-y-1 mt-1">
                      {group.children.map((item) => {
                        const isActive = isActivePath(item.path)
                        const IconComponent = item.icon

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-md mx-2",
                              "hover:bg-accent/50 hover:text-accent-foreground",
                              isActive && "bg-accent text-accent-foreground font-medium"
                            )}
                          >
                            <IconComponent className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}