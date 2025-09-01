import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format, isAfter, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  FileText,
  Eye
} from 'lucide-react'
import { FilterParams, PRSummary, InvoiceSummary } from '@/data/purchasing-types'
import { 
  useKpis, 
  usePRs, 
  useInvoices 
} from '@/hooks/purchasing/usePurchasingQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '../KpiTile'
import { ChartArea } from '../ChartArea'
import { ChartBar } from '../ChartBar'
import { ChartDonut } from '../ChartDonut'
import { DataTable } from '../DataTable'

interface ExecutiveDashboardProps {
  filterParams: FilterParams
}

export function ExecutiveDashboard({ filterParams }: ExecutiveDashboardProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useKpis(filterParams)
  const { data: prs = [], isLoading: prsLoading } = usePRs(filterParams)
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices(filterParams)

  // Filter data for executive view
  const prAwaitingApproval = useMemo(() => 
    prs.filter(pr => pr.status === 'Submitted'), 
    [prs]
  )

  const invoicesDueSoon = useMemo(() => {
    const now = new Date()
    return invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      return differenceInDays(dueDate, now) <= 7 && inv.status !== 'Paid' && inv.status !== 'Archived'
    })
  }, [invoices])

  // Chart data
  const spendOverTimeData = useMemo(() => {
    // Aggregate spend by month
    const monthlySpend = prs.reduce((acc, pr) => {
      const month = format(new Date(pr.createdAt), 'MMM yyyy')
      acc[month] = (acc[month] || 0) + pr.total
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlySpend).map(([month, total]) => ({
      month,
      total
    }))
  }, [prs])

  const topSuppliersData = useMemo(() => {
    const supplierSpend = prs.reduce((acc, pr) => {
      pr.suppliers.forEach(supplier => {
        acc[supplier] = (acc[supplier] || 0) + pr.total / pr.suppliers.length
      })
      return acc
    }, {} as Record<string, number>)

    return Object.entries(supplierSpend)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([supplier, total]) => ({
        supplier,
        total
      }))
  }, [prs])

  const currencyExposureData = useMemo(() => {
    const currencyTotals = prs.reduce((acc, pr) => {
      acc[pr.currency] = (acc[pr.currency] || 0) + pr.total
      return acc
    }, {} as Record<string, number>)

    return Object.entries(currencyTotals).map(([currency, total]) => ({
      currency,
      total
    }))
  }, [prs])

  // PR Table columns
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
      cell: ({ row }) => format(new Date(row.original.neededBy), 'MMM dd, yyyy')
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => {
        const age = differenceInDays(new Date(), new Date(row.original.createdAt))
        return `${age} days`
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
          View PR
        </Button>
      )
    }
  ]

  // Invoice Table columns
  const invoiceColumns: ColumnDef<InvoiceSummary>[] = [
    {
      accessorKey: 'code',
      header: 'Invoice',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto"
          onClick={() => navigate(`/invoice/${row.original.id}`)}
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
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = new Date(row.original.dueDate)
        const now = new Date()
        const isOverdue = isAfter(now, dueDate)
        const isUrgent = differenceInDays(dueDate, now) <= 3
        
        return (
          <div className="flex items-center space-x-2">
            <span>{format(dueDate, 'MMM dd, yyyy')}</span>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            {!isOverdue && isUrgent && <Badge variant="secondary">Urgent</Badge>}
          </div>
        )
      }
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
            onClick={() => navigate(`/invoice/${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/invoice/${row.original.id}/print`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Print
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

  if (kpisLoading || prsLoading || invoicesLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="PR Awaiting Approval"
          value={kpis?.prAwaiting.count || 0}
          subtitle={`Total: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(kpis?.prAwaiting.value || 0)}`}
          icon={<Clock className="h-4 w-4" />}
          onClick={() => navigate('/pr?status=submitted')}
        />
        
        <KpiTile
          title="On-Time Delivery"
          value={kpis?.onTimePct || 0}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Defect Rate"
          value={kpis?.defectRatePct || 0}
          format="percentage"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Invoices Due Soon"
          value={kpis?.invoicesDue7.count || 0}
          subtitle={`Total: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(kpis?.invoicesDue7.value || 0)}`}
          icon={<DollarSign className="h-4 w-4" />}
          onClick={() => navigate('/invoice?due=7days')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartArea
          title="Spend Over Time"
          data={spendOverTimeData}
          dataKey="total"
          xAxisKey="month"
          onDrillDown={(data) => navigate(`/spending?month=${data.month}`)}
        />
        
        <ChartBar
          title="Top Suppliers by Spend"
          data={topSuppliersData}
          dataKey="total"
          xAxisKey="supplier"
          onDrillDown={(data) => navigate(`/supplier/${data.supplier}`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartDonut
          title="Currency Exposure"
          data={currencyExposureData}
          dataKey="total"
          nameKey="currency"
          onDrillDown={(data) => navigate(`/currency/${data.currency}`)}
        />
        
        <div className="flex items-center justify-center bg-muted/20 rounded border-2 border-dashed border-muted-foreground/25 p-8">
          <p className="text-muted-foreground">Additional chart placeholder</p>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="PR Awaiting Director Approval"
          data={prAwaitingApproval}
          columns={prColumns}
          searchPlaceholder="Search PRs..."
          onExport={(format) => handleExport(prAwaitingApproval, 'pr_awaiting_approval', format)}
        />
        
        <DataTable
          title="Invoices Due Soon"
          data={invoicesDueSoon}
          columns={invoiceColumns}
          searchPlaceholder="Search invoices..."
          onExport={(format) => handleExport(invoicesDueSoon, 'invoices_due_soon', format)}
        />
      </div>
    </div>
  )
}