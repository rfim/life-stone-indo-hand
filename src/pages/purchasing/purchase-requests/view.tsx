import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { formatDistanceToNow } from 'date-fns'

// Purchase Request type following the master data pattern
interface PurchaseRequest {
  id: string
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  requestNumber: string
  quantity: number
  productId: string
  description: string
  requestedBy: string
  department: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  expectedDate: string
  notes?: string
  suppliers: any[]
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  selectedSupplierId?: string
  rejectedReason?: string
}

const adapter = makeLocalStorageAdapter<PurchaseRequest>('erp.purchasing.requests')

export function ViewPurchaseRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPurchaseRequest = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        setPurchaseRequest(data)
      } catch (error) {
        console.error('Failed to load purchase request:', error)
        toast.error('Failed to load purchase request')
        navigate('/purchasing/purchase-requests')
      } finally {
        setIsLoading(false)
      }
    }

    loadPurchaseRequest()
  }, [id, navigate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'pending_approval': return 'default'
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock
      case 'pending_approval': return AlertTriangle
      case 'approved': return CheckCircle
      case 'rejected': return XCircle
      default: return Clock
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'secondary'
      case 'medium': return 'default'
      case 'high': return 'destructive'
      case 'urgent': return 'destructive'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>Loading...</div>
      </div>
    )
  }

  if (!purchaseRequest) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>Purchase request not found</div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(purchaseRequest.status)

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/purchasing/purchase-requests')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Requests
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/purchasing/purchase-requests/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Purchase Request Details</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(purchaseRequest.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {purchaseRequest.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={getUrgencyColor(purchaseRequest.urgency)}>
                  {purchaseRequest.urgency.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Request Number</label>
                <p className="text-sm font-mono">{purchaseRequest.requestNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                <p className="text-sm">{purchaseRequest.requestedBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm">{purchaseRequest.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-sm">{purchaseRequest.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected Date</label>
                <p className="text-sm">{new Date(purchaseRequest.expectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product ID</label>
                <p className="text-sm">{purchaseRequest.productId}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1">{purchaseRequest.description}</p>
            </div>

            {purchaseRequest.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1">{purchaseRequest.notes}</p>
              </div>
            )}

            {purchaseRequest.rejectedReason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                <p className="text-sm mt-1 text-destructive">{purchaseRequest.rejectedReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {purchaseRequest.suppliers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseRequest.suppliers.map((supplier, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                        <p className="text-sm font-medium">{supplier.supplierName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Price</label>
                        <p className="text-sm">{supplier.price.toLocaleString()} {supplier.currency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lead Time</label>
                        <p className="text-sm">{supplier.leadTime} days</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Terms</label>
                        <p className="text-sm">{supplier.terms}</p>
                      </div>
                    </div>
                    {supplier.notes && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                        <p className="text-sm">{supplier.notes}</p>
                      </div>
                    )}
                    {purchaseRequest.selectedSupplierId === supplier.supplierId && (
                      <div className="mt-2">
                        <Badge variant="default">Selected</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Created</span>
              <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseRequest.createdAt))} ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Updated</span>
              <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseRequest.updatedAt))} ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}