import { BaseEntity } from '@/lib/db/connection'
import { createEntityService, createEntityHooks } from './base'

// Delivery Order interfaces
export interface DeliveryOrderLine {
  id: string
  productId: string
  productCode: string
  productName: string
  orderedQuantity: number
  alreadyDeliveredQuantity: number
  quantityToDeliver: number
  unitOfMeasure: string
  warehouseId: string
  stockAvailable: number
  pricePerUnit: number
  totalAmount: number
}

export interface DeliveryOrder extends BaseEntity {
  deliveryOrderNumber: string
  deliveryDate: Date
  expeditionId: string
  salesOrderId: string
  customerId: string
  customerName: string
  notes?: string
  status: 'draft' | 'released' | 'invoiced' | 'closed' | 'cancelled'
  lines: DeliveryOrderLine[]
  totalQuantity: number
  totalAmount: number
  // Status tracking
  isVoidable: boolean
  voidReason?: string
  voidedAt?: Date
  voidedBy?: string
}

// Sales Order reference (simplified)
export interface SalesOrder extends BaseEntity {
  salesOrderNumber: string
  customerId: string
  customerName: string
  status: 'draft' | 'active' | 'approved' | 'closed' | 'cancelled'
  orderDate: Date
  deliveryDate?: Date
  lines: SalesOrderLine[]
  totalAmount: number
}

export interface SalesOrderLine {
  id: string
  productId: string
  productCode: string
  productName: string
  quantity: number
  deliveredQuantity: number
  remainingQuantity: number
  unitOfMeasure: string
  pricePerUnit: number
  totalAmount: number
}

// Expedition (master data)
export interface Expedition extends BaseEntity {
  code: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
}

// Warehouse (master data)
export interface Warehouse extends BaseEntity {
  code: string
  name: string
  address?: string
  status: 'active' | 'inactive'
}

// Product (master data)
export interface Product extends BaseEntity {
  code: string
  name: string
  description?: string
  unitOfMeasure: string
  category?: string
  status: 'active' | 'inactive'
}

// Stock tracking
export interface StockCard extends BaseEntity {
  productId: string
  warehouseId: string
  transactionType: 'in' | 'out' | 'adjustment'
  transactionDate: Date
  referenceType: 'delivery_order' | 'receive_items' | 'adjustment' | 'movement'
  referenceId: string
  quantity: number
  unitCost?: number
  balance: number
  notes?: string
}

// Generate delivery order number
export const generateDeliveryOrderNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  
  return `DO/${year}/${month}/${sequence}`
}

// Validation function for delivery orders
const validateDeliveryOrder = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!data.expeditionId) {
    errors.expeditionId = 'Expedition is required'
  }

  if (!data.salesOrderId) {
    errors.salesOrderId = 'Sales Order is required'
  }

  if (!data.deliveryDate) {
    errors.deliveryDate = 'Delivery date is required'
  }

  if (!data.lines || data.lines.length === 0) {
    errors.lines = 'At least one line item is required'
  }

  // Validate each line
  if (data.lines) {
    data.lines.forEach((line: DeliveryOrderLine, index: number) => {
      if (!line.productId) {
        errors[`lines.${index}.productId`] = 'Product is required'
      }

      if (!line.quantityToDeliver || line.quantityToDeliver <= 0) {
        errors[`lines.${index}.quantityToDeliver`] = 'Quantity to deliver must be greater than 0'
      }

      if (line.quantityToDeliver > line.stockAvailable) {
        errors[`lines.${index}.quantityToDeliver`] = 'Quantity to deliver cannot exceed available stock'
      }

      const remainingToDeliver = line.orderedQuantity - line.alreadyDeliveredQuantity
      if (line.quantityToDeliver > remainingToDeliver) {
        errors[`lines.${index}.quantityToDeliver`] = 'Quantity to deliver cannot exceed remaining balance'
      }

      if (!line.warehouseId) {
        errors[`lines.${index}.warehouseId`] = 'Warehouse is required'
      }
    })
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}

// Create the delivery order service
export const deliveryOrderService = createEntityService<DeliveryOrder>(
  'delivery-orders',
  ['deliveryOrderNumber', 'customerName', 'notes'],
  validateDeliveryOrder
)

// Create React Query hooks
const deliveryOrderHooks = createEntityHooks('delivery-orders', deliveryOrderService)

// Export individual hooks for easier use
export const useDeliveryOrdersList = deliveryOrderHooks.useList
export const useDeliveryOrder = deliveryOrderHooks.useGet
export const useCreateDeliveryOrder = deliveryOrderHooks.useCreate
export const useUpdateDeliveryOrder = deliveryOrderHooks.useUpdate
export const useDeleteDeliveryOrder = deliveryOrderHooks.useDelete
export const useExportDeliveryOrders = deliveryOrderHooks.useExport
export const useImportDeliveryOrders = deliveryOrderHooks.useImport

// Export the complete hooks object as well for backwards compatibility
export const useDeliveryOrdersApi = deliveryOrderHooks

// Additional hooks for related data
export const useSalesOrders = () => {
  return {
    getAvailable: async () => {
      // TODO: Implement getAvailableSalesOrders
      return []
    }
  }
}

export const useStockAvailability = () => {
  return {
    check: async (productId: string, warehouseId: string) => {
      // TODO: Implement getStockAvailability
      return { available: 100 }
    }
  }
}