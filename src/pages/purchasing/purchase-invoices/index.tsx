import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { MasterForm } from '../../master-data/common/form'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { PurchaseInvoiceFields } from './fields'
import { purchaseInvoiceSchema, PurchaseInvoiceFormData } from './schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, QrCode, AlertTriangle, CheckCircle, Clock, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Purchase Invoice type following the master data pattern
interface PurchaseInvoice {
  id: string
  code: string // will be invoiceNumber
  name: string // will be description
  active: boolean
  createdAt: string
  updatedAt: string
  // Purchase invoice specific fields
  invoiceNumber: string
  purchaseOrderId: string
  supplierId: string
  supplierName: string
  invoiceDate: string
  dueDate: string
  amount: number
  currency: string
  taxAmount: number
  totalAmount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  qrCode: string
  paymentReference?: string
  paidAt?: string
  notes?: string
  notificationsSent: any[]
}

const adapter = makeLocalStorageAdapter<PurchaseInvoice>('erp.purchasing.invoices')

export function PurchaseInvoicesPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<PurchaseInvoice[]>([])
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
    try {
      const data = await adapter.getAll()
      setRows(data)
    } catch (error) {
      toast.error('Failed to load purchase invoices')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const generateQRCode = (invoiceNumber: string) => {
    // In real app, this would generate actual QR code
    return `QR_${invoiceNumber}_${Date.now()}`
  }

  const handleSave = async (data: PurchaseInvoiceFormData) => {
    setIsLoading(true)
    try {
      // Generate invoice number if not provided
      if (!data.invoiceNumber) {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const count = rows.length + 1
        data.invoiceNumber = `INV/${year}/${month}/${String(count).padStart(4, '0')}`
      }

      // Generate QR code if not provided
      if (!data.qrCode) {
        data.qrCode = generateQRCode(data.invoiceNumber)
      }

      const invoiceData: PurchaseInvoice = {
        id: editingId || crypto.randomUUID(),
        code: data.invoiceNumber,
        name: `Invoice from ${data.supplierName}`,
        active: data.status !== 'cancelled',
        createdAt: editingId ? rows.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      }

      if (editingId) {
        await adapter.update(editingId, invoiceData)
        toast.success('Purchase invoice updated successfully')
      } else {
        await adapter.create(invoiceData)
        toast.success('Purchase invoice created successfully')
        
        // Auto-notify finance team for new invoices
        handleNotifyFinance(invoiceData.id, false)
      }
      
      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save purchase invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotifyFinance = async (id: string, showToast = true) => {
    try {
      const invoice = rows.find(r => r.id === id)
      if (invoice) {
        const notification = {
          id: crypto.randomUUID(),
          type: 'email',
          recipient: 'finance@lifestone.com',
          subject: `New Purchase Invoice: ${invoice.invoiceNumber}`,
          message: `A new purchase invoice from ${invoice.supplierName} for ${invoice.currency} ${invoice.totalAmount.toLocaleString()} requires your attention.`,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }
        
        const updatedNotifications = [...(invoice.notificationsSent || []), notification]
        await adapter.update(id, { notificationsSent: updatedNotifications })
        
        if (showToast) {
          toast.success('Finance team notified successfully')
        }
        loadData()
      }
    } catch (error) {
      if (showToast) {
        toast.error('Failed to notify finance team')
      }
    }
  }

  const handlePrint = (id: string) => {
    // In real app, this would generate and print PDF
    toast.success('Invoice printed successfully')
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await adapter.update(id, { 
        status: 'paid',
        paidAt: new Date().toISOString()
      })
      toast.success('Invoice marked as paid')
      loadData()
    } catch (error) {
      toast.error('Failed to update invoice status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'paid': return CheckCircle
      case 'overdue': return AlertTriangle
      case 'cancelled': return AlertTriangle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'paid': return 'default'
      case 'overdue': return 'destructive'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false
    return new Date(dueDate) < new Date()
  }

  // Custom columns for purchase invoices
  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row: PurchaseInvoice) => (
        <div className="font-mono text-sm">{row.invoiceNumber}</div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (row: PurchaseInvoice) => (
        <div className="font-medium">{row.supplierName}</div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (row: PurchaseInvoice) => (
        <div className="font-medium">
          {row.currency} {row.totalAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'invoiceDate',
      header: 'Invoice Date',
      render: (row: PurchaseInvoice) => (
        <div className="text-sm">
          {new Date(row.invoiceDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row: PurchaseInvoice) => {
        const overdue = isOverdue(row.dueDate, row.status)
        return (
          <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : ''}`}>
            {new Date(row.dueDate).toLocaleDateString()}
            {overdue && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PurchaseInvoice) => {
        const Icon = getStatusIcon(row.status)
        let status = row.status
        
        // Auto-update overdue status
        if (isOverdue(row.dueDate, row.status)) {
          status = 'overdue'
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(status)}>
              <Icon className="h-3 w-3 mr-1" />
              {status.toUpperCase()}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'qrCode',
      header: 'QR Code',
      render: (row: PurchaseInvoice) => (
        <div className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span className="text-xs text-muted-foreground">{row.qrCode.slice(0, 8)}...</span>
        </div>
      )
    }
  ]

  const additionalActions = (row: PurchaseInvoice) => [
    {
      label: 'Notify Finance',
      onClick: () => handleNotifyFinance(row.id),
      icon: Building
    },
    {
      label: 'Print Invoice',
      onClick: () => handlePrint(row.id),
      icon: FileText
    },
    {
      label: 'Mark as Paid',
      onClick: () => handleMarkPaid(row.id),
      disabled: row.status === 'paid' || row.status === 'cancelled',
      icon: CheckCircle
    }
  ]

  return (
    <div className="container mx-auto p-4">
      <MasterList
        title="Purchase Invoices"
        data={rows}
        columns={[...getDefaultColumns<PurchaseInvoice>(), ...columns]}
        onEdit={(row) => {
          setEditingId(row.id)
          setIsSheetOpen(true)
        }}
        onDelete={async (id) => {
          try {
            await adapter.delete(id)
            toast.success('Purchase invoice deleted')
            loadData()
          } catch (error) {
            toast.error('Failed to delete purchase invoice')
          }
        }}
        onCreate={() => {
          setEditingId(null)
          setIsSheetOpen(true)
        }}
        additionalActions={additionalActions}
      />

      <MasterForm
        title={editingId ? 'Edit Purchase Invoice' : 'Create Purchase Invoice'}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSave}
        schema={purchaseInvoiceSchema}
        defaultValues={editingId ? rows.find(r => r.id === editingId) : undefined}
        isLoading={isLoading}
      >
        {(form) => (
          <PurchaseInvoiceFields 
            form={form} 
            isEdit={!!editingId}
          />
        )}
      </MasterForm>
    </div>
  )
}