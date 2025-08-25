import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarState } from '@/hooks/use-sidebar-state'
import { NAV_TREE } from '@/lib/nav-config'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import lifestoneLogo from '@/assets/images/lifestone-logo.svg'

export function Sidebar() {
  const location = useLocation()
  const { state, groupCollapsed, toggleGroupCollapsed, isCollapsed } = useSidebarState()
  const sidebarRef = useRef<HTMLElement>(null)

  if (state === 'hidden') {
    return null
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const SidebarContent = () => (
    <>
      {/* Logo and Title */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b",
        isCollapsed && "justify-center px-2"
      )}>
        <img 
          src={lifestoneLogo} 
          alt="Life Stone Indonesia" 
          className="w-8 h-8"
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Life Stone Indonesia</span>
            <span className="text-xs text-muted-foreground">ERP Admin</span>
          </div>
        )}
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
                  className={cn(
                    "w-full justify-between px-4 py-2 h-auto font-medium text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted/50",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => !isCollapsed && toggleGroupCollapsed(group.group)}
                >
                  {!isCollapsed && (
                    <>
                      <span>{group.group}</span>
                      {isGroupCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </>
                  )}
                  {isCollapsed && (
                    <div className="w-4 h-0.5 bg-muted-foreground rounded" />
                  )}
                </Button>

                {/* Group Items */}
                {(!isGroupCollapsed || isCollapsed) && (
                  <div className={cn("space-y-1", isCollapsed ? "mt-2" : "mt-1")}>
                    {group.children.map((item) => {
                      const isActive = isActivePath(item.path)
                      const IconComponent = item.icon

                      const linkContent = (
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-md mx-2",
                            "hover:bg-accent/50 hover:text-accent-foreground",
                            isActive && "bg-accent text-accent-foreground font-medium",
                            isCollapsed && "justify-center px-2 mx-1"
                          )}
                        >
                          <IconComponent className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      )

                      if (isCollapsed) {
                        return (
                          <TooltipProvider key={item.path}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {linkContent}
                              </TooltipTrigger>
                              <TooltipContent side="right" sideOffset={10}>
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      }

                      return (
                        <div key={item.path}>
                          {linkContent}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </>
  )

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "relative bg-card border-r transition-all duration-200 flex flex-col",
        isCollapsed ? "w-[72px]" : "w-[var(--sidebar-width,264px)]"
      )}
      aria-label="Primary navigation"
    >
      <SidebarContent />
    </aside>
  )
}