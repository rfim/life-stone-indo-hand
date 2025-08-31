import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BaseEntity } from '@/lib/db/connection'

// Import all entity services
import { 
  categoriesService,
  finishingTypesService,
  materialTypesService,
  sizesService,
  originsService,
  currenciesService,
  promotionsService,
  suppliersService,
  warehousesService,
  vehiclesService,
  expeditionsService,
  armadasService,
  bankAccountsService,
  vendorsService,
  accountsService,
  accountCategoriesService,
  subAccountCategoriesService,
  departmentsService,
  customerTypesService,
  projectsService,
  customersService
} from '@/lib/api/masters'
import { itemsService } from '@/lib/api/items'

// Entity service mapping
const entityServices = {
  'categories': categoriesService,
  'finishing-types': finishingTypesService,
  'material-types': materialTypesService,
  'sizes': sizesService,
  'origins': originsService,
  'currencies': currenciesService,
  'promotions': promotionsService,
  'suppliers': suppliersService,
  'warehouses': warehousesService,
  'vehicles': vehiclesService,
  'expeditions': expeditionsService,
  'armadas': armadasService,
  'bank-accounts': bankAccountsService,
  'vendors': vendorsService,
  'accounts': accountsService,
  'account-categories': accountCategoriesService,
  'sub-account-categories': subAccountCategoriesService,
  'departments': departmentsService,
  'customer-types': customerTypesService,
  'projects': projectsService,
  'customers': customersService,
  'items': itemsService,
} as const

// Custom fetch functions for entities stored directly in KV
const kvEntityFetchers = {
  'expeditions': async () => {
    const data = await spark.kv.get('erp.expeditions') || []
    return { data: data.filter((item: any) => !item.isDeleted), total: data.length }
  },
  'products': async () => {
    const data = await spark.kv.get('erp.products') || []
    return { data: data.filter((item: any) => !item.isDeleted), total: data.length }
  },
}

type EntityName = keyof typeof entityServices | keyof typeof kvEntityFetchers

interface LookupSelectProps {
  entity: EntityName
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  labelKey?: string
  valueKey?: string
  searchable?: boolean
  disabled?: boolean
  className?: string
  label?: string
  required?: boolean
  error?: string
}

export function LookupSelect({
  entity,
  value,
  onValueChange,
  placeholder = 'Select...',
  labelKey = 'name',
  valueKey = 'id',
  searchable = false,
  disabled = false,
  className = '',
  label,
  required = false,
  error
}: LookupSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  const service = entityServices[entity as keyof typeof entityServices]
  const kvFetcher = kvEntityFetchers[entity as keyof typeof kvEntityFetchers]
  
  const { data: result, isLoading, error: fetchError } = useQuery({
    queryKey: [entity, 'lookup', searchQuery],
    queryFn: async () => {
      if (kvFetcher) {
        return await kvFetcher()
      } else if (service) {
        return await service.list({ 
          q: searchQuery || undefined,
          pageSize: 100 // Get more items for lookups
        })
      }
      return { data: [], total: 0 }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  })

  const options = result?.data || []
  const selectedOption = options.find((item: any) => item[valueKey] === value)

  if (searchable) {
    return (
      <div className={className}>
        {label && (
          <Label className="mb-2 block">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="space-y-2">
          <Input
            placeholder={`Search ${entity}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
          />
          
          <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder}>
                {selectedOption ? (selectedOption as any)[labelKey] : placeholder}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {isLoading && (
                <SelectItem value="__loading__" disabled>
                  Loading...
                </SelectItem>
              )}
              {fetchError && (
                <SelectItem value="__error__" disabled>
                  Error loading data
                </SelectItem>
              )}
              {!isLoading && options.length === 0 && (
                <SelectItem value="__no_items__" disabled>
                  No items found
                </SelectItem>
              )}
              {options.map((item: any) => (
                <SelectItem key={item[valueKey]} value={item[valueKey]}>
                  {item[labelKey]}
                  {item.code && item.code !== item[labelKey] && (
                    <span className="text-muted-foreground ml-2">({item.code})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <Label className="mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (selectedOption as any)[labelKey] : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <SelectItem value="__loading__" disabled>
              Loading...
            </SelectItem>
          )}
          {fetchError && (
            <SelectItem value="__error__" disabled>
              Error loading data
            </SelectItem>
          )}
          {!isLoading && options.length === 0 && (
            <SelectItem value="__no_items__" disabled>
              No items found
            </SelectItem>
          )}
          {options.map((item: any) => (
            <SelectItem key={item[valueKey]} value={item[valueKey]}>
              {item[labelKey]}
              {item.code && item.code !== item[labelKey] && (
                <span className="text-muted-foreground ml-2">({item.code})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

// Specialized components for common lookups
export function CategorySelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="categories" {...props} />
}

export function SupplierSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="suppliers" {...props} />
}

export function CustomerSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="customers" {...props} />
}

export function WarehouseSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="warehouses" {...props} />
}

export function CurrencySelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="currencies" labelKey="code" {...props} />
}

export function MaterialTypeSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="material-types" {...props} />
}

export function FinishingTypeSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="finishing-types" {...props} />
}

export function SizeSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="sizes" {...props} />
}

export function OriginSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="origins" {...props} />
}

export function ItemSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="items" {...props} />
}

export function CustomerTypeSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="customer-types" {...props} />
}

export function ProjectSelect(props: Omit<LookupSelectProps, 'entity'>) {
  return <LookupSelect entity="projects" {...props} />
}