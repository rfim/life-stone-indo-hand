import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/data-table'
import { CrudModal, useCrudModal } from '@/components/forms/crud-modal'
import { getNavItemByPath } from '@/lib/nav-config'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Generic schema for simple master data
const genericSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
})

type GenericFormData = z.infer<typeof genericSchema>

// Generic columns for simple master data
const genericColumns: ColumnDef<any>[] = [
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

// Generic form component
function GenericForm() {
  const form = useForm<GenericFormData>({
    resolver: zodResolver(genericSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
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
                  <Input placeholder="Enter name" {...field} />
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
                  <Input placeholder="Enter code" {...field} />
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
                  placeholder="Enter description (optional)" 
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active Status
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this item for use in the system
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

// Mock service hooks - replace with actual API calls
const useMockEntityHooks = (entity: string) => {
  return () => ({
    useList: () => ({
      data: { data: [], total: 0 },
      isLoading: false,
      error: null,
      refetch: () => {}
    }),
    useGet: () => ({
      data: null,
      isLoading: false
    }),
    useCreate: () => ({
      mutateAsync: async () => ({ id: '1', data: {} }),
      isPending: false
    }),
    useUpdate: () => ({
      mutateAsync: async () => ({ id: '1', data: {} }),
      isPending: false
    }),
    useDelete: () => ({
      mutateAsync: async () => ({ success: true }),
      isPending: false
    }),
    useExport: () => ({
      mutate: () => {}
    }),
    useImport: () => ({
      mutate: () => {}
    })
  })
}

interface GenericPageProps {
  path: string
}

// Generic page component
export function GenericMasterPage({ path }: GenericPageProps) {
  const { isOpen, entity, mode, id, closeModal } = useCrudModal()
  const navItem = getNavItemByPath(path)
  
  if (!navItem) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The requested page could not be found.</p>
        </div>
      </div>
    )
  }

  const entityName = path.split('/').pop() || 'items'
  const entityHooks = useMockEntityHooks(entityName)
  const showModal = isOpen && entity === entityName

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <navItem.icon className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">{navItem.label}</h1>
            </div>
            <p className="text-muted-foreground">
              Manage {navItem.label.toLowerCase()} in the system
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="text-center py-12">
              <navItem.icon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                This module is being implemented. The basic CRUD interface will be available here.
              </p>
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <div>• List view with search and filtering</div>
                <div>• Create, edit, and view forms</div>
                <div>• Import/export functionality</div>
                <div>• Mobile-responsive design</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}