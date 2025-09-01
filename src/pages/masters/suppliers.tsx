import { ColumnDef } from '@tanstack/react-table'
import { Users } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/data-table'
import { CrudModal, useCrudModal } from '@/components/forms/crud-modal'
import { Supplier, useSuppliersApi } from '@/lib/api/masters'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Validation schema
const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().default(true)
})

type SupplierFormData = z.infer<typeof supplierSchema>

// Table columns
const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    meta: { priority: 1 }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { priority: 1 }
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact Person',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const contact = row.getValue('contactPerson') as string
      return contact || <span className="text-muted-foreground">—</span>
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { priority: 3 },
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return email ? (
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
          {email}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    meta: { priority: 3 },
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return phone ? (
        <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
          {phone}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      return rating ? (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < rating ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-sm text-muted-foreground ml-1">({rating})</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  }
]

// Form component
function SupplierForm() {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      code: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: '',
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter supplier address" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Net 30, COD, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="5" 
                      step="0.1"
                      placeholder="Rate supplier performance" 
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
          </div>
        </div>

        {/* Status */}
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
                  Enable this supplier for purchasing operations
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
    </Form>
  )
}

// Main page component
export function SuppliersPage() {
  const { isOpen, entity, mode, id, closeModal } = useCrudModal()

  const showModal = isOpen && entity === 'suppliers'

  return (
    <>
      <DataTable
        entity="suppliers"
        title="Suppliers"
        subtitle="Manage supplier information and contacts"
        icon={Users}
        columns={columns}
        useEntityHooks={useSuppliersApi}
      />

      <CrudModal
        entity="suppliers"
        mode={mode || 'create'}
        id={id}
        open={showModal}
        onOpenChange={closeModal}
        schema={supplierSchema}
        useEntityHooks={useSuppliersApi}
      >
        <SupplierForm />
      </CrudModal>
    </>
  )
}