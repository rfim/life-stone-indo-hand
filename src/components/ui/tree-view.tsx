import * as React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreeViewProps {
  children?: React.ReactNode
  className?: string
}

interface TreeViewItemProps {
  children?: React.ReactNode
  className?: string
  isExpanded?: boolean
  onToggle?: () => void
  hasChildren?: boolean
  level?: number
}

interface TreeViewIndicatorProps {
  isExpanded?: boolean
  hasChildren?: boolean
  onClick?: () => void
}

interface TreeViewContentProps {
  children?: React.ReactNode
  className?: string
}

export function TreeView({ children, className }: TreeViewProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  )
}

export function TreeViewItem({ 
  children, 
  className, 
  isExpanded = false, 
  onToggle,
  hasChildren = false,
  level = 0 
}: TreeViewItemProps) {
  return (
    <div className={cn("", className)}>
      <div 
        className={cn(
          "flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded-md",
          className
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={hasChildren ? onToggle : undefined}
      >
        {children}
      </div>
    </div>
  )
}

export function TreeViewIndicator({ isExpanded = false, hasChildren = false, onClick }: TreeViewIndicatorProps) {
  if (!hasChildren) {
    return <div className="w-4" />
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-4 h-4 hover:bg-muted rounded"
    >
      {isExpanded ? (
        <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </button>
  )
}

export function TreeViewContent({ children, className }: TreeViewContentProps) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  )
}