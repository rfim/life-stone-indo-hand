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
import { LookupSelect } from '@/components/lookup-select'
import { 
  Plus, 
  Search, 
  Filter, 
  Columns, 
  Download, 
  Upload, 
  FileTemplate,
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
  DeliveryOrder, 
  DeliveryOrderLine, 
  SalesOrder,
  deliveryOrderHooks,
  enhancedDeliveryOrderService,
  generateDeliveryOrderNumber
} from '@/lib/api/delivery-orders'
import { DeliveryOrderForm } from '@/components/forms/delivery-order-form'
import { DeliveryOrderView } from '@/components/forms/delivery-order-view'
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
  const { data: deliveryOrdersData, isLoading, error, refetch } = deliveryOrderHooks.useList({
    page: currentPage,
    pageSize,
    q: searchQuery
  })

  const { data: editData, isLoading: isLoadingEdit } = deliveryOrderHooks.useGet(editId || '') // Remove the enabled option that's causing issues

  // Mutations
  const createMutation = deliveryOrderHooks.useCreate()
  const updateMutation = deliveryOrderHooks.useUpdate()
  const deleteMutation = deliveryOrderHooks.useDelete()

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

  // Progress calculator for delivery completion
  const getDeliveryProgress = (lines: DeliveryOrderLine[]) => {
    if (lines.length === 0) return 0
    
    const totalOrdered = lines.reduce((sum, line) => sum + line.orderedQuantity, 0)
    const totalDelivered = lines.reduce((sum, line) => sum + line.alreadyDeliveredQuantity + line.quantityToDeliver, 0)
    
    return totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0
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
            SO: {row.original.salesOrderId}
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
        const progress = getDeliveryProgress(row.original.lines)
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
      await enhancedDeliveryOrderService.voidDeliveryOrder(id, reason)
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
            <FileTemplate className="w-4 h-4 mr-2" />
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
            <DeliveryOrderFormPlaceholder
              deliveryOrder={editData}
              onSave={(data) => {
                if (isCreateOpen) {
                  // Use the enhanced service for creating with stock mutations
                  enhancedDeliveryOrderService.createWithStockMutation(data).then((result) => {
                    toast.success('Delivery Order created successfully')
                    refetch()
                    closeModal()
                  }).catch((error) => {
                    toast.error(error instanceof Error ? error.message : 'Failed to create delivery order')
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
            <DeliveryOrderViewPlaceholder 
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

// Form Component (to be implemented separately)
interface DeliveryOrderFormProps {
  deliveryOrder?: DeliveryOrder
  onSave: (data: any) => void
  onCancel: () => void
  loading: boolean
}

function DeliveryOrderFormPlaceholder({ deliveryOrder, onSave, onCancel, loading }: DeliveryOrderFormProps) {
  return <DeliveryOrderForm deliveryOrder={deliveryOrder} onSave={onSave} onCancel={onCancel} loading={loading} />
}

// View Component (to be implemented separately)
interface DeliveryOrderViewProps {
  deliveryOrder: DeliveryOrder
  onClose: () => void
  onVoid: (id: string, reason: string) => void
  onPrint: (deliveryOrder: DeliveryOrder) => void
}

function DeliveryOrderViewPlaceholder({ deliveryOrder, onClose, onVoid, onPrint }: DeliveryOrderViewProps) {
  return <DeliveryOrderView deliveryOrder={deliveryOrder} onClose={onClose} onVoid={onVoid} onPrint={onPrint} />
}