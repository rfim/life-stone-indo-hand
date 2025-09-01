import { z } from 'zod'

export const purchaseRequestSchema = z.object({
  requestNumber: z.string().min(1, 'Request number is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  productId: z.string().min(1, 'Product is required'),
  description: z.string().min(1, 'Description is required'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  department: z.string().min(1, 'Department is required'),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  notes: z.string().optional(),
  suppliers: z.array(z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    supplierName: z.string().min(1, 'Supplier name is required'),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    currency: z.string().min(1, 'Currency is required'),
    leadTime: z.number().min(0, 'Lead time must be greater than or equal to 0'),
    terms: z.string().min(1, 'Terms are required'),
    notes: z.string().optional(),
    quotationFile: z.string().optional()
  })).default([]),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected']).default('draft'),
  selectedSupplierId: z.string().optional(),
  rejectedReason: z.string().optional()
})

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>

export const purchaseRequestSupplierSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  leadTime: z.number().min(0, 'Lead time must be greater than or equal to 0'),
  terms: z.string().min(1, 'Terms are required'),
  notes: z.string().optional(),
  quotationFile: z.string().optional()
})

export type PurchaseRequestSupplierFormData = z.infer<typeof purchaseRequestSupplierSchema>