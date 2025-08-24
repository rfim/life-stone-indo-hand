import { ColumnDef } from '@tanstack/react-table'
import { Layers } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/data-table'
import { CrudModal, useCrudModal } from '@/components/forms/crud-modal'
import { LookupSelect } from '@/components/lookup-select'
import { Category, useCategoriesApi } from '@/lib/api/masters'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true)
})

type CategoryFormData = z.infer<typeof categorySchema>

// Table columns
const columns: ColumnDef<Category>[] = [
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
    accessorKey: 'description',
    header: 'Description',
    meta: { priority: 3 },
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return description ? (
        <span className="max-w-xs truncate block" title={description}>
          {description}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    }
  },
  {
    accessorKey: 'parentId',
    header: 'Parent Category',
    meta: { priority: 2 },
    cell: ({ row }) => {
      const parentId = row.getValue('parentId') as string
      // TODO: Resolve parent category name
      return parentId ? (
        <span className="text-sm text-muted-foreground">{parentId}</span>
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
function CategoryForm() {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      parentId: '',
      isActive: true
    }
  })

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
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
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter category description (optional)" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <LookupSelect
                  entity="categories"
                  placeholder="Select parent category (optional)"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  Enable this category for use in the system
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
export function CategoriesPage() {
  const { isOpen, entity, mode, id, closeModal } = useCrudModal()

  const showModal = isOpen && entity === 'categories'

  return (
    <>
      <DataTable
        entity="categories"
        title="Categories"
        subtitle="Manage product categories and subcategories"
        icon={Layers}
        columns={columns}
        useEntityHooks={useCategoriesApi}
      />

      <CrudModal
        entity="categories"
        mode={mode || 'create'}
        id={id}
        open={showModal}
        onOpenChange={closeModal}
        schema={categorySchema}
        useEntityHooks={useCategoriesApi}
      >
        <CategoryForm />
      </CrudModal>
    </>
  )
}