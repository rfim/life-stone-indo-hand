import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { MasterForm } from '../../master-data/common/form'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { ReceiveItemsFields } from './fields'
import { receiveItemsSchema, ReceiveItemsFormData } from './schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, AlertTriangle, Package, FileText, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Receive Items type following the master data pattern
interface ReceiveItems {
  id: string
  code: string // will be receiptNumber
  name: string // will be description
  active: boolean
  createdAt: string
  updatedAt: string
  // Receive items specific fields
  receiptNumber: string
  purchaseOrderId: string
  purchaseOrderNumber: string
  receivedDate: string
  receivedBy: string
  actualDimensions: {
    length: number
    width: number
    height: number
    unit: 'mm' | 'cm' | 'm'
  }
  actualArea: number
  lineItems: any[]
  deductions: any[]
  complaints: any[]
  hasSKU: boolean
  qrCode: string
  status: 'draft' | 'received' | 'inspected' | 'stored' | 'complained'
  warehouseLocation?: string
  inspectionNotes?: string
  photos: string[]
  notes?: string
}

const adapter = makeLocalStorageAdapter<ReceiveItems>('erp.warehouse.receive-items')

export function ReceiveItemsPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<ReceiveItems[]>([])
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
      toast.error('Failed to load receive items')
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

  const generateQRCode = (receiptNumber: string) => {
    // In real app, this would generate actual QR code
    return `QR_RCV_${receiptNumber}_${Date.now()}`
  }

  const handleSave = async (data: ReceiveItemsFormData) => {
    setIsLoading(true)
    try {
      // Generate receipt number if not provided
      if (!data.receiptNumber) {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const count = rows.length + 1
        data.receiptNumber = `RCV/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      // Generate QR code if not provided
      if (!data.qrCode) {
        data.qrCode = generateQRCode(data.receiptNumber)
      }

      const receiveData: ReceiveItems = {
        id: editingId || crypto.randomUUID(),
        code: data.receiptNumber,
        name: `Receipt for ${data.purchaseOrderNumber}`,
        active: data.status !== 'complained',
        createdAt: editingId ? rows.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      if (editingId) {
        await adapter.update(editingId, receiveData)
        toast.success('Receive items updated successfully')
      } else {
        await adapter.create(receiveData)
        toast.success('Receive items created successfully')
      }
      
      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save receive items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileComplaint = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'complained'
      })
      toast.success('Complaint filed successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to file complaint')
    }
  }

  const handleMarkStored = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'stored'
      })
      toast.success('Items marked as stored')
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText
      case 'received': return Package
      case 'inspected': return CheckCircle
      case 'stored': return CheckCircle
      case 'complained': return AlertTriangle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'received': return 'secondary'
      case 'inspected': return 'default'
      case 'stored': return 'default'
      case 'complained': return 'destructive'
      default: return 'outline'
    }
  }

  // Custom columns for receive items
  const columns = [
    ...getDefaultColumns<ReceiveItems>(),
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (row: ReceiveItems) => (
        <div className="font-mono text-sm">{row.receiptNumber}</div>
      )
    },
    {
      key: 'purchaseOrderNumber',
      header: 'PO Number',
      render: (row: ReceiveItems) => (
        <div className="font-medium">{row.purchaseOrderNumber}</div>
      )
    },
    {
      key: 'receivedDate',
      header: 'Received Date',
      render: (row: ReceiveItems) => (
        <div className="text-sm">
          {new Date(row.receivedDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'receivedBy',
      header: 'Received By',
      render: (row: ReceiveItems) => (
        <div className="text-sm">{row.receivedBy}</div>
      )
    },
    {
      key: 'actualArea',
      header: 'Area (m²)',
      render: (row: ReceiveItems) => (
        <div className="text-sm">{row.actualArea.toFixed(2)}</div>
      )
    },
    {
      key: 'hasSKU',
      header: 'Has SKU',
      render: (row: ReceiveItems) => (
        <Badge variant={row.hasSKU ? 'default' : 'secondary'}>
          {row.hasSKU ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ReceiveItems) => {
        const Icon = getStatusIcon(row.status)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(row.status)}>
              <Icon className="h-3 w-3 mr-1" />
              {row.status.toUpperCase()}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'deductions',
      header: 'Deductions',
      render: (row: ReceiveItems) => (
        <div className="text-sm">
          {row.deductions?.length > 0 ? (
            <Badge variant="destructive" className="text-xs">
              {row.deductions.length} Issues
            </Badge>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'qrCode',
      header: 'QR Code',
      render: (row: ReceiveItems) => (
        <div className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span className="text-xs text-muted-foreground">{row.qrCode.slice(0, 8)}...</span>
        </div>
      )
    }
  ]

  const additionalActions = (row: ReceiveItems) => [
    {
      label: 'File Complaint',
      onClick: () => handleFileComplaint(row.id),
      disabled: row.status === 'complained' || row.deductions?.length === 0,
      icon: AlertTriangle
    },
    {
      label: 'Mark as Stored',
      onClick: () => handleMarkStored(row.id),
      disabled: row.status === 'stored' || row.status === 'complained',
      icon: CheckCircle
    }
  ]

  return (
    <>
      <MasterList
        title="Receive Items"
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
        title={editingId ? 'Edit Receive Items' : 'Create Receive Items'}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSave}
        schema={receiveItemsSchema}
        defaultValues={editingId ? rows.find(r => r.id === editingId) : undefined}
        isLoading={isLoading}
      >
        {(form) => (
          <ReceiveItemsFields 
            form={form} 
            isEdit={!!editingId}
          />
        )}
      </MasterForm>
    </>
  )
}