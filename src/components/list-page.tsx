import { useEffect, useState } from 'react'
import { ListChrome, ViewMode } from '@/components/table/list-chrome'
import { CardList } from '@/components/table/card-list'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getNavItemByPath } from '@/lib/nav-config'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface ListPageProps {
  path: string
}

// Mock data for demonstration
const mockCardItems = [
  {
    id: '1',
    title: 'Sample Item 1',
    subtitle: 'Category A • Created 2 days ago',
    status: { label: 'Active', variant: 'default' as const },
    metrics: [
      { label: 'Quantity', value: '150 units', variant: 'default' as const },
      { label: 'Value', value: 'Rp 2,500,000', variant: 'positive' as const },
      { label: 'Location', value: 'Warehouse A' },
      { label: 'Last Updated', value: '2 hours ago' }
    ],
    additionalFields: [
      { label: 'SKU', value: 'SKU-001' },
      { label: 'Supplier', value: 'PT Supplier ABC' },
      { label: 'Category', value: 'Electronics' }
    ],
    actions: [
      { label: 'Edit', onClick: () => console.log('Edit 1') },
      { label: 'View Details', onClick: () => console.log('View 1') },
      { label: 'Delete', onClick: () => console.log('Delete 1'), variant: 'destructive' as const }
    ]
  },
  {
    id: '2',
    title: 'Sample Item 2',
    subtitle: 'Category B • Created 1 week ago',
    status: { label: 'Pending', variant: 'secondary' as const },
    metrics: [
      { label: 'Quantity', value: '75 units', variant: 'default' as const },
      { label: 'Value', value: 'Rp 1,200,000', variant: 'neutral' as const },
      { label: 'Location', value: 'Warehouse B' },
      { label: 'Last Updated', value: '1 day ago' }
    ],
    additionalFields: [
      { label: 'SKU', value: 'SKU-002' },
      { label: 'Supplier', value: 'PT Supplier XYZ' },
      { label: 'Category', value: 'Furniture' }
    ],
    actions: [
      { label: 'Edit', onClick: () => console.log('Edit 2') },
      { label: 'View Details', onClick: () => console.log('View 2') },
      { label: 'Activate', onClick: () => console.log('Activate 2') }
    ]
  },
  {
    id: '3',
    title: 'Sample Item 3',
    subtitle: 'Category C • Created 3 days ago',
    status: { label: 'Inactive', variant: 'outline' as const },
    metrics: [
      { label: 'Quantity', value: '0 units', variant: 'negative' as const },
      { label: 'Value', value: 'Rp 0', variant: 'negative' as const },
      { label: 'Location', value: 'No Location' },
      { label: 'Last Updated', value: '3 days ago' }
    ],
    additionalFields: [
      { label: 'SKU', value: 'SKU-003' },
      { label: 'Supplier', value: 'PT Supplier DEF' },
      { label: 'Category', value: 'Materials' }
    ],
    actions: [
      { label: 'Edit', onClick: () => console.log('Edit 3') },
      { label: 'View Details', onClick: () => console.log('View 3') },
      { label: 'Reactivate', onClick: () => console.log('Reactivate 3') }
    ]
  }
]

export function ListPage({ path }: ListPageProps) {
  const [tableKey, setTableKey] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const navItem = getNavItemByPath(path)
  const isMobile = useIsMobile()
  
  const title = navItem?.label || 'Page'
  const IconComponent = navItem?.icon

  // Auto-switch to cards view on very small screens
  useEffect(() => {
    if (window.innerWidth < 640) { // sm breakpoint
      setViewMode('cards')
    }
  }, [])

  // Listen for sidebar changes to remeasure table
  useEffect(() => {
    const handleSidebarChange = () => {
      setTableKey(prev => prev + 1)
    }

    window.addEventListener('sidebar:changed', handleSidebarChange)
    return () => window.removeEventListener('sidebar:changed', handleSidebarChange)
  }, [])

  // Extract module from path for subtitle
  const pathParts = path.split('/')
  const module = pathParts[1] ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) : ''

  const handleCreateClick = () => {
    console.log('Create clicked')
    // TODO: Open create form
  }

  const handleExportClick = () => {
    console.log('Export clicked')
    // TODO: Implement export
  }

  const handleImportClick = () => {
    console.log('Import clicked')
    // TODO: Open import dialog
  }

  const handleTemplateClick = () => {
    console.log('Template clicked')
    // TODO: Download template
  }

  const handleFiltersClick = () => {
    console.log('Filters clicked')
    // TODO: Open filters
  }

  const handleColumnsClick = () => {
    console.log('Columns clicked')
    // TODO: Open column selection
  }

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item)
    // TODO: Open view dialog
  }

  const filteredItems = mockCardItems.filter(item =>
    item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <ListChrome
      title={title}
      subtitle={`${module} Management`}
      icon={IconComponent}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showViewToggle={true}
      showCreate={true}
      onCreateClick={handleCreateClick}
      onExportClick={handleExportClick}
      onImportClick={handleImportClick}
      onTemplateClick={handleTemplateClick}
      onFiltersClick={handleFiltersClick}
      onColumnsClick={handleColumnsClick}
      footerText={`Showing ${filteredItems.length} to ${filteredItems.length} of ${filteredItems.length} entries`}
    >
      {viewMode === 'cards' ? (
        <CardList
          items={filteredItems}
          loading={loading}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onItemClick={handleItemClick}
          className="h-full overflow-y-auto"
        />
      ) : (
        <div className="p-4 md:p-6 h-full overflow-y-auto" data-testid="table-view">
          <Card key={tableKey}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">All</Badge>
                  <span className="text-sm text-muted-foreground">{filteredItems.length} items</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Placeholder */}
              <div className="rounded-md border">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      {IconComponent && <IconComponent className="h-6 w-6 text-muted-foreground" />}
                    </div>
                    <h3 className="text-lg font-medium mb-2">No {title.toLowerCase()} found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchValue 
                        ? `No results found for "${searchValue}". Try adjusting your search.`
                        : `Get started by creating your first ${title.toLowerCase().replace(/s$/, '')}.`
                      }
                    </p>
                    {!searchValue && (
                      <Button onClick={handleCreateClick}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create {title.replace(/s$/, '')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="text-center text-muted-foreground">
                      <p>Table view would render here</p>
                      <p className="text-xs mt-2">Switch to Cards view to see sample data</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ListChrome>
  )
}