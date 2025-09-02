import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Eye,
  Edit,
  Send,
  Download,
  QrCode,
  Mail,
  FileText,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { 
  SalesInvoiceSummary, 
  InvoiceStatus, 
  FinanceFilterParams 
} from '@/data/finance-types'
import { useSalesInvoices } from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Invoice status configuration
const invoiceStatusConfig = {
  'DRAFT': { 
    color: 'bg-gray-100 text-gray-800', 
    icon: Edit,
    description: 'Invoice being prepared' 
  },
  'ISSUED': { 
    color: 'bg-blue-100 text-blue-800', 
    icon: FileText,
    description: 'Invoice issued to customer' 
  },
  'SENT': { 
    color: 'bg-purple-100 text-purple-800', 
    icon: Mail,
    description: 'Invoice sent to customer' 
  },
  'PARTIALLY_PAID': { 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    description: 'Partial payment received' 
  },
  'PAID': { 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    description: 'Fully paid' 
  },
  'OVERDUE': { 
    color: 'bg-red-100 text-red-800', 
    icon: AlertCircle,
    description: 'Payment overdue' 
  },
  'CANCELLED': { 
    color: 'bg-gray-100 text-gray-800', 
    icon: AlertCircle,
    description: 'Invoice cancelled' 
  },
} as const

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = invoiceStatusConfig[status]
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ')}
    </Badge>
  )
}

function InvoiceStats({ invoices }: { invoices: SalesInvoiceSummary[] }) {
  const stats = useMemo(() => {
    const totalCount = invoices.length
    const totalValue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidValue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length
    const draftCount = invoices.filter(inv => inv.status === 'DRAFT').length
    
    return {
      totalCount,
      totalValue,
      paidValue,
      outstandingValue: totalValue - paidValue,
      overdueCount,
      draftCount,
      paidPercentage: totalValue > 0 ? (paidValue / totalValue) * 100 : 0
    }
  }, [invoices])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCount}</div>
          <div className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0 
            }).format(stats.totalValue)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Outstanding Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0 
            }).format(stats.outstandingValue)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.paidPercentage.toFixed(1)}% collected
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Overdue Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
          <div className="text-sm text-gray-500 mt-1">Require immediate attention</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Draft Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.draftCount}</div>
          <div className="text-sm text-gray-500 mt-1">Ready to issue</div>
        </CardContent>
      </Card>
    </div>
  )
}

