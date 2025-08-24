import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Column {
  id: string
  label: string
  visible: boolean
  priority: 1 | 2 | 3 // 1 = must show, 2 = important, 3 = optional
}

interface ColumnsActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  columns?: Column[]
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void
  onRestoreDefaults?: () => void
  'data-testid'?: string
}

// Default columns for demonstration
const defaultColumns: Column[] = [
  { id: 'select', label: 'Select', visible: true, priority: 1 },
  { id: 'name', label: 'Name', visible: true, priority: 1 },
  { id: 'status', label: 'Status', visible: true, priority: 1 },
  { id: 'category', label: 'Category', visible: true, priority: 2 },
  { id: 'created', label: 'Created Date', visible: true, priority: 2 },
  { id: 'modified', label: 'Modified Date', visible: false, priority: 3 },
  { id: 'description', label: 'Description', visible: false, priority: 3 },
  { id: 'tags', label: 'Tags', visible: false, priority: 3 },
  { id: 'location', label: 'Location', visible: false, priority: 2 },
  { id: 'amount', label: 'Amount', visible: true, priority: 2 },
]

export function ColumnsActionSheet({ 
  open, 
  onOpenChange, 
  title,
  columns = defaultColumns,
  onColumnVisibilityChange,
  onRestoreDefaults,
  'data-testid': testId = 'columns-sheet'
}: ColumnsActionSheetProps) {
  const [localColumns, setLocalColumns] = useState(columns)

  const visibleCount = localColumns.filter(col => col.visible).length
  const totalCount = localColumns.length

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    setLocalColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: checked } : col
      )
    )
    onColumnVisibilityChange?.(columnId, checked)
  }

  const handleRestoreDefaults = () => {
    const resetColumns = localColumns.map(col => ({
      ...col,
      visible: col.priority <= 2 // Show priority 1 and 2 by default
    }))
    setLocalColumns(resetColumns)
    onRestoreDefaults?.()
  }

  const handleSelectAll = () => {
    const allVisible = localColumns.every(col => col.visible)
    const newColumns = localColumns.map(col => ({
      ...col,
      visible: !allVisible
    }))
    setLocalColumns(newColumns)
    newColumns.forEach(col => {
      onColumnVisibilityChange?.(col.id, col.visible)
    })
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Essential'
      case 2: return 'Important'
      case 3: return 'Optional'
      default: return ''
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedColumns = {
    essential: localColumns.filter(col => col.priority === 1),
    important: localColumns.filter(col => col.priority === 2),
    optional: localColumns.filter(col => col.priority === 3),
  }

  const allVisible = localColumns.every(col => col.visible)
  const someVisible = localColumns.some(col => col.visible)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[80vh] max-h-[500px] flex flex-col"
        data-testid={testId}
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Choose which columns to show in the table
              </SheetDescription>
            </div>
            <Badge variant="secondary">
              {visibleCount} of {totalCount} visible
            </Badge>
          </div>
        </SheetHeader>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            <Check className="h-4 w-4 mr-2" />
            {allVisible ? 'Hide All' : 'Show All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Defaults
          </Button>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Essential Columns */}
          {groupedColumns.essential.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Essential Columns</h3>
                <Badge className={getPriorityColor(1)}>Always visible</Badge>
              </div>
              <div className="space-y-3">
                {groupedColumns.essential.map((column) => (
                  <div key={column.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(column.id, checked as boolean)
                      }
                      disabled={column.priority === 1} // Essential columns cannot be hidden
                    />
                    <Label 
                      htmlFor={column.id} 
                      className="flex-1 text-sm font-normal"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Columns */}
          {groupedColumns.important.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Important Columns</h3>
                <Badge className={getPriorityColor(2)}>Recommended</Badge>
              </div>
              <div className="space-y-3">
                {groupedColumns.important.map((column) => (
                  <div key={column.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(column.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={column.id} 
                      className="flex-1 text-sm font-normal"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Columns */}
          {groupedColumns.optional.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Optional Columns</h3>
                <Badge className={getPriorityColor(3)}>Additional info</Badge>
              </div>
              <div className="space-y-3">
                {groupedColumns.optional.map((column) => (
                  <div key={column.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(column.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={column.id} 
                      className="flex-1 text-sm font-normal"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}