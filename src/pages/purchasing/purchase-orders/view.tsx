import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, FileText, Building } from 'lucide-react'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { formatDistanceToNow } from 'date-fns'

// Purchase Order type following the master data pattern
interface PurchaseOrder {
  id: string
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  orderNumber: string
  purchaseRequestId: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDeliveryDate: string
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  paymentInfo: {
    termsOfPayment: string
    leadTime: number
    shippingCosts: number
    portFees: number
    discount: number
    discountType: 'percentage' | 'fixed'
    isVAT: boolean
    vatPercentage?: number
  }
  productInfo: {
    packingList: string
    loadingPhotos: string[]
    productPhotos: string[]
    volume: number
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'mm' | 'cm' | 'm'
    }
  }
  lineItems: any[]
  deductions: any[]
  additionalPayments: any[]
  totalAmount: number
  currency: string
  notes?: string
  sentAt?: string
  confirmedAt?: string
  shippedAt?: string
  receivedAt?: string
}

const adapter = makeLocalStorageAdapter<PurchaseOrder>('erp.purchasing.orders')

export function ViewPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPurchaseOrder = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        setPurchaseOrder(data)
      } catch (error) {
        console.error('Failed to load purchase order:', error)
        toast.error('Failed to load purchase order')
        navigate('/purchasing/purchase-orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadPurchaseOrder()
  }, [id, navigate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'sent': return 'default'
      case 'confirmed': return 'default'
      case 'shipped': return 'default'
      case 'received': return 'default'
      case 'cancelled': return 'destructive'
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

  if (!purchaseOrder) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>Purchase order not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/purchasing/purchase-orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/purchasing/purchase-orders/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send to Supplier
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Print PO
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Purchase Order Details</CardTitle>
              <Badge variant={getStatusColor(purchaseOrder.status)}>
                {purchaseOrder.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                <p className="text-sm font-mono">{purchaseOrder.orderNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-sm">{purchaseOrder.supplierName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <p className="text-sm">{new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                <p className="text-sm">{new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <p className="text-sm">{purchaseOrder.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <p className="text-sm font-semibold">{purchaseOrder.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {purchaseOrder.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1">{purchaseOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Terms of Payment</label>
                <p className="text-sm">{purchaseOrder.paymentInfo.termsOfPayment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Lead Time</label>
                <p className="text-sm">{purchaseOrder.paymentInfo.leadTime} days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shipping Costs</label>
                <p className="text-sm">{purchaseOrder.paymentInfo.shippingCosts.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Port Fees</label>
                <p className="text-sm">{purchaseOrder.paymentInfo.portFees.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Discount</label>
                <p className="text-sm">
                  {purchaseOrder.paymentInfo.discount} {purchaseOrder.paymentInfo.discountType === 'percentage' ? '%' : purchaseOrder.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">VAT</label>
                <p className="text-sm">
                  {purchaseOrder.paymentInfo.isVAT ? `${purchaseOrder.paymentInfo.vatPercentage || 0}%` : 'No VAT'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Volume</label>
                <p className="text-sm">{purchaseOrder.productInfo.volume} m³</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Weight</label>
                <p className="text-sm">{purchaseOrder.productInfo.weight} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                <p className="text-sm">
                  {purchaseOrder.productInfo.dimensions.length} × {purchaseOrder.productInfo.dimensions.width} × {purchaseOrder.productInfo.dimensions.height} {purchaseOrder.productInfo.dimensions.unit}
                </p>
              </div>
            </div>

            {purchaseOrder.productInfo.packingList && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Packing List</label>
                <p className="text-sm mt-1">{purchaseOrder.productInfo.packingList}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {purchaseOrder.lineItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchaseOrder.lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.quantity} × {item.unitPrice.toLocaleString()}</p>
                      <p className="text-sm font-semibold">{item.totalPrice.toLocaleString()}</p>
                    </div>
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
              <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseOrder.createdAt))} ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Updated</span>
              <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseOrder.updatedAt))} ago</span>
            </div>
            {purchaseOrder.sentAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Sent to Supplier</span>
                <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseOrder.sentAt))} ago</span>
              </div>
            )}
            {purchaseOrder.confirmedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Confirmed</span>
                <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(purchaseOrder.confirmedAt))} ago</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}