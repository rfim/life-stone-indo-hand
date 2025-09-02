import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  User,
  Search,
  AlertCircle,
  Eye
} from 'lucide-react'
import { 
  PaymentRequestSummary, 
  PaymentRequestStatus, 
  PaymentSourceType,
  FinanceFilterParams 
} from '@/data/finance-types'
import { usePaymentRequests } from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Payment request status configuration
const statusConfig = {
  'PENDING': { 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    description: 'Awaiting approval' 
  },
  'APPROVED': { 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    description: 'Approved for payment' 
  },
  'REJECTED': { 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle,
    description: 'Request rejected' 
  },
} as const

const sourceTypeConfig = {
  'PURCHASE_ORDER': {
    label: 'Purchase Order',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText
  },
  'INVOICE': {
    label: 'Invoice',
    color: 'bg-green-100 text-green-800',
    icon: FileText
  },
  'REIMBURSEMENT': {
    label: 'Reimbursement',
    color: 'bg-purple-100 text-purple-800',
    icon: User
  }
} as const

function PaymentRequestStatusBadge({ status }: { status: PaymentRequestStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

function SourceTypeBadge({ sourceType }: { sourceType: PaymentSourceType }) {
  const config = sourceTypeConfig[sourceType]
  const Icon = config.icon
  
  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function PaymentRequestStats({ requests }: { requests: PaymentRequestSummary[] }) {
  const stats = useMemo(() => {
    const pendingRequests = requests.filter(req => req.status === 'PENDING')
    const pendingValue = pendingRequests.reduce((sum, req) => sum + req.amount, 0)
    const approvedToday = requests.filter(req => 
      req.status === 'APPROVED' && 
      req.approvedAt && 
      format(new Date(req.approvedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    )
    const rejectedToday = requests.filter(req => 
      req.status === 'REJECTED' && 
      req.approvedAt && 
      format(new Date(req.approvedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    )
    
    return {
      pendingCount: pendingRequests.length,
      pendingValue,
      approvedTodayCount: approvedToday.length,
      rejectedTodayCount: rejectedToday.length,
      avgAmount: requests.length > 0 ? requests.reduce((sum, req) => sum + req.amount, 0) / requests.length : 0
    }
  }, [requests])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
          <div className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0 
            }).format(stats.pendingValue)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Approved Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.approvedTodayCount}</div>
          <div className="text-sm text-gray-500 mt-1">Ready for payment</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Rejected Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rejectedTodayCount}</div>
          <div className="text-sm text-gray-500 mt-1">Needs review</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Average Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR',
              minimumFractionDigits: 0,
              notation: 'compact' 
            }).format(stats.avgAmount)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Per request</div>
        </CardContent>
      </Card>
    </div>
  )
}

