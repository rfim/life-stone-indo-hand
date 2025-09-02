import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useSalesOrdersApi, useProjectsApi, useMeetingMinutesApi, whatsappService } from '@/lib/api/marketing'
import { SalesOrder, Project } from '@/types/marketing'
import { ArrowLeft, Plus, X, Loader2, Send } from 'lucide-react'

interface SalesOrderFormData {
  code: string
  customerId: string
  projectId?: string
  meetingMinuteId?: string
  lines: Array<{
    productId: string
    qty: number
    uom: string
    unitPrice: number
    discounts: Array<{
      type: 'percentage' | 'fixed'
      value: number
      reason?: string
    }>
    taxType: 'PPN' | 'Non-PPN'
    currency: string
  }>
  additionalCharges: Array<{
    description: string
    amount: number
    taxType: 'PPN' | 'Non-PPN'
  }>
  headerDiscounts: Array<{
    type: 'percentage' | 'fixed'
    value: number
    reason?: string
  }>
  top: number
  isPPN: boolean
  newProjectName?: string
}

export function CreateSalesOrderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const meetingMinuteId = searchParams.get('meetingMinuteId')

  const { mutate: createSalesOrder, isPending: isCreating } = useSalesOrdersApi.useCreate()
  const { mutate: createProject, isPending: isCreatingProject } = useProjectsApi.useCreate()
  const { data: projects } = useProjectsApi.useList()
  const { data: meetingMinute } = useMeetingMinutesApi.useGetById(meetingMinuteId || '')

  const [createNewProject, setCreateNewProject] = useState(false)
  const [lineDiscountInput, setLineDiscountInput] = useState<{ [key: number]: { type: string; value: string; reason: string } }>({})
  const [headerDiscountInput, setHeaderDiscountInput] = useState({ type: 'percentage', value: '', reason: '' })
  const [additionalChargeInput, setAdditionalChargeInput] = useState({ description: '', amount: '', taxType: 'PPN' })

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SalesOrderFormData>({
    defaultValues: {
      code: '',
      customerId: '',
      lines: [],
      additionalCharges: [],
      headerDiscounts: [],
      top: 30,
      isPPN: true,
      meetingMinuteId: meetingMinuteId || undefined
    }
  })

  const { fields: lineFields, append: appendLine, remove: removeLine } = useFieldArray({
    control,
    name: 'lines'
  })

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: 'additionalCharges'
  })

  const { fields: discountFields, append: appendHeaderDiscount, remove: removeHeaderDiscount } = useFieldArray({
    control,
    name: 'headerDiscounts'
  })

  useEffect(() => {
    if (meetingMinute) {
      setValue('customerId', meetingMinute.customerId)
      setValue('projectId', meetingMinute.projectId)
    }
  }, [meetingMinute, setValue])

  useEffect(() => {
    // Generate SO code
    const timestamp = Date.now().toString().slice(-6)
    setValue('code', `SO-${timestamp}`)
  }, [setValue])

  const addLineItem = () => {
    appendLine({
      productId: '',
      qty: 1,
      uom: 'pcs',
      unitPrice: 0,
      discounts: [],
      taxType: 'PPN',
      currency: 'IDR'
    })
  }

  const addLineDiscount = (lineIndex: number) => {
    const input = lineDiscountInput[lineIndex]
    if (input && input.value) {
      const currentLines = watch('lines')
      const updatedLines = [...currentLines]
      updatedLines[lineIndex].discounts.push({
        type: input.type as 'percentage' | 'fixed',
        value: parseFloat(input.value),
        reason: input.reason
      })
      setValue('lines', updatedLines)
      setLineDiscountInput(prev => ({ ...prev, [lineIndex]: { type: 'percentage', value: '', reason: '' } }))
    }
  }

  const removeLineDiscount = (lineIndex: number, discountIndex: number) => {
    const currentLines = watch('lines')
    const updatedLines = [...currentLines]
    updatedLines[lineIndex].discounts.splice(discountIndex, 1)
    setValue('lines', updatedLines)
  }

  const addHeaderDiscount = () => {
    if (headerDiscountInput.value) {
      appendHeaderDiscount({
        type: headerDiscountInput.type as 'percentage' | 'fixed',
        value: parseFloat(headerDiscountInput.value),
        reason: headerDiscountInput.reason
      })
      setHeaderDiscountInput({ type: 'percentage', value: '', reason: '' })
    }
  }

  const addAdditionalCharge = () => {
    if (additionalChargeInput.description && additionalChargeInput.amount) {
      appendCharge({
        description: additionalChargeInput.description,
        amount: parseFloat(additionalChargeInput.amount),
        taxType: additionalChargeInput.taxType as 'PPN' | 'Non-PPN'
      })
      setAdditionalChargeInput({ description: '', amount: '', taxType: 'PPN' })
    }
  }

  const calculateLineTotal = (line: SalesOrderFormData['lines'][0]) => {
    const subtotal = line.qty * line.unitPrice
    let discountAmount = 0
    
    line.discounts.forEach(discount => {
      if (discount.type === 'percentage') {
        discountAmount += subtotal * (discount.value / 100)
      } else {
        discountAmount += discount.value
      }
    })
    
    return subtotal - discountAmount
  }

  const calculateGrandTotal = () => {
    const lines = watch('lines')
    const additionalCharges = watch('additionalCharges')
    const headerDiscounts = watch('headerDiscounts')
    
    const linesTotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0)
    
    let headerDiscountAmount = 0
    headerDiscounts.forEach(discount => {
      if (discount.type === 'percentage') {
        headerDiscountAmount += linesTotal * (discount.value / 100)
      } else {
        headerDiscountAmount += discount.value
      }
    })
    
    return linesTotal + chargesTotal - headerDiscountAmount
  }

  const onSubmit = async (data: SalesOrderFormData) => {
    try {
      let projectId = data.projectId

      // Create new project if requested
      if (createNewProject && data.newProjectName?.trim()) {
        const newProject: Partial<Project> = {
          name: data.newProjectName,
          customerId: data.customerId,
          source: 'SO',
          description: `Project created from sales order ${data.code}`
        }

        const projectResult = await new Promise<Project>((resolve, reject) => {
          createProject(newProject, {
            onSuccess: resolve,
            onError: reject
          })
        })

        projectId = projectResult.id
      }

      const salesOrderData: Partial<SalesOrder> = {
        code: data.code,
        customerId: data.customerId,
        projectId,
        meetingMinuteId: data.meetingMinuteId,
        status: 'Draft',
        lines: data.lines,
        additionalCharges: data.additionalCharges,
        headerDiscounts: data.headerDiscounts,
        top: data.top,
        isPPN: data.isPPN,
        approvals: []
      }

      createSalesOrder(salesOrderData, {
        onSuccess: (result) => {
          toast.success('Sales order created successfully')
          navigate(`/marketing/sales-orders/${result.id}/view`)
        },
        onError: () => {
          toast.error('Failed to create sales order')
        }
      })
    } catch (error) {
      toast.error('Failed to create sales order')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketing/sales-orders')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Sales Order</h1>
          {meetingMinute && (
            <p className="text-gray-600">Linked to Meeting Minutes: {meetingMinute.customerId}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">SO Code *</Label>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: 'SO code is required' }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter SO code" />
                  )}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerId">Customer *</Label>
                <Controller
                  name="customerId"
                  control={control}
                  rules={{ required: 'Customer is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter customer ID"
                      disabled={!!meetingMinute}
                    />
                  )}
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="top">Terms of Payment (days) *</Label>
                <Controller
                  name="top"
                  control={control}
                  rules={{ required: 'TOP is required', min: { value: 1, message: 'TOP must be greater than 0' } }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {errors.top && (
                  <p className="text-sm text-red-500">{errors.top.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectId">Project</Label>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={createNewProject ? 'new' : field.value || ''}
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setCreateNewProject(true)
                          field.onChange('')
                        } else {
                          setCreateNewProject(false)
                          field.onChange(value || undefined)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        <SelectItem value="new">+ Create New Project</SelectItem>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="isPPN"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Include PPN (VAT)</Label>
              </div>
            </div>

            {createNewProject && (
              <div>
                <Label htmlFor="newProjectName">New Project Name *</Label>
                <Controller
                  name="newProjectName"
                  control={control}
                  rules={{ required: createNewProject ? 'Project name is required' : false }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter new project name" />
                  )}
                />
                {errors.newProjectName && (
                  <p className="text-sm text-red-500">{errors.newProjectName.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Line Items
              <Button type="button" onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Line Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Product ID *</Label>
                    <Controller
                      name={`lines.${index}.productId`}
                      control={control}
                      rules={{ required: 'Product ID is required' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Product ID" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Quantity *</Label>
                    <Controller
                      name={`lines.${index}.qty`}
                      control={control}
                      rules={{ required: 'Quantity is required', min: { value: 1, message: 'Min 1' } }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label>UOM</Label>
                    <Controller
                      name={`lines.${index}.uom`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="UOM" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Unit Price *</Label>
                    <Controller
                      name={`lines.${index}.unitPrice`}
                      control={control}
                      rules={{ required: 'Unit price is required', min: { value: 0, message: 'Min 0' } }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Tax Type</Label>
                    <Controller
                      name={`lines.${index}.taxType`}
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PPN">PPN</SelectItem>
                            <SelectItem value="Non-PPN">Non-PPN</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Line Discounts */}
                <div className="space-y-2">
                  <Label>Line Discounts</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={lineDiscountInput[index]?.type || 'percentage'}
                      onValueChange={(value) => setLineDiscountInput(prev => ({
                        ...prev,
                        [index]: { ...prev[index], type: value }
                      }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={lineDiscountInput[index]?.value || ''}
                      onChange={(e) => setLineDiscountInput(prev => ({
                        ...prev,
                        [index]: { ...prev[index], value: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Reason"
                      value={lineDiscountInput[index]?.reason || ''}
                      onChange={(e) => setLineDiscountInput(prev => ({
                        ...prev,
                        [index]: { ...prev[index], reason: e.target.value }
                      }))}
                    />
                    <Button type="button" onClick={() => addLineDiscount(index)} size="sm">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {watch(`lines.${index}.discounts`)?.map((discount, discountIndex) => (
                      <Badge key={discountIndex} variant="outline" className="flex items-center">
                        {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value}`}
                        {discount.reason && ` - ${discount.reason}`}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeLineDiscount(index, discountIndex)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-medium">
                    Line Total: {calculateLineTotal(watch(`lines.${index}`)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </span>
                </div>
              </div>
            ))}

            {lineFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No line items added. Click "Add Line" to start.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Description"
                    value={additionalChargeInput.description}
                    onChange={(e) => setAdditionalChargeInput(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={additionalChargeInput.amount}
                    onChange={(e) => setAdditionalChargeInput(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <Select
                    value={additionalChargeInput.taxType}
                    onValueChange={(value) => setAdditionalChargeInput(prev => ({ ...prev, taxType: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PPN">PPN</SelectItem>
                      <SelectItem value="Non-PPN">Non-PPN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addAdditionalCharge} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {chargeFields.map((field, index) => (
                  <div key={field.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{field.description}</span>
                      <span className="text-sm text-gray-500 ml-2">({field.taxType})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{field.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCharge(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Header Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Select
                    value={headerDiscountInput.type}
                    onValueChange={(value) => setHeaderDiscountInput(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={headerDiscountInput.value}
                    onChange={(e) => setHeaderDiscountInput(prev => ({ ...prev, value: e.target.value }))}
                  />
                  <Input
                    placeholder="Reason"
                    value={headerDiscountInput.reason}
                    onChange={(e) => setHeaderDiscountInput(prev => ({ ...prev, reason: e.target.value }))}
                  />
                  <Button type="button" onClick={addHeaderDiscount} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {discountFields.map((field, index) => (
                  <div key={field.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">
                        {field.type === 'percentage' ? `${field.value}%` : field.value}
                      </span>
                      {field.reason && <span className="text-sm text-gray-500 ml-2">- {field.reason}</span>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeaderDiscount(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-right">
              <div className="text-2xl font-bold">
                Grand Total: {calculateGrandTotal().toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </div>
              <div className="text-sm text-gray-500">
                {watch('isPPN') ? 'Including PPN/VAT' : 'Excluding VAT'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/marketing/sales-orders')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isCreatingProject}
          >
            {(isCreating || isCreatingProject) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Create Sales Order
          </Button>
        </div>
      </form>
    </div>
  )
}