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
import { PurchaseInvoiceFields } from './fields'
import { purchaseInvoiceSchema, PurchaseInvoiceFormData } from './schema'

const adapter = makeLocalStorageAdapter('erp.purchasing.invoices')

export function CreatePurchaseInvoicePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema)
  })

  const onSubmit = async (data: PurchaseInvoiceFormData) => {
    try {
      setIsLoading(true)
      
      const entityData = {
        id: crypto.randomUUID(),
        code: data.code || crypto.randomUUID().slice(0, 8),
        name: data.name || data.description || 'New purchaseInvoice',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.create(entityData)
      toast.success('PurchaseInvoice created successfully')
      navigate('/src/pages/purchasing/purchase-invoices')
    } catch (error) {
      console.error('Create failed:', error)
      toast.error('Failed to create purchaseInvoice')
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
          onClick={() => navigate('/src/pages/purchasing/purchase-invoices')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PurchaseInvoices
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create PurchaseInvoice</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseInvoiceFields form={form} isEdit={false} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/src/pages/purchasing/purchase-invoices')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create PurchaseInvoice'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
