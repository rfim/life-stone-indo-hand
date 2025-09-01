import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, FileText } from 'lucide-react'
import { PurchaseRequestFormData } from './schema'

interface PurchaseRequestFieldsProps {
  form: UseFormReturn<PurchaseRequestFormData>
  isEdit?: boolean
}

export function PurchaseRequestFields({ form, isEdit = false }: PurchaseRequestFieldsProps) {
  const [suppliers, setSuppliers] = React.useState<any[]>([])

  // Initialize suppliers from form when component mounts
  React.useEffect(() => {
    const currentSuppliers = form.watch('suppliers') || []
    setSuppliers(currentSuppliers)
  }, [])

  const addSupplier = () => {
    const newSupplier = {
      supplierId: '',
      supplierName: '',
      price: 0,
      currency: 'IDR',
      leadTime: 7,
      terms: '',
      notes: '',
      quotationFile: ''
    }
    const updatedSuppliers = [...suppliers, newSupplier]
    setSuppliers(updatedSuppliers)
    form.setValue('suppliers', updatedSuppliers)
  }

  const removeSupplier = (index: number) => {
    const updatedSuppliers = suppliers.filter((_, i) => i !== index)
    setSuppliers(updatedSuppliers)
    form.setValue('suppliers', updatedSuppliers)
  }

  const updateSupplier = (index: number, field: string, value: any) => {
    const updatedSuppliers = [...suppliers]
    updatedSuppliers[index] = { ...updatedSuppliers[index], [field]: value }
    setSuppliers(updatedSuppliers)
    form.setValue('suppliers', updatedSuppliers)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending_approval': return 'secondary'
      case 'rejected': return 'destructive'
      case 'draft': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="requestNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Number</FormLabel>
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
                {isEdit && field.value === 'pending_approval' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => form.setValue('status', 'approved')}
                      className="h-6"
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => form.setValue('status', 'rejected')}
                      className="h-6"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="prod-001">Marble Slab - Carrara White</SelectItem>
                  <SelectItem value="prod-002">Granite Tile - Black Galaxy</SelectItem>
                  <SelectItem value="prod-003">Travertine - Beige Classic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter quantity" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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
                placeholder="Enter detailed description of the requested items"
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Request Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="requestedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested By</FormLabel>
              <FormControl>
                <Input placeholder="Enter requester name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="urgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-1">
                <Badge variant={getUrgencyColor(field.value)} className="text-xs">
                  {field.value?.toUpperCase()}
                </Badge>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="expectedDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expected Date</FormLabel>
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

      {/* Supplier Comparison Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Comparison</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addSupplier}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suppliers added yet. Click "Add Supplier" to start comparing quotes.
            </div>
          ) : (
            <div className="space-y-4">
              {suppliers.map((supplier, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Supplier {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSupplier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Supplier</label>
                      <Select 
                        value={supplier.supplierId} 
                        onValueChange={(value) => {
                          updateSupplier(index, 'supplierId', value)
                          // In real app, fetch supplier name
                          updateSupplier(index, 'supplierName', `Supplier ${value}`)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sup-001">PT. Stone Indonesia</SelectItem>
                          <SelectItem value="sup-002">CV. Marble Jaya</SelectItem>
                          <SelectItem value="sup-003">UD. Granite Sejahtera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Price</label>
                      <Input
                        type="number"
                        value={supplier.price}
                        onChange={(e) => updateSupplier(index, 'price', Number(e.target.value))}
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <Select 
                        value={supplier.currency} 
                        onValueChange={(value) => updateSupplier(index, 'currency', value)}
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

                    <div>
                      <label className="text-sm font-medium">Lead Time (days)</label>
                      <Input
                        type="number"
                        value={supplier.leadTime}
                        onChange={(e) => updateSupplier(index, 'leadTime', Number(e.target.value))}
                        placeholder="Lead time"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Terms</label>
                      <Input
                        value={supplier.terms}
                        onChange={(e) => updateSupplier(index, 'terms', e.target.value)}
                        placeholder="Payment terms, conditions, etc."
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        value={supplier.notes}
                        onChange={(e) => updateSupplier(index, 'notes', e.target.value)}
                        placeholder="Additional notes"
                        className="min-h-[60px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Quotation File</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => {
                            // In real app, upload file and get URL
                            updateSupplier(index, 'quotationFile', e.target.files?.[0]?.name || '')
                          }}
                        />
                        {supplier.quotationFile && (
                          <Button type="button" variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Supplier */}
      {suppliers.length > 0 && (
        <FormField
          control={form.control}
          name="selectedSupplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selected Supplier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier, index) => (
                    <SelectItem key={index} value={supplier.supplierId}>
                      {supplier.supplierName} - {supplier.currency} {supplier.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Rejection Reason */}
      {form.watch('status') === 'rejected' && (
        <FormField
          control={form.control}
          name="rejectedReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rejection Reason</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter reason for rejection"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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