function ApprovalDialog({ 
  request, 
  action, 
  onClose, 
  onSubmit 
}: { 
  request: PaymentRequestSummary
  action: 'approve' | 'reject'
  onClose: () => void
  onSubmit: (note: string) => void
}) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(note)
      onClose()
    } catch (error) {
      console.error('Error submitting approval:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve Payment Request' : 'Reject Payment Request'}
          </DialogTitle>
          <DialogDescription>
            {request.sourceCode} - {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: request.currency,
              minimumFractionDigits: 0 
            }).format(request.amount)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
            </label>
            <Textarea
              placeholder={action === 'approve' 
                ? 'Add any notes for this approval...' 
                : 'Please explain why this request is being rejected...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || (action === 'reject' && !note.trim())}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {isSubmitting ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PaymentApproval() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentRequestStatus | 'ALL'>('ALL')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<PaymentSourceType | 'ALL'>('ALL')
  const [approvalDialog, setApprovalDialog] = useState<{
    request: PaymentRequestSummary
    action: 'approve' | 'reject'
  } | null>(null)

  // Filter parameters
  const filterParams: FinanceFilterParams = useMemo(() => {
    const params: FinanceFilterParams = {
      from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Last 30 days
      to: format(new Date(), 'yyyy-MM-dd')
    }
    
    if (searchQuery) params.q = searchQuery
    if (statusFilter !== 'ALL') params.status = statusFilter
    
    return params
  }, [searchQuery, statusFilter])

  // Data queries
  const { data: requests = [], isLoading, refetch } = usePaymentRequests(filterParams)

  // Filter requests by source type
  const filteredRequests = useMemo(() => {
    if (sourceTypeFilter === 'ALL') return requests
    return requests.filter(req => req.sourceType === sourceTypeFilter)
  }, [requests, sourceTypeFilter])

  // Separate pending requests for priority display
  const pendingRequests = useMemo(() => 
    filteredRequests.filter(req => req.status === 'PENDING'),
    [filteredRequests]
  )

  // Table columns
  const columns: ColumnDef<PaymentRequestSummary>[] = [
    {
      accessorKey: 'sourceCode',
      header: 'Source',
      cell: ({ row }) => (
        <div>
          <Button 
            variant="link" 
            onClick={() => navigate(`/finance/payment-approval/${row.original.id}`)}
            className="p-0 font-medium text-blue-600"
          >
            {row.getValue('sourceCode')}
          </Button>
          <div className="mt-1">
            <SourceTypeBadge sourceType={row.original.sourceType} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('requestedBy')}</div>
          <div className="text-sm text-gray-500">
            {format(new Date(row.original.requestedAt), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: row.original.currency,
            minimumFractionDigits: 0 
          }).format(row.getValue('amount'))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <PaymentRequestStatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('note')}>
          {row.getValue('note') || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate(`/finance/payment-approval/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {request.status === 'PENDING' && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => setApprovalDialog({ request, action: 'approve' })}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setApprovalDialog({ request, action: 'reject' })}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  // Event handlers
  const handleApprovalAction = async (action: 'approve' | 'reject', note: string) => {
    if (!approvalDialog) return

    const request = approvalDialog.request
    
    try {
      // In a real app, this would call an API
      console.log(`${action} payment request:`, request.id, 'with note:', note)
      
      // Create a payment record if approved
      if (action === 'approve') {
        // This would create a payment record in the backend
        console.log('Creating payment record for approved request')
      }
      
      // Log audit
      await mockDataProvider.logAudit(
        'PaymentRequest',
        request.id,
        action === 'approve' ? 'APPROVAL' : 'REJECTION',
        'current_user',
        'Finance Manager',
        { 
          status: { from: 'PENDING', to: action === 'approve' ? 'APPROVED' : 'REJECTED' },
          note: note || undefined
        }
      )
      
      refetch()
    } catch (error) {
      console.error('Error processing approval:', error)
      throw error
    }
  }

  const handleBulkApprove = async () => {
    // In a real app, this would approve multiple requests
    console.log('Bulk approving all pending requests')
    for (const request of pendingRequests) {
      await handleApprovalAction('approve', 'Bulk approval')
    }
  }

  const handleExport = (data: PaymentRequestSummary[], filename: string, format: 'csv' | 'pdf') => {
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Approval</h1>
          <p className="text-muted-foreground">
            Review and approve payment requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {pendingRequests.length > 0 && (
            <Button onClick={handleBulkApprove} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All Pending ({pendingRequests.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <PaymentRequestStats requests={filteredRequests} />

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
                  placeholder="Search by source code, requester, or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: PaymentRequestStatus | 'ALL') => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceTypeFilter} onValueChange={(value: PaymentSourceType | 'ALL') => setSourceTypeFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PURCHASE_ORDER">Purchase Orders</SelectItem>
                <SelectItem value="INVOICE">Invoices</SelectItem>
                <SelectItem value="REIMBURSEMENT">Reimbursements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Priority Alert for Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                {pendingRequests.length} payment request(s) require your immediate attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Requests Table */}
      <DataTable
        title="Payment Requests"
        data={filteredRequests}
        columns={columns}
        searchPlaceholder="Search payment requests..."
        onExport={(format) => handleExport(filteredRequests, 'payment_requests', format)}
      />

      {/* Approval Dialog */}
      {approvalDialog && (
        <ApprovalDialog
          request={approvalDialog.request}
          action={approvalDialog.action}
          onClose={() => setApprovalDialog(null)}
          onSubmit={(note) => handleApprovalAction(approvalDialog.action, note)}
        />
      )}
    </div>
  )
}