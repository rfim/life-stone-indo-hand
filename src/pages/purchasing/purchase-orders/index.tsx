import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { MasterForm } from '../../master-data/common/form'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { PurchaseOrderFields } from './fields'
import { purchaseOrderSchema, PurchaseOrderFormData } from './schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, Truck, AlertTriangle, CreditCard, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Purchase Order type following the master data pattern
interface PurchaseOrder {
  id: string
  code: string // will be orderNumber
  name: string // will be description
  active: boolean
  createdAt: string
  updatedAt: string
  // Purchase order specific fields
  orderNumber: string
  purchaseRequestId: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDeliveryDate: string
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  paymentInfo: {
    termsOfPayment: string
    leadTime: number
    shippingCosts: number
    portFees: number
    discount: number
    discountType: 'percentage' | 'fixed'
    isVAT: boolean
    vatPercentage?: number
  }
  productInfo: {
    packingList: string
    loadingPhotos: string[]
    productPhotos: string[]
    volume: number
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'mm' | 'cm' | 'm'
    }
  }
  lineItems: any[]
  deductions: any[]
  additionalPayments: any[]
  totalAmount: number
  currency: string
  notes?: string
  sentAt?: string
  confirmedAt?: string
  shippedAt?: string
  receivedAt?: string
}

const adapter = makeLocalStorageAdapter<PurchaseOrder>('erp.purchasing.orders')

export function PurchaseOrdersPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<PurchaseOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Auto-open form if create=true in URL
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsSheetOpen(true)
    }
  }, [searchParams])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await adapter.getAll()
      setRows(data)
      setTotal(data.length)
    } catch (error) {
      toast.error('Failed to load purchase orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handleCreate = () => {
    setEditingId(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsSheetOpen(true)
  }

  const handleSave = async (data: PurchaseOrderFormData) => {
    setIsLoading(true)
    try {
      // Generate order number if not provided
      if (!data.orderNumber) {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const count = rows.length + 1
        data.orderNumber = `PO/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      const orderData: PurchaseOrder = {
        id: editingId || crypto.randomUUID(),
        code: data.orderNumber,
        name: `PO for ${data.supplierName}`,
        active: data.status !== 'cancelled',
        createdAt: editingId ? rows.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      if (editingId) {
        await adapter.update(editingId, orderData)
        toast.success('Purchase order updated successfully')
      } else {
        await adapter.create(orderData)
        toast.success('Purchase order created successfully')
      }
      
      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save purchase order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendToSupplier = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'sent',
        sentAt: new Date().toISOString()
      })
      toast.success('Purchase order sent to supplier')
      loadData()
    } catch (error) {
      toast.error('Failed to send purchase order')
    }
  }

  const handlePrint = (id: string) => {
    // In real app, this would generate and print PDF
    toast.success('Purchase order printed successfully')
  }

  const handleNotifyWarehouse = (id: string) => {
    // In real app, this would send notification to warehouse team
    toast.success('Warehouse team notified')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText
      case 'sent': return Mail
      case 'confirmed': return CreditCard
      case 'shipped': return Truck
      case 'received': return Building
      case 'cancelled': return AlertTriangle
      default: return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'sent': return 'secondary'
      case 'confirmed': return 'default'
      case 'shipped': return 'default'
      case 'received': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  // Custom columns for purchase orders
  const columns = [
    ...getDefaultColumns<PurchaseOrder>(),
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row: PurchaseOrder) => (
        <div className="font-mono text-sm">{row.orderNumber}</div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (row: PurchaseOrder) => (
        <div className="font-medium">{row.supplierName}</div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (row: PurchaseOrder) => (
        <div className="font-medium">
          {row.currency} {row.totalAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (row: PurchaseOrder) => (
        <div className="text-sm">
          {new Date(row.orderDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Expected Delivery',
      render: (row: PurchaseOrder) => (
        <div className="text-sm">
          {new Date(row.expectedDeliveryDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PurchaseOrder) => {
        const Icon = getStatusIcon(row.status)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(row.status)}>
              <Icon className="h-3 w-3 mr-1" />
              {row.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )
      }
    }
  ]

  const additionalActions = (row: PurchaseOrder) => [
    {
      label: 'Send to Supplier',
      onClick: () => handleSendToSupplier(row.id),
      disabled: row.status !== 'draft',
      icon: Mail
    },
    {
      label: 'Print PO',
      onClick: () => handlePrint(row.id),
      icon: FileText
    },
    {
      label: 'Notify Warehouse',
      onClick: () => handleNotifyWarehouse(row.id),
      disabled: !['confirmed', 'shipped'].includes(row.status),
      icon: Building
    }
  ]

  return (
    <>
      <MasterList
        title="Purchase Orders"
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        searchQuery={searchQuery}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        columns={columns}
        isLoading={isLoading}
      />

      <MasterForm
        title={editingId ? 'Edit Purchase Order' : 'Create Purchase Order'}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSave}
        schema={purchaseOrderSchema}
        defaultValues={editingId ? rows.find(r => r.id === editingId) : undefined}
        isLoading={isLoading}
      >
        {(form) => (
          <PurchaseOrderFields 
            form={form} 
            isEdit={!!editingId}
          />
        )}
      </MasterForm>
    </>
  )
}