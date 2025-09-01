import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { format, startOfDay, endOfDay, subDays, startOfQuarter } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  Search,
  Download,
  Filter,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRange, FilterParams } from '@/data/purchasing-types'
import { useSuppliers } from '@/hooks/purchasing/usePurchasingQueries'

// Import dashboard components
import { ExecutiveDashboard } from './routes/ExecutiveDashboard'
import { ProcurementDashboard } from './routes/ProcurementDashboard'
import { FinanceDashboard } from './routes/FinanceDashboard'
import { WarehouseDashboard } from './routes/WarehouseDashboard'
import { QualityDashboard } from './routes/QualityDashboard'

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Today', value: 'Today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'This Quarter', value: 'Quarter' },
  { label: 'Custom', value: 'Custom' },
]

const CURRENCIES = [
  { label: 'All Currencies', value: 'all' },
  { label: 'IDR', value: 'IDR' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

export function DashboardApp() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Get suppliers for filter
  const { data: suppliers = [] } = useSuppliers()

  // Current tab from URL
  const currentTab = searchParams.get('tab') || 'executive'

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [customDateFrom, setCustomDateFrom] = useState<Date>()
  const [customDateTo, setCustomDateTo] = useState<Date>()
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate date range
  const getDateRange = useMemo(() => {
    const now = new Date()
    
    switch (dateRange) {
      case 'Today':
        return {
          from: format(startOfDay(now), 'yyyy-MM-dd'),
          to: format(endOfDay(now), 'yyyy-MM-dd')
        }
      case '7d':
        return {
          from: format(subDays(now, 7), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case '30d':
        return {
          from: format(subDays(now, 30), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case 'Quarter':
        const quarterStart = startOfQuarter(now)
        return {
          from: format(quarterStart, 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
      case 'Custom':
        return {
          from: customDateFrom ? format(customDateFrom, 'yyyy-MM-dd') : format(subDays(now, 30), 'yyyy-MM-dd'),
          to: customDateTo ? format(customDateTo, 'yyyy-MM-dd') : format(now, 'yyyy-MM-dd')
        }
      default:
        return {
          from: format(subDays(now, 30), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd')
        }
    }
  }, [dateRange, customDateFrom, customDateTo])

  // Build filter params
  const filterParams: FilterParams = {
    from: getDateRange.from,
    to: getDateRange.to,
    supplierIds: selectedSuppliers.length > 0 ? selectedSuppliers : undefined,
    currency: selectedCurrency !== 'all' ? selectedCurrency as 'IDR' | 'USD' | 'EUR' : undefined,
    q: searchQuery || undefined
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)
  }

  // Handle supplier toggle
  const toggleSupplier = (supplier: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplier)
        ? prev.filter(s => s !== supplier)
        : [...prev, supplier]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setDateRange('30d')
    setCustomDateFrom(undefined)
    setCustomDateTo(undefined)
    setSelectedSuppliers([])
    setSelectedCurrency('all')
    setSearchQuery('')
  }

  // Count active filters
  const activeFiltersCount = [
    dateRange !== '30d',
    selectedSuppliers.length > 0,
    selectedCurrency !== 'all',
    searchQuery
  ].filter(Boolean).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchasing Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor purchasing operations and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                <SelectTrigger>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'Custom' && (
              <>
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {customDateFrom ? format(customDateFrom, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateFrom}
                        onSelect={setCustomDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {customDateTo ? format(customDateTo, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateTo}
                        onSelect={setCustomDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Supplier Multi-select */}
          <div className="space-y-2">
            <Label>Suppliers</Label>
            <div className="flex flex-wrap gap-2">
              {suppliers.map((supplier) => (
                <Badge
                  key={supplier}
                  variant={selectedSuppliers.includes(supplier) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSupplier(supplier)}
                >
                  {supplier}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {dateRange !== '30d' && (
                  <Badge variant="secondary">
                    Date: {DATE_RANGES.find(r => r.value === dateRange)?.label}
                  </Badge>
                )}
                {selectedCurrency !== 'all' && (
                  <Badge variant="secondary">
                    Currency: {selectedCurrency}
                  </Badge>
                )}
                {selectedSuppliers.map((supplier) => (
                  <Badge key={supplier} variant="secondary">
                    Supplier: {supplier}
                  </Badge>
                ))}
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: "{searchQuery}"
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard filterParams={filterParams} />
          </TabsContent>
          
          <TabsContent value="procurement" className="space-y-6">
            <ProcurementDashboard filterParams={filterParams} />
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-6">
            <FinanceDashboard filterParams={filterParams} />
          </TabsContent>
          
          <TabsContent value="warehouse" className="space-y-6">
            <WarehouseDashboard filterParams={filterParams} />
          </TabsContent>
          
          <TabsContent value="quality" className="space-y-6">
            <QualityDashboard filterParams={filterParams} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}