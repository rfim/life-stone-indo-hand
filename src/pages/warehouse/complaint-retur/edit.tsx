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
import { ComplaintReturFields } from './fields'
import { complaintReturSchema, ComplaintReturFormData } from './schema'

const adapter = makeLocalStorageAdapter('erp.warehouse.complaint-retur')

export function EditComplaintReturPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<ComplaintReturFormData>({
    resolver: zodResolver(complaintReturSchema)
  })

  useEffect(() => {
    const loadEntity = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        form.reset(data)
      } catch (error) {
        console.error('Failed to load complaintRetur:', error)
        toast.error('Failed to load complaintRetur')
        navigate('/src/pages/warehouse/complaint-retur')
      } finally {
        setInitialLoading(false)
      }
    }

    loadEntity()
  }, [id, navigate, form])

  const onSubmit = async (data: ComplaintReturFormData) => {
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
      toast.success('ComplaintRetur updated successfully')
      navigate('/src/pages/warehouse/complaint-retur')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update complaintRetur')
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
          onClick={() => navigate('/src/pages/warehouse/complaint-retur')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to ComplaintReturs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit ComplaintRetur</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ComplaintReturFields form={form} isEdit={true} />
              
              <div className="flex gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/src/pages/warehouse/complaint-retur')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update ComplaintRetur'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
