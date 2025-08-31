import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BaseEntity, ListParams, ListResponse, generateId, createTimestamps, updateTimestamps, applyFilters, applySorting, applyPagination, DEFAULT_PAGE_SIZE } from '@/lib/db/connection'

export interface SimpleApiService<T extends BaseEntity> {
  list: (params?: ListParams) => Promise<ListResponse<T>>
  get: (id: string) => Promise<T | null>
  create: (data: Omit<T, keyof BaseEntity>) => Promise<{ id: string; data: T }>
  update: (id: string, data: Partial<Omit<T, keyof BaseEntity>>) => Promise<{ id: string; data: T }>
  remove: (id: string) => Promise<{ success: boolean }>
}

/**
 * Creates a simple API service using localStorage
 */
export function createSimpleApiService<T extends BaseEntity>(
  entityName: string,
  searchFields: (keyof T)[] = [],
  validateFn?: (data: any) => { success: boolean; errors?: Record<string, string> }
): SimpleApiService<T> {
  const storageKey = `erp.${entityName}`

  const getStoredData = (): T[] => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return []
      const data = JSON.parse(stored)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  const saveData = (data: T[]): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${entityName} data:`, error)
    }
  }

  const list = async (params: ListParams = {}): Promise<ListResponse<T>> => {
    try {
      const allData = getStoredData()
      
      // Apply filters and search
      let filtered = applyFilters(allData, params, searchFields)
      
      // Apply sorting
      filtered = applySorting(filtered, params.sortBy, params.sortDir)
      
      // Apply pagination
      const result = applyPagination(filtered, params.page, params.pageSize || DEFAULT_PAGE_SIZE)
      
      return result
    } catch (error) {
      console.error(`Error listing ${entityName}:`, error)
      throw new Error(`Failed to list ${entityName}`)
    }
  }

  const get = async (id: string): Promise<T | null> => {
    try {
      const allData = getStoredData()
      const item = allData.find(item => item.id === id && !item.isDeleted)
      return item || null
    } catch (error) {
      console.error(`Error getting ${entityName} ${id}:`, error)
      throw new Error(`Failed to get ${entityName}`)
    }
  }

  const create = async (data: Omit<T, keyof BaseEntity>): Promise<{ id: string; data: T }> => {
    try {
      // Validate if validation function provided
      if (validateFn) {
        const validation = validateFn(data)
        if (!validation.success) {
          throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`)
        }
      }

      const id = generateId()
      const newItem: T = {
        ...data,
        id,
        ...createTimestamps()
      } as T

      const allData = getStoredData()
      allData.push(newItem)
      saveData(allData)
      
      return { id, data: newItem }
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error)
      throw error
    }
  }

  const update = async (id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<{ id: string; data: T }> => {
    try {
      const allData = getStoredData()
      const itemIndex = allData.findIndex(item => item.id === id && !item.isDeleted)
      
      if (itemIndex === -1) {
        throw new Error(`${entityName} not found`)
      }

      // Validate if validation function provided
      if (validateFn) {
        const validation = validateFn({ ...allData[itemIndex], ...data })
        if (!validation.success) {
          throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`)
        }
      }

      const updatedItem: T = {
        ...allData[itemIndex],
        ...data,
        ...updateTimestamps()
      } as T

      allData[itemIndex] = updatedItem
      saveData(allData)
      
      return { id, data: updatedItem }
    } catch (error) {
      console.error(`Error updating ${entityName} ${id}:`, error)
      throw error
    }
  }

  const remove = async (id: string): Promise<{ success: boolean }> => {
    try {
      const allData = getStoredData()
      const itemIndex = allData.findIndex(item => item.id === id && !item.isDeleted)
      
      if (itemIndex === -1) {
        throw new Error(`${entityName} not found`)
      }

      // Soft delete
      allData[itemIndex] = {
        ...allData[itemIndex],
        isDeleted: true,
        ...updateTimestamps()
      }
      
      saveData(allData)
      
      return { success: true }
    } catch (error) {
      console.error(`Error deleting ${entityName} ${id}:`, error)
      throw error
    }
  }

  return {
    list,
    get,
    create,
    update,
    remove
  }
}

/**
 * React Query hooks for simple API operations
 */
export function createSimpleApiHooks<T extends BaseEntity>(
  entityName: string,
  service: SimpleApiService<T>
) {
  const queryKeyPrefix = entityName

  const useList = (params: ListParams = {}) => {
    return useQuery({
      queryKey: [queryKeyPrefix, 'list', params],
      queryFn: () => service.list(params),
      staleTime: 30000, // 30 seconds
    })
  }

  const useGet = (id: string) => {
    return useQuery({
      queryKey: [queryKeyPrefix, 'detail', id],
      queryFn: () => service.get(id),
      enabled: !!id,
      staleTime: 60000, // 1 minute
    })
  }

  const useCreate = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: service.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, 'list'] })
      },
    })
  }

  const useUpdate = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Omit<T, keyof BaseEntity>> }) => 
        service.update(id, data),
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, 'list'] })
        queryClient.setQueryData([queryKeyPrefix, 'detail', result.id], result.data)
      },
    })
  }

  const useDelete = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: service.remove,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, 'list'] })
      },
    })
  }

  const useExport = () => {
    return useMutation({
      mutationFn: () => Promise.resolve(new Blob([''], { type: 'text/csv' })),
    })
  }

  const useImport = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: () => Promise.resolve({ jobId: 'test' }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, 'list'] })
      },
    })
  }

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
    useExport,
    useImport
  }
}