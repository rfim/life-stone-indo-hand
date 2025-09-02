import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronLeft, ChevronRight, MoreVertical, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebarState } from '@/hooks/use-sidebar-state'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { MobileDrawer } from './mobile-drawer'
// Use public logo instead of asset import for better compatibility
const lifestoneLogo = '/lifestone-logo.svg'

export function Header() {
  const { 
    state, 
    isExpanded, 
    isCollapsed, 
    isHidden, 
    toggle, 
    expand, 
    collapse, 
    hide 
  } = useSidebarState()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header 
        className={cn(
          "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40",
          isMobile ? "h-14" : "h-16"
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        <div className={cn("flex items-center justify-between h-full", isMobile ? "px-3" : "px-6")}>
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(true)
                  if (isHidden) expand()
                }}
                className="lg:hidden h-9 w-9 p-0"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            {/* Desktop controls */}
            {!isMobile && (
              <div className="flex items-center gap-1">
                {/* Hamburger button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggle}
                  className="hidden lg:flex"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                {/* Chevron button - only show when not hidden */}
                {!isHidden && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isExpanded ? collapse : expand}
                    className="hidden lg:flex"
                    aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {isExpanded ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {/* Kebab menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden lg:flex" aria-label="Sidebar options">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {!isHidden && (
                      <DropdownMenuItem onClick={hide}>
                        Hide sidebar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={expand}>
                      Expand sidebar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={collapse}>
                      Collapse sidebar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile app title */}
            {isMobile && (
              <div className="flex items-center gap-2">
                <img 
                  src={lifestoneLogo} 
                  alt="Life Stone Indonesia" 
                  className="w-6 h-6"
                />
                <span className="font-semibold text-sm">Life Stone</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Future: User menu, notifications, etc. */}
          </div>
        </div>
      </header>

      {/* Show sidebar pill when hidden */}
      {isHidden && !isMobile && (
        <Button
          variant="secondary"
          size="sm"
          onClick={expand}
          className="fixed top-4 left-4 z-50 shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show sidebar
        </Button>
      )}

      {/* Mobile drawer */}
      <MobileDrawer 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}