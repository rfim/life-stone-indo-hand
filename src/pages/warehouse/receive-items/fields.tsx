import React, { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Upload, X, AlertTriangle, QrCode, Package } from 'lucide-react'
import { ReceiveItemsFormData } from './schema'

interface ReceiveItemsFieldsProps {
  form: UseFormReturn<ReceiveItemsFormData>
  isEdit?: boolean
}

export function ReceiveItemsFields({ form, isEdit = false }: ReceiveItemsFieldsProps) {
  const [lineItems, setLineItems] = useState<any[]>([])
  const [deductions, setDeductions] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [photos, setPhotos] = useState<string[]>([])

  // Initialize arrays from form when component mounts
  useEffect(() => {
    const currentLineItems = form.watch('lineItems') || []
    const currentDeductions = form.watch('deductions') || []
    const currentComplaints = form.watch('complaints') || []
    const currentPhotos = form.watch('photos') || []
    
    setLineItems(currentLineItems)
    setDeductions(currentDeductions)
    setComplaints(currentComplaints)
    setPhotos(currentPhotos)
  }, [])

  // Auto-calculate area when dimensions change
  useEffect(() => {
    const dimensions = form.watch('actualDimensions')
    if (dimensions && dimensions.length > 0 && dimensions.width > 0) {
      let area = dimensions.length * dimensions.width
      
      // Convert to square meters
      if (dimensions.unit === 'mm') {
        area = area / 1000000
      } else if (dimensions.unit === 'cm') {
        area = area / 10000
      }
      
      form.setValue('actualArea', area)
    }
  }, [form.watch('actualDimensions')])

  // Auto-generate QR code when receipt number changes
  useEffect(() => {
    const receiptNumber = form.watch('receiptNumber')
    if (receiptNumber && !form.watch('qrCode')) {
      const qrCode = `QR_RCV_${receiptNumber}_${Date.now()}`
      form.setValue('qrCode', qrCode)
    }
  }, [form.watch('receiptNumber')])

  const addLineItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      expectedQuantity: 1,
      receivedQuantity: 1,
      unit: 'pcs',
      condition: 'good',
      notes: ''
    }
    const updated = [...lineItems, newItem]
    setLineItems(updated)
    form.setValue('lineItems', updated)
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
    form.setValue('lineItems', updated)
  }

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index)
    setLineItems(updated)
    form.setValue('lineItems', updated)
  }

  const addDeduction = () => {
    const newDeduction = {
      id: crypto.randomUUID(),
      type: 'damaged',
      description: '',
      quantity: 0,
      affectedArea: 0,
      estimatedValue: 0,
      photos: [],
      reportedBy: 'Current User',
      reportedAt: new Date().toISOString()
    }
    const updated = [...deductions, newDeduction]
    setDeductions(updated)
    form.setValue('deductions', updated)
  }

  const updateDeduction = (index: number, field: string, value: any) => {
    const updated = [...deductions]
    updated[index] = { ...updated[index], [field]: value }
    setDeductions(updated)
    form.setValue('deductions', updated)
  }

  const removeDeduction = (index: number) => {
    const updated = deductions.filter((_, i) => i !== index)
    setDeductions(updated)
    form.setValue('deductions', updated)
  }

  const addComplaint = () => {
    const newComplaint = {
      id: crypto.randomUUID(),
      type: 'quality',
      priority: 'medium',
      description: '',
      expectedResolution: '',
      status: 'open',
      reportedBy: 'Current User',
      reportedAt: new Date().toISOString(),
      photos: [],
      supplierNotified: false,
      supplierResponse: ''
    }
    const updated = [...complaints, newComplaint]
    setComplaints(updated)
    form.setValue('complaints', updated)
  }

  const updateComplaint = (index: number, field: string, value: any) => {
    const updated = [...complaints]
    updated[index] = { ...updated[index], [field]: value }
    setComplaints(updated)
    form.setValue('complaints', updated)
  }

  const removeComplaint = (index: number) => {
    const updated = complaints.filter((_, i) => i !== index)
    setComplaints(updated)
    form.setValue('complaints', updated)
  }

  const addPhoto = (photoUrl: string) => {
    const updated = [...photos, photoUrl]
    setPhotos(updated)
    form.setValue('photos', updated)
  }

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    form.setValue('photos', updated)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'received': return 'secondary'
      case 'inspected': return 'default'
      case 'stored': return 'default'
      case 'complained': return 'destructive'
      default: return 'outline'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'default'
      case 'damaged': return 'destructive'
      case 'cracked': return 'destructive'
      case 'broken': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="receiptNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Auto-generated if empty" 
                  {...field} 
                  disabled={isEdit}
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
              <div className="flex items-center space-x-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="inspected">Inspected</SelectItem>
                    <SelectItem value="stored">Stored</SelectItem>
                    <SelectItem value="complained">Complained</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getStatusColor(field.value)}>
                  {field.value?.toUpperCase()}
                </Badge>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Purchase Order and Receipt Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="purchaseOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                // Auto-populate PO number
                const poMap: Record<string, string> = {
                  'po-001': 'PO/2024/01/0001',
                  'po-002': 'PO/2024/01/0002',
                  'po-003': 'PO/2024/01/0003'
                }
                form.setValue('purchaseOrderNumber', poMap[value] || '')
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="po-001">PO/2024/01/0001 - PT. Stone Indonesia</SelectItem>
                  <SelectItem value="po-002">PO/2024/01/0002 - CV. Marble Jaya</SelectItem>
                  <SelectItem value="po-003">PO/2024/01/0003 - UD. Granite Sejahtera</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receivedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="receivedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received By</FormLabel>
              <FormControl>
                <Input placeholder="Enter receiver name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warehouseLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A-1-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Dimensions and Area */}
      <Card>
        <CardHeader>
          <CardTitle>Actual Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="actualDimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualDimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualDimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualDimensions.unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="actualArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Area (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.001"
                    {...field}
                    disabled
                    className="bg-muted font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* SKU Toggle */}
      <Card>
        <CardContent className="p-6">
          <FormField
            control={form.control}
            name="hasSKU"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Has SKU</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Does this item already have an SKU assigned?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Received Line Items</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addLineItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No line items added yet. Click "Add Item" to start.
                </div>
              ) : (
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Product</label>
                          <Select 
                            value={item.productId} 
                            onValueChange={(value) => {
                              updateLineItem(index, 'productId', value)
                              const productMap: Record<string, string> = {
                                'prod-001': 'Marble Slab - Carrara White',
                                'prod-002': 'Granite Tile - Black Galaxy',
                                'prod-003': 'Travertine - Beige Classic'
                              }
                              updateLineItem(index, 'productName', productMap[value] || '')
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prod-001">Marble Slab - Carrara White</SelectItem>
                              <SelectItem value="prod-002">Granite Tile - Black Galaxy</SelectItem>
                              <SelectItem value="prod-003">Travertine - Beige Classic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Expected Qty</label>
                          <Input
                            type="number"
                            value={item.expectedQuantity}
                            onChange={(e) => updateLineItem(index, 'expectedQuantity', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Received Qty</label>
                          <Input
                            type="number"
                            value={item.receivedQuantity}
                            onChange={(e) => updateLineItem(index, 'receivedQuantity', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Unit</label>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                            placeholder="pcs, m², kg"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Condition</label>
                          <Select 
                            value={item.condition} 
                            onValueChange={(value) => updateLineItem(index, 'condition', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="cracked">Cracked</SelectItem>
                              <SelectItem value="broken">Broken</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="mt-1">
                            <Badge variant={getConditionColor(item.condition)} className="text-xs">
                              {item.condition?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={item.notes}
                            onChange={(e) => updateLineItem(index, 'notes', e.target.value)}
                            placeholder="Additional notes about this item"
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span>Deductions</span>
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addDeduction}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {deductions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No deductions recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {deductions.map((deduction, index) => (
                    <Card key={deduction.id} className="p-4 border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Deduction {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDeduction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select 
                            value={deduction.type} 
                            onValueChange={(value) => updateDeduction(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cracked">Cracked</SelectItem>
                              <SelectItem value="broken">Broken</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="missing">Missing</SelectItem>
                              <SelectItem value="quality">Quality Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Quantity</label>
                          <Input
                            type="number"
                            value={deduction.quantity}
                            onChange={(e) => updateDeduction(index, 'quantity', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Affected Area (m²)</label>
                          <Input
                            type="number"
                            step="0.001"
                            value={deduction.affectedArea}
                            onChange={(e) => updateDeduction(index, 'affectedArea', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Estimated Value</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={deduction.estimatedValue}
                            onChange={(e) => updateDeduction(index, 'estimatedValue', Number(e.target.value))}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={deduction.description}
                            onChange={(e) => updateDeduction(index, 'description', e.target.value)}
                            placeholder="Describe the issue"
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Complaints</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addComplaint}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  File Complaint
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No complaints filed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint, index) => (
                    <Card key={complaint.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Complaint {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComplaint(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select 
                            value={complaint.type} 
                            onValueChange={(value) => updateComplaint(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quality">Quality</SelectItem>
                              <SelectItem value="damage">Damage</SelectItem>
                              <SelectItem value="shortage">Shortage</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item</SelectItem>
                              <SelectItem value="late_delivery">Late Delivery</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select 
                            value={complaint.priority} 
                            onValueChange={(value) => updateComplaint(index, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <Select 
                            value={complaint.status} 
                            onValueChange={(value) => updateComplaint(index, 'status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={complaint.description}
                            onChange={(e) => updateComplaint(index, 'description', e.target.value)}
                            placeholder="Describe the complaint"
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-sm font-medium">Expected Resolution</label>
                          <Textarea
                            value={complaint.expectedResolution}
                            onChange={(e) => updateComplaint(index, 'expectedResolution', e.target.value)}
                            placeholder="What resolution do you expect?"
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Receipt ${index + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach((file, index) => {
                      addPhoto(`https://via.placeholder.com/200x200?text=Receipt+${photos.length + index + 1}`)
                    })
                    e.target.value = ''
                  }}
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="qrCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>QR Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Auto-generated QR code"
                    {...field}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    QR Code: {field.value || 'Will be generated'}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Inspection Notes */}
      <FormField
        control={form.control}
        name="inspectionNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inspection Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Quality inspection notes, observations, etc."
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* General Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional notes or comments"
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}