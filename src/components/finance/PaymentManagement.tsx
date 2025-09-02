import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Upload, 
  Eye,
  Download,
  Check,
  X,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Pause
} from 'lucide-react'
import { 
  FinanceFilterParams, 
  PaymentSummary, 
  PaymentStatus 
} from '@/data/finance-types'
import { 
  usePayments,
  usePaymentStats
} from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Payment Status Configuration
const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  VERIFIED: { label: 'Verified', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  POSTED: { label: 'Posted', color: 'bg-green-100 text-green-800', icon: Check }
}

// Source Type Configuration
const SOURCE_TYPE_CONFIG = {
  PURCHASE_ORDER: { label: 'Purchase Order', color: 'bg-purple-100 text-purple-800' },
  SALES_INVOICE: { label: 'Sales Invoice', color: 'bg-blue-100 text-blue-800' },
  REIMBURSEMENT: { label: 'Reimbursement', color: 'bg-green-100 text-green-800' }
}

interface PaymentManagementProps {}

export function PaymentManagement({}: PaymentManagementProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FinanceFilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentSummary | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')

  // Fetch data with React Query
  const { data: payments = [], isLoading } = usePayments(filters)
  const { data: stats } = usePaymentStats(filters)

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments
    return payments.filter(payment => 
      payment.sourceCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [payments, searchTerm])

  // Payment columns for data table
  const paymentColumns: ColumnDef<PaymentSummary>[] = useMemo(() => [
    {
      accessorKey: 'sourceCode',
      header: 'Source',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.sourceCode}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className={SOURCE_TYPE_CONFIG[row.original.sourceType as keyof typeof SOURCE_TYPE_CONFIG]?.color}>
              {SOURCE_TYPE_CONFIG[row.original.sourceType as keyof typeof SOURCE_TYPE_CONFIG]?.label}
            </Badge>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'payeeId',
      header: 'Payee',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.payeeId}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            {row.original.currency} {row.original.amount.toLocaleString('id-ID')}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = PAYMENT_STATUS_CONFIG[row.original.status as keyof typeof PAYMENT_STATUS_CONFIG]
        const Icon = config.icon
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'paidAt',
      header: 'Payment Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.paidAt ? format(new Date(row.original.paidAt), 'MMM dd, yyyy') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'verifiedBy',
      header: 'Verified By',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.verifiedBy || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPayment(row.original)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPayment(row.original)
                  setUploadDialogOpen(true)
                }}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPayment(row.original)
                  setStatusDialogOpen(true)
                }}
              >
                <Check className="w-4 h-4" />
              </Button>
            </>
          )}
          {row.original.proofUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(row.original.proofUrl, '_blank')}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ], [])

  const handleUploadProof = async () => {
    if (!selectedPayment || !uploadFile) return
    
    try {
      // Simulate file upload
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('paymentId', selectedPayment.id)
      
      // Mock API call
      await mockDataProvider.uploadPaymentProof(selectedPayment.id, formData)
      
      setUploadDialogOpen(false)
      setUploadFile(null)
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleStatusUpdate = async (newStatus: PaymentStatus) => {
    if (!selectedPayment) return
    
    try {
      await mockDataProvider.updatePaymentStatus(selectedPayment.id, newStatus, notes)
      setStatusDialogOpen(false)
      setNotes('')
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">Manage payment records, upload proofs, and verify transactions</p>
        </div>
        <Button onClick={() => navigate('/finance/payment-approval')}>
          <Plus className="w-4 h-4 mr-2" />
          New Payment Request
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.totalAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.pendingAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedCount}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.verifiedAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posted</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.postedCount}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.postedAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by source, payee, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filters.status || 'ALL'} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value === 'ALL' ? undefined : value }))
            }>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>All payment transactions and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Upload Proof Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Upload proof of payment for {selectedPayment?.sourceCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proof-file">Payment Proof File</Label>
              <Input
                id="proof-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="upload-notes">Notes</Label>
              <Textarea
                id="upload-notes"
                placeholder="Enter any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadProof} disabled={!uploadFile}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update status for payment {selectedPayment?.sourceCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status-notes">Notes</Label>
              <Textarea
                id="status-notes"
                placeholder="Enter verification notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleStatusUpdate('VERIFIED')}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify
              </Button>
              <Button onClick={() => handleStatusUpdate('POSTED')}>
                <Check className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}