import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SimpleDataTable } from './SimpleDataTable'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  DollarSign,
  Users,
  Truck,
  Image,
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  Filter,
  Search,
  Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/format-currency'
import { useApprovalsApi } from '@/lib/api/director-dashboard'
import { ApprovalRecord, ApprovalType, ApprovalStatus } from '@/types/director-dashboard'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'

interface ApprovalDialogProps {
  approval: ApprovalRecord
  action: 'approve' | 'reject'
  onClose: () => void
  onSubmit: (note: string) => void
  loading: boolean
}

function ApprovalDialog({ approval, action, onClose, onSubmit, loading }: ApprovalDialogProps) {
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(note)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve' : 'Reject'} {approval.entityType}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="note">
              {action === 'approve' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={action === 'approve' ? 'Add approval note...' : 'Please provide reason for rejection...'}
              required={action === 'reject'}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (action === 'reject' && !note.trim())}
              className={`flex-1 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getApprovalTypeIcon(type: ApprovalType) {
  switch (type) {
    case 'PurchaseRequest': return ShoppingCart
    case 'ClientDiscount': return DollarSign
    case 'HRGAPayment': return Users
    case 'ShippingCost': return Truck
    case 'SocialMediaContent': return Image
    case 'SalesOrder': return FileText
    case 'PurchaseOrder': return CreditCard
    default: return FileText
  }
}

function getStatusColor(status: ApprovalStatus) {
  switch (status) {
    case 'Pending': return 'yellow'
    case 'Approved': return 'green'
    case 'Rejected': return 'red'
    case 'Cancelled': return 'gray'
    default: return 'gray'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Urgent': return 'red'
    case 'High': return 'orange'
    case 'Medium': return 'yellow'
    case 'Low': return 'green'
    default: return 'gray'
  }
}

export function ApprovalManagement() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('All')
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [approvalDialog, setApprovalDialog] = useState<{
    approval: ApprovalRecord
    action: 'approve' | 'reject'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { data: approvals = [], isLoading, refetch } = useApprovalsApi.useList()
  const { mutate: updateApproval } = useApprovalsApi.useUpdate()

  // Filter approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter(approval => {
      const matchesSearch = approval.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || approval.status === statusFilter
      const matchesType = typeFilter === 'All' || approval.entityType === typeFilter
      const matchesPriority = priorityFilter === 'All' || approval.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
  }, [approvals, searchTerm, statusFilter, typeFilter, priorityFilter])

  // Group approvals by status
  const pendingApprovals = filteredApprovals.filter(a => a.status === 'Pending')
  const processedApprovals = filteredApprovals.filter(a => a.status !== 'Pending')

  const handleApprovalAction = async (action: 'approve' | 'reject', note: string) => {
    if (!approvalDialog) return

    setActionLoading(true)
    try {
      const approval = approvalDialog.approval
      const updateData = {
        status: action === 'approve' ? 'Approved' as ApprovalStatus : 'Rejected' as ApprovalStatus,
        notes: note,
        [action === 'approve' ? 'approvedBy' : 'rejectedBy']: 'current_user',
        [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString(),
        ...(action === 'reject' && { rejectionReason: note })
      }

      updateApproval({ id: approval.id, data: updateData }, {
        onSuccess: () => {
          toast.success(`${approval.entityType} ${action}d successfully`)
          setApprovalDialog(null)
          refetch()
        },
        onError: () => {
          toast.error(`Failed to ${action} ${approval.entityType}`)
        }
      })
    } catch (error) {
      toast.error(`Failed to ${action} approval`)
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnDef<ApprovalRecord>[] = [
    {
      accessorKey: 'entityType',
      header: 'Type',
      cell: ({ row }) => {
        const Icon = getApprovalTypeIcon(row.original.entityType)
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-500" />
            <span>{row.original.entityType}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'entityId',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.entityId.slice(-8)}</span>
      )
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.requestedBy}</span>
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant="outline" className={`border-${getPriorityColor(row.original.priority)}-200 text-${getPriorityColor(row.original.priority)}-700`}>
          {row.original.priority}
        </Badge>
      )
    },
    {
      accessorKey: 'requestedAt',
      header: 'Requested At',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.requestedAt).toLocaleDateString()}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={`border-${getStatusColor(row.original.status)}-200 text-${getStatusColor(row.original.status)}-700`}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const approval = row.original
        if (approval.status !== 'Pending') {
          return (
            <span className="text-sm text-gray-500">
              {approval.status === 'Approved' ? 'Approved' : 'Processed'}
            </span>
          )
        }
        
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => setApprovalDialog({ approval, action: 'approve' })}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setApprovalDialog({ approval, action: 'reject' })}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )
      }
    }
  ]

  const urgentPendingCount = pendingApprovals.filter(a => a.priority === 'Urgent').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Management</h1>
          <p className="text-gray-600 mt-1">
            Review and approve pending requests across all business functions
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboards/overview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Alert for urgent approvals */}
      {urgentPendingCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {urgentPendingCount} urgent approval{urgentPendingCount > 1 ? 's' : ''} require immediate attention
                </p>
                <p className="text-sm text-red-700">
                  Review the "Pending Approvals" tab to address these requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{pendingApprovals.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{urgentPendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {processedApprovals.filter(a => 
                    a.status === 'Approved' && 
                    new Date(a.approvedAt || '').toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{filteredApprovals.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search approvals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApprovalStatus | 'All')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ApprovalType | 'All')}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="PurchaseRequest">Purchase Request</SelectItem>
                <SelectItem value="ClientDiscount">Client Discount</SelectItem>
                <SelectItem value="HRGAPayment">HRGA Payment</SelectItem>
                <SelectItem value="ShippingCost">Shipping Cost</SelectItem>
                <SelectItem value="SocialMediaContent">Social Media Content</SelectItem>
                <SelectItem value="SalesOrder">Sales Order</SelectItem>
                <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({processedApprovals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          <SimpleDataTable
            data={pendingApprovals}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search pending approvals..."
            title="Pending Approvals"
          />
        </TabsContent>
        
        <TabsContent value="processed" className="mt-4">
          <SimpleDataTable
            data={processedApprovals}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search processed approvals..."
            title="Processed Approvals"
          />
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {approvalDialog && (
        <ApprovalDialog
          approval={approvalDialog.approval}
          action={approvalDialog.action}
          onClose={() => setApprovalDialog(null)}
          onSubmit={handleApprovalAction}
          loading={actionLoading}
        />
      )}
    </div>
  )
}