import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { MasterForm } from '../../master-data/common/form'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { ComplaintReturFields } from './fields'
import { complaintReturSchema, ComplaintReturFormData } from './schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, AlertTriangle, CheckCircle, Clock, MessageSquare, FileX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Complaint Return type following the master data pattern
interface ComplaintRetur {
  id: string
  code: string // will be complaintNumber
  name: string // will be description
  active: boolean
  createdAt: string
  updatedAt: string
  // Complaint return specific fields
  complaintNumber: string
  receivedItemId: string
  receiptNumber: string
  type: 'complaint' | 'return'
  reason: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  deductionAmount: number
  isEditableDeduction: boolean
  isFreeSlabExcluded: boolean
  qrCode: string
  resolution?: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  supplierNotified: boolean
  supplierResponse?: string
  communications: any[]
  attachments: string[]
  notes?: string
}

const adapter = makeLocalStorageAdapter<ComplaintRetur>('erp.warehouse.complaint-retur')

export function ComplaintReturPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<ComplaintRetur[]>([])
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
      console.error('Failed to load complaint/returns:', error)
      toast.error('Failed to load complaint/returns. Please try refreshing the page.')
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

  const generateQRCode = (complaintNumber: string) => {
    // In real app, this would generate actual QR code
    return `QR_COMP_${complaintNumber}_${Date.now()}`
  }

  const handleSave = async (data: ComplaintReturFormData) => {
    setIsLoading(true)
    try {
      // Generate complaint number if not provided
      if (!data.complaintNumber) {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const count = rows.length + 1
        const prefix = data.type === 'complaint' ? 'COMP' : 'RET'
        data.complaintNumber = `${prefix}/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      // Generate QR code if not provided
      if (!data.qrCode) {
        data.qrCode = generateQRCode(data.complaintNumber)
      }

      const complaintData: ComplaintRetur = {
        id: editingId || crypto.randomUUID(),
        code: data.complaintNumber,
        name: `${data.type === 'complaint' ? 'Complaint' : 'Return'}: ${data.reason}`,
        active: data.status !== 'closed',
        createdAt: editingId ? rows.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      if (editingId) {
        await adapter.update(editingId, complaintData)
        toast.success(`${data.type === 'complaint' ? 'Complaint' : 'Return'} updated successfully`)
      } else {
        await adapter.create(complaintData)
        toast.success(`${data.type === 'complaint' ? 'Complaint' : 'Return'} created successfully`)
      }
      
      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save complaint/return')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      })
      toast.success('Complaint/return marked as resolved')
      loadData()
    } catch (error) {
      toast.error('Failed to resolve complaint/return')
    }
  }

  const handleClose = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'closed',
        active: false
      })
      toast.success('Complaint/return closed')
      loadData()
    } catch (error) {
      toast.error('Failed to close complaint/return')
    }
  }

  const handleNotifySupplier = async (id: string) => {
    try {
      const complaint = rows.find(r => r.id === id)
      if (complaint) {
        const communication = {
          id: crypto.randomUUID(),
          type: 'supplier_email',
          subject: `${complaint.type === 'complaint' ? 'Complaint' : 'Return'} Notification: ${complaint.complaintNumber}`,
          message: `We have identified an issue with the received items and need to discuss resolution.`,
          sentTo: 'supplier@example.com',
          sentBy: 'Current User',
          sentAt: new Date().toISOString(),
          attachments: []
        }
        
        const updatedCommunications = [...(complaint.communications || []), communication]
        await adapter.update(id, { 
          supplierNotified: true,
          communications: updatedCommunications 
        })
        
        toast.success('Supplier notified successfully')
        loadData()
      }
    } catch (error) {
      toast.error('Failed to notify supplier')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertTriangle
      case 'investigating': return Clock
      case 'resolved': return CheckCircle
      case 'closed': return FileX
      default: return AlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'investigating': return 'secondary'
      case 'resolved': return 'default'
      case 'closed': return 'outline'
      default: return 'destructive'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'complaint' ? 'destructive' : 'secondary'
  }

  // Custom columns for complaint/returns
  const columns = [
    ...getDefaultColumns<ComplaintRetur>(),
    {
      key: 'complaintNumber',
      header: 'Number',
      render: (row: ComplaintRetur) => (
        <div className="font-mono text-sm">{row.complaintNumber}</div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: ComplaintRetur) => (
        <Badge variant={getTypeColor(row.type)}>
          {row.type.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (row: ComplaintRetur) => (
        <div className="font-medium">{row.receiptNumber}</div>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row: ComplaintRetur) => (
        <div className="text-sm">{row.reason}</div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row: ComplaintRetur) => (
        <Badge variant={getPriorityColor(row.priority)}>
          {row.priority.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ComplaintRetur) => {
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
      key: 'deductionAmount',
      header: 'Deduction',
      render: (row: ComplaintRetur) => (
        <div className="text-sm">
          {row.deductionAmount > 0 ? (
            <span className="font-medium text-red-600">
              ${row.deductionAmount.toLocaleString()}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'reportedAt',
      header: 'Reported',
      render: (row: ComplaintRetur) => (
        <div className="text-sm">
          {new Date(row.reportedAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'supplierNotified',
      header: 'Supplier',
      render: (row: ComplaintRetur) => (
        <Badge variant={row.supplierNotified ? 'default' : 'outline'}>
          {row.supplierNotified ? 'Notified' : 'Not Notified'}
        </Badge>
      )
    },
    {
      key: 'qrCode',
      header: 'QR Code',
      render: (row: ComplaintRetur) => (
        <div className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span className="text-xs text-muted-foreground">{row.qrCode.slice(0, 8)}...</span>
        </div>
      )
    }
  ]

  const additionalActions = (row: ComplaintRetur) => [
    {
      label: 'Notify Supplier',
      onClick: () => handleNotifySupplier(row.id),
      disabled: row.supplierNotified || row.status === 'closed',
      icon: MessageSquare
    },
    {
      label: 'Mark Resolved',
      onClick: () => handleResolve(row.id),
      disabled: row.status === 'resolved' || row.status === 'closed',
      icon: CheckCircle
    },
    {
      label: 'Close',
      onClick: () => handleClose(row.id),
      disabled: row.status === 'closed',
      icon: FileX
    }
  ]

  return (
    <>
      <MasterList
        title="Complaint / Purchase Return"
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
        title={editingId ? 'Edit Complaint/Return' : 'Create Complaint/Return'}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSave}
        schema={complaintReturSchema}
        defaultValues={editingId ? rows.find(r => r.id === editingId) : undefined}
        isLoading={isLoading}
      >
        {(form) => (
          <ComplaintReturFields 
            form={form} 
            isEdit={!!editingId}
          />
        )}
      </MasterForm>
    </>
  )
}