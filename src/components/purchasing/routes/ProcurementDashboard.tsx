import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Truck, 
  Clock, 
  AlertTriangle,
  Eye,
  Mail,
  MessageSquare
} from 'lucide-react'
import { FilterParams, PRSummary, POSummary } from '@/data/purchasing-types'
import { 
  useKpis, 
  usePRs, 
  usePOs
} from '@/hooks/purchasing/usePurchasingQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '../KpiTile'
import { ChartBar } from '../ChartBar'
import { ChartArea } from '../ChartArea'
import { DataTable } from '../DataTable'

interface ProcurementDashboardProps {
  filterParams: FilterParams
}

export function ProcurementDashboard({ filterParams }: ProcurementDashboardProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useKpis(filterParams)
  const { data: prs = [], isLoading: prsLoading } = usePRs(filterParams)
  const { data: pos = [], isLoading: posLoading } = usePOs(filterParams)

  // Filter data for procurement view
  const prQueue = useMemo(() => 
    prs.filter(pr => pr.status === 'Submitted' || pr.status === 'Draft'), 
    [prs]
  )

  const shipmentsH3 = useMemo(() => {
    const now = dayjs()
    return pos.filter(po => {
      if (!po.eta) return false
      const eta = dayjs(po.eta)
      return eta.diff(now, 'day') <= 3 && eta.isAfter(now)
    })
  }, [pos])

  // Chart data
  const supplierLeadTimeData = useMemo(() => {
    const supplierStats = prs.reduce((acc, pr) => {
      const relatedPo = pos.find(po => pr.suppliers.includes(po.supplier))
      if (relatedPo && relatedPo.eta) {
        const leadTime = dayjs(relatedPo.eta).diff(dayjs(pr.createdAt), 'day')
        pr.suppliers.forEach(supplier => {
          if (!acc[supplier]) acc[supplier] = { total: 0, count: 0 }
          acc[supplier].total += leadTime
          acc[supplier].count += 1
        })
      }
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    return Object.entries(supplierStats)
      .map(([supplier, stats]) => ({
        supplier,
        avgLeadTime: Math.round(stats.total / stats.count)
      }))
      .filter(item => !isNaN(item.avgLeadTime))
  }, [prs, pos])

  const topSuppliersData = useMemo(() => {
    const supplierSpend = prs.reduce((acc, pr) => {
      pr.suppliers.forEach(supplier => {
        acc[supplier] = (acc[supplier] || 0) + pr.total / pr.suppliers.length
      })
      return acc
    }, {} as Record<string, number>)

    return Object.entries(supplierSpend)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([supplier, total]) => ({
        supplier,
        total
      }))
  }, [prs])

  // PR Queue columns
  const prColumns: ColumnDef<PRSummary>[] = [
    {
      accessorKey: 'code',
      header: 'PR Code',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto"
          onClick={() => navigate(`/pr/${row.original.id}`)}
        >
          {row.original.code}
        </Button>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'Draft' ? 'outline' : 'secondary'}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'requester',
      header: 'Requester'
    },
    {
      accessorKey: 'suppliers',
      header: 'Suppliers',
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.suppliers.slice(0, 2).join(', ')}
          {row.original.suppliers.length > 2 && ` +${row.original.suppliers.length - 2} more`}
        </div>
      )
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: row.original.currency,
            minimumFractionDigits: 0
          }).format(row.original.total)}
        </div>
      )
    },
    {
      accessorKey: 'neededBy',
      header: 'Needed By',
      cell: ({ row }) => {
        const neededBy = dayjs(row.original.neededBy)
        const isUrgent = neededBy.diff(dayjs(), 'day') <= 7
        
        return (
          <div className="flex items-center space-x-2">
            <span>{neededBy.format('MMM DD, YYYY')}</span>
            {isUrgent && <Badge variant="destructive">Urgent</Badge>}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/pr/${row.original.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Process
        </Button>
      )
    }
  ]

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
        const eta = dayjs(row.original.eta)
        const daysUntil = eta.diff(dayjs(), 'day')
        
        return (
          <div className="flex items-center space-x-2">
            <span>{eta.format('MMM DD, YYYY')}</span>
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
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: row.original.currency,
            minimumFractionDigits: 0
          }).format(row.original.total)}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/po/${row.original.id}#warehouse`)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Request Gudang
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

  if (kpisLoading || prsLoading || posLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="PR Queue"
          value={kpis?.prAwaiting.count || 0}
          subtitle={`Total: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(kpis?.prAwaiting.value || 0)}`}
          icon={<Package className="h-4 w-4" />}
          onClick={() => navigate('/pr?status=queue')}
        />
        
        <KpiTile
          title="Shipments H-3"
          value={kpis?.shipmentsH3 || 0}
          subtitle="Arriving in 3 days"
          icon={<Truck className="h-4 w-4" />}
          onClick={() => navigate('/po?eta=3days')}
        />
        
        <KpiTile
          title="Avg Lead Time"
          value={kpis?.leadTimeAvg || 0}
          subtitle="days"
          icon={<Clock className="h-4 w-4" />}
        />
        
        <KpiTile
          title="On-Time Delivery"
          value={kpis?.onTimePct || 0}
          format="percentage"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBar
          title="Top Suppliers by Spend"
          data={topSuppliersData}
          dataKey="total"
          xAxisKey="supplier"
          onDrillDown={(data) => navigate(`/supplier/${data.supplier}`)}
        />
        
        <ChartBar
          title="Lead Time Distribution by Supplier"
          data={supplierLeadTimeData}
          dataKey="avgLeadTime"
          xAxisKey="supplier"
          onDrillDown={(data) => navigate(`/supplier/${data.supplier}/leadtime`)}
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6">
        <DataTable
          title="PR Queue - Awaiting Processing"
          data={prQueue}
          columns={prColumns}
          searchPlaceholder="Search PRs..."
          onExport={(format) => handleExport(prQueue, 'pr_queue', format)}
        />
        
        <DataTable
          title="Shipments H-3 - Incoming Deliveries"
          data={shipmentsH3}
          columns={shipmentColumns}
          searchPlaceholder="Search shipments..."
          onExport={(format) => handleExport(shipmentsH3, 'shipments_h3', format)}
        />
      </div>
    </div>
  )
}