import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { ArrowLeft, Save } from 'lucide-react'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { PurchaseOrderFields } from './fields'
import { purchaseOrderSchema, PurchaseOrderFormData } from './schema'

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

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: '',
      purchaseRequestId: '',
      supplierId: '',
      supplierName: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      status: 'draft',
      paymentInfo: {
        termsOfPayment: '',
        leadTime: 0,
        shippingCosts: 0,
        portFees: 0,
        discount: 0,
        discountType: 'percentage',
        isVAT: false,
        vatPercentage: 0
      },
      productInfo: {
        packingList: '',
        loadingPhotos: [],
        productPhotos: [],
        volume: 0,
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'cm'
        }
      },
      lineItems: [],
      deductions: [],
      additionalPayments: [],
      totalAmount: 0,
      currency: '',
      notes: ''
    }
  })

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      setIsLoading(true)

      // Auto-generate order number if not provided
      if (!data.orderNumber) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const result = await adapter.list({ page: 1, pageSize: 1000 })
        const count = result.data.length + 1
        data.orderNumber = `PO/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      const orderData: PurchaseOrder = {
        id: crypto.randomUUID(),
        code: data.orderNumber,
        name: `PO for ${data.supplierName}`,
        active: data.status !== 'cancelled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.create(orderData)
      toast.success('Purchase order created successfully')
      navigate('/purchasing/purchase-orders')
    } catch (error) {
      console.error('Create failed:', error)
      toast.error('Failed to create purchase order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseOrderFields form={form} isEdit={false} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/purchasing/purchase-orders')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Purchase Order'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}