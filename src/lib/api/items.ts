import { BaseEntity } from '@/lib/db/connection'
import { createEntityService, createEntityHooks } from '@/lib/api/base'

export interface Item extends BaseEntity {
  name: string
  code: string
  description?: string
  categoryId: string
  materialTypeId: string
  finishingTypeId?: string
  originId?: string
  specifications?: Record<string, any>
  isActive: boolean
}

export interface Product extends BaseEntity {
  itemId: string
  sku: string
  name: string
  description?: string
  categoryId: string
  sizeId?: string
  
  // Pricing
  priceOriginal?: {
    amount: number
    currency: string
    fxDate?: Date
    fxRateSnapshot?: number
  }
  priceIDR?: number // Computed server-side
  
  // Physical properties
  dimensions?: {
    length: number
    width: number
    height: number
    thickness?: number
    unit: string
  }
  weight?: {
    value: number
    unit: string
  }
  area?: {
    value: number
    unit: string
  }
  
  // Images and media
  images?: string[]
  primaryImageUrl?: string
  
  // Inventory
  stockLevel?: number
  minStockLevel?: number
  maxStockLevel?: number
  
  // For stone products
  blockInfo?: {
    blockId: string
    bundleNumber: string
    slabNumber: string
  }
  
  // For tile products
  tileInfo?: {
    pattern?: string
    grade?: string
    batchNumber?: string
  }
  
  // Status
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  isActive: boolean
}

export interface ProductPriceHistory extends BaseEntity {
  productId: string
  priceOriginal: {
    amount: number
    currency: string
    fxDate: Date
    fxRateSnapshot: number
  }
  priceIDR: number
  effectiveDate: Date
  reason?: string
}

export interface ProductImage extends BaseEntity {
  productId: string
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  isPrimary: boolean
  order: number
  alt?: string
}

// Validation functions
export const validateItem = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.categoryId?.trim()) errors.categoryId = 'Category is required'
  if (!data.materialTypeId?.trim()) errors.materialTypeId = 'Material type is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateProduct = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.itemId?.trim()) errors.itemId = 'Item is required'
  if (!data.sku?.trim()) errors.sku = 'SKU is required'
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.categoryId?.trim()) errors.categoryId = 'Category is required'
  
  // Validate pricing
  if (data.priceOriginal) {
    if (!data.priceOriginal.amount || data.priceOriginal.amount <= 0) {
      errors['priceOriginal.amount'] = 'Price amount must be greater than 0'
    }
    if (!data.priceOriginal.currency?.trim()) {
      errors['priceOriginal.currency'] = 'Currency is required'
    }
  }
  
  // Validate dimensions if provided
  if (data.dimensions) {
    if (data.dimensions.length <= 0) errors['dimensions.length'] = 'Length must be greater than 0'
    if (data.dimensions.width <= 0) errors['dimensions.width'] = 'Width must be greater than 0'
    if (data.dimensions.height <= 0) errors['dimensions.height'] = 'Height must be greater than 0'
  }
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

// Helper function to calculate IDR price
export const calculateIDRPrice = async (priceOriginal: { amount: number; currency: string }): Promise<number> => {
  if (priceOriginal.currency === 'IDR') {
    return Math.round(priceOriginal.amount)
  }
  
  // Get exchange rate from currencies
  try {
    const currencies: any[] = await spark.kv.get('erp.currencies') || []
    const currency = currencies.find(c => c.code === priceOriginal.currency && c.isActive && !c.isDeleted)
    
    if (!currency || !currency.exchangeRate) {
      throw new Error(`Exchange rate not found for currency ${priceOriginal.currency}`)
    }
    
    return Math.round(priceOriginal.amount * currency.exchangeRate)
  } catch (error) {
    console.error('Error calculating IDR price:', error)
    throw error
  }
}

// Enhanced service for products with pricing logic
const createProductService = () => {
  const baseService = createEntityService<Product>('products', ['sku', 'name'], validateProduct)
  
  return {
    ...baseService,
    
    async create(data: Omit<Product, keyof BaseEntity>): Promise<{ id: string; data: Product }> {
      // Calculate IDR price if original price provided
      let priceIDR = data.priceIDR
      if (data.priceOriginal && !priceIDR) {
        priceIDR = await calculateIDRPrice(data.priceOriginal)
      }
      
      const result = await baseService.create({
        ...data,
        priceIDR
      })
      
      // Save price history if price provided
      if (data.priceOriginal && priceIDR) {
        await savePriceHistory(result.id, data.priceOriginal, priceIDR)
      }
      
      return result
    },
    
    async update(id: string, data: Partial<Omit<Product, keyof BaseEntity>>): Promise<{ id: string; data: Product }> {
      // Calculate IDR price if original price updated
      let priceIDR = data.priceIDR
      if (data.priceOriginal && !priceIDR) {
        priceIDR = await calculateIDRPrice(data.priceOriginal)
      }
      
      const result = await baseService.update(id, {
        ...data,
        priceIDR
      })
      
      // Save price history if price changed
      if (data.priceOriginal && priceIDR) {
        await savePriceHistory(id, data.priceOriginal, priceIDR)
      }
      
      return result
    },
    
    // Export as price list
    async exportPriceList(params: any = {}): Promise<Blob> {
      const result = await baseService.list(params)
      const priceListData = result.data.map(product => ({
        sku: product.sku,
        name: product.name,
        category: product.categoryId, // Would need to resolve category name
        priceIDR: product.priceIDR,
        priceOriginal: product.priceOriginal?.amount,
        currency: product.priceOriginal?.currency,
        status: product.status
      }))
      
      const csvContent = convertToPriceListCSV(priceListData)
      return new Blob([csvContent], { type: 'text/csv' })
    }
  }
}

// Price history helper
const savePriceHistory = async (
  productId: string, 
  priceOriginal: { amount: number; currency: string }, 
  priceIDR: number
) => {
  try {
    const allHistory: ProductPriceHistory[] = await spark.kv.get('erp.product-price-history') || []
    
    const historyRecord: ProductPriceHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      priceOriginal: {
        ...priceOriginal,
        fxDate: new Date(),
        fxRateSnapshot: priceIDR / priceOriginal.amount
      },
      priceIDR,
      effectiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }
    
    allHistory.unshift(historyRecord) // Add to beginning (latest first)
    await spark.kv.set('erp.product-price-history', allHistory)
  } catch (error) {
    console.error('Error saving price history:', error)
  }
}

// CSV export helper for price lists
const convertToPriceListCSV = (data: any[]): string => {
  if (data.length === 0) return ''
  
  const headers = ['SKU', 'Product Name', 'Category', 'Price (IDR)', 'Original Price', 'Currency', 'Status']
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = [
      row.sku,
      `"${row.name}"`,
      row.category,
      row.priceIDR || '',
      row.priceOriginal || '',
      row.currency || '',
      row.status
    ]
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

// Services
export const itemsService = createEntityService<Item>('items', ['name', 'code'], validateItem)
export const productsService = createProductService()
export const productPriceHistoryService = createEntityService<ProductPriceHistory>('product-price-history', ['productId'])
export const productImagesService = createEntityService<ProductImage>('product-images', ['productId', 'fileName'])

// Hooks
export const useItemsApi = () => createEntityHooks('items', itemsService)
export const useProductsApi = () => createEntityHooks('products', productsService)
export const useProductPriceHistoryApi = () => createEntityHooks('product-price-history', productPriceHistoryService)
export const useProductImagesApi = () => createEntityHooks('product-images', productImagesService)