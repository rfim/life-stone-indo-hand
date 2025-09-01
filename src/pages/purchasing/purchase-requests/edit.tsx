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
import { PurchaseRequestFields } from './fields'
import { purchaseRequestSchema, PurchaseRequestFormData } from './schema'

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

export function EditPurchaseRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      requestNumber: '',
      quantity: 1,
      productId: '',
      description: '',
      requestedBy: '',
      department: '',
      urgency: 'medium',
      expectedDate: '',
      notes: '',
      suppliers: [],
      status: 'draft',
      selectedSupplierId: '',
      rejectedReason: ''
    }
  })

  useEffect(() => {
    const loadPurchaseRequest = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        
        // Reset form with loaded data
        form.reset({
          requestNumber: data.requestNumber,
          quantity: data.quantity,
          productId: data.productId,
          description: data.description,
          requestedBy: data.requestedBy,
          department: data.department,
          urgency: data.urgency,
          expectedDate: data.expectedDate,
          notes: data.notes || '',
          suppliers: data.suppliers,
          status: data.status,
          selectedSupplierId: data.selectedSupplierId || '',
          rejectedReason: data.rejectedReason || ''
        })
      } catch (error) {
        console.error('Failed to load purchase request:', error)
        toast.error('Failed to load purchase request')
        navigate('/purchasing/purchase-requests')
      } finally {
        setInitialLoading(false)
      }
    }

    loadPurchaseRequest()
  }, [id, navigate, form])

  const onSubmit = async (data: PurchaseRequestFormData) => {
    if (!id) return
    
    try {
      setIsLoading(true)

      const originalRequest = await adapter.get(id)
      const requestData: PurchaseRequest = {
        ...originalRequest,
        code: data.requestNumber,
        name: data.description,
        active: data.status !== 'rejected',
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.update(id, requestData)
      toast.success('Purchase request updated successfully')
      navigate('/purchasing/purchase-requests')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update purchase request')
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
          onClick={() => navigate('/purchasing/purchase-requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Requests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Purchase Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseRequestFields form={form} isEdit={true} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/purchasing/purchase-requests')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Purchase Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}