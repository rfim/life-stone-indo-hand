import { z } from 'zod'

const paymentInfoSchema = z.object({
  termsOfPayment: z.string().min(1, 'Terms of payment is required'),
  leadTime: z.number().min(0, 'Lead time must be greater than or equal to 0'),
  shippingCosts: z.number().min(0, 'Shipping costs must be greater than or equal to 0'),
  portFees: z.number().min(0, 'Port fees must be greater than or equal to 0'),
  discount: z.number().min(0, 'Discount must be greater than or equal to 0'),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  isVAT: z.boolean().default(false),
  vatPercentage: z.number().min(0).max(100).optional()
})

const dimensionsSchema = z.object({
  length: z.number().min(0, 'Length must be greater than or equal to 0'),
  width: z.number().min(0, 'Width must be greater than or equal to 0'),
  height: z.number().min(0, 'Height must be greater than or equal to 0'),
  unit: z.enum(['mm', 'cm', 'm']).default('cm')
})

const productInfoSchema = z.object({
  packingList: z.string().optional(),
  loadingPhotos: z.array(z.string()).default([]),
  productPhotos: z.array(z.string()).default([]),
  volume: z.number().min(0, 'Volume must be greater than or equal to 0'),
  weight: z.number().min(0, 'Weight must be greater than or equal to 0'),
  dimensions: dimensionsSchema
})

const lineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
  totalPrice: z.number().min(0, 'Total price must be greater than or equal to 0'),
  description: z.string().optional()
})

const deductionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['cracked', 'broken', 'damaged', 'quality', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  photos: z.array(z.string()).default([])
})

const additionalPaymentSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  type: z.enum(['shipping', 'insurance', 'customs', 'handling', 'other']),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional()
})

export const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  purchaseRequestId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  status: z.enum(['draft', 'sent', 'confirmed', 'shipped', 'received', 'cancelled']).default('draft'),
  paymentInfo: paymentInfoSchema,
  productInfo: productInfoSchema,
  lineItems: z.array(lineItemSchema).default([]),
  deductions: z.array(deductionSchema).default([]),
  additionalPayments: z.array(additionalPaymentSchema).default([]),
  totalAmount: z.number().min(0, 'Total amount must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
  sentAt: z.string().optional(),
  confirmedAt: z.string().optional(),
  shippedAt: z.string().optional(),
  receivedAt: z.string().optional()
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>
export type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>
export type ProductInfoFormData = z.infer<typeof productInfoSchema>
export type LineItemFormData = z.infer<typeof lineItemSchema>
export type DeductionFormData = z.infer<typeof deductionSchema>
export type AdditionalPaymentFormData = z.infer<typeof additionalPaymentSchema>