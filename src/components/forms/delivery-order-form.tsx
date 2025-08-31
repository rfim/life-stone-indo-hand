import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LookupSelect } from '@/components/lookup-select'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Minus,
  Package,
  Warehouse,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Truck,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { 
  DeliveryOrder, 
  DeliveryOrderLine, 
  SalesOrder,
  SalesOrderLine,
  enhancedDeliveryOrderService,
  generateDeliveryOrderNumber
} from '@/lib/api/delivery-orders'

// Form validation schema
const deliveryOrderLineSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, 'Product is required'),
  productCode: z.string(),
  productName: z.string(),
  orderedQuantity: z.number().min(0),
  alreadyDeliveredQuantity: z.number().min(0),
  quantityToDeliver: z.number().min(1, 'Quantity must be greater than 0'),
  unitOfMeasure: z.string(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  stockAvailable: z.number().min(0),
  pricePerUnit: z.number().min(0),
  totalAmount: z.number().min(0)
})

const deliveryOrderSchema = z.object({
  deliveryOrderNumber: z.string().optional(),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  expeditionId: z.string().min(1, 'Expedition is required'),
  salesOrderId: z.string().min(1, 'Sales order is required'),
  customerId: z.string(),
  customerName: z.string(),
  notes: z.string().optional(),
  lines: z.array(deliveryOrderLineSchema).min(1, 'At least one line item is required')
}).refine((data) => {
  // Custom validation for delivery quantities
  return data.lines.every(line => {
    const remainingToDeliver = line.orderedQuantity - line.alreadyDeliveredQuantity
    return line.quantityToDeliver <= remainingToDeliver && line.quantityToDeliver <= line.stockAvailable
  })
}, {
  message: "Delivery quantities exceed available stock or remaining balance",
  path: ["lines"]
})

type DeliveryOrderFormData = z.infer<typeof deliveryOrderSchema>

interface DeliveryOrderFormProps {
  deliveryOrder?: DeliveryOrder
  onSave: (data: any) => void
  onCancel: () => void
  loading: boolean
}

