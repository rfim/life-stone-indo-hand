import { z } from 'zod'

const notificationLogSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['email', 'sms', 'system']),
  recipient: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  sentAt: z.string().min(1, 'Sent date is required'),
  status: z.enum(['sent', 'delivered', 'failed'])
})

export const purchaseInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  taxAmount: z.number().min(0, 'Tax amount must be greater than or equal to 0'),
  totalAmount: z.number().min(0, 'Total amount must be greater than or equal to 0'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
  qrCode: z.string().optional(),
  paymentReference: z.string().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
  notificationsSent: z.array(notificationLogSchema).default([])
})

export type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>
export type NotificationLogFormData = z.infer<typeof notificationLogSchema>