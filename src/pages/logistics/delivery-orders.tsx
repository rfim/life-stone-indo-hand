import React, { useState, useEffect, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Plus, Download, Upload, FileText, Printer, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types and Interfaces
export type DOStatus = 'draft' | 'released' | 'invoiced' | 'closed' | 'cancelled'

export interface DeliveryOrder {
  id: string
  deliveryOrderNumber: string // format DO/YYYY/MM/####
  deliveryDate: string        // ISO string
  customerName: string
  status: DOStatus
  totalQuantity: number
  totalAmount: number
  notes?: string
  createdAt: string // ISO
  updatedAt: string // ISO
}

// Local storage key
const STORAGE_KEY = 'erp.delivery-orders'

// Business Logic Functions
function generateDONumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  // Get existing DOs to find next sequential number for this month
  const existingDOs = getDeliveryOrdersFromStorage()
  const monthPrefix = `DO/${year}/${month}/`
  const monthDOs = existingDOs.filter(order => order.deliveryOrderNumber.startsWith(monthPrefix))
  
  const nextNumber = monthDOs.length + 1
  return `${monthPrefix}${String(nextNumber).padStart(4, '0')}`
}

function getProgressPercentage(status: DOStatus): number {
  switch (status) {
    case 'draft': return 0
    case 'released': return 50
    case 'invoiced': return 100
    case 'closed': return 100
    case 'cancelled': return 0
    default: return 0
  }
}

function isStatusEditable(status: DOStatus): boolean {
  return status === 'draft' || status === 'released'
}

function canVoidOrder(status: DOStatus): boolean {
  return status === 'draft'
}

// LocalStorage Service Functions
function getDeliveryOrdersFromStorage(): DeliveryOrder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading delivery orders from localStorage:', error)
    return []
  }
}

function saveDeliveryOrdersToStorage(orders: DeliveryOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error('Error saving delivery orders to localStorage:', error)
    throw new Error('Failed to save delivery orders')
  }
}

function createSampleData(): DeliveryOrder[] {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  // Generate DO numbers manually for sample data to ensure proper sequence
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  return [
    {
      id: '1',
      deliveryOrderNumber: `DO/${year}/${month}/0001`,
      deliveryDate: yesterday.toISOString(),
      customerName: 'PT. Sample Customer A',
      status: 'released',
      totalQuantity: 150,
      totalAmount: 2500000,
      notes: 'Sample delivery order for testing',
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString()
    },
    {
      id: '2', 
      deliveryOrderNumber: `DO/${year}/${month}/0002`,
      deliveryDate: now.toISOString(),
      customerName: 'CV. Sample Customer B',
      status: 'draft',
      totalQuantity: 75,
      totalAmount: 1250000,
      notes: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ]
}

// StatusBadge Component
interface StatusBadgeProps {
  status: DOStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: DOStatus) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary' as const, icon: '✏️', label: 'Draft' }
      case 'released':
        return { variant: 'default' as const, icon: '🚚', label: 'Released' }
      case 'invoiced':
        return { variant: 'default' as const, icon: '✅', label: 'Invoiced' }
      case 'closed':
        return { variant: 'outline' as const, icon: '✅', label: 'Closed' }
      case 'cancelled':
        return { variant: 'destructive' as const, icon: '❌', label: 'Cancelled' }
      default:
        return { variant: 'secondary' as const, icon: '', label: status }
    }
  }

  const config = getStatusConfig(status)
  
  return (
    <Badge variant={config.variant}>
      {config.icon} {config.label}
    </Badge>
  )
}

