import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ColdCall, ColdCallStatus } from '@/types/marketing'
import { useColdCallsApi } from '@/lib/api/marketing'
import { useCustomersApi } from '@/lib/api/masters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { format } from 'date-fns'

const coldCallSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  ownerId: z.string().min(1, 'Salesperson is required'),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  status: z.enum(['Planned', 'Visited', 'NoShow', 'Converted', 'Dropped']),
  notes: z.string().optional(),
  followUpDate: z.string().optional()
})

type ColdCallFormData = z.infer<typeof coldCallSchema>

interface ColdCallFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: ColdCall
  onSuccess?: () => void
  onCancel?: () => void
}

export function ColdCallForm({ mode, initialData, onSuccess, onCancel }: ColdCallFormProps) {
  const { mutate: createColdCall, isPending: isCreating } = useColdCallsApi.useCreate()
  const { mutate: updateColdCall, isPending: isUpdating } = useColdCallsApi.useUpdate()
  const { data: customersResult } = useCustomersApi.useList({ pageSize: 100 })
  
  const customers = customersResult?.data || []
  const isLoading = isCreating || isUpdating
  const isViewMode = mode === 'view'

  const form = useForm<ColdCallFormData>({
    resolver: zodResolver(coldCallSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      ownerId: initialData?.ownerId || 'current-user', // TODO: Get current user
      scheduledAt: initialData?.scheduledAt || '',
      status: initialData?.status || 'Planned',
      notes: initialData?.notes || '',
      followUpDate: initialData?.followUpDate || ''
    }
  })

  const onSubmit = (data: ColdCallFormData) => {
    if (mode === 'create') {
      createColdCall(data, {
        onSuccess: () => {
          toast.success('Cold call created successfully')
          onSuccess?.()
        },
        onError: (error) => {
          toast.error(`Failed to create cold call: ${error.message}`)
        }
      })
    } else if (mode === 'edit' && initialData) {
      updateColdCall(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            toast.success('Cold call updated successfully')
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(`Failed to update cold call: ${error.message}`)
          }
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Select
                    disabled={isViewMode}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    disabled={isViewMode}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    disabled={isViewMode}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Visited">Visited</SelectItem>
                      <SelectItem value="NoShow">No Show</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Call notes and observations..."
                    disabled={isViewMode}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={isViewMode}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isViewMode && initialData && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(initialData.createdAt), 'PPpp')}
                </p>
              </div>
              {initialData.updatedAt && (
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(initialData.updatedAt), 'PPpp')}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isViewMode && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {mode === 'create' ? 'Create' : 'Update'} Cold Call
              </Button>
            </div>
          )}
        </form>
      </Form>

      {isViewMode && (
        <div className="flex justify-end pt-4">
          <Button onClick={onCancel}>Close</Button>
        </div>
      )}
    </div>
  )
}