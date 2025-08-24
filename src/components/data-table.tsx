import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Upload, 
  FileText, 
  Plus,
  Funnel,
  Columns,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, record: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  subtitle?: string
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: string | null
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSearch?: (query: string) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onCreateClick?: () => void
  onExportClick?: () => void
  onImportClick?: () => void
  onTemplateClick?: () => void
  createButtonText?: string
  searchPlaceholder?: string
  showActions?: boolean
}

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onSort,
  onCreateClick,
  onExportClick,
  onImportClick,
  onTemplateClick,
  createButtonText = "Create",
  searchPlaceholder = "Search...",
  showActions = true
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const totalPages = Math.ceil(totalCount / pageSize)
  const startEntry = (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleSort = (column: keyof T) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(column)
    setSortDirection(newDirection)
    onSort?.(column, newDirection)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((_, index) => index)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedRows(newSelected)
  }

  const isAllSelected = data.length > 0 && selectedRows.size === data.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportClick}>
              <Download size={16} />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onImportClick}>
              <Upload size={16} />
              <span className="hidden sm:inline ml-2">Import</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onTemplateClick}>
              <FileText size={16} />
              <span className="hidden sm:inline ml-2">Template</span>
            </Button>
            <Button onClick={onCreateClick} className="flex items-center gap-2">
              <Plus size={16} />
              <span className="hidden sm:inline">{createButtonText}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Funnel size={16} />
            <span className="ml-2">Filters</span>
          </Button>
          <Button variant="outline" size="sm">
            <Columns size={16} />
            <span className="ml-2">Columns</span>
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="bg-primary/10 text-primary text-sm px-4 py-2 rounded-md">
          Loading...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)}
                  className={cn(
                    "font-medium",
                    column.sortable && "cursor-pointer hover:bg-muted/80 transition-colors",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-primary">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <div className="text-lg mb-2">No data found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow 
                  key={index}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    selectedRows.has(index) && "bg-primary/5"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(index)}
                      onCheckedChange={(checked) => handleSelectRow(index, checked as boolean)}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render ? 
                        column.render(record[column.key], record) : 
                        String(record[column.key] || '-')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          Showing {totalCount > 0 ? startEntry : 0} to {endEntry} of {totalCount} entries
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}