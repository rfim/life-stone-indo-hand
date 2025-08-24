import { useEffect, useState } from 'react'
import { Search, Filter, Columns, Download, Upload, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getNavItemByPath } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

interface ListPageProps {
  path: string
}

export function ListPage({ path }: ListPageProps) {
  const [tableKey, setTableKey] = useState(0)
  const navItem = getNavItemByPath(path)
  
  const title = navItem?.label || 'Page'
  const IconComponent = navItem?.icon

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent className="h-6 w-6" />}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{module} Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create {title.replace(/s$/, '')}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b bg-muted/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 p-6">
        <Card key={tableKey}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">All</Badge>
                <span className="text-sm text-muted-foreground">0 items</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table Placeholder */}
            <div className="rounded-md border">
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  {IconComponent && <IconComponent className="h-6 w-6 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-medium mb-2">No {title.toLowerCase()} found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first {title.toLowerCase().replace(/s$/, '')}.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {title.replace(/s$/, '')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/20 px-6 py-3">
        <p className="text-sm text-muted-foreground">
          Showing 0 to 0 of 0 entries
        </p>
      </div>
    </div>
  )
}