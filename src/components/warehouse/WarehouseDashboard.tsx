import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, subDays, startOfDay } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Package, 
  ArrowUpDown, 
  Settings, 
  FileText, 
  Truck,
  Filter,
  X
} from 'lucide-react'
import { WarehouseFilterParams } from '@/data/warehouse-types'
import { useLocations, useSKUs } from '@/hooks/warehouse/useWarehouseQueries'
import { StockOverview } from './StockOverview'
import { MovementManagement } from './MovementManagement'
import { AdjustmentManagement } from './AdjustmentManagement'
import { SIKManagement } from './SIKManagement'
import { InboundRequestManagement } from './InboundRequestManagement'

type DateRange = 'today' | '7d' | '30d' | 'quarter' | 'custom'

export function WarehouseDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get locations and SKUs for filter dropdowns
  const { data: locations = [] } = useLocations()
  const { data: skus = [] } = useSKUs({})

  // Current tab from URL
  const currentTab = searchParams.get('tab') || 'overview'

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [customDateFrom, setCustomDateFrom] = useState<Date>()
  const [customDateTo, setCustomDateTo] = useState<Date>()
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([])
  const [selectedFinishing, setSelectedFinishing] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate date range
  const getDateRange = useMemo(() => {
    const now = new Date()
    
    switch (dateRange) {
      case 'today':
        return {
          from: format(startOfDay(now), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case '7d':
        return {
          from: format(subDays(now, 7), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case 'quarter':
        return {
          from: format(subDays(now, 90), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case 'custom':
        if (customDateFrom && customDateTo) {
          return {
            from: format(customDateFrom, 'yyyy-MM-dd'),
            to: format(customDateTo, 'yyyy-MM-dd')
          }
        }
        // Fallback to 30 days
        return {
          from: format(subDays(now, 30), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      default: // '30d'
        return {
          from: format(subDays(now, 30), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
    }
  }, [dateRange, customDateFrom, customDateTo])

  // Build filter params
  const filterParams: WarehouseFilterParams = {
    from: getDateRange.from,
    to: getDateRange.to,
    locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
    skuIds: selectedSKUs.length > 0 ? selectedSKUs : undefined,
    finishing: selectedFinishing !== 'all' ? selectedFinishing : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    q: searchQuery || undefined
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)
  }

  // Handle location toggle
  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(l => l !== locationId)
        : [...prev, locationId]
    )
  }

  // Handle SKU toggle
  const toggleSKU = (skuId: string) => {
    setSelectedSKUs(prev => 
      prev.includes(skuId)
        ? prev.filter(s => s !== skuId)
        : [...prev, skuId]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setDateRange('30d')
    setCustomDateFrom(undefined)
    setCustomDateTo(undefined)
    setSelectedLocations([])
    setSelectedSKUs([])
    setSelectedFinishing('all')
    setSelectedStatus('all')
    setSelectedType('all')
    setSearchQuery('')
  }

  // Count active filters
  const activeFiltersCount = [
    dateRange !== '30d',
    selectedLocations.length > 0,
    selectedSKUs.length > 0,
    selectedFinishing !== 'all',
    selectedStatus !== 'all',
    selectedType !== 'all',
    searchQuery
  ].filter(Boolean).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage warehouse operations and inventory
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Real-time data
          </Badge>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search SKUs, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Posted">Posted</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter (context-dependent) */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {currentTab === 'movements' && (
                    <>
                      <SelectItem value="INBOUND">Inbound</SelectItem>
                      <SelectItem value="OUTBOUND">Outbound</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </>
                  )}
                  {currentTab === 'adjustments' && (
                    <>
                      <SelectItem value="COUNT_CORRECTION">Count Correction</SelectItem>
                      <SelectItem value="DAMAGE">Damage</SelectItem>
                      <SelectItem value="UOM_CONVERSION">UoM Conversion</SelectItem>
                      <SelectItem value="FINISHING_CHANGE">Finishing Change</SelectItem>
                      <SelectItem value="CUTTING">Cutting</SelectItem>
                      <SelectItem value="LOST_FOUND">Lost & Found</SelectItem>
                    </>
                  )}
                  {currentTab === 'siks' && (
                    <>
                      <SelectItem value="FINISHING_CHANGE">Finishing Change</SelectItem>
                      <SelectItem value="CUTTING">Cutting</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedLocations.map((locationId) => {
                const location = locations.find(l => l.id === locationId)
                return (
                  <Badge key={locationId} variant="secondary">
                    Location: {location?.name || locationId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => toggleLocation(locationId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
              {selectedSKUs.map((skuId) => {
                const sku = skus.find(s => s.id === skuId)
                return (
                  <Badge key={skuId} variant="secondary">
                    SKU: {sku?.code || skuId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => toggleSKU(skuId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Movements</span>
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Adjustments</span>
          </TabsTrigger>
          <TabsTrigger value="siks" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>SIK</span>
          </TabsTrigger>
          <TabsTrigger value="inbound" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Inbound</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <StockOverview filterParams={filterParams} />
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <MovementManagement filterParams={filterParams} />
          </TabsContent>

          <TabsContent value="adjustments" className="space-y-6">
            <AdjustmentManagement filterParams={filterParams} />
          </TabsContent>

          <TabsContent value="siks" className="space-y-6">
            <SIKManagement filterParams={filterParams} />
          </TabsContent>

          <TabsContent value="inbound" className="space-y-6">
            <InboundRequestManagement filterParams={filterParams} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}