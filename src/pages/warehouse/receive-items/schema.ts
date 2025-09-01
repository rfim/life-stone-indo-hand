import { z } from 'zod'

const dimensionsSchema = z.object({
  length: z.number().min(0, 'Length must be greater than or equal to 0'),
  width: z.number().min(0, 'Width must be greater than or equal to 0'),
  height: z.number().min(0, 'Height must be greater than or equal to 0'),
  unit: z.enum(['mm', 'cm', 'm']).default('cm')
})

const lineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  expectedQuantity: z.number().min(1, 'Expected quantity must be greater than 0'),
  receivedQuantity: z.number().min(0, 'Received quantity must be greater than or equal to 0'),
  unit: z.string().min(1, 'Unit is required'),
  condition: z.enum(['good', 'damaged', 'cracked', 'broken']).default('good'),
  notes: z.string().optional()
})

const deductionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['cracked', 'broken', 'damaged', 'missing', 'quality', 'other']),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be greater than or equal to 0'),
  affectedArea: z.number().min(0, 'Affected area must be greater than or equal to 0'),
  estimatedValue: z.number().min(0, 'Estimated value must be greater than or equal to 0'),
  photos: z.array(z.string()).default([]),
  reportedBy: z.string().min(1, 'Reporter is required'),
  reportedAt: z.string().min(1, 'Report date is required')
})

const complaintSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['quality', 'damage', 'shortage', 'wrong_item', 'late_delivery', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  description: z.string().min(1, 'Description is required'),
  expectedResolution: z.string().optional(),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).default('open'),
  reportedBy: z.string().min(1, 'Reporter is required'),
  reportedAt: z.string().min(1, 'Report date is required'),
  photos: z.array(z.string()).default([]),
  supplierNotified: z.boolean().default(false),
  supplierResponse: z.string().optional()
})

export const receiveItemsSchema = z.object({
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  purchaseOrderNumber: z.string().min(1, 'PO number is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  receivedBy: z.string().min(1, 'Received by is required'),
  actualDimensions: dimensionsSchema,
  actualArea: z.number().min(0, 'Actual area must be greater than or equal to 0'),
  lineItems: z.array(lineItemSchema).default([]),
  deductions: z.array(deductionSchema).default([]),
  complaints: z.array(complaintSchema).default([]),
  hasSKU: z.boolean().default(false),
  qrCode: z.string().optional(),
  status: z.enum(['draft', 'received', 'inspected', 'stored', 'complained']).default('draft'),
  warehouseLocation: z.string().optional(),
  inspectionNotes: z.string().optional(),
  photos: z.array(z.string()).default([]),
  notes: z.string().optional()
})

export type ReceiveItemsFormData = z.infer<typeof receiveItemsSchema>
export type LineItemFormData = z.infer<typeof lineItemSchema>
export type DeductionFormData = z.infer<typeof deductionSchema>
export type ComplaintFormData = z.infer<typeof complaintSchema>