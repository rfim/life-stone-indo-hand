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

// Enhanced service with business logic
export const enhancedDeliveryOrderService = {
  ...deliveryOrderService,

  // Get available sales orders for delivery
  getAvailableSalesOrders: async (): Promise<SalesOrder[]> => {
    try {
      const salesOrders: SalesOrder[] = await spark.kv.get('erp.sales-orders') || []
      return salesOrders.filter(so => 
        !so.isDeleted && 
        ['active', 'approved'].includes(so.status) &&
        so.lines.some(line => line.remainingQuantity > 0)
      )
    } catch (error) {
      console.error('Error getting available sales orders:', error)
      throw new Error('Failed to get available sales orders')
    }
  },

  // Get stock availability for product in warehouse
  getStockAvailability: async (productId: string, warehouseId: string): Promise<number> => {
    try {
      const stockCards: StockCard[] = await spark.kv.get('erp.stock-cards') || []
      const productStock = stockCards
        .filter(sc => sc.productId === productId && sc.warehouseId === warehouseId)
        .reduce((balance, card) => {
          return card.transactionType === 'in' ? balance + card.quantity : balance - card.quantity
        }, 0)
      
      return Math.max(0, productStock)
    } catch (error) {
      console.error('Error getting stock availability:', error)
      return 0
    }
  },

  // Create delivery order with stock mutations
  createWithStockMutation: async (data: Omit<DeliveryOrder, keyof BaseEntity>): Promise<{ id: string; data: DeliveryOrder }> => {
    try {
      // Validate stock availability before creating
      for (const line of data.lines) {
        const available = await enhancedDeliveryOrderService.getStockAvailability(line.productId, line.warehouseId)
        if (line.quantityToDeliver > available) {
          throw new Error(`Insufficient stock for ${line.productName}. Available: ${available}, Required: ${line.quantityToDeliver}`)
        }
      }

      // Generate delivery order number if not provided
      const doData = {
        ...data,
        deliveryOrderNumber: data.deliveryOrderNumber || generateDeliveryOrderNumber(),
        status: 'draft' as const,
        isVoidable: true
      }

      // Create the delivery order
      const result = await deliveryOrderService.create(doData)

      // Update stock cards (reduce inventory)
      const stockCards: StockCard[] = await spark.kv.get('erp.stock-cards') || []
      
      for (const line of data.lines) {
        const stockCard: StockCard = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: line.productId,
          warehouseId: line.warehouseId,
          transactionType: 'out',
          transactionDate: new Date(data.deliveryDate),
          referenceType: 'delivery_order',
          referenceId: result.id,
          quantity: line.quantityToDeliver,
          balance: await enhancedDeliveryOrderService.getStockAvailability(line.productId, line.warehouseId) - line.quantityToDeliver,
          notes: `Delivery Order: ${doData.deliveryOrderNumber}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        }
        stockCards.push(stockCard)
      }

      await spark.kv.set('erp.stock-cards', stockCards)

      // Update sales order delivery quantities
      const salesOrders: SalesOrder[] = await spark.kv.get('erp.sales-orders') || []
      const salesOrderIndex = salesOrders.findIndex(so => so.id === data.salesOrderId)
      
      if (salesOrderIndex !== -1) {
        const salesOrder = salesOrders[salesOrderIndex]
        
        // Update delivery quantities
        data.lines.forEach(doLine => {
          const soLineIndex = salesOrder.lines.findIndex(sol => sol.productId === doLine.productId)
          if (soLineIndex !== -1) {
            salesOrder.lines[soLineIndex].deliveredQuantity += doLine.quantityToDeliver
            salesOrder.lines[soLineIndex].remainingQuantity = 
              salesOrder.lines[soLineIndex].quantity - salesOrder.lines[soLineIndex].deliveredQuantity
          }
        })

        // Update sales order status
        const allDelivered = salesOrder.lines.every(line => line.remainingQuantity === 0)
        const partiallyDelivered = salesOrder.lines.some(line => line.deliveredQuantity > 0)
        
        if (allDelivered) {
          salesOrder.status = 'closed'
        } else if (partiallyDelivered && salesOrder.status === 'approved') {
          salesOrder.status = 'active' // Partial delivery
        }

        salesOrder.updatedAt = new Date()
        await spark.kv.set('erp.sales-orders', salesOrders)
      }

      return result
    } catch (error) {
      console.error('Error creating delivery order with stock mutation:', error)
      throw error
    }
  },

  // Void delivery order (reverse stock movements)
  voidDeliveryOrder: async (id: string, reason: string): Promise<{ success: boolean }> => {
    try {
      const deliveryOrder = await deliveryOrderService.get(id)
      if (!deliveryOrder) {
        throw new Error('Delivery Order not found')
      }

      if (!deliveryOrder.isVoidable) {
        throw new Error('Delivery Order cannot be voided (already invoiced)')
      }

      // Reverse stock movements
      const stockCards: StockCard[] = await spark.kv.get('erp.stock-cards') || []
      
      for (const line of deliveryOrder.lines) {
        const reverseStockCard: StockCard = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: line.productId,
          warehouseId: line.warehouseId,
          transactionType: 'in',
          transactionDate: new Date(),
          referenceType: 'delivery_order',
          referenceId: id,
          quantity: line.quantityToDeliver,
          balance: await enhancedDeliveryOrderService.getStockAvailability(line.productId, line.warehouseId) + line.quantityToDeliver,
          notes: `VOID - Delivery Order: ${deliveryOrder.deliveryOrderNumber} - Reason: ${reason}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        }
        stockCards.push(reverseStockCard)
      }

      await spark.kv.set('erp.stock-cards', stockCards)

      // Update delivery order status
      await deliveryOrderService.update(id, {
        status: 'cancelled',
        isVoidable: false,
        voidReason: reason,
        voidedAt: new Date()
      })

      // Reverse sales order delivery quantities
      const salesOrders: SalesOrder[] = await spark.kv.get('erp.sales-orders') || []
      const salesOrderIndex = salesOrders.findIndex(so => so.id === deliveryOrder.salesOrderId)
      
      if (salesOrderIndex !== -1) {
        const salesOrder = salesOrders[salesOrderIndex]
        
        deliveryOrder.lines.forEach(doLine => {
          const soLineIndex = salesOrder.lines.findIndex(sol => sol.productId === doLine.productId)
          if (soLineIndex !== -1) {
            salesOrder.lines[soLineIndex].deliveredQuantity -= doLine.quantityToDeliver
            salesOrder.lines[soLineIndex].remainingQuantity = 
              salesOrder.lines[soLineIndex].quantity - salesOrder.lines[soLineIndex].deliveredQuantity
          }
        })

        // Update sales order status
        const hasDeliveries = salesOrder.lines.some(line => line.deliveredQuantity > 0)
        if (!hasDeliveries) {
          salesOrder.status = 'approved'
        } else {
          salesOrder.status = 'active'
        }

        salesOrder.updatedAt = new Date()
        await spark.kv.set('erp.sales-orders', salesOrders)
      }

      return { success: true }
    } catch (error) {
      console.error('Error voiding delivery order:', error)
      throw error
    }
  }
}

// Create React Query hooks
const deliveryOrderHooks = createEntityHooks('delivery-orders', enhancedDeliveryOrderService)

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
    getAvailable: async () => enhancedDeliveryOrderService.getAvailableSalesOrders()
  }
}

export const useStockAvailability = () => {
  return {
    check: async (productId: string, warehouseId: string) => 
      enhancedDeliveryOrderService.getStockAvailability(productId, warehouseId)
  }
}