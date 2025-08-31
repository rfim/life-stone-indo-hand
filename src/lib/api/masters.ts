import { BaseEntity } from '@/lib/db/connection'
import { createEntityService, createEntityHooks } from '@/lib/api/base'
import { createSimpleApiService, createSimpleApiHooks } from '@/lib/api/simple'

// Master Data Entities

export interface Category extends BaseEntity {
  name: string
  code: string
  description?: string
  parentId?: string
  isActive: boolean
}

export interface FinishingType extends BaseEntity {
  name: string
  code: string
  description?: string
  isActive: boolean
}

export interface MaterialType extends BaseEntity {
  name: string
  code: string
  description?: string
  properties?: Record<string, any>
  isActive: boolean
}

export interface Size extends BaseEntity {
  name: string
  code: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
    thickness?: number
    unit: string
  }
  isActive: boolean
}

export interface Origin extends BaseEntity {
  name: string
  code: string
  country: string
  region?: string
  isActive: boolean
}

export interface Currency extends BaseEntity {
  name: string
  code: string // e.g., 'IDR', 'USD'
  symbol: string // e.g., 'Rp', '$'
  isBase: boolean // IDR is the base currency
  exchangeRate?: number
  isActive: boolean
}

export interface Promotion extends BaseEntity {
  name: string
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  scope: 'ORIGINAL_PRICE' | 'IDR_PRICE'
  validFrom: Date
  validTo: Date
  isActive: boolean
}

export interface Supplier extends BaseEntity {
  name: string
  code: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  paymentTerms?: string
  rating?: number
  isActive: boolean
}

export interface Warehouse extends BaseEntity {
  name: string
  code: string
  address?: string
  managerId?: string
  bins?: Bin[]
  isActive: boolean
}

export interface Bin extends BaseEntity {
  code: string
  warehouseId: string
  location?: string
  capacity?: number
  currentStock?: number
  isActive: boolean
}

export interface Vehicle extends BaseEntity {
  licensePlate: string
  type: 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'CAR'
  brand: string
  model: string
  year?: number
  capacity?: {
    weight: number
    volume: number
    unit: string
  }
  driverId?: string
  maintenanceSchedule?: MaintenanceRecord[]
  isActive: boolean
}

export interface MaintenanceRecord {
  date: Date
  type: string
  description: string
  cost: number
  nextScheduled?: Date
}

export interface Expedition extends BaseEntity {
  name: string
  code: string
  contactPerson?: string
  phone?: string
  email?: string
  serviceAreas?: string[]
  rateCard?: Record<string, number>
  isActive: boolean
}

export interface Armada extends BaseEntity {
  name: string
  code: string
  vehicleIds: string[]
  managerId?: string
  serviceArea?: string
  isActive: boolean
}

export interface BankAccount extends BaseEntity {
  bankName: string
  accountNumber: string
  accountName: string
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT'
  currency: string
  balance?: number
  isActive: boolean
}

export interface Vendor extends BaseEntity {
  name: string
  code: string
  type: 'SERVICE' | 'GOODS' | 'BOTH'
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  services?: string[]
  isActive: boolean
}

export interface Account extends BaseEntity {
  name: string
  code: string
  categoryId: string
  subCategoryId?: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  isActive: boolean
}

export interface AccountCategory extends BaseEntity {
  name: string
  code: string
  description?: string
  isActive: boolean
}

export interface SubAccountCategory extends BaseEntity {
  name: string
  code: string
  categoryId: string
  description?: string
  isActive: boolean
}

export interface Department extends BaseEntity {
  name: string
  code: string
  managerId?: string
  budget?: number
  isActive: boolean
}

export interface CustomerType extends BaseEntity {
  name: string
  code: string
  description?: string
  discountRate?: number
  creditLimit?: number
  paymentTerms?: string
  isActive: boolean
}

export interface Project extends BaseEntity {
  name: string
  code: string
  customerId: string
  description?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  managerId?: string
}

export interface Customer extends BaseEntity {
  name: string
  code: string
  typeId: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  creditLimit?: number
  paymentTerms?: string
  projects?: string[] // Project IDs
  isActive: boolean
}

