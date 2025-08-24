import { useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onApplyFilters?: (filters: Record<string, any>) => void
  onClearFilters?: () => void
  'data-testid'?: string
}

export function FilterSheet({ 
  open, 
  onOpenChange, 
  title,
  onApplyFilters,
  onClearFilters,
  'data-testid': testId = 'filter-sheet'
}: FilterSheetProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [hasFilters, setHasFilters] = useState(false)

  const handleApply = () => {
    onApplyFilters?.(filters)
    setHasFilters(Object.keys(filters).some(key => filters[key]))
    onOpenChange(false)
  }

  const handleClear = () => {
    setFilters({})
    setHasFilters(false)
    onClearFilters?.()
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] max-h-[600px] flex flex-col"
        data-testid={testId}
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Apply filters to narrow down your results
              </SheetDescription>
            </div>
            {hasFilters && (
              <Badge variant="secondary">
                {Object.keys(filters).filter(key => filters[key]).length} active
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status || '__all__'}
              onValueChange={(value) => handleFilterChange('status', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-4">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm text-muted-foreground">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm text-muted-foreground">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select
              value={filters.category || '__all__'}
              onValueChange={(value) => handleFilterChange('category', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                <SelectItem value="category-1">Category 1</SelectItem>
                <SelectItem value="category-2">Category 2</SelectItem>
                <SelectItem value="category-3">Category 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-4">
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount-min" className="text-sm text-muted-foreground">Min</Label>
                <Input
                  id="amount-min"
                  type="number"
                  placeholder="0"
                  value={filters.amountMin || ''}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount-max" className="text-sm text-muted-foreground">Max</Label>
                <Input
                  id="amount-max"
                  type="number"
                  placeholder="No limit"
                  value={filters.amountMax || ''}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Select
              value={filters.location || '__all__'}
              onValueChange={(value) => handleFilterChange('location', value === '__all__' ? undefined : value)}
            >
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All locations</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="medan">Medan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasFilters}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}