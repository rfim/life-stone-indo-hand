import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BaseEntity } from '@/lib/db/connection'

// Simple delivery order interface
export interface SimpleDeliveryOrder extends BaseEntity {
  deliveryOrderNumber: string
  deliveryDate: Date
  customerName: string
  status: 'draft' | 'released' | 'invoiced' | 'closed' | 'cancelled'
  totalQuantity: number
  totalAmount: number
  notes?: string
}

// Simple service implementation
const STORAGE_KEY = 'erp.delivery-orders'

export const simpleDeliveryOrderService = {
  list: async () => {
    try {
      const data: SimpleDeliveryOrder[] = await spark.kv.get(STORAGE_KEY) || []
      return {
        data: data.filter(item => !item.isDeleted),
        total: data.filter(item => !item.isDeleted).length,
        page: 1,
        pageSize: 25
      }
    } catch (error) {
      console.error('Error listing delivery orders:', error)
      throw new Error('Failed to list delivery orders')
    }
  },

  get: async (id: string) => {
    try {
      const data: SimpleDeliveryOrder[] = await spark.kv.get(STORAGE_KEY) || []
      return data.find(item => item.id === id && !item.isDeleted) || null
    } catch (error) {
      console.error('Error getting delivery order:', error)
      throw new Error('Failed to get delivery order')
    }
  },

  create: async (data: Omit<SimpleDeliveryOrder, keyof BaseEntity>) => {
    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newItem: SimpleDeliveryOrder = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }

      const allData: SimpleDeliveryOrder[] = await spark.kv.get(STORAGE_KEY) || []
      allData.push(newItem)
      
      await spark.kv.set(STORAGE_KEY, allData)
      
      return { id, data: newItem }
    } catch (error) {
      console.error('Error creating delivery order:', error)
      throw error
    }
  },

  update: async (id: string, data: Partial<Omit<SimpleDeliveryOrder, keyof BaseEntity>>) => {
    try {
      const allData: SimpleDeliveryOrder[] = await spark.kv.get(STORAGE_KEY) || []
      const itemIndex = allData.findIndex(item => item.id === id && !item.isDeleted)
      
      if (itemIndex === -1) {
        throw new Error('Delivery order not found')
      }

      const updatedItem: SimpleDeliveryOrder = {
        ...allData[itemIndex],
        ...data,
        updatedAt: new Date()
      }

      allData[itemIndex] = updatedItem
      await spark.kv.set(STORAGE_KEY, allData)
      
      return { id, data: updatedItem }
    } catch (error) {
      console.error('Error updating delivery order:', error)
      throw error
    }
  },

  remove: async (id: string) => {
    try {
      const allData: SimpleDeliveryOrder[] = await spark.kv.get(STORAGE_KEY) || []
      const itemIndex = allData.findIndex(item => item.id === id && !item.isDeleted)
      
      if (itemIndex === -1) {
        throw new Error('Delivery order not found')
      }

      // Soft delete
      allData[itemIndex] = {
        ...allData[itemIndex],
        isDeleted: true,
        updatedAt: new Date()
      }
      
      await spark.kv.set(STORAGE_KEY, allData)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting delivery order:', error)
      throw error
    }
  }
}

// Simple hooks
export const useSimpleDeliveryOrdersList = () => {
  return useQuery({
    queryKey: ['delivery-orders', 'list'],
    queryFn: () => simpleDeliveryOrderService.list(),
    staleTime: 30000, // 30 seconds
  })
}

export const useSimpleDeliveryOrder = (id: string) => {
  return useQuery({
    queryKey: ['delivery-orders', 'detail', id],
    queryFn: () => simpleDeliveryOrderService.get(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

export const useSimpleCreateDeliveryOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: simpleDeliveryOrderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', 'list'] })
    },
  })
}

export const useSimpleUpdateDeliveryOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<SimpleDeliveryOrder, keyof BaseEntity>> }) => 
      simpleDeliveryOrderService.update(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', 'list'] })
      queryClient.setQueryData(['delivery-orders', 'detail', result.id], result.data)
    },
  })
}

export const useSimpleDeleteDeliveryOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: simpleDeliveryOrderService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', 'list'] })
    },
  })
}