import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export function EditPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: '',
      purchaseRequestId: '',
      supplierId: '',
      supplierName: '',
      orderDate: '',
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

  useEffect(() => {
    const loadPurchaseOrder = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        
        // Reset form with loaded data
        form.reset({
          orderNumber: data.orderNumber,
          purchaseRequestId: data.purchaseRequestId,
          supplierId: data.supplierId,
          supplierName: data.supplierName,
          orderDate: data.orderDate,
          expectedDeliveryDate: data.expectedDeliveryDate,
          status: data.status,
          paymentInfo: data.paymentInfo,
          productInfo: data.productInfo,
          lineItems: data.lineItems,
          deductions: data.deductions,
          additionalPayments: data.additionalPayments,
          totalAmount: data.totalAmount,
          currency: data.currency,
          notes: data.notes || ''
        })
      } catch (error) {
        console.error('Failed to load purchase order:', error)
        toast.error('Failed to load purchase order')
        navigate('/purchasing/purchase-orders')
      } finally {
        setInitialLoading(false)
      }
    }

    loadPurchaseOrder()
  }, [id, navigate, form])

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (!id) return
    
    try {
      setIsLoading(true)

      const originalOrder = await adapter.get(id)
      const orderData: PurchaseOrder = {
        ...originalOrder,
        code: data.orderNumber,
        name: `PO for ${data.supplierName}`,
        active: data.status !== 'cancelled',
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.update(id, orderData)
      toast.success('Purchase order updated successfully')
      navigate('/purchasing/purchase-orders')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update purchase order')
    } finally {
      setIsLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>Loading...</div>
      </div>
    )
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
          <CardTitle>Edit Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseOrderFields form={form} isEdit={true} />
              
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
                  {isLoading ? 'Updating...' : 'Update Purchase Order'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}