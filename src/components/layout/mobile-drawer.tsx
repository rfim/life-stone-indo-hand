import { useEffect, useRef, useState } from 'react'
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
  
  // Swipe gesture state
  const [startX, setStartX] = useState<number | null>(null)
  const [currentX, setCurrentX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Focus management and body scroll lock
  useEffect(() => {
    if (open) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      
      // Focus on close button
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
      
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
        clearTimeout(timer)
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [open, onClose])

  // Touch event handlers for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startX === null) return
    
    const x = e.touches[0].clientX
    setCurrentX(x)
    
    // Only allow closing swipe (left direction)
    const deltaX = x - startX
    if (deltaX < 0) {
      const drawer = drawerRef.current
      if (drawer) {
        const progress = Math.min(Math.abs(deltaX) / 200, 1)
        drawer.style.transform = `translateX(${deltaX}px)`
        drawer.style.opacity = String(1 - progress * 0.5)
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || startX === null || currentX === null) {
      setIsDragging(false)
      setStartX(null)
      setCurrentX(null)
      return
    }
    
    const deltaX = currentX - startX
    const drawer = drawerRef.current
    
    if (drawer) {
      drawer.style.transform = ''
      drawer.style.opacity = ''
    }
    
    // Close if swiped more than 30% of the drawer width (72px for 288px drawer)
    if (deltaX < -72) {
      onClose()
    }
    
    setIsDragging(false)
    setStartX(null)
    setCurrentX(null)
  }

  // Mouse event handlers for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setCurrentX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || startX === null) return
    
    const x = e.clientX
    setCurrentX(x)
    
    const deltaX = x - startX
    if (deltaX < 0) {
      const drawer = drawerRef.current
      if (drawer) {
        const progress = Math.min(Math.abs(deltaX) / 200, 1)
        drawer.style.transform = `translateX(${deltaX}px)`
        drawer.style.opacity = String(1 - progress * 0.5)
      }
    }
  }

  const handleMouseUp = () => {
    if (!isDragging || startX === null || currentX === null) {
      setIsDragging(false)
      setStartX(null)
      setCurrentX(null)
      return
    }
    
    const deltaX = currentX - startX
    const drawer = drawerRef.current
    
    if (drawer) {
      drawer.style.transform = ''
      drawer.style.opacity = ''
    }
    
    if (deltaX < -72) {
      onClose()
    }
    
    setIsDragging(false)
    setStartX(null)
    setCurrentX(null)
  }

  // Global mouse events for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging || startX === null) return
        
        const x = e.clientX
        setCurrentX(x)
        
        const deltaX = x - startX
        if (deltaX < 0) {
          const drawer = drawerRef.current
          if (drawer) {
            const progress = Math.min(Math.abs(deltaX) / 200, 1)
            drawer.style.transform = `translateX(${deltaX}px)`
            drawer.style.opacity = String(1 - progress * 0.5)
          }
        }
      }

      const handleGlobalMouseUp = () => {
        if (!isDragging || startX === null || currentX === null) {
          setIsDragging(false)
          setStartX(null)
          setCurrentX(null)
          return
        }
        
        const deltaX = currentX - startX
        const drawer = drawerRef.current
        
        if (drawer) {
          drawer.style.transform = ''
          drawer.style.opacity = ''
        }
        
        if (deltaX < -72) {
          onClose()
        }
        
        setIsDragging(false)
        setStartX(null)
        setCurrentX(null)
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, startX, currentX, onClose])

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
      data-testid="mobile-drawer-overlay"
    >
      <div 
        ref={drawerRef}
        className="fixed left-0 top-0 h-full w-72 bg-card border-r shadow-lg flex flex-col transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        data-testid="mobile-drawer"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag indicator */}
        <div className="absolute top-2 right-2 w-1 h-8 bg-muted-foreground/20 rounded-full" />
        
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
            className="h-9 w-9 p-0"
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
                              "active:bg-accent/70 active:scale-[0.98]",
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