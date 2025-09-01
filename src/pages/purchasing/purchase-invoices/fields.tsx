import React, { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Building, Mail, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { PurchaseInvoiceFormData } from './schema'

interface PurchaseInvoiceFieldsProps {
  form: UseFormReturn<PurchaseInvoiceFormData>
  isEdit?: boolean
}

export function PurchaseInvoiceFields({ form, isEdit = false }: PurchaseInvoiceFieldsProps) {
  
  // Auto-calculate total amount when amount or tax changes
  useEffect(() => {
    const amount = form.watch('amount') || 0
    const taxAmount = form.watch('taxAmount') || 0
    const total = amount + taxAmount
    form.setValue('totalAmount', total)
  }, [form.watch('amount'), form.watch('taxAmount')])

  // Auto-generate QR code when invoice number changes
  useEffect(() => {
    const invoiceNumber = form.watch('invoiceNumber')
    if (invoiceNumber && !form.watch('qrCode')) {
      const qrCode = `QR_${invoiceNumber}_${Date.now()}`
      form.setValue('qrCode', qrCode)
    }
  }, [form.watch('invoiceNumber')])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'paid': return 'default'
      case 'overdue': return 'destructive'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'paid': return CheckCircle
      case 'overdue': return AlertTriangle
      case 'cancelled': return AlertTriangle
      default: return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getStatusColor(field.value)}>
                  {React.createElement(getStatusIcon(field.value), { className: "h-3 w-3 mr-1" })}
                  {field.value?.toUpperCase()}
                </Badge>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Supplier Information */}
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
          name="purchaseOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="po-001">PO/2024/01/0001</SelectItem>
                  <SelectItem value="po-002">PO/2024/01/0002</SelectItem>
                  <SelectItem value="po-003">PO/2024/01/0003</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="invoiceDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Date</FormLabel>
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
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
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

      {/* Amount Information */}
      <Card>
        <CardHeader>
          <CardTitle>Amount Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
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
              name="taxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
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
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field}
                      disabled
                      className="bg-muted font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {form.watch('status') === 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Payment reference number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Date</FormLabel>
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
          </CardContent>
        </Card>
      )}

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

      {/* Notifications Section */}
      {form.watch('notificationsSent')?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Finance Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {form.watch('notificationsSent').map((notification: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{notification.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        To: {notification.recipient} • {new Date(notification.sentAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                    {notification.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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