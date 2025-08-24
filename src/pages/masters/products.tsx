import { ColumnDef } from '@tanstack/react-table'
import { Grid, Upload } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { CrudModal, useCrudModal } from '@/components/forms/crud-modal'
import { 
  LookupSelect, 
  ItemSelect, 
  CategorySelect, 
  SizeSelect, 
  CurrencySelect 
} from '@/components/lookup-select'
import { Product, useProductsApi } from '@/lib/api/items'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

// Validation schema
const productSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  sizeId: z.string().optional(),
  
  // Pricing
  priceOriginal: z.object({
    amount: z.number().positive('Price must be positive'),
    currency: z.string().min(1, 'Currency is required'),
  }).optional(),
  
  // Dimensions
  dimensions: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
    thickness: z.number().positive().optional(),
    unit: z.string().min(1, 'Unit is required'),
  }).optional(),
  
  // Weight
  weight: z.object({
    value: z.number().positive('Weight must be positive'),
    unit: z.string().min(1, 'Unit is required'),
  }).optional(),
  
  // Block info for stone products
  blockInfo: z.object({
    blockId: z.string().min(1, 'Block ID is required'),
    bundleNumber: z.string().min(1, 'Bundle number is required'),
    slabNumber: z.string().min(1, 'Slab number is required'),
  }).optional(),
  
  // Tile info for tile products
  tileInfo: z.object({
    pattern: z.string().optional(),
    grade: z.string().optional(),
    batchNumber: z.string().optional(),
  }).optional(),
  
  // Inventory
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
  isActive: z.boolean().default(true)
})

type ProductFormData = z.infer<typeof productSchema>

// Table columns
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
    meta: { priority: 1 }
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    meta: { priority: 1 }
  },
  {
    accessorKey: 'priceIDR',
    header: 'Price (IDR)',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const price = row.getValue('priceIDR') as number
      return price ? (
        <span className="font-medium">
          Rp {price.toLocaleString('id-ID')}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'priceOriginal',
    header: 'Original Price',
    meta: { priority: 3 },
    cell: ({ row }) => {
      const priceOriginal = row.getValue('priceOriginal') as any
      return priceOriginal ? (
        <span className="text-sm">
          {priceOriginal.currency} {priceOriginal.amount.toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'stockLevel',
    header: 'Stock',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const stock = row.getValue('stockLevel') as number
      const minStock = (row.original as Product).minStockLevel
      
      if (stock === undefined || stock === null) {
        return <span className="text-muted-foreground">—</span>
      }
      
      const isLow = minStock && stock <= minStock
      
      return (
        <Badge variant={isLow ? 'destructive' : stock > 0 ? 'default' : 'secondary'}>
          {stock}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
        ACTIVE: 'default',
        DRAFT: 'secondary',
        INACTIVE: 'secondary',
        DISCONTINUED: 'destructive'
      }
      
      return (
        <Badge variant={variants[status] || 'secondary'}>
          {status}
        </Badge>
      )
    }
  }
]

// Form component
function ProductForm() {
  const [showBlockInfo, setShowBlockInfo] = useState(false)
  const [showTileInfo, setShowTileInfo] = useState(false)
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      itemId: '',
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      sizeId: '',
      status: 'ACTIVE',
      isActive: true
    }
  })

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Item</FormLabel>
                  <FormControl>
                    <ItemSelect
                      placeholder="Select base item"
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter product description" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategorySelect
                      placeholder="Select category"
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <SizeSelect
                      placeholder="Select size (optional)"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priceOriginal.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Enter price amount" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priceOriginal.currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <CurrencySelect
                      placeholder="Select currency"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dimensions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dimensions.unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Product Type Specific */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product Details</h3>
          
          <div className="flex gap-4">
            <Button 
              type="button"
              variant={showBlockInfo ? "default" : "outline"}
              onClick={() => {
                setShowBlockInfo(!showBlockInfo)
                if (showTileInfo) setShowTileInfo(false)
              }}
            >
              Stone/Slab Product
            </Button>
            <Button 
              type="button"
              variant={showTileInfo ? "default" : "outline"}
              onClick={() => {
                setShowTileInfo(!showTileInfo)
                if (showBlockInfo) setShowBlockInfo(false)
              }}
            >
              Tile Product
            </Button>
          </div>

          {showBlockInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="blockInfo.blockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter block ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="blockInfo.bundleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bundle number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="blockInfo.slabNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slab Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter slab number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {showTileInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="tileInfo.pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pattern" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tileInfo.grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tileInfo.batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter batch number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Active Status
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable this product for sales operations
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  )
}

// Main page component
export function ProductsPage() {
  const { isOpen, entity, mode, id, closeModal } = useCrudModal()
  const productsApi = useProductsApi()

  const showModal = isOpen && entity === 'products'

  return (
    <>
      <DataTable
        entity="products"
        title="Products"
        subtitle="Manage product catalog and pricing"
        icon={Grid}
        columns={columns}
        useEntityHooks={productsApi}
      />

      <CrudModal
        entity="products"
        mode={mode || 'create'}
        id={id}
        open={showModal}
        onOpenChange={closeModal}
        schema={productSchema}
        useEntityHooks={productsApi}
      >
        <ProductForm />
      </CrudModal>
    </>
  )
}