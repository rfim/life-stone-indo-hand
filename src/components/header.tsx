import { List, MagnifyingGlass, Plus, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSidebarContext } from '@/components/sidebar-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
}

export function Header({ 
  title = "Dashboard", 
  subtitle,
  showCreateButton = false,
  onCreateClick,
  createButtonText = "Create"
}: HeaderProps) {
  const { isHidden, toggle, show } = useSidebarContext()
  const isMobile = useIsMobile()

  return (
    <header className="bg-background border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isMobile ? toggle : (isHidden ? show : toggle)}
            className="lg:hidden"
          >
            <List size={20} />
          </Button>
          
          {/* Show sidebar pill - only when hidden on desktop */}
          {isHidden && !isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={show}
              className="hidden lg:flex items-center gap-2 bg-background shadow-sm"
            >
              <List size={16} />
              <span className="text-sm">Show sidebar</span>
            </Button>
          )}

          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <MagnifyingGlass 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search..."
              className="pl-9 w-64"
            />
          </div>

          {/* Create button */}
          {showCreateButton && (
            <Button onClick={onCreateClick} className="flex items-center gap-2">
              <Plus size={16} />
              <span className="hidden sm:inline">{createButtonText}</span>
            </Button>
          )}

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">CREA</div>
              <div className="text-xs text-muted-foreground">admin@email.com</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}