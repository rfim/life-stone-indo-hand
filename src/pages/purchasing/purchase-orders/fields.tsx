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
import { Plus, Trash2, Upload, X, FileText, AlertTriangle } from 'lucide-react'
import { PurchaseOrderFormData } from './schema'

interface PurchaseOrderFieldsProps {
  form: UseFormReturn<PurchaseOrderFormData>
  isEdit?: boolean
}

export function PurchaseOrderFields({ form, isEdit = false }: PurchaseOrderFieldsProps) {
  const [lineItems, setLineItems] = useState<any[]>([])
  const [deductions, setDeductions] = useState<any[]>([])
  const [additionalPayments, setAdditionalPayments] = useState<any[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState<string[]>([])
  const [productPhotos, setProductPhotos] = useState<string[]>([])

  // Initialize arrays from form when component mounts
  useEffect(() => {
    const currentLineItems = form.watch('lineItems') || []
    const currentDeductions = form.watch('deductions') || []
    const currentAdditionalPayments = form.watch('additionalPayments') || []
    const currentLoadingPhotos = form.watch('productInfo.loadingPhotos') || []
    const currentProductPhotos = form.watch('productInfo.productPhotos') || []
    
    setLineItems(currentLineItems)
    setDeductions(currentDeductions)
    setAdditionalPayments(currentAdditionalPayments)
    setLoadingPhotos(currentLoadingPhotos)
    setProductPhotos(currentProductPhotos)
  }, [])

  const calculateTotal = () => {
    const itemsTotal = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    const deductionsTotal = deductions.reduce((sum, deduction) => sum + (deduction.amount || 0), 0)
    const additionalTotal = additionalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const paymentInfo = form.watch('paymentInfo')
    
    let total = itemsTotal - deductionsTotal + additionalTotal
    
    // Apply shipping costs and port fees
    if (paymentInfo) {
      total += (paymentInfo.shippingCosts || 0) + (paymentInfo.portFees || 0)
      
      // Apply discount
      if (paymentInfo.discount > 0) {
        if (paymentInfo.discountType === 'percentage') {
          total = total * (1 - paymentInfo.discount / 100)
        } else {
          total = total - paymentInfo.discount
        }
      }
      
      // Apply VAT
      if (paymentInfo.isVAT && paymentInfo.vatPercentage) {
        total = total * (1 + paymentInfo.vatPercentage / 100)
      }
    }
    
    form.setValue('totalAmount', Math.max(0, total))
    return Math.max(0, total)
  }

  // Recalculate total when dependencies change
  useEffect(() => {
    calculateTotal()
  }, [lineItems, deductions, additionalPayments, form.watch('paymentInfo')])

  const addLineItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: ''
    }
    const updated = [...lineItems, newItem]
    setLineItems(updated)
    form.setValue('lineItems', updated)
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice
    }
    
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
      amount: 0,
      photos: []
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

  const addAdditionalPayment = () => {
    const newPayment = {
      id: crypto.randomUUID(),
      description: '',
      amount: 0,
      currency: form.watch('currency') || 'IDR',
      type: 'other',
      invoiceNumber: '',
      notes: ''
    }
    const updated = [...additionalPayments, newPayment]
    setAdditionalPayments(updated)
    form.setValue('additionalPayments', updated)
  }

  const updateAdditionalPayment = (index: number, field: string, value: any) => {
    const updated = [...additionalPayments]
    updated[index] = { ...updated[index], [field]: value }
    setAdditionalPayments(updated)
    form.setValue('additionalPayments', updated)
  }

  const removeAdditionalPayment = (index: number) => {
    const updated = additionalPayments.filter((_, i) => i !== index)
    setAdditionalPayments(updated)
    form.setValue('additionalPayments', updated)
  }

  const addPhoto = (type: 'loading' | 'product', photoUrl: string) => {
    if (type === 'loading') {
      const updated = [...loadingPhotos, photoUrl]
      setLoadingPhotos(updated)
      form.setValue('productInfo.loadingPhotos', updated)
    } else {
      const updated = [...productPhotos, photoUrl]
      setProductPhotos(updated)
      form.setValue('productInfo.productPhotos', updated)
    }
  }

  const removePhoto = (type: 'loading' | 'product', index: number) => {
    if (type === 'loading') {
      const updated = loadingPhotos.filter((_, i) => i !== index)
      setLoadingPhotos(updated)
      form.setValue('productInfo.loadingPhotos', updated)
    } else {
      const updated = productPhotos.filter((_, i) => i !== index)
      setProductPhotos(updated)
      form.setValue('productInfo.productPhotos', updated)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'sent': return 'secondary'
      case 'confirmed': return 'default'
      case 'shipped': return 'default'
      case 'received': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="orderNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Number</FormLabel>
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
                <Badge variant={getStatusColor(field.value)}>
                  {field.value?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Supplier and Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                // Auto-populate supplier name
                const supplierMap: Record<string, string> = {
                  'sup-001': 'PT. Stone Indonesia',
                  'sup-002': 'CV. Marble Jaya',
                  'sup-003': 'UD. Granite Sejahtera'
                }
                form.setValue('supplierName', supplierMap[value] || '')
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sup-001">PT. Stone Indonesia</SelectItem>
                  <SelectItem value="sup-002">CV. Marble Jaya</SelectItem>
                  <SelectItem value="sup-003">UD. Granite Sejahtera</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="orderDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Date</FormLabel>
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

        <FormField
          control={form.control}
          name="expectedDeliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Delivery Date</FormLabel>
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

      {/* Tabbed Content */}
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payment">Payment Info</TabsTrigger>
          <TabsTrigger value="product">Product Info</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentInfo.termsOfPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms of Payment</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Net 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentInfo.leadTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                  name="paymentInfo.shippingCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Costs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="paymentInfo.portFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Fees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="paymentInfo.discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="paymentInfo.discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="paymentInfo.isVAT"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>VAT</FormLabel>
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

                  {form.watch('paymentInfo.isVAT') && (
                    <FormField
                      control={form.control}
                      name="paymentInfo.vatPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="11"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="productInfo.packingList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packing List</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed packing list"
                        className="min-h-[80px]"
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
                  name="productInfo.volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (m³)</FormLabel>
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
                  name="productInfo.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
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
              </div>

              {/* Dimensions */}
              <div>
                <label className="text-sm font-medium">Dimensions</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="productInfo.dimensions.length"
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
                    name="productInfo.dimensions.width"
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
                    name="productInfo.dimensions.height"
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
                    name="productInfo.dimensions.unit"
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
              </div>

              {/* Photo Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loading Photos */}
                <div>
                  <label className="text-sm font-medium">Loading Photos</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {loadingPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={photo} 
                            alt={`Loading ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removePhoto('loading', index)}
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
                            addPhoto('loading', `https://via.placeholder.com/200x200?text=Loading+${loadingPhotos.length + index + 1}`)
                          })
                          e.target.value = ''
                        }}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Photos */}
                <div>
                  <label className="text-sm font-medium">Product Photos</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {productPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={photo} 
                            alt={`Product ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removePhoto('product', index)}
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
                            addPhoto('product', `https://via.placeholder.com/200x200?text=Product+${productPhotos.length + index + 1}`)
                          })
                          e.target.value = ''
                        }}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
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
                          <label className="text-sm font-medium">Quantity</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Unit Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Total Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.totalPrice}
                            disabled
                            className="bg-muted"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Additional details"
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
                <CardTitle>Supplier Deductions</CardTitle>
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
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <h4 className="font-medium">Deduction {index + 1}</h4>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDeduction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              <SelectItem value="quality">Quality Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Input
                            value={deduction.description}
                            onChange={(e) => updateDeduction(index, 'description', e.target.value)}
                            placeholder="Describe the issue"
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

        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Additional Payments</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addAdditionalPayment}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {additionalPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No additional payments recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {additionalPayments.map((payment, index) => (
                    <Card key={payment.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Payment {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalPayment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select 
                            value={payment.type} 
                            onValueChange={(value) => updateAdditionalPayment(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shipping">Shipping</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="customs">Customs</SelectItem>
                              <SelectItem value="handling">Handling</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => updateAdditionalPayment(index, 'amount', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Currency</label>
                          <Select 
                            value={payment.currency} 
                            onValueChange={(value) => updateAdditionalPayment(index, 'currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IDR">IDR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Description</label>
                          <Input
                            value={payment.description}
                            onChange={(e) => updateAdditionalPayment(index, 'description', e.target.value)}
                            placeholder="Describe the payment"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Invoice Number</label>
                          <Input
                            value={payment.invoiceNumber}
                            onChange={(e) => updateAdditionalPayment(index, 'invoiceNumber', e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={payment.notes}
                          onChange={(e) => updateAdditionalPayment(index, 'notes', e.target.value)}
                          placeholder="Additional notes"
                          className="min-h-[60px]"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Total Amount Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Total Amount</div>
            <div className="text-2xl font-bold">
              {form.watch('currency')} {calculateTotal().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
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