export function DeliveryOrderForm({ deliveryOrder, onSave, onCancel, loading }: DeliveryOrderFormProps) {
  const [availableSalesOrders, setAvailableSalesOrders] = useState<SalesOrder[]>([])
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null)
  const [stockAvailability, setStockAvailability] = useState<Record<string, number>>({})
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false)
  const [loadingStock, setLoadingStock] = useState(false)

  const isEditing = !!deliveryOrder

  const form = useForm<DeliveryOrderFormData>({
    resolver: zodResolver(deliveryOrderSchema),
    defaultValues: {
      deliveryOrderNumber: deliveryOrder?.deliveryOrderNumber || '',
      deliveryDate: deliveryOrder?.deliveryDate 
        ? format(new Date(deliveryOrder.deliveryDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      expeditionId: deliveryOrder?.expeditionId || '',
      salesOrderId: deliveryOrder?.salesOrderId || '',
      customerId: deliveryOrder?.customerId || '',
      customerName: deliveryOrder?.customerName || '',
      notes: deliveryOrder?.notes || '',
      lines: deliveryOrder?.lines || []
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  // Load available sales orders on mount
  useEffect(() => {
    loadAvailableSalesOrders()
  }, [])

  // Load selected sales order when salesOrderId changes
  useEffect(() => {
    const salesOrderId = form.watch('salesOrderId')
    if (salesOrderId && availableSalesOrders.length > 0) {
      const salesOrder = availableSalesOrders.find(so => so.id === salesOrderId)
      setSelectedSalesOrder(salesOrder || null)
      
      if (salesOrder) {
        // Update customer info
        form.setValue('customerId', salesOrder.customerId)
        form.setValue('customerName', salesOrder.customerName)
        
        // Load delivery order lines from sales order
        if (!isEditing) {
          loadDeliveryOrderLines(salesOrder)
        }
      }
    }
  }, [form.watch('salesOrderId'), availableSalesOrders, isEditing])

  // Check stock availability when lines change
  useEffect(() => {
    const lines = form.watch('lines')
    if (lines.length > 0) {
      checkStockAvailability(lines)
    }
  }, [form.watch('lines')])

  const loadAvailableSalesOrders = async () => {
    try {
      setLoadingSalesOrders(true)
      const salesOrders = await enhancedDeliveryOrderService.getAvailableSalesOrders()
      setAvailableSalesOrders(salesOrders)
    } catch (error) {
      toast.error('Failed to load available sales orders')
    } finally {
      setLoadingSalesOrders(false)
    }
  }

  const loadDeliveryOrderLines = async (salesOrder: SalesOrder) => {
    const lines: DeliveryOrderLine[] = []
    
    for (const soLine of salesOrder.lines) {
      if (soLine.remainingQuantity > 0) {
        const stockAvailable = await enhancedDeliveryOrderService.getStockAvailability(
          soLine.productId,
          'default-warehouse' // TODO: Get from product or use first available warehouse
        )
        
        const line: DeliveryOrderLine = {
          id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: soLine.productId,
          productCode: soLine.productCode,
          productName: soLine.productName,
          orderedQuantity: soLine.quantity,
          alreadyDeliveredQuantity: soLine.deliveredQuantity,
          quantityToDeliver: Math.min(soLine.remainingQuantity, stockAvailable),
          unitOfMeasure: soLine.unitOfMeasure,
          warehouseId: 'default-warehouse', // TODO: Load available warehouses
          stockAvailable,
          pricePerUnit: soLine.pricePerUnit,
          totalAmount: Math.min(soLine.remainingQuantity, stockAvailable) * soLine.pricePerUnit
        }
        
        lines.push(line)
      }
    }
    
    form.setValue('lines', lines)
  }

  const checkStockAvailability = async (lines: DeliveryOrderLine[]) => {
    try {
      setLoadingStock(true)
      const stockData: Record<string, number> = {}
      
      for (const line of lines) {
        if (line.productId && line.warehouseId) {
          const available = await enhancedDeliveryOrderService.getStockAvailability(
            line.productId,
            line.warehouseId
          )
          stockData[`${line.productId}-${line.warehouseId}`] = available
        }
      }
      
      setStockAvailability(stockData)
    } catch (error) {
      console.error('Error checking stock availability:', error)
    } finally {
      setLoadingStock(false)
    }
  }

  const updateLineQuantity = (index: number, quantity: number) => {
    const line = fields[index]
    const updatedLine = {
      ...line,
      quantityToDeliver: quantity,
      totalAmount: quantity * line.pricePerUnit
    }
    update(index, updatedLine)
  }

  const updateLineWarehouse = async (index: number, warehouseId: string) => {
    const line = fields[index]
    
    // Check stock availability for new warehouse
    const stockAvailable = await enhancedDeliveryOrderService.getStockAvailability(
      line.productId,
      warehouseId
    )
    
    const maxQuantity = Math.min(
      line.orderedQuantity - line.alreadyDeliveredQuantity,
      stockAvailable
    )
    
    const updatedLine = {
      ...line,
      warehouseId,
      stockAvailable,
      quantityToDeliver: Math.min(line.quantityToDeliver, maxQuantity),
      totalAmount: Math.min(line.quantityToDeliver, maxQuantity) * line.pricePerUnit
    }
    
    update(index, updatedLine)
  }

  const getDeliveryProgress = (line: DeliveryOrderLine) => {
    if (line.orderedQuantity === 0) return 0
    const totalDelivered = line.alreadyDeliveredQuantity + line.quantityToDeliver
    return Math.round((totalDelivered / line.orderedQuantity) * 100)
  }

  const getTotalQuantity = () => {
    return fields.reduce((sum, line) => sum + line.quantityToDeliver, 0)
  }

  const getTotalAmount = () => {
    return fields.reduce((sum, line) => sum + line.totalAmount, 0)
  }

  const getStockStatus = (line: DeliveryOrderLine) => {
    const remaining = line.orderedQuantity - line.alreadyDeliveredQuantity
    const available = line.stockAvailable
    
    if (line.quantityToDeliver > available) {
      return { type: 'error', message: `Insufficient stock (Available: ${available})` }
    }
    
    if (line.quantityToDeliver > remaining) {
      return { type: 'error', message: `Exceeds remaining balance (Remaining: ${remaining})` }
    }
    
    if (available < remaining) {
      return { type: 'warning', message: `Limited stock (Available: ${available})` }
    }
    
    return { type: 'success', message: 'Stock available' }
  }

  const handleSubmit = (data: DeliveryOrderFormData) => {
    // Calculate totals
    const totalQuantity = getTotalQuantity()
    const totalAmount = getTotalAmount()
    
    const deliveryOrderData = {
      ...data,
      deliveryOrderNumber: data.deliveryOrderNumber || generateDeliveryOrderNumber(),
      deliveryDate: new Date(data.deliveryDate),
      totalQuantity,
      totalAmount,
      status: 'draft' as const,
      isVoidable: true
    }
    
    onSave(deliveryOrderData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Order Information
            </CardTitle>
            <CardDescription>
              Enter delivery order header details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Order Number */}
              <FormField
                control={form.control}
                name="deliveryOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Order Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Auto-generated"
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      {!isEditing && 'Will be auto-generated if left empty'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Date */}
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expedition */}
              <FormField
                control={form.control}
                name="expeditionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expedition</FormLabel>
                    <FormControl>
                      <LookupSelect
                        entity="expeditions"
                        valueKey="id"
                        labelKey="name"
                        placeholder="Select expedition..."
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sales Order */}
              <FormField
                control={form.control}
                name="salesOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Order</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEditing || loadingSalesOrders}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales order..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSalesOrders.map((so) => (
                            <SelectItem key={so.id} value={so.id}>
                              <div>
                                <div className="font-medium">{so.salesOrderNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                  {so.customerName} • {format(new Date(so.orderDate), 'dd MMM yyyy')}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Customer Info (read-only) */}
            {selectedSalesOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{field.value}</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional notes for delivery..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Line Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Delivery Items
            </CardTitle>
            <CardDescription>
              Configure quantities and warehouses for delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select a sales order to load delivery items automatically.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Total Items: {fields.length} • Total Quantity: {getTotalQuantity()}
                  </div>
                  <div className="font-medium">
                    Total Amount: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(getTotalAmount())}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>To Deliver</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((line, index) => {
                        const stockStatus = getStockStatus(line)
                        const progress = getDeliveryProgress(line)
                        
                        return (
                          <TableRow key={line.id}>
                            {/* Product */}
                            <TableCell>
                              <div>
                                <div className="font-medium">{line.productCode}</div>
                                <div className="text-sm text-muted-foreground">
                                  {line.productName}
                                </div>
                              </div>
                            </TableCell>

                            {/* Ordered Quantity */}
                            <TableCell>
                              <div className="text-center">
                                <div className="font-medium">{line.orderedQuantity}</div>
                                <div className="text-xs text-muted-foreground">
                                  {line.unitOfMeasure}
                                </div>
                              </div>
                            </TableCell>

                            {/* Already Delivered */}
                            <TableCell>
                              <div className="text-center">
                                <div>{line.alreadyDeliveredQuantity}</div>
                              </div>
                            </TableCell>

                            {/* Quantity to Deliver */}
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={Math.min(
                                  line.orderedQuantity - line.alreadyDeliveredQuantity,
                                  line.stockAvailable
                                )}
                                value={line.quantityToDeliver}
                                onChange={(e) => updateLineQuantity(index, Number(e.target.value))}
                                className="w-20"
                              />
                            </TableCell>

                            {/* Warehouse */}
                            <TableCell>
                              <LookupSelect
                                entity="warehouses"
                                valueKey="id"
                                labelKey="name"
                                value={line.warehouseId}
                                onValueChange={(value) => updateLineWarehouse(index, value)}
                                className="w-32"
                              />
                            </TableCell>

                            {/* Stock Status */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {stockStatus.type === 'error' && 
                                  <AlertTriangle className="w-4 h-4 text-destructive" />
                                }
                                {stockStatus.type === 'warning' && 
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                }
                                {stockStatus.type === 'success' && 
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                }
                                <div className="text-sm">
                                  <div className="font-medium">{line.stockAvailable}</div>
                                  <div className="text-xs text-muted-foreground">
                                    available
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Progress */}
                            <TableCell>
                              <div className="w-20">
                                <Progress value={progress} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {progress}%
                                </div>
                              </div>
                            </TableCell>

                            {/* Amount */}
                            <TableCell>
                              <div className="text-right font-medium">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(line.totalAmount)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Stock Status Alerts */}
                {fields.some(line => getStockStatus(line).type === 'error') && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Some items have insufficient stock or exceed remaining balance. 
                      Please adjust quantities before saving.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={loading || fields.length === 0}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={loading || fields.length === 0}
              onClick={() => {
                form.handleSubmit((data) => {
                  handleSubmit(data)
                  onCancel() // Close after save
                })()
              }}
            >
              {loading ? 'Saving...' : 'Save & Close'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}