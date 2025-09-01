import { z } from 'zod'

export const skuSchema = z.object({
  skuCode: z.string().min(1, 'SKU code is required'),
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  costPrice: z.number().min(0, 'Cost price must be greater than or equal to 0'),
  artisticValue: z.number().min(0, 'Artistic value must be greater than or equal to 0').default(0),
  profitMargin: z.number().min(0, 'Profit margin must be greater than or equal to 0'),
  sellingPrice: z.number().min(0, 'Selling price must be greater than or equal to 0'),
  currentStock: z.number().min(0, 'Current stock must be greater than or equal to 0').default(0),
  reservedStock: z.number().min(0, 'Reserved stock must be greater than or equal to 0').default(0),
  availableStock: z.number().min(0, 'Available stock must be greater than or equal to 0').default(0),
  reorderLevel: z.number().min(0, 'Reorder level must be greater than or equal to 0').default(0),
  maxStockLevel: z.number().min(0, 'Max stock level must be greater than or equal to 0').default(0),
  dimensions: z.object({
    length: z.number().min(0).default(0),
    width: z.number().min(0).default(0),
    height: z.number().min(0).default(0),
    unit: z.enum(['mm', 'cm', 'm']).default('cm')
  }).default({ length: 0, width: 0, height: 0, unit: 'cm' }),
  weight: z.number().min(0, 'Weight must be greater than or equal to 0').default(0),
  specifications: z.record(z.any()).optional(),
  images: z.array(z.string()).default([]),
  qrCode: z.string().optional(),
  barcode: z.string().optional(),
  active: z.boolean().default(true)
})

export type SKUFormData = z.infer<typeof skuSchema>

export const dimensionsSchema = z.object({
  length: z.number().min(0, 'Length must be greater than or equal to 0'),
  width: z.number().min(0, 'Width must be greater than or equal to 0'),
  height: z.number().min(0, 'Height must be greater than or equal to 0'),
  unit: z.enum(['mm', 'cm', 'm'])
})

export type DimensionsFormData = z.infer<typeof dimensionsSchema>