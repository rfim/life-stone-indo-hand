import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface CardItem {
  id: string
  title: string
  subtitle?: string
  status?: {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  metrics?: Array<{
    label: string
    value: string | number
    variant?: 'default' | 'positive' | 'negative' | 'neutral'
  }>
  additionalFields?: Array<{
    label: string
    value: string | number
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
  }>
}

interface CardListProps {
  items: CardItem[]
  loading?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onItemClick?: (item: CardItem) => void
  className?: string
}

function CardItemComponent({ 
  item, 
  selected, 
  onSelectionChange, 
  onClick 
}: { 
  item: CardItem
  selected: boolean
  onSelectionChange: (checked: boolean) => void
  onClick?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on checkbox, buttons, or dropdown
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('[role="checkbox"]') ||
      (e.target as HTMLElement).closest('[role="menuitem"]')
    ) {
      return
    }
    onClick?.()
  }

  const getMetricColor = (variant?: string) => {
    switch (variant) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-muted-foreground'
      default: return 'text-foreground'
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-item">
      <CardContent className="p-4" onClick={handleCardClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelectionChange}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight truncate">{item.title}</h3>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {item.status && (
              <Badge variant={item.status.variant} className="text-xs">
                {item.status.label}
              </Badge>
            )}
            
            {item.actions && item.actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                    data-testid="card-actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                      }}
                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Primary Metrics */}
        {item.metrics && item.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-3">
            {item.metrics.slice(0, 2).map((metric, index) => (
              <div key={index}>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className={cn("text-sm font-medium", getMetricColor(metric.variant))}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less Button */}
        {((item.metrics && item.metrics.length > 2) || (item.additionalFields && item.additionalFields.length > 0)) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="w-full text-xs h-8 mt-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show More
                </>
              )}
            </Button>

            {/* Expanded Content */}
            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-3">
                {/* Additional Metrics */}
                {item.metrics && item.metrics.slice(2).length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {item.metrics.slice(2).map((metric, index) => (
                      <div key={index}>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className={cn("text-sm font-medium", getMetricColor(metric.variant))}>
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Fields */}
                {item.additionalFields && item.additionalFields.length > 0 && (
                  <div className="space-y-2">
                    {item.additionalFields.map((field, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{field.label}</span>
                        <span className="text-xs font-medium">{field.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function CardList({ 
  items, 
  loading = false, 
  selectedItems = [], 
  onSelectionChange,
  onItemClick,
  className 
}: CardListProps) {
  const handleItemSelectionChange = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedItems, itemId])
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    
    const allSelected = selectedItems.length === items.length
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map(item => item.id))
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-muted rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={cn("p-8 text-center", className)} data-testid="empty-state">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No items found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no items to display at the moment.
        </p>
      </div>
    )
  }

  const allSelected = selectedItems.length === items.length && items.length > 0
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length

  return (
    <div className={cn("space-y-4", className)} data-testid="cards-view">
      {/* Bulk Selection Header */}
      {onSelectionChange && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg" data-testid="bulk-selection">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedItems.length > 0 
                ? `${selectedItems.length} selected` 
                : `Select all ${items.length} items`
              }
            </span>
          </div>
          {selectedItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onSelectionChange([])}>
              Clear selection
            </Button>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-3 px-4">
        {items.map((item) => (
          <CardItemComponent
            key={item.id}
            item={item}
            selected={selectedItems.includes(item.id)}
            onSelectionChange={(checked) => handleItemSelectionChange(item.id, checked)}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </div>
  )
}