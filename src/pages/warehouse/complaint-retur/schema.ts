import { z } from 'zod'

const communicationSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['internal_note', 'supplier_email', 'customer_call', 'meeting']),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  sentTo: z.string().optional(),
  sentBy: z.string().min(1, 'Sender is required'),
  sentAt: z.string().min(1, 'Sent date is required'),
  attachments: z.array(z.string()).default([])
})

export const complaintReturSchema = z.object({
  complaintNumber: z.string().min(1, 'Complaint number is required'),
  receivedItemId: z.string().min(1, 'Received item is required'),
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  type: z.enum(['complaint', 'return']),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).default('open'),
  deductionAmount: z.number().min(0, 'Deduction amount must be greater than or equal to 0'),
  isEditableDeduction: z.boolean().default(true),
  isFreeSlabExcluded: z.boolean().default(false),
  qrCode: z.string().optional(),
  resolution: z.string().optional(),
  reportedBy: z.string().min(1, 'Reporter is required'),
  reportedAt: z.string().min(1, 'Report date is required'),
  assignedTo: z.string().optional(),
  resolvedAt: z.string().optional(),
  supplierNotified: z.boolean().default(false),
  supplierResponse: z.string().optional(),
  communications: z.array(communicationSchema).default([]),
  attachments: z.array(z.string()).default([]),
  notes: z.string().optional()
})

export type ComplaintReturFormData = z.infer<typeof complaintReturSchema>
export type CommunicationFormData = z.infer<typeof communicationSchema>