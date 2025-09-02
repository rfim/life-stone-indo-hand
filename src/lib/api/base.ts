import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BaseEntity, 
  ListParams, 
  ListResponse, 
  generateId, 
  createTimestamps, 
  updateTimestamps,
  applyFilters,
  applySorting,
  applyPagination,
  DEFAULT_PAGE_SIZE
} from '@/lib/db/connection'

export interface ApiEntityService<T extends BaseEntity> {
  list: (params?: ListParams) => Promise<ListResponse<T>>
  get: (id: string) => Promise<T | null>
  create: (data: Omit<T, keyof BaseEntity>) => Promise<{ id: string; data: T }>
  update: (id: string, data: Partial<Omit<T, keyof BaseEntity>>) => Promise<{ id: string; data: T }>
  remove: (id: string) => Promise<{ success: boolean }>
  export: (params?: ListParams) => Promise<Blob>
  import: (file: File) => Promise<{ jobId: string; errors?: Blob }>
  template: () => Promise<Blob>
}

/**
 * Creates a complete API service for an entity using GitHub Spark KV store
 */
export function createEntityService<T extends BaseEntity>(
  entityName: string,
  searchFields: (keyof T)[] = [],
  validateFn?: (data: any) => { success: boolean; errors?: Record<string, string> }
): ApiEntityService<T> {
  const storageKey = `erp.${entityName}`

  const list = async (params: ListParams = {}): Promise<ListResponse<T>> => {
    try {
      // Check if spark is available
      if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
        // Fallback to localStorage
        const localData = localStorage.getItem(storageKey)
        const allData: T[] = localData ? JSON.parse(localData) : []
        
        // Apply filters and search
        let filtered = applyFilters(allData, params, searchFields)
        
        // Apply sorting
        filtered = applySorting(filtered, params.sortBy, params.sortDir)
        
        // Apply pagination
        const result = applyPagination(filtered, params.page, params.pageSize || DEFAULT_PAGE_SIZE)
        
        return result
      }
      
      const allData: T[] = await spark.kv.get(storageKey) || []
      
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
      // Check if spark is available
      if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
        // Fallback to localStorage
        const localData = localStorage.getItem(storageKey)
        const allData: T[] = localData ? JSON.parse(localData) : []
        const item = allData.find(item => item.id === id && !item.isDeleted)
        return item || null
      }
      
      const allData: T[] = await spark.kv.get(storageKey) || []
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

      // Check if spark is available
      if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
        // Fallback to localStorage
        const localData = localStorage.getItem(storageKey)
        const allData: T[] = localData ? JSON.parse(localData) : []
        allData.push(newItem)
        localStorage.setItem(storageKey, JSON.stringify(allData))
        return { id, data: newItem }
      }

      const allData: T[] = await spark.kv.get(storageKey) || []
      allData.push(newItem)
      
      await spark.kv.set(storageKey, allData)
      
      return { id, data: newItem }
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error)
      throw error
    }
  }

  const update = async (id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<{ id: string; data: T }> => {
    try {
      // Check if spark is available
      if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
        // Fallback to localStorage
        const localData = localStorage.getItem(storageKey)
        const allData: T[] = localData ? JSON.parse(localData) : []
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
        localStorage.setItem(storageKey, JSON.stringify(allData))
        
        return { id, data: updatedItem }
      }

      const allData: T[] = await spark.kv.get(storageKey) || []
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
      await spark.kv.set(storageKey, allData)
      
      return { id, data: updatedItem }
    } catch (error) {
      console.error(`Error updating ${entityName} ${id}:`, error)
      throw error
    }
  }

  const remove = async (id: string): Promise<{ success: boolean }> => {
    try {
      // Check if spark is available
      if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
        // Fallback to localStorage
        const localData = localStorage.getItem(storageKey)
        const allData: T[] = localData ? JSON.parse(localData) : []
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
        
        localStorage.setItem(storageKey, JSON.stringify(allData))
        
        return { success: true }
      }

      const allData: T[] = await spark.kv.get(storageKey) || []
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
      
      await spark.kv.set(storageKey, allData)
      
      return { success: true }
    } catch (error) {
      console.error(`Error deleting ${entityName} ${id}:`, error)
      throw error
    }
  }

  const exportData = async (params: ListParams = {}): Promise<Blob> => {
    try {
      const result = await list(params)
      const csvContent = convertToCSV(result.data)
      return new Blob([csvContent], { type: 'text/csv' })
    } catch (error) {
      console.error(`Error exporting ${entityName}:`, error)
      throw new Error(`Failed to export ${entityName}`)
    }
  }

  const importData = async (file: File): Promise<{ jobId: string; errors?: Blob }> => {
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      const errors: string[] = []
      let imported = 0

      for (const [index, row] of rows.entries()) {
        try {
          if (validateFn) {
            const validation = validateFn(row)
            if (!validation.success) {
              errors.push(`Row ${index + 1}: ${JSON.stringify(validation.errors)}`)
              continue
            }
          }
          await create(row)
          imported++
        } catch (error) {
          errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const jobId = generateId()
      
      if (errors.length > 0) {
        const errorBlob = new Blob([errors.join('\n')], { type: 'text/plain' })
        return { jobId, errors: errorBlob }
      }

      return { jobId }
    } catch (error) {
      console.error(`Error importing ${entityName}:`, error)
      throw new Error(`Failed to import ${entityName}`)
    }
  }

  const template = async (): Promise<Blob> => {
    // Create a CSV template with headers
    const headers = getEntityHeaders<T>()
    const csvContent = headers.join(',') + '\n'
    return new Blob([csvContent], { type: 'text/csv' })
  }

  return {
    list,
    get,
    create,
    update,
    remove,
    export: exportData,
    import: importData,
    template
  }
}

/**
 * React Query hooks for entity operations
 */
export function createEntityHooks<T extends BaseEntity>(
  entityName: string,
  service: ApiEntityService<T>
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
      mutationFn: service.export,
    })
  }

  const useImport = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: service.import,
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

// Helper functions
function convertToCSV<T>(data: T[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0] as object)
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = (row as any)[header]
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }
  
  return rows
}

function getEntityHeaders<T>(): string[] {
  // This would typically be defined per entity
  // For now, return common headers
  return ['name', 'description', 'status', 'code']
}