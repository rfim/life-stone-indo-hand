import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ListChrome, ViewMode } from '@/components/table/list-chrome'
import { CardList } from '@/components/table/card-list'
import { useCrudModal } from '@/components/forms/crud-modal'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { BaseEntity, ListParams } from '@/lib/db/connection'

interface DataTableProps<T extends BaseEntity> {
  entity: string
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  columns: ColumnDef<T>[]
  useEntityHooks: () => {
    useList: (params: ListParams) => any
    useDelete: () => any
    useExport: () => any
    useImport: () => any
  }
  onRowClick?: (row: T) => void
  showActions?: boolean
  showCreate?: boolean
  className?: string
}

export function DataTable<T extends BaseEntity>({
  entity,
  title,
  subtitle,
  icon,
  columns,
  useEntityHooks,
  onRowClick,
  showActions = true,
  showCreate = true,
  className
}: DataTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const { openModal } = useCrudModal()
  
  // Table state from URL
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10)
  const q = searchParams.get('q') || ''
  const sortBy = searchParams.get('sortBy') || ''
  const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc'
  const viewMode = (searchParams.get('view') || 'table') as ViewMode
  
  // Parse filters from URL
  const filtersParam = searchParams.get('filters')
  const filters = useMemo(() => {
    try {
      return filtersParam ? JSON.parse(filtersParam) : {}
    } catch {
      return {}
    }
  }, [filtersParam])
  
  // Parse visible columns from URL
  const columnsParam = searchParams.get('columns')
  const visibleColumns = useMemo(() => {
    try {
      return columnsParam ? JSON.parse(columnsParam) : {}
    } catch {
      return {}
    }
  }, [columnsParam])
  
  // Local state
  const [rowSelection, setRowSelection] = useState({})
  
  // API hooks
  const { useList, useDelete, useExport, useImport } = useEntityHooks()
  
  // Fetch data
  const { data: result, isLoading, error, refetch } = useList({
    page,
    pageSize,
    q: q || undefined,
    sortBy: sortBy || undefined,
    sortDir,
    filters: Object.keys(filters).length > 0 ? filters : undefined
  })
  
  // Mutations
  const deleteMutation = useDelete()
  const exportMutation = useExport()
  const importMutation = useImport()
  
  const data = result?.data || []
  const total = result?.total || 0
  
  // Add actions column if needed
  const enhancedColumns = useMemo(() => {
    const baseColumns = [...columns]
    
    // Add selection column
    baseColumns.unshift({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { priority: 1 }
    })
    
    // Add actions column
    if (showActions) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openModal(entity, 'view', row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openModal(entity, 'edit', row.original.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(row.original.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { priority: 1 }
      })
    }
    
    return baseColumns
  }, [columns, showActions, entity, openModal])
  
  // Table setup
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      sorting: sortBy ? [{ id: sortBy, desc: sortDir === 'desc' }] : [],
      columnFilters: [],
      columnVisibility: visibleColumns,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (sorting) => {
      const newParams = new URLSearchParams(searchParams)
      if (typeof sorting === 'function') {
        const currentSorting = sortBy ? [{ id: sortBy, desc: sortDir === 'desc' }] : []
        const newSorting = sorting(currentSorting)
        if (newSorting.length > 0) {
          newParams.set('sortBy', newSorting[0].id)
          newParams.set('sortDir', newSorting[0].desc ? 'desc' : 'asc')
        } else {
          newParams.delete('sortBy')
          newParams.delete('sortDir')
        }
      }
      newParams.set('page', '1') // Reset to first page
      setSearchParams(newParams)
    },
    onColumnVisibilityChange: (visibility) => {
      const newParams = new URLSearchParams(searchParams)
      if (typeof visibility === 'function') {
        const newVisibility = visibility(visibleColumns)
        newParams.set('columns', JSON.stringify(newVisibility))
      }
      setSearchParams(newParams)
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
  })
  
  // Event handlers
  const updateUrl = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    setSearchParams(newParams)
  }
  
  const handleSearchChange = (value: string) => {
    updateUrl({ q: value || null, page: '1' })
  }
  
  const handleViewModeChange = (mode: ViewMode) => {
    updateUrl({ view: mode })
  }
  
  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() })
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMutation.mutateAsync(id)
        refetch()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }
  
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row)
    } else {
      openModal(entity, 'edit', row.id)
    }
  }
  
  const footerText = `Showing ${Math.min((page - 1) * pageSize + 1, total)} to ${Math.min(page * pageSize, total)} of ${total} entries`
  
  // Handle responsive columns
  useEffect(() => {
    const handleResize = () => {
      // Update column visibility based on screen size
      if (isMobile) {
        const mobileVisibility: Record<string, boolean> = {}
        enhancedColumns.forEach(col => {
          const priority = (col.meta as any)?.priority || 3
          mobileVisibility[col.id as string] = priority <= 1
        })
        table.setColumnVisibility(mobileVisibility)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile, enhancedColumns, table])
  
  return (
    <ListChrome
      title={title}
      subtitle={subtitle}
      icon={icon}
      searchValue={q}
      onSearchChange={handleSearchChange}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      showViewToggle={isMobile}
      showCreate={showCreate}
      onCreateClick={() => openModal(entity, 'create')}
      onExportClick={() => exportMutation.mutate()}
      onImportClick={() => {/* TODO: Implement import */}}
      onTemplateClick={() => {/* TODO: Implement template download */}}
      footerText={footerText}
      className={className}
    >
      {error && (
        <div className="p-4 text-center text-destructive">
          Error loading data. <Button variant="link" onClick={() => refetch()}>Retry</Button>
        </div>
      )}
      
      {viewMode === 'cards' && isMobile ? (
        <CardList 
          data={data} 
          isLoading={isLoading}
          onItemClick={handleRowClick}
        />
      ) : (
        <div className="relative overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap",
                        header.column.getCanSort() && "cursor-pointer select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())
                        }
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={cn(
                                "h-3 w-3",
                                header.column.getIsSorted() === 'asc' ? 'text-foreground' : 'text-muted-foreground'
                              )} 
                            />
                            <ChevronDown 
                              className={cn(
                                "h-3 w-3 -mt-1",
                                header.column.getIsSorted() === 'desc' ? 'text-foreground' : 'text-muted-foreground'
                              )} 
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {enhancedColumns.map((col, colIndex) => (
                      <TableCell key={colIndex}>
                        <div className="h-8 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={enhancedColumns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(Math.ceil(total / pageSize), page + 1))}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            Next
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(total / pageSize)}
        </div>
      </div>
    </ListChrome>
  )
}