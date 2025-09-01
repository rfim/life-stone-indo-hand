import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Purchase Request type following the master data pattern
interface PurchaseRequest {
  id: string
  code: string // will be requestNumber
  name: string // will be description
  active: boolean
  createdAt: string
  updatedAt: string
  // Purchase request specific fields
  requestNumber: string
  quantity: number
  productId: string
  description: string
  requestedBy: string
  department: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  expectedDate: string
  suppliers: any[]
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  selectedSupplierId?: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
}

const adapter = makeLocalStorageAdapter<PurchaseRequest>('erp.purchasing.requests')

export function PurchaseRequestsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState<PurchaseRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const pageSize = 10

  // Load data
  const loadData = async () => {
    setIsLoading(true)
    try {
      const result = await adapter.list({ q: searchQuery, page, pageSize })
      setRows(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load purchase requests:', error)
      toast.error('Failed to load purchase requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCreate = () => {
    navigate('/purchasing/purchase-requests/create')
  }

  const handleView = (id: string) => {
    navigate(`/purchasing/purchase-requests/${id}/view`)
  }

  const handleEdit = (id: string) => {
    navigate(`/purchasing/purchase-requests/${id}/edit`)
  }

  // Generate request number
  const generateRequestNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PR/${year}/${month}/${day}/${random}`
  }

  const handleApprove = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'approved',
        approvedBy: 'Current User', // In real app, get from auth
        approvedAt: new Date().toISOString()
      })
      toast.success('Purchase request approved successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to approve purchase request')
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await adapter.update(id, { 
        status: 'rejected',
        rejectedReason: reason,
        active: false
      })
      toast.success('Purchase request rejected')
      loadData()
    } catch (error) {
      toast.error('Failed to reject purchase request')
    }
  }

  const handleSendEmail = async (id: string) => {
    // In real app, this would send emails to suppliers
    toast.success('Email sent to suppliers successfully')
  }

  const handleCreatePO = (id: string) => {
    // Navigate to PO creation with this request
    window.open(`/purchasing/purchase-orders?create=true&requestId=${id}`, '_blank')
  }

  // Custom columns for purchase requests
  const columns = [
    {
      key: 'requestNumber',
      header: 'Request #',
      render: (row: PurchaseRequest) => (
        <div className="font-mono text-sm">{row.requestNumber}</div>
      )
    },
    {
      key: 'productId',
      header: 'Product',
      render: (row: PurchaseRequest) => {
        // In real app, lookup product name
        const productMap: Record<string, string> = {
          'prod-001': 'Marble Slab - Carrara White',
          'prod-002': 'Granite Tile - Black Galaxy', 
          'prod-003': 'Travertine - Beige Classic'
        }
        return productMap[row.productId] || row.productId
      }
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (row: PurchaseRequest) => (
        <div className="text-right">{row.quantity}</div>
      )
    },
    {
      key: 'requestedBy',
      header: 'Requested By'
    },
    {
      key: 'department',
      header: 'Department',
      render: (row: PurchaseRequest) => (
        <Badge variant="outline">{row.department}</Badge>
      )
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (row: PurchaseRequest) => {
        const variants = {
          urgent: 'destructive' as const,
          high: 'destructive' as const, 
          medium: 'default' as const,
          low: 'secondary' as const
        }
        return (
          <Badge variant={variants[row.urgency] || 'default'}>
            {row.urgency?.toUpperCase()}
          </Badge>
        )
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PurchaseRequest) => {
        const variants = {
          approved: 'default' as const,
          pending_approval: 'secondary' as const,
          rejected: 'destructive' as const,
          draft: 'outline' as const
        }
        
        const icons = {
          approved: CheckCircle,
          pending_approval: Clock,
          rejected: XCircle,
          draft: AlertTriangle
        }
        
        const Icon = icons[row.status as keyof typeof icons]
        
        return (
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4" />}
            <Badge variant={variants[row.status as keyof typeof variants] || 'outline'}>
              {row.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'expectedDate',
      header: 'Expected Date',
      render: (row: PurchaseRequest) => {
        const date = new Date(row.expectedDate)
        return (
          <div className="text-sm">
            {date.toLocaleDateString()}
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: PurchaseRequest) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending_approval' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(row.id)}
                className="h-7"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(row.id, 'Rejected by user')}
                className="h-7"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {row.status === 'approved' && row.suppliers?.length > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendEmail(row.id)}
                className="h-7"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button
                size="sm"
                onClick={() => handleCreatePO(row.id)}
                className="h-7"
              >
                <FileText className="h-3 w-3 mr-1" />
                Create PO
              </Button>
            </>
          )}
          
          {/* Always show View and Edit buttons */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(row.id)}
            className="h-7"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(row.id)}
            className="h-7"
          >
            Edit
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <MasterList
        title="Purchase Requests"
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        searchQuery={searchQuery}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onEdit={() => {}} // Using custom actions in actions column instead
        columns={columns}
        isLoading={isLoading}
      />
    </div>
  )
}