// Validation functions
export const validateCategory = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.code?.trim()) errors.code = 'Code is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateCurrency = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.symbol?.trim()) errors.symbol = 'Symbol is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateSupplier = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format'
  }
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateCustomer = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.typeId?.trim()) errors.typeId = 'Customer type is required'
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format'
  }
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

// Services - use simple localStorage-based service as fallback
export const categoriesService = createSimpleApiService<Category>('categories', ['name', 'code'], validateCategory)
export const finishingTypesService = createSimpleApiService<FinishingType>('finishing-types', ['name', 'code'])
export const materialTypesService = createSimpleApiService<MaterialType>('material-types', ['name', 'code'])
export const sizesService = createSimpleApiService<Size>('sizes', ['name', 'code'])
export const originsService = createSimpleApiService<Origin>('origins', ['name', 'code', 'country'])
export const currenciesService = createSimpleApiService<Currency>('currencies', ['name', 'code'], validateCurrency)
export const promotionsService = createSimpleApiService<Promotion>('promotions', ['name', 'code'])
export const suppliersService = createSimpleApiService<Supplier>('suppliers', ['name', 'code', 'contactPerson'], validateSupplier)
export const warehousesService = createSimpleApiService<Warehouse>('warehouses', ['name', 'code'])
export const vehiclesService = createSimpleApiService<Vehicle>('vehicles', ['licensePlate', 'brand', 'model'])
export const expeditionsService = createSimpleApiService<Expedition>('expeditions', ['name', 'code'])
export const armadasService = createSimpleApiService<Armada>('armadas', ['name', 'code'])
export const bankAccountsService = createSimpleApiService<BankAccount>('bank-accounts', ['bankName', 'accountNumber', 'accountName'])
export const vendorsService = createSimpleApiService<Vendor>('vendors', ['name', 'code'])
export const accountsService = createSimpleApiService<Account>('accounts', ['name', 'code'])
export const accountCategoriesService = createSimpleApiService<AccountCategory>('account-categories', ['name', 'code'])
export const subAccountCategoriesService = createSimpleApiService<SubAccountCategory>('sub-account-categories', ['name', 'code'])
export const departmentsService = createSimpleApiService<Department>('departments', ['name', 'code'])
export const customerTypesService = createSimpleApiService<CustomerType>('customer-types', ['name', 'code'])
export const projectsService = createSimpleApiService<Project>('projects', ['name', 'code'])
export const customersService = createSimpleApiService<Customer>('customers', ['name', 'code', 'contactPerson'], validateCustomer)

// Hooks - use simple localStorage-based hooks as fallback
export const useCategoriesApi = createSimpleApiHooks('categories', categoriesService)
export const useFinishingTypesApi = createSimpleApiHooks('finishing-types', finishingTypesService)
export const useMaterialTypesApi = createSimpleApiHooks('material-types', materialTypesService)
export const useSizesApi = createSimpleApiHooks('sizes', sizesService)
export const useOriginsApi = createSimpleApiHooks('origins', originsService)
export const useCurrenciesApi = createSimpleApiHooks('currencies', currenciesService)
export const usePromotionsApi = createSimpleApiHooks('promotions', promotionsService)
export const useSuppliersApi = createSimpleApiHooks('suppliers', suppliersService)
export const useWarehousesApi = createSimpleApiHooks('warehouses', warehousesService)
export const useVehiclesApi = createSimpleApiHooks('vehicles', vehiclesService)
export const useExpeditionsApi = createSimpleApiHooks('expeditions', expeditionsService)
export const useArmadasApi = createSimpleApiHooks('armadas', armadasService)
export const useBankAccountsApi = createSimpleApiHooks('bank-accounts', bankAccountsService)
export const useVendorsApi = createSimpleApiHooks('vendors', vendorsService)
export const useAccountsApi = createSimpleApiHooks('accounts', accountsService)
export const useAccountCategoriesApi = createSimpleApiHooks('account-categories', accountCategoriesService)
export const useSubAccountCategoriesApi = createSimpleApiHooks('sub-account-categories', subAccountCategoriesService)
export const useDepartmentsApi = createSimpleApiHooks('departments', departmentsService)
export const useCustomerTypesApi = createSimpleApiHooks('customer-types', customerTypesService)
export const useProjectsApi = createSimpleApiHooks('projects', projectsService)
export const useCustomersApi = createSimpleApiHooks('customers', customersService)