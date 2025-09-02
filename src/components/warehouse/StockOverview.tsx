import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpDown,
  Eye,
  Plus
} from 'lucide-react'
import { WarehouseFilterParams, InventorySummary } from '@/data/warehouse-types'
import { 
  useWarehouseKpis, 
  useInventory,
  useMovements,
  useAdjustments
} from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '@/components/purchasing/KpiTile'
import { ChartArea } from '@/components/purchasing/ChartArea'
import { ChartBar } from '@/components/purchasing/ChartBar'
import { ChartDonut } from '@/components/purchasing/ChartDonut'
import { DataListView, ViewMode } from '@/components/ui/data-list-view'
import { InventoryCard } from '@/components/warehouse/cards'

interface StockOverviewProps {
  filterParams: WarehouseFilterParams
}

export function StockOverview({ filterParams }: StockOverviewProps) {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useWarehouseKpis(filterParams)
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory(filterParams)
  const { data: movements = [], isLoading: movementsLoading } = useMovements(filterParams)
  const { data: adjustments = [], isLoading: adjustmentsLoading } = useAdjustments(filterParams)

  // Chart data
  const onHandByLocationData = useMemo(() => {
    const locationTotals = inventory.reduce((acc, inv) => {
      const location = inv.locationName
      if (!acc[location]) acc[location] = 0
      acc[location] += inv.onHand
      return acc
    }, {} as Record<string, number>)

    return Object.entries(locationTotals).map(([location, total]) => ({
      location,
      total
    }))
  }, [inventory])

  const onHandByFinishingData = useMemo(() => {
    const finishingTotals = inventory.reduce((acc, inv) => {
      const finishing = inv.finishing || 'No Finishing'
      if (!acc[finishing]) acc[finishing] = 0
      acc[finishing] += inv.onHand
      return acc
    }, {} as Record<string, number>)

    return Object.entries(finishingTotals).map(([finishing, total]) => ({
      finishing,
      total
    }))
  }, [inventory])

  const topSKUsByMovementData = useMemo(() => {
    const skuMovements = movements.reduce((acc, mov) => {
      const sku = mov.skuCode
      if (!acc[sku]) acc[sku] = 0
      acc[sku] += mov.qty
      return acc
    }, {} as Record<string, number>)

    return Object.entries(skuMovements)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([sku, total]) => ({
        sku,
        total
      }))
  }, [movements])

  // Table columns
  const inventoryColumns: ColumnDef<InventorySummary>[] = [
    {
      accessorKey: 'skuCode',
      header: 'SKU Code'
    },
    {
      accessorKey: 'skuName',
      header: 'SKU Name'
    },
    {
      accessorKey: 'locationName',
      header: 'Location'
    },
    {
      accessorKey: 'finishing',
      header: 'Finishing',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.getValue('finishing') || 'No Finishing'}
        </Badge>
      )
    },
    {
      accessorKey: 'onHand',
      header: 'On Hand',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.getValue('onHand')} {row.original.uom}
        </div>
      )
    },
    {
      accessorKey: 'reserved',
      header: 'Reserved',
      cell: ({ row }) => (
        <div className="text-right">
          {row.getValue('reserved')} {row.original.uom}
        </div>
      )
    },
    {
      accessorKey: 'available',
      header: 'Available',
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-600">
          {row.getValue('available')} {row.original.uom}
        </div>
      )
    },
    {
      accessorKey: 'belowMin',
      header: 'Status',
      cell: ({ row }) => {
        const belowMin = row.getValue('belowMin') as boolean
        return (
          <Badge variant={belowMin ? 'destructive' : 'default'}>
            {belowMin ? 'Below Min' : 'OK'}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/warehouse/stock-card/${row.original.skuId}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Stock Card
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/warehouse/movements/create?sku=${row.original.skuId}`)}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Move
          </Button>
        </div>
      )
    }
  ]

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  // Card renderer for inventory
  const renderInventoryCard = (item: InventorySummary, index: number) => (
    <InventoryCard inventory={item} index={index} />
  )

  if (kpisLoading || inventoryLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="Total On Hand"
          value={kpis?.totalOnHand.value || 0}
          subtitle="Items in warehouse"
          icon={<Package className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Total Available"
          value={kpis?.totalAvailable.value || 0}
          subtitle="Available for use"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Items Below Min"
          value={kpis?.itemsBelowMin.value || 0}
          subtitle="Require restocking"
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => navigate('/warehouse/inventory?belowMin=true')}
        />
        
        <KpiTile
          title="Movements Today"
          value={kpis?.movementsToday.value || 0}
          subtitle="Stock movements"
          icon={<ArrowUpDown className="h-4 w-4" />}
          onClick={() => navigate('/warehouse/movements?date=today')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartDonut
          title="On Hand by Location"
          data={onHandByLocationData}
          dataKey="total"
          nameKey="location"
          onDrillDown={(data) => navigate(`/warehouse/inventory?location=${data.location}`)}
        />
        
        <ChartDonut
          title="On Hand by Finishing"
          data={onHandByFinishingData}
          dataKey="total"
          nameKey="finishing"
          onDrillDown={(data) => navigate(`/warehouse/inventory?finishing=${data.finishing}`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBar
          title="Top SKUs by Movement"
          data={topSKUsByMovementData}
          dataKey="total"
          xAxisKey="sku"
          onDrillDown={(data) => navigate(`/warehouse/movements?sku=${data.sku}`)}
        />
        
        <ChartArea
          title="Available Stock Trend"
          data={[]} // TODO: implement trend data
          dataKey="available"
          xAxisKey="date"
        />
      </div>

      {/* Inventory Table */}
      <DataListView
        title="Current Inventory"
        data={inventory}
        columns={inventoryColumns}
        searchPlaceholder="Search inventory..."
        onExport={(format) => handleExport(inventory, 'warehouse-inventory', format)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardRenderer={renderInventoryCard}
        defaultViewMode="table"
      />
    </div>
  )
}