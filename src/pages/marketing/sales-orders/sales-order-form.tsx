import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SalesOrder, SOStatus } from '@/types/marketing'
import { useSalesOrdersApi } from '@/lib/api/marketing'
import { useCustomersApi, useProjectsApi } from '@/lib/api/masters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCrudModal } from '@/hooks/use-crud-modal'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

const salesOrderSchema = z.object({
  code: z.string().min(1, 'SO code is required'),
  customerId: z.string().min(1, 'Customer is required'),
  projectId: z.string().optional(),
  status: z.enum(['Draft', 'Submitted', 'DirectorApproved', 'DirectorRejected', 'Confirmed']),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    qty: z.number().min(0.01, 'Quantity must be greater than 0'),
    uom: z.string().min(1, 'Unit of measure is required'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    taxType: z.enum(['PPN', 'Non-PPN']),
    currency: z.string().default('IDR')
  })).min(1, 'At least one line item is required'),
  top: z.number().min(1, 'Terms of payment must be at least 1 day'),
  isPPN: z.boolean().default(true)
})

type SalesOrderFormData = z.infer<typeof salesOrderSchema>

interface SalesOrderFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: SalesOrder
}

export function SalesOrderForm({ mode, initialData }: SalesOrderFormProps) {
  const { closeModal } = useCrudModal()
  const { mutate: createSalesOrder, isPending: isCreating } = useSalesOrdersApi.useCreate()
  const { mutate: updateSalesOrder, isPending: isUpdating } = useSalesOrdersApi.useUpdate()
  const { data: customersResult } = useCustomersApi.useList({ pageSize: 100 })
  const { data: projectsResult } = useProjectsApi.useList({ pageSize: 100 })
  
  const customers = customersResult?.data || []
  const projects = projectsResult?.data || []
  const isLoading = isCreating || isUpdating
  const isViewMode = mode === 'view'

  const [lines, setLines] = useState(
    initialData?.lines || [
      {
        productId: '',
        qty: 1,
        uom: 'PCS',
        unitPrice: 0,
        taxType: 'PPN' as const,
        currency: 'IDR'
      }
    ]
  )

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      code: initialData?.code || `SO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      customerId: initialData?.customerId || '',
      projectId: initialData?.projectId || '',
      status: initialData?.status || 'Draft',
      lines: lines,
      top: initialData?.top || 30,
      isPPN: initialData?.isPPN ?? true
    }
  })

  const addLine = () => {
    const newLines = [...lines, {
      productId: '',
      qty: 1,
      uom: 'PCS',
      unitPrice: 0,
      taxType: 'PPN' as const,
      currency: 'IDR'
    }]
    setLines(newLines)
    form.setValue('lines', newLines)
  }

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index)
      setLines(newLines)
      form.setValue('lines', newLines)
    }
  }

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
    form.setValue('lines', newLines)
  }

  const calculateTotal = () => {
    return lines.reduce((total, line) => {
      return total + (line.qty * line.unitPrice)
    }, 0)
  }

  const onSubmit = (data: SalesOrderFormData) => {
    if (mode === 'create') {
      createSalesOrder(data, {
        onSuccess: () => {
          toast.success('Sales order created successfully')
          closeModal()
        },
        onError: (error) => {
          toast.error(`Failed to create sales order: ${error.message}`)
        }
      })
    } else if (mode === 'edit' && initialData) {
      updateSalesOrder(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            toast.success('Sales order updated successfully')
            closeModal()
          },
          onError: (error) => {
            toast.error(`Failed to update sales order: ${error.message}`)
          }
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SO Number</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isViewMode || mode === 'edit'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isViewMode}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="top"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms of Payment (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isViewMode}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPPN"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>PPN/Tax Inclusive</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isViewMode}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                {!isViewMode && (
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lines.map((line, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {!isViewMode && lines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Product</Label>
                        <Input
                          disabled={isViewMode}
                          placeholder="Product ID"
                          value={line.productId}
                          onChange={(e) => updateLine(index, 'productId', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          disabled={isViewMode}
                          value={line.qty}
                          onChange={(e) => updateLine(index, 'qty', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>UOM</Label>
                        <Input
                          disabled={isViewMode}
                          value={line.uom}
                          onChange={(e) => updateLine(index, 'uom', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          disabled={isViewMode}
                          value={line.unitPrice}
                          onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <Select
                        disabled={isViewMode}
                        value={line.taxType}
                        onValueChange={(value) => updateLine(index, 'taxType', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PPN">PPN</SelectItem>
                          <SelectItem value="Non-PPN">Non-PPN</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Line Total</p>
                        <p className="font-medium">
                          {(line.qty * line.unitPrice).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-medium">
                      Total: {calculateTotal().toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isViewMode && initialData && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge>{initialData.status}</Badge>
                  </div>
                </div>
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
              </CardContent>
            </Card>
          )}

          {!isViewMode && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {mode === 'create' ? 'Create' : 'Update'} Sales Order
              </Button>
            </div>
          )}
        </form>
      </Form>

      {isViewMode && (
        <div className="flex justify-end pt-4">
          <Button onClick={closeModal}>Close</Button>
        </div>
      )}
    </div>
  )
}