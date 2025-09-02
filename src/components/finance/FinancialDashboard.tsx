import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format, subDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  Eye,
  Download,
  Send,
  Clock,
  ArrowUp,
  ArrowDown,
  Banknote,
  Receipt,
  PieChart,
  BarChart3
} from 'lucide-react'
import { 
  FinanceFilterParams, 
  SalesInvoiceSummary, 
  PaymentRequestSummary, 
  ReimbursementSummary,
  DateWindow 
} from '@/data/finance-types'
import { 
  useFinancialKpis, 
  useFinanceChartData, 
  useSalesInvoices, 
  usePaymentRequests, 
  useReimbursements 
} from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Reusable KPI Tile Component
interface KpiTileProps {
  title: string
  value: string
  delta?: number
  icon: React.ComponentType<any>
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  onClick?: () => void
}

function KpiTile({ title, value, delta, icon: Icon, color = 'blue', onClick }: KpiTileProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50', 
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50'
  }

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600', 
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  }

  return (
    <Card className={`${colorClasses[color]} cursor-pointer hover:shadow-md transition-shadow`} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {delta >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={delta >= 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="ml-1">vs prev period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Simple Chart Components
interface ChartProps {
  title: string
  data: any[]
  onDrillDown?: (data: any) => void
}

function SimpleBarChart({ title, data, onDrillDown }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value || d.amount))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => onDrillDown?.(item)}
            >
              <span className="text-sm font-medium">{item.label || item.category || item.bucket}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((item.value || item.amount) / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(item.value || item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SimpleLineChart({ title, data, onDrillDown }: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end space-x-1">
          {data.slice(0, 7).map((item, index) => (
            <div 
              key={index}
              className="flex-1 flex flex-col items-center cursor-pointer hover:opacity-80"
              onClick={() => onDrillDown?.(item)}
            >
              <div 
                className="w-full bg-blue-500 rounded-t" 
                style={{ height: `${(item.sales / Math.max(...data.map(d => d.sales))) * 100}%` }}
              />
              <span className="text-xs mt-1">{format(new Date(item.date), 'MM/dd')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function FinancialDashboard() {
  const navigate = useNavigate()
  const [dateWindow, setDateWindow] = useState<DateWindow>('1M')
  
  // Calculate date range based on window
  const dateRange = useMemo(() => {
    const to = format(new Date(), 'yyyy-MM-dd')
    let from: string
    
    switch (dateWindow) {
      case '1M':
        from = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        break
      case '6M':
        from = format(subDays(new Date(), 180), 'yyyy-MM-dd')
        break
      case '12M':
        from = format(subDays(new Date(), 365), 'yyyy-MM-dd')
        break
      default:
        from = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    }
    
    return { from, to }
  }, [dateWindow])

  const filterParams: FinanceFilterParams = dateRange

  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useFinancialKpis(filterParams)
  const { data: chartData, isLoading: chartLoading } = useFinanceChartData(filterParams)
  const { data: salesInvoices = [], isLoading: invoicesLoading } = useSalesInvoices(filterParams)
  const { data: paymentRequests = [], isLoading: paymentRequestsLoading } = usePaymentRequests(filterParams)
  const { data: reimbursements = [], isLoading: reimbursementsLoading } = useReimbursements(filterParams)

  // Filter data for different views
  const overdueInvoices = useMemo(() => 
    salesInvoices.filter(inv => inv.status === 'OVERDUE' || (inv.agingDays && inv.agingDays > 0 && inv.remainingAmount > 0)),
    [salesInvoices]
  )

  const pendingPaymentRequests = useMemo(() =>
    paymentRequests.filter(req => req.status === 'PENDING'),
    [paymentRequests]
  )

  const pendingReimbursements = useMemo(() =>
    reimbursements.filter(reimb => reimb.status === 'SUBMITTED' || reimb.status === 'APPROVED'),
    [reimbursements]
  )

  // Table column definitions
  const overdueInvoiceColumns: ColumnDef<SalesInvoiceSummary>[] = [
    {
      accessorKey: 'code',
      header: 'Invoice #',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          onClick={() => navigate(`/finance/invoice-management/${row.original.id}`)}
          className="p-0 font-medium text-blue-600"
        >
          {row.getValue('code')}
        </Button>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(new Date(row.getValue('dueDate')), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'remainingAmount',
      header: 'Amount Due',
      cell: ({ row }) => new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0 
      }).format(row.getValue('remainingAmount')),
    },
    {
      accessorKey: 'agingDays',
      header: 'Days Overdue',
      cell: ({ row }) => (
        <Badge variant={row.getValue('agingDays') > 60 ? 'destructive' : 'secondary'}>
          {row.getValue('agingDays')} days
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/finance/invoice-management/${row.original.id}`)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => console.log('Send reminder', row.original.id)}>
            <Send className="h-4 w-4 mr-1" />
            Remind
          </Button>
        </div>
      ),
    },
  ]

  const paymentRequestColumns: ColumnDef<PaymentRequestSummary>[] = [
    {
      accessorKey: 'sourceCode',
      header: 'Source',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          onClick={() => navigate(`/finance/payment-approval/${row.original.id}`)}
          className="p-0 font-medium text-blue-600"
        >
          {row.getValue('sourceCode')}
        </Button>
      ),
    },
    {
      accessorKey: 'sourceType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('sourceType')}
        </Badge>
      ),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: row.original.currency,
        minimumFractionDigits: 0 
      }).format(row.getValue('amount')),
    },
    {
      accessorKey: 'requestedAt',
      header: 'Requested',
      cell: ({ row }) => format(new Date(row.getValue('requestedAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/finance/payment-approval/${row.original.id}`)}>
            Review
          </Button>
        </div>
      ),
    },
  ]

  // Event handlers
  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (kpisLoading || chartLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor financial performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateWindow} onValueChange={(value: DateWindow) => setDateWindow(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="12M">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport(salesInvoices, 'financial_dashboard', 'csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Health KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Financial Health Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            title="Current Ratio"
            value={kpis?.currentRatio.toFixed(2) || '0.00'}
            icon={TrendingUp}
            color={kpis?.currentRatio >= 1.5 ? 'green' : kpis?.currentRatio >= 1 ? 'yellow' : 'red'}
          />
          <KpiTile
            title="Quick Ratio"
            value={kpis?.quickRatio.toFixed(2) || '0.00'}
            icon={TrendingUp}
            color={kpis?.quickRatio >= 1 ? 'green' : kpis?.quickRatio >= 0.5 ? 'yellow' : 'red'}
          />
          <KpiTile
            title="Gross Margin %"
            value={`${kpis?.grossMarginPct.toFixed(1) || '0.0'}%`}
            icon={PieChart}
            color="blue"
          />
          <KpiTile
            title="Net Margin %"
            value={`${kpis?.netMarginPct.toFixed(1) || '0.0'}%`}
            icon={PieChart}
            color="purple"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            title="Total Revenue"
            value={new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(kpis?.totalRevenue.value || 0)}
            delta={kpis?.totalRevenue.delta}
            icon={DollarSign}
            color="green"
            onClick={() => navigate('/finance/invoice-management')}
          />
          <KpiTile
            title="Total AR"
            value={new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(kpis?.totalAR.value || 0)}
            delta={kpis?.totalAR.delta}
            icon={Receipt}
            color="blue"
            onClick={() => navigate('/finance/invoice-management')}
          />
          <KpiTile
            title="Cash Balance"
            value={new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(kpis?.cashBalance.value || 0)}
            delta={kpis?.cashBalance.delta}
            icon={Banknote}
            color="green"
          />
          <KpiTile
            title="Net Income"
            value={new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(kpis?.netIncome.value || 0)}
            delta={kpis?.netIncome.delta}
            icon={TrendingUp}
            color={kpis?.netIncome.value >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Operational Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            title="Overdue Invoices"
            value={`${kpis?.invoicesOverdue.count || 0} invoices`}
            icon={AlertCircle}
            color={kpis?.invoicesOverdue.count > 0 ? 'red' : 'green'}
            onClick={() => navigate('/finance/invoice-management?status=overdue')}
          />
          <KpiTile
            title="Pending Payments"
            value={`${kpis?.paymentsApproved.count || 0} items`}
            icon={Clock}
            color="yellow"
            onClick={() => navigate('/finance/payment-approval')}
          />
          <KpiTile
            title="Pending Reimbursements"
            value={`${kpis?.reimbursementsPending.count || 0} items`}
            icon={FileText}
            color="blue"
            onClick={() => navigate('/finance/reimbursement')}
          />
          <KpiTile
            title="DSO (Days)"
            value={`${kpis?.dso || 0} days`}
            icon={BarChart3}
            color="purple"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData && (
          <>
            <SimpleLineChart
              title="Sales Trend"
              data={chartData.salesTrend}
              onDrillDown={(data) => navigate(`/finance/invoice-management?date=${data.date}`)}
            />
            <SimpleBarChart
              title="AR Aging"
              data={chartData.arAging}
              onDrillDown={(data) => navigate(`/finance/invoice-management?aging=${data.bucket}`)}
            />
            <SimpleBarChart
              title="Currency Exposure"
              data={chartData.currencyExposure}
              onDrillDown={(data) => navigate(`/finance/invoice-management?currency=${data.currency}`)}
            />
            <SimpleBarChart
              title="Category Breakdown"
              data={chartData.categoryBreakdown.filter(c => c.type === 'REVENUE')}
              onDrillDown={(data) => navigate(`/finance/accounting-journal?category=${data.category}`)}
            />
          </>
        )}
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="overdue" className="w-full">
        <TabsList>
          <TabsTrigger value="overdue">Overdue Invoices ({overdueInvoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Pending Payments ({pendingPaymentRequests.length})</TabsTrigger>
          <TabsTrigger value="reimbursements">Pending Reimbursements ({pendingReimbursements.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overdue" className="space-y-4">
          <DataTable
            title="Overdue Invoices - Immediate Action Required"
            data={overdueInvoices}
            columns={overdueInvoiceColumns}
            searchPlaceholder="Search invoices..."
            onExport={(format) => handleExport(overdueInvoices, 'overdue_invoices', format)}
          />
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <DataTable
            title="Payment Requests Pending Approval"
            data={pendingPaymentRequests}
            columns={paymentRequestColumns}
            searchPlaceholder="Search payment requests..."
            onExport={(format) => handleExport(pendingPaymentRequests, 'pending_payments', format)}
          />
        </TabsContent>
        
        <TabsContent value="reimbursements" className="space-y-4">
          <DataTable
            title="Reimbursements Awaiting Processing"
            data={pendingReimbursements}
            columns={[
              {
                accessorKey: 'code',
                header: 'Code',
                cell: ({ row }) => (
                  <Button 
                    variant="link" 
                    onClick={() => navigate(`/finance/reimbursement/${row.original.id}`)}
                    className="p-0 font-medium text-blue-600"
                  >
                    {row.getValue('code')}
                  </Button>
                ),
              },
              { accessorKey: 'requesterName', header: 'Requester' },
              { accessorKey: 'category', header: 'Category' },
              {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ row }) => new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: row.original.currency,
                  minimumFractionDigits: 0 
                }).format(row.getValue('amount')),
              },
              {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                  <Badge variant={row.getValue('status') === 'APPROVED' ? 'default' : 'secondary'}>
                    {row.getValue('status')}
                  </Badge>
                ),
              },
            ]}
            searchPlaceholder="Search reimbursements..."
            onExport={(format) => handleExport(pendingReimbursements, 'pending_reimbursements', format)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}