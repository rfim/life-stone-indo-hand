import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText,
  Eye,
  Edit,
  Printer,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Import our new data layer
import { DeliveryOrder, DOStatus, ListParams } from './types'
import { deliveryOrderAdapter } from './adapters'
import { StatusBadge } from './components/StatusBadge'
import { seedDeliveryOrderData } from './seed-data'

export function DeliveryOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DOStatus | 'all' | 'uninvoiced'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 25

  // Modal state from URL params
  const modalParam = searchParams.get('modal')
  const idParam = searchParams.get('id')
  const isCreateOpen = modalParam === 'delivery-orders.create'
  const isEditOpen = modalParam === 'delivery-orders.edit' && !!idParam
  const isViewOpen = modalParam === 'delivery-orders.view' && !!idParam

  // Initialize seed data
  useEffect(() => {
    seedDeliveryOrderData()
  }, [])

  // Load delivery orders
  const loadDeliveryOrders = async () => {
    try {
      setLoading(true)
      const params: ListParams = {
        q: searchQuery,
        status: statusFilter,
        page: currentPage,
        pageSize
      }
      
      const response = await deliveryOrderAdapter.list(params)
      setDeliveryOrders(response.data)
      setTotalCount(response.total)
    } catch (error) {
      console.error('Error loading delivery orders:', error)
      toast.error('Failed to load delivery orders')
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    loadDeliveryOrders()
  }, [searchQuery, statusFilter, currentPage])

  // Modal handlers
  const openCreate = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('modal', 'delivery-orders.create')
      newParams.delete('id')
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

  const openUninvoicedList = () => {
    setStatusFilter('uninvoiced')
    setCurrentPage(1)
  }

  const handlePrint = (deliveryOrder: DeliveryOrder) => {
    // TODO: Implement print functionality
    toast.info(`Print functionality for ${deliveryOrder.deliveryOrderNumber} will be implemented`)
  }

  const handleDelete = async (id: string) => {
    try {
      await deliveryOrderAdapter.delete(id)
      toast.success('Delivery order deleted successfully')
      loadDeliveryOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete delivery order')
    }
  }

  const canEdit = (status: DOStatus) => !['invoiced', 'closed', 'cancelled'].includes(status)
  const canDelete = (deliveryOrder: DeliveryOrder) => deliveryOrder.status === 'draft'

  // Calculate pagination info
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Delivery Order</h1>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
          <Button variant="outline" onClick={openUninvoicedList}>
            <FileText className="w-4 h-4 mr-2" />
            Uninvoiced List
          </Button>
          <Button variant="outline" onClick={() => toast.info('Print SO functionality will be implemented')}>
            <Printer className="w-4 h-4 mr-2" />
            Print SO
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search delivery orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: DOStatus | 'all' | 'uninvoiced') => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="invoiced">Invoiced</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="uninvoiced">Uninvoiced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Kode SO</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tgl Dibuat</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : deliveryOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No delivery orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryOrders.map((deliveryOrder) => (
                    <TableRow key={deliveryOrder.id}>
                      <TableCell>
                        {format(new Date(deliveryOrder.deliveryDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {deliveryOrder.deliveryOrderNumber}
                      </TableCell>
                      <TableCell>{deliveryOrder.salesOrderNumber}</TableCell>
                      <TableCell>{deliveryOrder.customerName}</TableCell>
                      <TableCell>
                        {format(new Date(deliveryOrder.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{deliveryOrder.createdBy || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={deliveryOrder.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openView(deliveryOrder.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {canEdit(deliveryOrder.status) && (
                              <DropdownMenuItem onClick={() => openEdit(deliveryOrder.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handlePrint(deliveryOrder)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            {canDelete(deliveryOrder) && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(deliveryOrder.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {totalCount} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Zero state pagination */}
          {totalCount === 0 && !loading && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Showing 0 to 0 of 0 entries
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Add modals/sheets for Create, Edit, View */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {isCreateOpen ? 'Create Delivery Order' : 'Edit Delivery Order'}
            </h2>
            <p className="text-muted-foreground mb-4">
              Form component will be implemented next
            </p>
            <Button onClick={closeModal}>Close</Button>
          </div>
        </div>
      )}

      {isViewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">View Delivery Order</h2>
            <p className="text-muted-foreground mb-4">
              View dialog component will be implemented next
            </p>
            <Button onClick={closeModal}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}