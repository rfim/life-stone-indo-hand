import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table'
import { 
  Plus, 
  Search, 
  Filter, 
  Columns, 
  Download, 
  Upload, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Truck,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { 
  SimpleDeliveryOrder as DeliveryOrder, 
  useSimpleDeliveryOrdersList as useDeliveryOrdersList,
  useSimpleDeliveryOrder as useDeliveryOrder,
  useSimpleCreateDeliveryOrder as useCreateDeliveryOrder,
  useSimpleUpdateDeliveryOrder as useUpdateDeliveryOrder,
  useSimpleDeleteDeliveryOrder as useDeleteDeliveryOrder,
  simpleDeliveryOrderService as deliveryOrderService
} from '@/lib/api/simple-delivery-orders'
import { ColumnDef } from '@tanstack/react-table'

export function DeliveryOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Modal states
  const modalType = searchParams.get('modal')
  const editId = searchParams.get('id')
  const isCreateOpen = modalType === 'delivery-orders.create'
  const isEditOpen = modalType === 'delivery-orders.edit' && !!editId
  const isViewOpen = modalType === 'delivery-orders.view' && !!editId

  // Data fetching
  const { data: deliveryOrdersData, isLoading, error, refetch } = useDeliveryOrdersList()

  const { data: editData, isLoading: isLoadingEdit } = useDeliveryOrder(editId || '')

  // Mutations
  const createMutation = useCreateDeliveryOrder()
  const updateMutation = useUpdateDeliveryOrder()
  const deleteMutation = useDeleteDeliveryOrder()

  const deliveryOrders = deliveryOrdersData?.data || []
  const total = deliveryOrdersData?.total || 0

  // Modal handlers
  const openCreate = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('modal', 'delivery-orders.create')
      return newParams
    })
  }

  const openEdit = (id: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('modal', 'delivery-orders.edit')
      newParams.set('id', id)
      return newParams
    })
  }

  const openView = (id: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('modal', 'delivery-orders.view')
      newParams.set('id', id)
      return newParams
    })
  }

  const closeModal = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('modal')
      newParams.delete('id')
      return newParams
    })
  }

  // Status badge renderer
  const getStatusBadge = (status: DeliveryOrder['status']) => {
    const variants: Record<DeliveryOrder['status'], { variant: any; label: string; icon: React.ReactNode }> = {
      draft: { variant: 'secondary', label: 'Draft', icon: <Edit className="w-3 h-3" /> },
      released: { variant: 'default', label: 'Released', icon: <Truck className="w-3 h-3" /> },
      invoiced: { variant: 'success', label: 'Invoiced', icon: <CheckCircle className="w-3 h-3" /> },
      closed: { variant: 'outline', label: 'Closed', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: <XCircle className="w-3 h-3" /> }
    }
    
    const config = variants[status]
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Progress calculator for delivery completion (simplified for now)
  const getDeliveryProgress = (deliveryOrder: DeliveryOrder) => {
    // For the simple version, just return a placeholder
    return deliveryOrder.status === 'closed' ? 100 : deliveryOrder.status === 'draft' ? 0 : 50
  }

  // Table columns
  const columns: ColumnDef<DeliveryOrder>[] = [
    {
      accessorKey: 'deliveryOrderNumber',
      header: 'DO Number',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('deliveryOrderNumber')}
        </div>
      ),
    },
    {
      accessorKey: 'deliveryDate',
      header: 'Delivery Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(row.getValue('deliveryDate')), 'dd MMM yyyy')}
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('customerName')}</div>
          <div className="text-sm text-muted-foreground">
            Simple DO
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalQuantity',
      header: 'Total Qty',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('totalQuantity')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      header: 'Progress',
      cell: ({ row }) => {
        const progress = getDeliveryProgress(row.original)
        return (
          <div className="w-24">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">{progress}%</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <div className="font-medium">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(row.getValue('totalAmount'))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openView(row.original.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row.original.id)}
            disabled={row.original.status === 'invoiced' || row.original.status === 'closed'}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrint(row.original)}
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePrint = (deliveryOrder: DeliveryOrder) => {
    // Generate printable delivery note
    toast.info('Printing functionality will be implemented')
  }

  const handleVoid = async (id: string, reason: string) => {
    try {
      // Simple void - just update status for now
      await deliveryOrderService.update(id, {
        status: 'cancelled',
        voidReason: reason,
        voidedAt: new Date()
      })
      toast.success('Delivery Order voided successfully')
      refetch()
      closeModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to void delivery order')
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load delivery orders. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Orders</h1>
          <p className="text-muted-foreground">
            Manage delivery orders and track shipments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Delivery Order
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search delivery orders..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Columns className="w-4 h-4 mr-2" />
              Columns
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={deliveryOrders}
            loading={isLoading}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize,
              pageCount: Math.ceil(total / pageSize),
              total,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
            onRowClick={(row) => openView(row.id)}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Sheet open={isCreateOpen || isEditOpen} onOpenChange={closeModal}>
        <SheetContent className="w-full max-w-4xl">
          <SheetHeader>
            <SheetTitle>
              {isCreateOpen ? 'Create Delivery Order' : 'Edit Delivery Order'}
            </SheetTitle>
            <SheetDescription>
              {isCreateOpen 
                ? 'Create a new delivery order from an approved sales order' 
                : 'Update delivery order details'
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <SimpleDeliveryOrderForm
              deliveryOrder={editData}
              onSave={(data) => {
                if (isCreateOpen) {
                  createMutation.mutate(data, {
                    onSuccess: () => {
                      toast.success('Delivery Order created successfully')
                      refetch()
                      closeModal()
                    },
                    onError: (error) => {
                      toast.error(error instanceof Error ? error.message : 'Failed to create delivery order')
                    }
                  })
                } else {
                  updateMutation.mutate({ id: editId!, data }, {
                    onSuccess: () => {
                      toast.success('Delivery Order updated successfully')
                      refetch()
                      closeModal()
                    },
                    onError: (error) => {
                      toast.error(error instanceof Error ? error.message : 'Failed to update delivery order')
                    }
                  })
                }
              }}
              onCancel={closeModal}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Delivery Order Details</DialogTitle>
            <DialogDescription>
              View delivery order information and line items
            </DialogDescription>
          </DialogHeader>
          
          {editData && (
            <SimpleDeliveryOrderView 
              deliveryOrder={editData} 
              onClose={closeModal}
              onVoid={handleVoid}
              onPrint={handlePrint}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Simple Form Component
interface SimpleDeliveryOrderFormProps {
  deliveryOrder?: DeliveryOrder
  onSave: (data: any) => void
  onCancel: () => void
  loading: boolean
}

function SimpleDeliveryOrderForm({ deliveryOrder, onSave, onCancel, loading }: SimpleDeliveryOrderFormProps) {
  const [formData, setFormData] = React.useState({
    deliveryOrderNumber: deliveryOrder?.deliveryOrderNumber || `DO/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
    deliveryDate: deliveryOrder?.deliveryDate || new Date(),
    customerName: deliveryOrder?.customerName || '',
    status: deliveryOrder?.status || 'draft' as const,
    totalQuantity: deliveryOrder?.totalQuantity || 1,
    totalAmount: deliveryOrder?.totalAmount || 100000,
    notes: deliveryOrder?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryOrderNumber">DO Number</Label>
          <Input
            id="deliveryOrderNumber"
            value={formData.deliveryOrderNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryOrderNumber: e.target.value }))}
            disabled={!!deliveryOrder}
          />
        </div>
        <div>
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalQuantity">Total Quantity</Label>
          <Input
            id="totalQuantity"
            type="number"
            value={formData.totalQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: Number(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// Simple View Component
interface SimpleDeliveryOrderViewProps {
  deliveryOrder: DeliveryOrder
  onClose: () => void
  onVoid: (id: string, reason: string) => void
  onPrint: (deliveryOrder: DeliveryOrder) => void
}

function SimpleDeliveryOrderView({ deliveryOrder, onClose, onVoid, onPrint }: SimpleDeliveryOrderViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>DO Number</Label>
          <div className="font-medium">{deliveryOrder.deliveryOrderNumber}</div>
        </div>
        <div>
          <Label>Customer Name</Label>
          <div className="font-medium">{deliveryOrder.customerName}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <div>{getStatusBadge(deliveryOrder.status)}</div>
        </div>
        <div>
          <Label>Total Amount</Label>
          <div className="font-medium">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(deliveryOrder.totalAmount)}
          </div>
        </div>
      </div>

      {deliveryOrder.notes && (
        <div>
          <Label>Notes</Label>
          <div>{deliveryOrder.notes}</div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => onPrint(deliveryOrder)}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        {deliveryOrder.status === 'draft' && (
          <Button variant="destructive" onClick={() => onVoid(deliveryOrder.id, 'Manual void')}>
            <XCircle className="w-4 h-4 mr-2" />
            Void
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}