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
import { SKUFields } from './fields'
import { skuSchema, SKUFormData } from './schema'

const adapter = makeLocalStorageAdapter('erp.warehouse.sku-management')

export function EditSKUPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<SKUFormData>({
    resolver: zodResolver(skuSchema)
  })

  useEffect(() => {
    const loadEntity = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        form.reset(data)
      } catch (error) {
        console.error('Failed to load skuManagement:', error)
        toast.error('Failed to load skuManagement')
        navigate('/src/pages/warehouse/sku-management')
      } finally {
        setInitialLoading(false)
      }
    }

    loadEntity()
  }, [id, navigate, form])

  const onSubmit = async (data: SKUFormData) => {
    if (!id) return
    
    try {
      setIsLoading(true)

      const originalEntity = await adapter.get(id)
      const entityData = {
        ...originalEntity,
        ...data,
        updatedAt: new Date().toISOString()
      }

      await adapter.update(id, entityData)
      toast.success('SkuManagement updated successfully')
      navigate('/src/pages/warehouse/sku-management')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update skuManagement')
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
          onClick={() => navigate('/src/pages/warehouse/sku-management')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SkuManagements
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit SkuManagement</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <SKUFields form={form} isEdit={true} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/src/pages/warehouse/sku-management')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update SkuManagement'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
