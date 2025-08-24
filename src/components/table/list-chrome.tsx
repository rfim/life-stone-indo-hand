import { useState, ReactNode } from 'react'
import { Search, Filter, Columns, Download, Upload, FileText, Plus, MoreVertical, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { FilterSheet } from './filter-sheet'
import { ColumnsActionSheet } from './columns-action-sheet'

export type ViewMode = 'table' | 'cards'

interface ListChromeProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  searchValue?: string
  onSearchChange?: (value: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showViewToggle?: boolean
  showCreate?: boolean
  onCreateClick?: () => void
  onExportClick?: () => void
  onImportClick?: () => void
  onTemplateClick?: () => void
  onFiltersClick?: () => void
  onColumnsClick?: () => void
  children: ReactNode
  footerText?: string
  className?: string
}

export function ListChrome({
  title,
  subtitle,
  icon: IconComponent,
  searchValue = '',
  onSearchChange,
  viewMode = 'table',
  onViewModeChange,
  showViewToggle = false,
  showCreate = true,
  onCreateClick,
  onExportClick,
  onImportClick,
  onTemplateClick,
  onFiltersClick,
  onColumnsClick,
  children,
  footerText = 'Showing 0 to 0 of 0 entries',
  className
}: ListChromeProps) {
  const isMobile = useIsMobile()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [columnsSheetOpen, setColumnsSheetOpen] = useState(false)

  const entityName = title.replace(/s$/, '')

  const handleFiltersClick = () => {
    if (isMobile) {
      setFilterSheetOpen(true)
    } else {
      onFiltersClick?.()
    }
  }

  const handleColumnsClick = () => {
    if (isMobile) {
      setColumnsSheetOpen(true)
    } else {
      onColumnsClick?.()
    }
  }

  return (
    <>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {IconComponent && <IconComponent className="h-5 w-5 md:h-6 md:w-6 shrink-0" />}
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-semibold tracking-tight truncate">{title}</h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Desktop Actions */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onExportClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={onImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={onTemplateClick}>
                  <FileText className="h-4 w-4 mr-2" />
                  Template
                </Button>
                {showCreate && (
                  <Button size="sm" onClick={onCreateClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create {entityName}
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Actions Menu */}
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Actions menu">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {showCreate && (
                    <>
                      <DropdownMenuItem onClick={onCreateClick}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create {entityName}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={onExportClick}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onImportClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onTemplateClick}>
                    <FileText className="h-4 w-4 mr-2" />
                    Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleColumnsClick}>
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFiltersClick}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="border-b bg-muted/20 sticky top-14 z-30">
          <div className="flex items-center justify-between p-3 md:p-4 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  className="pl-9"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>

              {/* View Mode Toggle */}
              {showViewToggle && (
                <TooltipProvider>
                  <div className="flex items-center rounded-md border" data-testid="view-toggle">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onViewModeChange?.('table')}
                          className="rounded-r-none border-r-0"
                          aria-pressed={viewMode === 'table'}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Table view</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onViewModeChange?.('cards')}
                          className="rounded-l-none"
                          aria-pressed={viewMode === 'cards'}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cards view</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              )}
            </div>
            
            {/* Desktop Filter/Column Controls */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleFiltersClick}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" onClick={handleColumnsClick}>
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/20 px-3 md:px-6 py-3" data-testid="list-footer">
          <p className="text-xs md:text-sm text-muted-foreground">
            {footerText}
          </p>
        </div>
      </div>

      {/* Mobile FAB for Create */}
      {isMobile && showCreate && (
        <Button
          onClick={onCreateClick}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
          size="lg"
          aria-label={`Create ${entityName}`}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Mobile Sheets */}
      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title={`Filter ${title}`}
        data-testid="filter-sheet"
      />
      
      <ColumnsActionSheet
        open={columnsSheetOpen}
        onOpenChange={setColumnsSheetOpen}
        title={`Show/Hide Columns`}
        data-testid="columns-sheet"
      />
    </>
  )
}