export function InvoiceManagement() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  // Filter parameters
  const filterParams: FinanceFilterParams = useMemo(() => {
    const params: FinanceFilterParams = {
      from: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Last 90 days
      to: format(new Date(), 'yyyy-MM-dd')
    }
    
    if (searchQuery) params.q = searchQuery
    if (statusFilter !== 'ALL') params.status = statusFilter
    
    return params
  }, [searchQuery, statusFilter])

  // Data queries
  const { data: invoices = [], isLoading, refetch } = useSalesInvoices(filterParams)

  // Filter invoices by status for tabs
  const invoicesByStatus = useMemo(() => {
    return {
      all: invoices,
      draft: invoices.filter(inv => inv.status === 'DRAFT'),
      issued: invoices.filter(inv => inv.status === 'ISSUED' || inv.status === 'SENT'),
      overdue: invoices.filter(inv => inv.status === 'OVERDUE'),
      paid: invoices.filter(inv => inv.status === 'PAID'),
    }
  }, [invoices])

  // Table columns
  const columns: ColumnDef<SalesInvoiceSummary>[] = [
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
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('customerName')}</div>
          {row.original.projectName && (
            <div className="text-sm text-gray-500">{row.original.projectName}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => format(new Date(row.getValue('issueDate')), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div>
          <div>{format(new Date(row.getValue('dueDate')), 'MMM dd, yyyy')}</div>
          {row.original.agingDays !== undefined && row.original.agingDays > 0 && (
            <div className="text-sm text-red-600">
              {row.original.agingDays} days overdue
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total Amount',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: row.original.currency,
              minimumFractionDigits: 0 
            }).format(row.getValue('total'))}
          </div>
          <div className="text-sm text-gray-500">
            Paid: {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: row.original.currency,
              minimumFractionDigits: 0 
            }).format(row.original.paidAmount)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'remainingAmount',
      header: 'Outstanding',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: row.original.currency,
            minimumFractionDigits: 0 
          }).format(row.getValue('remainingAmount'))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <InvoiceStatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/finance/invoice-management/${invoice.id}`)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {invoice.status === 'DRAFT' && (
              <Button size="sm" variant="outline" onClick={() => handleIssueInvoice(invoice.id)}>
                <Send className="h-4 w-4 mr-1" />
                Issue
              </Button>
            )}
            
            {(invoice.status === 'ISSUED' || invoice.status === 'SENT') && (
              <Button size="sm" variant="outline" onClick={() => handleSendWhatsApp(invoice)}>
                <Mail className="h-4 w-4 mr-1" />
                Send
              </Button>
            )}
            
            {invoice.qrPayload && (
              <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(invoice.id)}>
                <QrCode className="h-4 w-4 mr-1" />
                Print
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  // Event handlers
  const handleCreateInvoice = () => {
    navigate('/finance/invoice-management/create')
  }

  const handleIssueInvoice = async (invoiceId: string) => {
    // In a real app, this would call an API to update the invoice status
    console.log('Issuing invoice:', invoiceId)
    // Create audit log
    await mockDataProvider.logAudit(
      'SalesInvoice',
      invoiceId,
      'STATUS_CHANGE',
      'current_user',
      'Finance Manager',
      { status: { from: 'DRAFT', to: 'ISSUED' } }
    )
    refetch()
  }

  const handleSendWhatsApp = async (invoice: SalesInvoiceSummary) => {
    // Send WhatsApp message with invoice
    const payload = {
      invoiceCode: invoice.code,
      customerName: invoice.customerName,
      amount: invoice.total.toString(),
      dueDate: invoice.dueDate,
      pdfUrl: invoice.pdfUrl || `/invoices/${invoice.code}.pdf`
    }
    
    const customer = await mockDataProvider.getCustomers({ customerIds: [invoice.customerId] })
    const phone = customer[0]?.phone || '+628123456789'
    
    await mockDataProvider.sendWhatsAppMessage('invoice_send', phone, payload)
    
    // Log audit
    await mockDataProvider.logAudit(
      'SalesInvoice',
      invoice.id,
      'STATUS_CHANGE',
      'current_user',
      'Finance Manager',
      { status: { from: invoice.status, to: 'SENT' }, whatsappSent: true }
    )
    
    console.log('WhatsApp sent for invoice:', invoice.code)
    refetch()
  }

  const handlePrintInvoice = (invoiceId: string) => {
    // In a real app, this would generate and download the PDF
    console.log('Printing invoice:', invoiceId)
    window.open(`/api/invoices/${invoiceId}/print`, '_blank')
  }

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'for invoices:', selectedInvoices)
    // Implement bulk actions (issue, send, etc.)
  }

  const handleExport = (data: SalesInvoiceSummary[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track sales invoices
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <InvoiceStats invoices={invoices} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices by customer, code, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: InvoiceStatus | 'ALL') => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedInvoices.length} invoice(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('issue')}>
                  Issue Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('send')}>
                  Send Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Tables by Status */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({invoicesByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({invoicesByStatus.draft.length})</TabsTrigger>
          <TabsTrigger value="issued">Issued ({invoicesByStatus.issued.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({invoicesByStatus.overdue.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoicesByStatus.paid.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <DataTable
            title="All Invoices"
            data={invoicesByStatus.all}
            columns={columns}
            searchPlaceholder="Search invoices..."
            onExport={(format) => handleExport(invoicesByStatus.all, 'all_invoices', format)}
          />
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <DataTable
            title="Draft Invoices"
            data={invoicesByStatus.draft}
            columns={columns}
            searchPlaceholder="Search draft invoices..."
            onExport={(format) => handleExport(invoicesByStatus.draft, 'draft_invoices', format)}
          />
        </TabsContent>
        
        <TabsContent value="issued" className="space-y-4">
          <DataTable
            title="Issued Invoices"
            data={invoicesByStatus.issued}
            columns={columns}
            searchPlaceholder="Search issued invoices..."
            onExport={(format) => handleExport(invoicesByStatus.issued, 'issued_invoices', format)}
          />
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <DataTable
            title="Overdue Invoices - Immediate Action Required"
            data={invoicesByStatus.overdue}
            columns={columns}
            searchPlaceholder="Search overdue invoices..."
            onExport={(format) => handleExport(invoicesByStatus.overdue, 'overdue_invoices', format)}
          />
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <DataTable
            title="Paid Invoices"
            data={invoicesByStatus.paid}
            columns={columns}
            searchPlaceholder="Search paid invoices..."
            onExport={(format) => handleExport(invoicesByStatus.paid, 'paid_invoices', format)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}