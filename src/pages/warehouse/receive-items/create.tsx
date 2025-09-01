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
import { ReceiveItemsFields } from './fields'
import { receiveItemsSchema, ReceiveItemsFormData } from './schema'

const adapter = makeLocalStorageAdapter('erp.warehouse.receive-items')

export function CreateReceiveItemsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ReceiveItemsFormData>({
    resolver: zodResolver(receiveItemsSchema)
  })

  const onSubmit = async (data: ReceiveItemsFormData) => {
    try {
      setIsLoading(true)
      
      const entityData = {
        id: crypto.randomUUID(),
        code: data.code || crypto.randomUUID().slice(0, 8),
        name: data.name || data.description || 'New receiveItems',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      await adapter.create(entityData)
      toast.success('ReceiveItems created successfully')
      navigate('/src/pages/warehouse/receive-items')
    } catch (error) {
      console.error('Create failed:', error)
      toast.error('Failed to create receiveItems')
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
          onClick={() => navigate('/src/pages/warehouse/receive-items')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to ReceiveItemss
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create ReceiveItems</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ReceiveItemsFields form={form} isEdit={false} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/src/pages/warehouse/receive-items')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create ReceiveItems'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
