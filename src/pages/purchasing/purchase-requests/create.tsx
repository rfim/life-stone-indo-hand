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

export function CreatePurchaseRequestPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

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

  const onSubmit = async (data: PurchaseRequestFormData) => {
    try {
      setIsLoading(true)

      // Auto-generate request number if not provided
      if (!data.requestNumber) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const result = await adapter.list({ page: 1, pageSize: 1000 })
        const count = result.data.length + 1
        data.requestNumber = `PR/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      const requestData: PurchaseRequest = {
        id: crypto.randomUUID(),
        code: data.requestNumber,
        name: data.description,
        active: data.status !== 'rejected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.create(requestData)
      toast.success('Purchase request created successfully')
      navigate('/purchasing/purchase-requests')
    } catch (error) {
      console.error('Create failed:', error)
      toast.error('Failed to create purchase request')
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
          onClick={() => navigate('/purchasing/purchase-requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Requests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseRequestFields form={form} isEdit={false} />
              
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
                  {isLoading ? 'Creating...' : 'Create Purchase Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}