import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format, isAfter, differenceInDays, isSameDay, subDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Plus,
  ClipboardList
} from 'lucide-react'
import { FilterParams, POSummary, GRNSummary, SKUGap } from '@/data/purchasing-types'
import { 
  useKpis, 
  usePOs, 
  useGRNs,
  useSkuGaps
} from '@/hooks/purchasing/usePurchasingQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '../KpiTile'
import { ChartArea } from '../ChartArea'
import { ChartBar } from '../ChartBar'
import { DataTable } from '../DataTable'

interface WarehouseDashboardProps {
  filterParams: FilterParams
}

export function WarehouseDashboard({ filterParams }: WarehouseDashboardProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useKpis(filterParams)
  const { data: pos = [], isLoading: posLoading } = usePOs(filterParams)
  const { data: grns = [], isLoading: grnsLoading } = useGRNs(filterParams)
  const { data: skuGaps = [], isLoading: skuGapsLoading } = useSkuGaps(filterParams)

  // Filter data for warehouse view
  const shipmentsH3 = useMemo(() => {
    const now = new Date()
    return pos.filter(po => {
      if (!po.eta) return false
      const eta = new Date(po.eta)
      return differenceInDays(eta, now) <= 3 && isAfter(eta, now)
    })
  }, [pos])

  const todaysGRNs = useMemo(() => {
    const today = new Date()
    return grns.filter(grn => 
      isSameDay(new Date(grn.receivedAt), today)
    )
  }, [grns])

  const recentGRNs = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7)
    return grns.filter(grn => 
      isAfter(new Date(grn.receivedAt), sevenDaysAgo)
    ).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  }, [grns])

  // Chart data
  const receivingTrendData = useMemo(() => {
    const dailyReceiving = grns.reduce((acc, grn) => {
      const day = format(new Date(grn.receivedAt), 'MMM dd')
      if (!acc[day]) acc[day] = { day, count: 0, totalItems: 0 }
      acc[day].count += 1
      acc[day].totalItems += grn.itemsCount
      return acc
    }, {} as Record<string, { day: string; count: number; totalItems: number }>)

    return Object.values(dailyReceiving).sort((a, b) => 
      new Date(`2024 ${a.day}`).getTime() - new Date(`2024 ${b.day}`).getTime()
    )
  }, [grns])

  const warehouseActivityData = useMemo(() => {
    return [
      { activity: 'Receiving', count: grns.length },
      { activity: 'Items without SKU', count: skuGaps.length },
      { activity: 'Defects Found', count: grns.filter(g => g.defectsPct > 0).length },
      { activity: 'Pending Processing', count: shipmentsH3.length }
    ]
  }, [grns, skuGaps, shipmentsH3])

  // Shipments H-3 columns
  const shipmentColumns: ColumnDef<POSummary>[] = [
    {
      accessorKey: 'code',
      header: 'PO Code',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto"
          onClick={() => navigate(`/po/${row.original.id}`)}
        >
          {row.original.code}
        </Button>
      )
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier'
    },
    {
      accessorKey: 'eta',
      header: 'ETA',
      cell: ({ row }) => {
        const eta = new Date(row.original.eta)
        const daysUntil = differenceInDays(eta, new Date())
        
        return (
          <div className="flex items-center space-x-2">
            <span>{format(eta, 'MMM dd, yyyy')}</span>
            <Badge variant={daysUntil <= 1 ? 'destructive' : 'secondary'}>
              {daysUntil <= 0 ? 'Today' : `${daysUntil}d`}
            </Badge>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'itemsEstimate',
      header: 'Est. Items',
      cell: () => (
        <span className="text-muted-foreground">Est. 15-25</span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/po/${row.original.id}#warehouse`)}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Prepare Receiving
        </Button>
      )
    }
  ]

  // Recent GRN columns
  const grnColumns: ColumnDef<GRNSummary>[] = [
    {
      accessorKey: 'code',
      header: 'GRN Code',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto"
          onClick={() => navigate(`/grn/${row.original.id}`)}
        >
          {row.original.code}
        </Button>
      )
    },
    {
      accessorKey: 'poCode',
      header: 'PO Code',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto text-muted-foreground"
          onClick={() => navigate(`/po/${row.original.poCode}`)}
        >
          {row.original.poCode}
        </Button>
      )
    },
    {
      accessorKey: 'receivedAt',
      header: 'Received At',
      cell: ({ row }) => {
        const receivedAt = new Date(row.original.receivedAt)
        const isToday = isSameDay(receivedAt, new Date())
        
        return (
          <div className="flex items-center space-x-2">
            <span>{format(receivedAt, 'MMM dd, HH:mm')}</span>
            {isToday && <Badge variant="default">Today</Badge>}
          </div>
        )
      }
    },
    {
      accessorKey: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <div className="text-center">{row.original.itemsCount}</div>
      )
    },
    {
      accessorKey: 'defectsPct',
      header: 'Defects',
      cell: ({ row }) => {
        const defectsPct = row.original.defectsPct
        const hasDefects = defectsPct > 0
        
        return (
          <div className="flex items-center space-x-2">
            <span className={hasDefects ? 'text-red-600' : 'text-green-600'}>
              {defectsPct}%
            </span>
            {hasDefects && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </div>
        )
      }
    },
    {
      accessorKey: 'hasUnsku',
      header: 'SKU Issues',
      cell: ({ row }) => (
        row.original.hasUnsku ? (
          <Badge variant="destructive">Missing SKUs</Badge>
        ) : (
          <Badge variant="outline">Complete</Badge>
        )
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/grn/${row.original.id}#complaint`)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Create Complaint
        </Button>
      )
    }
  ]

  // SKU Gap columns
  const skuGapColumns: ColumnDef<SKUGap>[] = [
    {
      accessorKey: 'tempItemName',
      header: 'Item Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.tempItemName}</div>
      )
    },
    {
      accessorKey: 'qty',
      header: 'Qty',
      cell: ({ row }) => (
        <div className="text-center">{row.original.qty}</div>
      )
    },
    {
      accessorKey: 'area',
      header: 'Area (m²)',
      cell: ({ row }) => (
        <div className="text-right">{row.original.area.toFixed(1)}</div>
      )
    },
    {
      accessorKey: 'receivedAt',
      header: 'Received',
      cell: ({ row }) => format(new Date(row.original.receivedAt), 'MMM dd, yyyy')
    },
    {
      accessorKey: 'grnId',
      header: 'GRN',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto text-muted-foreground"
          onClick={() => navigate(`/grn/${row.original.grnId}`)}
        >
          View GRN
        </Button>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/sku/new?from=${row.original.id}`)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create SKU
        </Button>
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

  if (kpisLoading || posLoading || grnsLoading || skuGapsLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="Shipments H-3"
          value={kpis?.shipmentsH3 || 0}
          subtitle="Arriving in 3 days"
          icon={<Truck className="h-4 w-4" />}
          onClick={() => navigate('/po?eta=3days')}
        />
        
        <KpiTile
          title="Today's GRN"
          value={todaysGRNs.length}
          subtitle={`${todaysGRNs.reduce((sum, grn) => sum + grn.itemsCount, 0)} items received`}
          icon={<Package className="h-4 w-4" />}
          onClick={() => navigate('/grn?date=today')}
        />
        
        <KpiTile
          title="Items Without SKU"
          value={kpis?.itemsNoSku || 0}
          subtitle="Require SKU creation"
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => navigate('/sku/gaps')}
        />
        
        <KpiTile
          title="Receiving Efficiency"
          value={92}
          format="percentage"
          subtitle="Items processed"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartArea
          title="Receiving Trend (Last 7 Days)"
          data={receivingTrendData}
          dataKey="totalItems"
          xAxisKey="day"
          onDrillDown={(data) => navigate(`/grn?date=${data.day}`)}
        />
        
        <ChartBar
          title="Warehouse Activity"
          data={warehouseActivityData}
          dataKey="count"
          xAxisKey="activity"
          onDrillDown={(data) => navigate(`/warehouse/${data.activity.toLowerCase()}`)}
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6">
        <DataTable
          title="Shipments H-3 - Prepare for Receiving"
          data={shipmentsH3}
          columns={shipmentColumns}
          searchPlaceholder="Search shipments..."
          onExport={(format) => handleExport(shipmentsH3, 'shipments_h3', format)}
        />
        
        <DataTable
          title="Recent GRN / Today's Receiving"
          data={recentGRNs}
          columns={grnColumns}
          searchPlaceholder="Search GRNs..."
          onExport={(format) => handleExport(recentGRNs, 'recent_grns', format)}
        />
        
        <DataTable
          title="Products Without SKU"
          data={skuGaps}
          columns={skuGapColumns}
          searchPlaceholder="Search items..."
          onExport={(format) => handleExport(skuGaps, 'sku_gaps', format)}
        />
      </div>
    </div>
  )
}