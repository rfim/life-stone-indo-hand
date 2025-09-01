import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit } from 'lucide-react'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { formatDistanceToNow } from 'date-fns'

const adapter = makeLocalStorageAdapter('erp.purchasing.invoices')

export function ViewPurchaseInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entity, setEntity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEntity = async () => {
      if (!id) return
      
      try {
        const data = await adapter.get(id)
        setEntity(data)
      } catch (error) {
        console.error('Failed to load purchaseInvoice:', error)
        toast.error('Failed to load purchaseInvoice')
        navigate('/src/pages/purchasing/purchase-invoices')
      } finally {
        setIsLoading(false)
      }
    }

    loadEntity()
  }, [id, navigate])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>Loading...</div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div>PurchaseInvoice not found</div>
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
            onClick={() => navigate('/src/pages/purchasing/purchase-invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PurchaseInvoices
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/src/pages/purchasing/purchase-invoices/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PurchaseInvoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="text-sm font-mono">{entity.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-sm">{entity.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{entity.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={entity.active ? 'default' : 'secondary'}>
                {entity.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{formatDistanceToNow(new Date(entity.createdAt))} ago</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{formatDistanceToNow(new Date(entity.updatedAt))} ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
