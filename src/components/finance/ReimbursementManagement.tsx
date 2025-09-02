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
  Receipt, 
  Plus,
  Eye,
  Edit,
  Send,
  Check,
  X,
  Clock,
  DollarSign,
  FileText,
  Upload,
  Download,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { 
  FinanceFilterParams, 
  ReimbursementSummary, 
  ReimbursementStatus 
} from '@/data/finance-types'
import { 
  useReimbursements,
  useReimbursementStats
} from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Reimbursement Status Configuration
const REIMBURSEMENT_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Send },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: Check },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: X },
  PAID: { label: 'Paid', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
  POSTED: { label: 'Posted', color: 'bg-emerald-100 text-emerald-800', icon: Receipt }
}

// Reimbursement Categories
const REIMBURSEMENT_CATEGORIES = [
  'Finishing Change',
  'Transport',
  'Meal Allowance',
  'Communication',
  'Office Supplies',
  'Training',
  'Other'
]

interface ReimbursementManagementProps {}

export function ReimbursementManagement({}: ReimbursementManagementProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FinanceFilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReimbursement, setSelectedReimbursement] = useState<ReimbursementSummary | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'SUBMIT' | 'APPROVE' | 'REJECT' | 'PAY'>('SUBMIT')
  const [actionNotes, setActionNotes] = useState('')

  // Form state for new reimbursement
  const [formData, setFormData] = useState({
    requesterId: '',
    projectId: '',
    category: '',
    amount: '',
    currency: 'IDR',
    description: '',
    receipts: [] as File[]
  })

  // Fetch data with React Query
  const { data: reimbursements = [], isLoading } = useReimbursements(filters)
  const { data: stats } = useReimbursementStats(filters)

  // Filter reimbursements based on search term
  const filteredReimbursements = useMemo(() => {
    if (!searchTerm) return reimbursements
    return reimbursements.filter(reimbursement => 
      reimbursement.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.requesterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [reimbursements, searchTerm])

  // Reimbursement columns for data table
  const reimbursementColumns: ColumnDef<ReimbursementSummary>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      )
    },
    {
      accessorKey: 'requesterId',
      header: 'Requester',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.requesterId}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      )
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.projectId || '-'}
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
        const config = REIMBURSEMENT_STATUS_CONFIG[row.original.status as keyof typeof REIMBURSEMENT_STATUS_CONFIG]
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
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      accessorKey: 'approvedBy',
      header: 'Approved By',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.approvedBy || '-'}
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
            onClick={() => {
              setSelectedReimbursement(row.original)
              setDetailDialogOpen(true)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'DRAFT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReimbursement(row.original)
                setActionType('SUBMIT')
                setActionDialogOpen(true)
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
          {row.original.status === 'SUBMITTED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReimbursement(row.original)
                  setActionType('APPROVE')
                  setActionDialogOpen(true)
                }}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReimbursement(row.original)
                  setActionType('REJECT')
                  setActionDialogOpen(true)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          {row.original.status === 'APPROVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReimbursement(row.original)
                setActionType('PAY')
                setActionDialogOpen(true)
              }}
            >
              <DollarSign className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ], [])

  const handleCreateReimbursement = async () => {
    try {
      const newReimbursement = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'DRAFT' as ReimbursementStatus
      }
      
      await mockDataProvider.createReimbursement(newReimbursement)
      
      setCreateDialogOpen(false)
      setFormData({
        requesterId: '',
        projectId: '',
        category: '',
        amount: '',
        currency: 'IDR',
        description: '',
        receipts: []
      })
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  const handleReimbursementAction = async () => {
    if (!selectedReimbursement) return
    
    try {
      let newStatus: ReimbursementStatus
      
      switch (actionType) {
        case 'SUBMIT':
          newStatus = 'SUBMITTED'
          break
        case 'APPROVE':
          newStatus = 'APPROVED'
          break
        case 'REJECT':
          newStatus = 'REJECTED'
          break
        case 'PAY':
          newStatus = 'PAID'
          break
        default:
          return
      }
      
      await mockDataProvider.updateReimbursementStatus(selectedReimbursement.id, newStatus, actionNotes)
      
      setActionDialogOpen(false)
      setActionNotes('')
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Management</h1>
          <p className="text-muted-foreground">Manage employee reimbursements and expense claims</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Reimbursement
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reimbursements</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReimbursements}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.totalAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.approvedAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidCount}</div>
              <p className="text-xs text-muted-foreground">
                IDR {stats.paidAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Tabs */}
      <Tabs defaultValue="ALL" onValueChange={(value) => 
        setFilters(prev => ({ ...prev, status: value === 'ALL' ? undefined : value }))
      }>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="SUBMITTED">Submitted</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="PAID">Paid</TabsTrigger>
          <TabsTrigger value="POSTED">Posted</TabsTrigger>
        </TabsList>

        <TabsContent value="ALL" className="space-y-4">
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
                      placeholder="Search by code, requester, category, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.category || 'ALL'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, category: value === 'ALL' ? undefined : value }))
                }>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {REIMBURSEMENT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reimbursements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reimbursement Records</CardTitle>
              <CardDescription>All reimbursement requests and their approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={reimbursementColumns}
                data={filteredReimbursements}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab contents would be similar with filtered data */}
      </Tabs>

      {/* Create Reimbursement Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Reimbursement</DialogTitle>
            <DialogDescription>
              Submit a new reimbursement request for expense claims
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requester">Requester ID</Label>
                <Input
                  id="requester"
                  value={formData.requesterId}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesterId: e.target.value }))}
                  placeholder="Enter requester ID"
                />
              </div>
              <div>
                <Label htmlFor="project">Project ID</Label>
                <Input
                  id="project"
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="Enter project ID (optional)"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {REIMBURSEMENT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="flex gap-2">
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter reimbursement description"
              />
            </div>
            
            <div>
              <Label htmlFor="receipts">Receipt Attachments</Label>
              <Input
                id="receipts"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setFormData(prev => ({ ...prev, receipts: files }))
                }}
              />
              {formData.receipts.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {formData.receipts.length} file(s) selected
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReimbursement}>
                <Plus className="w-4 h-4 mr-2" />
                Create Reimbursement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reimbursement Details</DialogTitle>
            <DialogDescription>
              {selectedReimbursement?.code} - {selectedReimbursement?.category}
            </DialogDescription>
          </DialogHeader>
          {selectedReimbursement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requester</Label>
                  <div className="text-sm">{selectedReimbursement.requesterId}</div>
                </div>
                <div>
                  <Label>Project</Label>
                  <div className="text-sm">{selectedReimbursement.projectId || 'N/A'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="text-sm font-medium">
                    {selectedReimbursement.currency} {selectedReimbursement.amount.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>
                    <Badge variant="outline" className={REIMBURSEMENT_STATUS_CONFIG[selectedReimbursement.status].color}>
                      {REIMBURSEMENT_STATUS_CONFIG[selectedReimbursement.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="text-sm">{selectedReimbursement.description}</div>
              </div>
              {selectedReimbursement.approvedBy && (
                <div>
                  <Label>Approved By</Label>
                  <div className="text-sm">{selectedReimbursement.approvedBy}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'SUBMIT' && 'Submit Reimbursement'}
              {actionType === 'APPROVE' && 'Approve Reimbursement'}
              {actionType === 'REJECT' && 'Reject Reimbursement'}
              {actionType === 'PAY' && 'Mark as Paid'}
            </DialogTitle>
            <DialogDescription>
              {actionType} reimbursement {selectedReimbursement?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-notes">Notes</Label>
              <Textarea
                id="action-notes"
                placeholder={`Enter ${actionType.toLowerCase()} notes...`}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReimbursementAction}>
                {actionType === 'SUBMIT' && <Send className="w-4 h-4 mr-2" />}
                {actionType === 'APPROVE' && <Check className="w-4 h-4 mr-2" />}
                {actionType === 'REJECT' && <X className="w-4 h-4 mr-2" />}
                {actionType === 'PAY' && <DollarSign className="w-4 h-4 mr-2" />}
                {actionType === 'SUBMIT' && 'Submit'}
                {actionType === 'APPROVE' && 'Approve'}
                {actionType === 'REJECT' && 'Reject'}
                {actionType === 'PAY' && 'Mark Paid'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}