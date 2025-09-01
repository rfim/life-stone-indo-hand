import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
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
  const navigate = useNavigate()
  const [rows, setRows] = useState<PurchaseOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await adapter.getAll()
      setRows(data)
      setTotal(data.length)
    } catch (error) {
      console.error('Failed to load purchase orders:', error)
      toast.error('Failed to load purchase orders. Please try refreshing the page.')
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
    navigate('/purchasing/purchase-orders/create')
  }

  const handleView = (id: string) => {
    navigate(`/purchasing/purchase-orders/${id}/view`)
  }

  const handleEdit = (id: string) => {
    navigate(`/purchasing/purchase-orders/${id}/edit`)
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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.id)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.id)}
          >
            Edit
          </Button>
        </div>
      )
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
    <div className="p-6">
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
        onEdit={() => {}} // Using custom actions column instead
        columns={columns}
        isLoading={isLoading}
      />
    </div>
  )
}