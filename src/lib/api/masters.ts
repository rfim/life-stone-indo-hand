import { BaseEntity } from '@/lib/db/connection'
import { createEntityService, createEntityHooks } from '@/lib/api/base'

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

// Services
export const categoriesService = createEntityService<Category>('categories', ['name', 'code'], validateCategory)
export const finishingTypesService = createEntityService<FinishingType>('finishing-types', ['name', 'code'])
export const materialTypesService = createEntityService<MaterialType>('material-types', ['name', 'code'])
export const sizesService = createEntityService<Size>('sizes', ['name', 'code'])
export const originsService = createEntityService<Origin>('origins', ['name', 'code', 'country'])
export const currenciesService = createEntityService<Currency>('currencies', ['name', 'code'], validateCurrency)
export const promotionsService = createEntityService<Promotion>('promotions', ['name', 'code'])
export const suppliersService = createEntityService<Supplier>('suppliers', ['name', 'code', 'contactPerson'], validateSupplier)
export const warehousesService = createEntityService<Warehouse>('warehouses', ['name', 'code'])
export const vehiclesService = createEntityService<Vehicle>('vehicles', ['licensePlate', 'brand', 'model'])
export const expeditionsService = createEntityService<Expedition>('expeditions', ['name', 'code'])
export const armadasService = createEntityService<Armada>('armadas', ['name', 'code'])
export const bankAccountsService = createEntityService<BankAccount>('bank-accounts', ['bankName', 'accountNumber', 'accountName'])
export const vendorsService = createEntityService<Vendor>('vendors', ['name', 'code'])
export const accountsService = createEntityService<Account>('accounts', ['name', 'code'])
export const accountCategoriesService = createEntityService<AccountCategory>('account-categories', ['name', 'code'])
export const subAccountCategoriesService = createEntityService<SubAccountCategory>('sub-account-categories', ['name', 'code'])
export const departmentsService = createEntityService<Department>('departments', ['name', 'code'])
export const customerTypesService = createEntityService<CustomerType>('customer-types', ['name', 'code'])
export const projectsService = createEntityService<Project>('projects', ['name', 'code'])
export const customersService = createEntityService<Customer>('customers', ['name', 'code', 'contactPerson'], validateCustomer)

// Hooks
export const useCategoriesApi = () => createEntityHooks('categories', categoriesService)
export const useFinishingTypesApi = () => createEntityHooks('finishing-types', finishingTypesService)
export const useMaterialTypesApi = () => createEntityHooks('material-types', materialTypesService)
export const useSizesApi = () => createEntityHooks('sizes', sizesService)
export const useOriginsApi = () => createEntityHooks('origins', originsService)
export const useCurrenciesApi = () => createEntityHooks('currencies', currenciesService)
export const usePromotionsApi = () => createEntityHooks('promotions', promotionsService)
export const useSuppliersApi = () => createEntityHooks('suppliers', suppliersService)
export const useWarehousesApi = () => createEntityHooks('warehouses', warehousesService)
export const useVehiclesApi = () => createEntityHooks('vehicles', vehiclesService)
export const useExpeditionsApi = () => createEntityHooks('expeditions', expeditionsService)
export const useArmadasApi = () => createEntityHooks('armadas', armadasService)
export const useBankAccountsApi = () => createEntityHooks('bank-accounts', bankAccountsService)
export const useVendorsApi = () => createEntityHooks('vendors', vendorsService)
export const useAccountsApi = () => createEntityHooks('accounts', accountsService)
export const useAccountCategoriesApi = () => createEntityHooks('account-categories', accountCategoriesService)
export const useSubAccountCategoriesApi = () => createEntityHooks('sub-account-categories', subAccountCategoriesService)
export const useDepartmentsApi = () => createEntityHooks('departments', departmentsService)
export const useCustomerTypesApi = () => createEntityHooks('customer-types', customerTypesService)
export const useProjectsApi = () => createEntityHooks('projects', projectsService)
export const useCustomersApi = () => createEntityHooks('customers', customersService)