import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  TrendingDown,
  Eye,
  FileText,
  Mail
} from 'lucide-react'
import { FilterParams, POSummary, InvoiceSummary } from '@/data/purchasing-types'
import { 
  useKpis, 
  usePOs, 
  useInvoices
} from '@/hooks/purchasing/usePurchasingQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '../KpiTile'
import { ChartDonut } from '../ChartDonut'
import { ChartArea } from '../ChartArea'
import { DataTable } from '../DataTable'

interface FinanceDashboardProps {
  filterParams: FilterParams
}

export function FinanceDashboard({ filterParams }: FinanceDashboardProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useKpis(filterParams)
  const { data: pos = [], isLoading: posLoading } = usePOs(filterParams)
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices(filterParams)

  // Filter data for finance view
  const unpaidPOs = useMemo(() => 
    pos.filter(po => po.unpaid), 
    [pos]
  )

  const invoicesDueOverdue = useMemo(() => {
    const now = dayjs()
    return invoices.filter(inv => {
      const dueDate = dayjs(inv.dueDate)
      return (dueDate.diff(now, 'day') <= 7 || dueDate.isBefore(now)) && inv.status !== 'Paid' && inv.status !== 'Archived'
    }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
  }, [invoices])

  // Chart data
  const currencyExposureData = useMemo(() => {
    const currencyTotals = [...pos, ...invoices].reduce((acc, item) => {
      acc[item.currency] = (acc[item.currency] || 0) + item.total
      return acc
    }, {} as Record<string, number>)

    return Object.entries(currencyTotals).map(([currency, total]) => ({
      currency,
      total
    }))
  }, [pos, invoices])

  const paymentTrendData = useMemo(() => {
    // Aggregate payments by month
    const monthlyPayments = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((acc, inv) => {
        const month = dayjs(inv.dueDate).format('MMM YYYY')
        acc[month] = (acc[month] || 0) + inv.total
        return acc
      }, {} as Record<string, number>)

    return Object.entries(monthlyPayments).map(([month, total]) => ({
      month,
      total
    }))
  }, [invoices])

  // Tax breakdown (simplified calculation)
  const taxBreakdownData = useMemo(() => {
    const vatTotals = invoices.reduce((acc, inv) => {
      const vatAmount = inv.total * 0.11 // Assuming 11% VAT
      acc['VAT 11%'] = (acc['VAT 11%'] || 0) + vatAmount
      acc['Base Amount'] = (acc['Base Amount'] || 0) + (inv.total - vatAmount)
      return acc
    }, {} as Record<string, number>)

    return Object.entries(vatTotals).map(([type, total]) => ({
      type,
      total
    }))
  }, [invoices])

  // Unpaid PO columns
  const unpaidPOColumns: ColumnDef<POSummary>[] = [
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'top',
      header: 'Terms',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.top}
        </Badge>
      )
    },
    {
      accessorKey: 'eta',
      header: 'ETA/Due',
      cell: ({ row }) => {
        if (!row.original.eta) return '-'
        const eta = dayjs(row.original.eta)
        return eta.format('MMM DD, YYYY')
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
            onClick={() => navigate(`/po/${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View PO
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/po/${row.original.id}#email`)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email PO
          </Button>
        </div>
      )
    }
  ]

  // Invoice columns
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
        const dueDate = dayjs(row.original.dueDate)
        const isOverdue = dueDate.isBefore(dayjs())
        const daysUntil = dueDate.diff(dayjs(), 'day')
        
        return (
          <div className="flex items-center space-x-2">
            <span>{dueDate.format('MMM DD, YYYY')}</span>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            {!isOverdue && daysUntil <= 3 && <Badge variant="secondary">Due Soon</Badge>}
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Approved' ? 'default' : 
                      status === 'Submitted' ? 'secondary' : 'outline'
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
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

  if (kpisLoading || posLoading || invoicesLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="Unpaid POs"
          value={kpis?.poUnpaid.count || 0}
          subtitle={`Total: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(kpis?.poUnpaid.value || 0)}`}
          icon={<CreditCard className="h-4 w-4" />}
          onClick={() => navigate('/po?status=unpaid')}
        />
        
        <KpiTile
          title="Invoices Due Soon"
          value={kpis?.invoicesDue7.count || 0}
          subtitle={`Total: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(kpis?.invoicesDue7.value || 0)}`}
          icon={<AlertCircle className="h-4 w-4" />}
          onClick={() => navigate('/invoice?due=soon')}
        />
        
        <KpiTile
          title="Total Outstanding"
          value={((kpis?.poUnpaid.value || 0) + (kpis?.invoicesDue7.value || 0))}
          format="currency"
          currency="IDR"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Payment Efficiency"
          value={85}
          format="percentage"
          subtitle="On-time payments"
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartDonut
          title="Currency Exposure"
          data={currencyExposureData}
          dataKey="total"
          nameKey="currency"
          onDrillDown={(data) => navigate(`/finance/currency/${data.currency}`)}
        />
        
        <ChartDonut
          title="Tax/VAT Breakdown"
          data={taxBreakdownData}
          dataKey="total"
          nameKey="type"
          onDrillDown={(data) => navigate(`/finance/tax/${data.type}`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartArea
          title="Payment Trend Over Time"
          data={paymentTrendData}
          dataKey="total"
          xAxisKey="month"
          onDrillDown={(data) => navigate(`/finance/payments?month=${data.month}`)}
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6">
        <DataTable
          title="Unpaid POs - Notify Finance"
          data={unpaidPOs}
          columns={unpaidPOColumns}
          searchPlaceholder="Search POs..."
          onExport={(format) => handleExport(unpaidPOs, 'unpaid_pos', format)}
        />
        
        <DataTable
          title="Invoices Due Soon/Overdue"
          data={invoicesDueOverdue}
          columns={invoiceColumns}
          searchPlaceholder="Search invoices..."
          onExport={(format) => handleExport(invoicesDueOverdue, 'invoices_due_overdue', format)}
        />
      </div>
    </div>
  )
}