import { useKV } from '@github/spark/hooks'

/**
 * Database connection and configuration for Life Stone Indonesia ERP
 * Using GitHub Spark's KV store as the primary database
 */

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
  isDeleted: boolean
}

export interface ListParams {
  page?: number
  pageSize?: number
  q?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}

// Generate unique ID for entities
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Default pagination
export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

// Base entity timestamps
export const createTimestamps = (userId?: string): Pick<BaseEntity, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'> => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: userId,
  updatedBy: userId,
  isDeleted: false
})

export const updateTimestamps = (userId?: string): Pick<BaseEntity, 'updatedAt' | 'updatedBy'> => ({
  updatedAt: new Date(),
  updatedBy: userId
})

// Filter data based on search and filters
export const applyFilters = <T extends BaseEntity>(
  data: T[],
  params: ListParams,
  searchFields: (keyof T)[] = []
): T[] => {
  let filtered = data.filter(item => !item.isDeleted)

  // Apply search
  if (params.q && searchFields.length > 0) {
    const query = params.q.toLowerCase()
    filtered = filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(query)
      })
    )
  }

  // Apply filters
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = (item as any)[key]
          if (Array.isArray(value)) {
            return value.includes(itemValue)
          }
          if (typeof value === 'object' && value.operator) {
            switch (value.operator) {
              case 'eq':
                return itemValue === value.value
              case 'contains':
                return String(itemValue).toLowerCase().includes(String(value.value).toLowerCase())
              case 'gte':
                return itemValue >= value.value
              case 'lte':
                return itemValue <= value.value
              case 'between':
                return itemValue >= value.min && itemValue <= value.max
              default:
                return itemValue === value.value
            }
          }
          return itemValue === value
        })
      }
    })
  }

  return filtered
}

// Apply sorting
export const applySorting = <T>(
  data: T[],
  sortBy?: string,
  sortDir: 'asc' | 'desc' = 'desc'
): T[] => {
  if (!sortBy) return data

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy]
    const bValue = (b as any)[sortBy]

    if (aValue === bValue) return 0
    
    const comparison = aValue < bValue ? -1 : 1
    return sortDir === 'asc' ? comparison : -comparison
  })
}

// Apply pagination
export const applyPagination = <T>(
  data: T[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): { data: T[]; total: number; page: number; pageSize: number } => {
  const validPageSize = Math.min(pageSize, MAX_PAGE_SIZE)
  const startIndex = (page - 1) * validPageSize
  const endIndex = startIndex + validPageSize

  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page,
    pageSize: validPageSize
  }
}