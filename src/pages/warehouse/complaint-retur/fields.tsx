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
import { Plus, Trash2, Upload, X, QrCode, MessageSquare, AlertTriangle, Clock, CheckCircle, FileX } from 'lucide-react'
import { ComplaintReturFormData } from './schema'

interface ComplaintReturFieldsProps {
  form: UseFormReturn<ComplaintReturFormData>
  isEdit?: boolean
}

export function ComplaintReturFields({ form, isEdit = false }: ComplaintReturFieldsProps) {
  const [communications, setCommunications] = useState<any[]>([])
  const [attachments, setAttachments] = useState<string[]>([])

  // Initialize arrays from form when component mounts
  useEffect(() => {
    const currentCommunications = form.watch('communications') || []
    const currentAttachments = form.watch('attachments') || []
    
    setCommunications(currentCommunications)
    setAttachments(currentAttachments)
  }, [])

  // Auto-generate QR code when complaint number changes
  useEffect(() => {
    const complaintNumber = form.watch('complaintNumber')
    if (complaintNumber && !form.watch('qrCode')) {
      const qrCode = `QR_COMP_${complaintNumber}_${Date.now()}`
      form.setValue('qrCode', qrCode)
    }
  }, [form.watch('complaintNumber')])

  const addCommunication = () => {
    const newCommunication = {
      id: crypto.randomUUID(),
      type: 'internal_note',
      subject: '',
      message: '',
      sentTo: '',
      sentBy: 'Current User',
      sentAt: new Date().toISOString(),
      attachments: []
    }
    const updated = [...communications, newCommunication]
    setCommunications(updated)
    form.setValue('communications', updated)
  }

  const updateCommunication = (index: number, field: string, value: any) => {
    const updated = [...communications]
    updated[index] = { ...updated[index], [field]: value }
    setCommunications(updated)
    form.setValue('communications', updated)
  }

  const removeCommunication = (index: number) => {
    const updated = communications.filter((_, i) => i !== index)
    setCommunications(updated)
    form.setValue('communications', updated)
  }

  const addAttachment = (attachmentUrl: string) => {
    const updated = [...attachments, attachmentUrl]
    setAttachments(updated)
    form.setValue('attachments', updated)
  }

  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index)
    setAttachments(updated)
    form.setValue('attachments', updated)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'investigating': return 'secondary'
      case 'resolved': return 'default'
      case 'closed': return 'outline'
      default: return 'destructive'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertTriangle
      case 'investigating': return Clock
      case 'resolved': return CheckCircle
      case 'closed': return FileX
      default: return AlertTriangle
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'complaint' ? 'destructive' : 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="complaintNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complaint/Return Number</FormLabel>
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <div className="flex items-center space-x-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getTypeColor(field.value)}>
                  {field.value?.toUpperCase()}
                </Badge>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Source Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="receivedItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received Item</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                // Auto-populate receipt number
                const receiptMap: Record<string, string> = {
                  'rcv-001': 'RCV/2024/01/0001',
                  'rcv-002': 'RCV/2024/01/0002',
                  'rcv-003': 'RCV/2024/01/0003'
                }
                form.setValue('receiptNumber', receiptMap[value] || '')
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select received item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rcv-001">RCV/2024/01/0001 - Marble Slabs</SelectItem>
                  <SelectItem value="rcv-002">RCV/2024/01/0002 - Granite Tiles</SelectItem>
                  <SelectItem value="rcv-003">RCV/2024/01/0003 - Travertine</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                  <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="Shortage">Shortage</SelectItem>
                  <SelectItem value="Late Delivery">Late Delivery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <div className="flex items-center space-x-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getPriorityColor(field.value)}>
                  {field.value?.toUpperCase()}
                </Badge>
              </div>
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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

      {/* Reported Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="reportedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reported By</FormLabel>
              <FormControl>
                <Input placeholder="Enter reporter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reportedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reported Date</FormLabel>
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

      {/* Assignment */}
      {form.watch('status') !== 'open' && (
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <FormControl>
                <Input placeholder="Enter assignee name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Detailed description of the complaint/return"
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Deduction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="deductionAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deduction Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={!form.watch('isEditableDeduction')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isEditableDeduction"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Editable Deduction</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow editing deduction amount
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

            <FormField
              control={form.control}
              name="isFreeSlabExcluded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Exclude Free Slabs</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Exclude free slabs from return processing
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
          </div>
        </CardContent>
      </Card>

      {/* Supplier Information */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierNotified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Supplier Notified</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Has the supplier been notified?
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
          </div>

          {form.watch('supplierNotified') && (
            <FormField
              control={form.control}
              name="supplierResponse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Response</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Supplier's response to the complaint/return"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Resolution */}
      {['resolved', 'closed'].includes(form.watch('status')) && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how the complaint/return was resolved"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolvedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolved Date</FormLabel>
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
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="communications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Communications</span>
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCommunication}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Communication
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No communications recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm, index) => (
                    <Card key={comm.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Communication {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCommunication(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select 
                            value={comm.type} 
                            onValueChange={(value) => updateCommunication(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internal_note">Internal Note</SelectItem>
                              <SelectItem value="supplier_email">Supplier Email</SelectItem>
                              <SelectItem value="customer_call">Customer Call</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            value={comm.subject}
                            onChange={(e) => updateCommunication(index, 'subject', e.target.value)}
                            placeholder="Communication subject"
                          />
                        </div>

                        {comm.type === 'supplier_email' && (
                          <div>
                            <label className="text-sm font-medium">Sent To</label>
                            <Input
                              value={comm.sentTo}
                              onChange={(e) => updateCommunication(index, 'sentTo', e.target.value)}
                              placeholder="recipient@example.com"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Message</label>
                          <Textarea
                            value={comm.message}
                            onChange={(e) => updateCommunication(index, 'message', e.target.value)}
                            placeholder="Communication message"
                            className="min-h-[80px]"
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

        <TabsContent value="attachments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={attachment} 
                      alt={`Attachment ${index + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach((file, index) => {
                      addAttachment(`https://via.placeholder.com/200x200?text=Doc+${attachments.length + index + 1}`)
                    })
                    e.target.value = ''
                  }}
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
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