// Main Component
export function DeliveryOrdersPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<DeliveryOrder | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    deliveryDate: '',
    customerName: '',
    totalQuantity: '',
    totalAmount: '',
    notes: ''
  })

  const pageSize = 10

  // Load data on mount
  useEffect(() => {
    const existingData = getDeliveryOrdersFromStorage()
    if (existingData.length === 0) {
      // Seed with sample data if empty
      const sampleData = createSampleData()
      saveDeliveryOrdersToStorage(sampleData)
      setDeliveryOrders(sampleData)
    } else {
      setDeliveryOrders(existingData)
    }
  }, [])

  // Filtered and paginated data
  const filteredOrders = useMemo(() => {
    return deliveryOrders.filter(order => 
      order.deliveryOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [deliveryOrders, searchTerm])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredOrders.slice(startIndex, startIndex + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const startEntry = (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, filteredOrders.length)

  // CRUD Operations
  const handleCreate = () => {
    setEditingOrder(null)
    setFormData({
      deliveryDate: new Date().toISOString().split('T')[0], // Today's date
      customerName: '',
      totalQuantity: '',
      totalAmount: '',
      notes: ''
    })
    setIsCreateEditOpen(true)
  }

  const handleEdit = (order: DeliveryOrder) => {
    if (!isStatusEditable(order.status)) {
      toast.error('This delivery order cannot be edited because it is ' + order.status)
      return
    }
    setEditingOrder(order)
    setFormData({
      deliveryDate: order.deliveryDate.split('T')[0], // Convert ISO to date input format
      customerName: order.customerName,
      totalQuantity: order.totalQuantity.toString(),
      totalAmount: order.totalAmount.toString(),
      notes: order.notes || ''
    })
    setIsCreateEditOpen(true)
  }

  const handleView = (order: DeliveryOrder) => {
    setViewingOrder(order)
    setIsViewOpen(true)
  }

  const handleVoid = async (order: DeliveryOrder) => {
    if (!canVoidOrder(order.status)) {
      toast.error('Only draft orders can be voided')
      return
    }

    if (!confirm('Are you sure you want to void this delivery order?')) {
      return
    }

    try {
      const updatedOrders = deliveryOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'cancelled' as DOStatus, updatedAt: new Date().toISOString() }
          : o
      )
      setDeliveryOrders(updatedOrders)
      saveDeliveryOrdersToStorage(updatedOrders)
      toast.success('Delivery order voided successfully')
    } catch (error) {
      toast.error('Failed to void delivery order')
    }
  }

  const handlePrint = (order: DeliveryOrder) => {
    toast.info('Printing will be implemented')
  }

  const handleExport = () => {
    toast.info('Export will be implemented')
  }

  const handleImport = () => {
    toast.info('Import will be implemented')
  }

  const handleTemplate = () => {
    toast.info('Template download will be implemented')
  }

  // Form Operations
  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required')
      return false
    }
    if (!formData.deliveryDate) {
      toast.error('Delivery date is required')
      return false
    }
    const quantity = Number(formData.totalQuantity)
    if (!formData.totalQuantity || quantity <= 0) {
      toast.error('Total quantity must be a positive number')
      return false
    }
    const amount = Number(formData.totalAmount)
    if (!formData.totalAmount || amount <= 0) {
      toast.error('Total amount must be a positive number')
      return false
    }
    return true
  }

  const handleSave = async (shouldClose: boolean = false) => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const now = new Date().toISOString()
      const orderData = {
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        customerName: formData.customerName.trim(),
        totalQuantity: Number(formData.totalQuantity),
        totalAmount: Number(formData.totalAmount),
        notes: formData.notes.trim()
      }

      let updatedOrders: DeliveryOrder[]

      if (editingOrder) {
        // Update existing order
        updatedOrders = deliveryOrders.map(order =>
          order.id === editingOrder.id
            ? { ...order, ...orderData, updatedAt: now }
            : order
        )
        toast.success('Delivery order updated successfully')
      } else {
        // Create new order
        const newOrder: DeliveryOrder = {
          id: Date.now().toString(), // Simple ID generation
          deliveryOrderNumber: generateDONumber(),
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          ...orderData
        }
        updatedOrders = [...deliveryOrders, newOrder]
        toast.success('Delivery order created successfully')
      }

      setDeliveryOrders(updatedOrders)
      saveDeliveryOrdersToStorage(updatedOrders)

      if (shouldClose) {
        setIsCreateEditOpen(false)
      }
    } catch (error) {
      toast.error('Failed to save delivery order')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsCreateEditOpen(false)
    setFormData({
      deliveryDate: '',
      customerName: '',
      totalQuantity: '',
      totalAmount: '',
      notes: ''
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Delivery Orders</h1>
          <p className="text-muted-foreground">Manage delivery order information and status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTemplate}>
            <FileText className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by DO number or customer..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DO Number</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No delivery orders found matching your search' : 'No delivery orders found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.deliveryOrderNumber}</TableCell>
                  <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.totalQuantity.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{getProgressPercentage(order.status)}%</TableCell>
                  <TableCell>Rp {order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEdit(order)}
                          disabled={!isStatusEditable(order.status)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(order)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        {canVoidOrder(order.status) && (
                          <DropdownMenuItem 
                            onClick={() => handleVoid(order)}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Void
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
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {filteredOrders.length === 0 
              ? 'Showing 0 entries' 
              : `Showing ${startEntry}–${endEntry} of ${filteredOrders.length} entries`
            }
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={isCreateEditOpen} onOpenChange={(open) => {
        if (!open) handleCancel()
      }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingOrder ? 'Edit Delivery Order' : 'Create Delivery Order'}
            </SheetTitle>
            <SheetDescription>
              {editingOrder ? 'Update delivery order details' : 'Create a new delivery order'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* DO Number (read-only for editing) */}
            <div className="space-y-2">
              <Label htmlFor="doNumber">DO Number</Label>
              <Input
                id="doNumber"
                value={editingOrder ? editingOrder.deliveryOrderNumber : '(Auto-generated)'}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                required
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>

            {/* Total Quantity */}
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Total Quantity *</Label>
              <Input
                id="totalQuantity"
                type="number"
                min="1"
                step="1"
                placeholder="Enter total quantity"
                value={formData.totalQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: e.target.value }))}
                required
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount (Rp) *</Label>
              <Input
                id="totalAmount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter total amount"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleSave(false)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save & Close'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery Order Details</DialogTitle>
            <DialogDescription>
              View delivery order information
            </DialogDescription>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="mt-6 space-y-4">
              {/* DO Number */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">DO Number</Label>
                <p className="font-medium">{viewingOrder.deliveryOrderNumber}</p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div>
                  <StatusBadge status={viewingOrder.status} />
                </div>
              </div>

              {/* Delivery Date */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Delivery Date</Label>
                <p>{new Date(viewingOrder.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                <p>{viewingOrder.customerName}</p>
              </div>

              {/* Total Quantity */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Total Quantity</Label>
                <p>{viewingOrder.totalQuantity.toLocaleString()}</p>
              </div>

              {/* Total Amount */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                <p>Rp {viewingOrder.totalAmount.toLocaleString()}</p>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                <p>{getProgressPercentage(viewingOrder.status)}%</p>
              </div>

              {/* Notes */}
              {viewingOrder.notes && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm">{viewingOrder.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                  <p className="text-xs">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Updated At</Label>
                  <p className="text-xs">{new Date(viewingOrder.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrint(viewingOrder)}
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                {canVoidOrder(viewingOrder.status) && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsViewOpen(false)
                      handleVoid(viewingOrder)
                    }}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Void
                  </Button>
                )}
                <Button onClick={() => setIsViewOpen(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}