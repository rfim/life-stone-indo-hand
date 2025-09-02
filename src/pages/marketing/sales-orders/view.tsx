import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useSalesOrdersApi, whatsappService, generateQRPayload, generatePDF } from '@/lib/api/marketing'
import { formatDate } from '@/lib/utils'
import { SOStatus } from '@/types/marketing'
import {
  ArrowLeft, Edit, Send, Loader2, FileText, QrCode, CheckCircle, XCircle, Clock,
  Package, DollarSign, Calendar, User, AlertTriangle
} from 'lucide-react'

const getStatusIcon = (status: SOStatus) => {
  switch (status) {
    case 'Draft': return <Clock className="h-4 w-4" />
    case 'Submitted': return <AlertTriangle className="h-4 w-4" />
    case 'DirectorApproved': return <CheckCircle className="h-4 w-4" />
    case 'DirectorRejected': return <XCircle className="h-4 w-4" />
    case 'Confirmed': return <CheckCircle className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

const getStatusColor = (status: SOStatus) => {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-800'
    case 'Submitted': return 'bg-yellow-100 text-yellow-800'
    case 'DirectorApproved': return 'bg-blue-100 text-blue-800'
    case 'DirectorRejected': return 'bg-red-100 text-red-800'
    case 'Confirmed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function ViewSalesOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: salesOrder, isLoading } = useSalesOrdersApi.useGetById(id!)
  const { mutate: updateSalesOrder } = useSalesOrdersApi.useUpdate()
  
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const calculateLineTotal = (line: any) => {
    const subtotal = line.qty * line.unitPrice
    let discountAmount = 0
    
    line.discounts?.forEach((discount: any) => {
      if (discount.type === 'percentage') {
        discountAmount += subtotal * (discount.value / 100)
      } else {
        discountAmount += discount.value
      }
    })
    
    return subtotal - discountAmount
  }

  const calculateGrandTotal = () => {
    if (!salesOrder) return 0
    
    const linesTotal = salesOrder.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
    const chargesTotal = salesOrder.additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0
    
    let headerDiscountAmount = 0
    salesOrder.headerDiscounts?.forEach((discount) => {
      if (discount.type === 'percentage') {
        headerDiscountAmount += linesTotal * (discount.value / 100)
      } else {
        headerDiscountAmount += discount.value
      }
    })
    
    return linesTotal + chargesTotal - headerDiscountAmount
  }

  const handleSubmit = async () => {
    if (!salesOrder || salesOrder.status !== 'Draft') return

    setSubmitting(true)
    try {
      // Log quotation price for each line
      // This would normally integrate with price list system
      
      await updateSalesOrder({
        id: salesOrder.id,
        data: { status: 'Submitted' }
      }, {
        onSuccess: () => {
          toast.success('Sales order submitted successfully')
          window.location.reload()
        },
        onError: () => {
          toast.error('Failed to submit sales order')
        }
      })
    } catch (error) {
      toast.error('Failed to submit sales order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!salesOrder || salesOrder.status !== 'Submitted') return

    try {
      await updateSalesOrder({
        id: salesOrder.id,
        data: { 
          status: 'DirectorApproved',
          approvals: [
            ...(salesOrder.approvals || []),
            {
              type: 'DirectorDiscount',
              requestedBy: 'system',
              requestedAt: new Date().toISOString(),
              approvedBy: 'director',
              approvedAt: new Date().toISOString(),
              status: 'Approved',
              reason: 'Director approval for sales order'
            }
          ]
        }
      }, {
        onSuccess: () => {
          toast.success('Sales order approved successfully')
          window.location.reload()
        },
        onError: () => {
          toast.error('Failed to approve sales order')
        }
      })
    } catch (error) {
      toast.error('Failed to approve sales order')
    }
  }

  const handleConfirm = async () => {
    if (!salesOrder || salesOrder.status !== 'DirectorApproved') return

    setConfirming(true)
    try {
      await updateSalesOrder({
        id: salesOrder.id,
        data: { status: 'Confirmed' }
      }, {
        onSuccess: () => {
          toast.success('Sales order confirmed successfully. Finance has been notified.')
          window.location.reload()
        },
        onError: () => {
          toast.error('Failed to confirm sales order')
        }
      })
    } catch (error) {
      toast.error('Failed to confirm sales order')
    } finally {
      setConfirming(false)
    }
  }

  const sendWhatsAppMessage = async () => {
    if (!salesOrder) return

    setSendingWhatsApp(true)
    try {
      const result = await whatsappService.sendMessage({
        template: 'SalesOrder',
        to: `customer_${salesOrder.customerId}`,
        variables: {
          client_name: salesOrder.customerId,
          so_number: salesOrder.code,
          total_amount: calculateGrandTotal().toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
          due_date: new Date(Date.now() + salesOrder.top * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: salesOrder.status
        },
        attachments: [{
          filename: `sales_order_${salesOrder.code}.pdf`,
          url: `/api/pdf/sales-orders/${salesOrder.id}.pdf`,
          type: 'application/pdf'
        }]
      })

      if (result.success) {
        toast.success(`WhatsApp message sent successfully (ID: ${result.messageId})`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message')
    } finally {
      setSendingWhatsApp(false)
    }
  }

  const generateSOPDF = async () => {
    if (!salesOrder) return

    setGeneratingPDF(true)
    try {
      const qrPayload = generateQRPayload('SO', salesOrder)
      const pdfUrl = await generatePDF('SO', salesOrder)
      
      // Update SO with QR payload and PDF URL
      await updateSalesOrder({
        id: salesOrder.id,
        data: { qrPayload, printUrl: pdfUrl }
      }, {
        onSuccess: () => {
          toast.success('PDF generated successfully')
          window.open(pdfUrl, '_blank')
        },
        onError: () => {
          toast.error('Failed to generate PDF')
        }
      })
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const canSubmit = salesOrder?.status === 'Draft'
  const canApprove = salesOrder?.status === 'Submitted'
  const canConfirm = salesOrder?.status === 'DirectorApproved'
  const canCreateDO = salesOrder?.status === 'Confirmed'

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!salesOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sales Order Not Found</h2>
          <p className="text-gray-600 mb-4">The requested sales order could not be found.</p>
          <Button onClick={() => navigate('/marketing/sales-orders')}>
            Back to Sales Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketing/sales-orders')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sales Order {salesOrder.code}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getStatusColor(salesOrder.status)} flex items-center`}>
                {getStatusIcon(salesOrder.status)}
                <span className="ml-1">{salesOrder.status}</span>
              </Badge>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{formatDate(salesOrder.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={sendWhatsAppMessage}
            disabled={sendingWhatsApp}
          >
            {sendingWhatsApp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send WhatsApp
          </Button>
          
          <Button
            variant="outline"
            onClick={generateSOPDF}
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate PDF
          </Button>

          {canCreateDO && (
            <Button
              onClick={() => navigate(`/marketing/delivery-orders/create?soId=${salesOrder.id}`)}
            >
              <Package className="h-4 w-4 mr-2" />
              Create Delivery Order
            </Button>
          )}

          <Button onClick={() => navigate(`/marketing/sales-orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-lg font-semibold">{salesOrder.customerId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Project</label>
                <p className="text-lg">
                  {salesOrder.projectId ? (
                    <Badge variant="secondary">{salesOrder.projectId}</Badge>
                  ) : (
                    <span className="text-gray-400">No project</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Terms of Payment</label>
                <p className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {salesOrder.top} days
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tax Type</label>
                <p className="text-lg">
                  <Badge variant={salesOrder.isPPN ? "default" : "outline"}>
                    {salesOrder.isPPN ? "PPN/VAT" : "Non-PPN"}
                  </Badge>
                </p>
              </div>
            </div>

            {salesOrder.meetingMinuteId && (
              <div>
                <label className="text-sm font-medium text-gray-500">Meeting Minutes</label>
                <p className="text-lg">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => navigate(`/marketing/meeting-minutes/${salesOrder.meetingMinuteId}/view`)}
                  >
                    {salesOrder.meetingMinuteId}
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Line Items ({salesOrder.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesOrder.lines.map((line, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Product</label>
                      <p className="font-semibold">{line.productId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantity</label>
                      <p>{line.qty} {line.uom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Unit Price</label>
                      <p>{line.unitPrice.toLocaleString('id-ID', { style: 'currency', currency: line.currency || 'IDR' })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tax</label>
                      <p>
                        <Badge variant="outline">{line.taxType}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Discounts</label>
                      <div className="flex flex-wrap gap-1">
                        {line.discounts?.map((discount, discountIndex) => (
                          <Badge key={discountIndex} variant="secondary" className="text-xs">
                            {discount.type === 'percentage' ? `${discount.value}%` : discount.value}
                          </Badge>
                        ))}
                        {(!line.discounts || line.discounts.length === 0) && (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Line Total</label>
                      <p className="font-semibold">
                        {calculateLineTotal(line).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {(salesOrder.additionalCharges && salesOrder.additionalCharges.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salesOrder.additionalCharges.map((charge, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{charge.description}</span>
                      <Badge variant="outline" className="ml-2">{charge.taxType}</Badge>
                    </div>
                    <span className="font-semibold">
                      {charge.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(salesOrder.headerDiscounts && salesOrder.headerDiscounts.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Header Discounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salesOrder.headerDiscounts.map((discount, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">
                        {discount.type === 'percentage' ? `${discount.value}%` : discount.value} Discount
                      </span>
                      {discount.reason && <span className="text-sm text-gray-500 ml-2">- {discount.reason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Order Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-right">
              <div className="text-3xl font-bold">
                {calculateGrandTotal().toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </div>
              <div className="text-sm text-gray-500">
                {salesOrder.isPPN ? 'Including PPN/VAT' : 'Excluding VAT'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {canSubmit && (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit for Approval
                </Button>
              )}
              
              {canApprove && (
                <Button onClick={handleApprove} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve (Director)
                </Button>
              )}
              
              {canConfirm && (
                <Button onClick={handleConfirm} disabled={confirming}>
                  {confirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {salesOrder.approvals && salesOrder.approvals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesOrder.approvals.map((approval, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{approval.type}</div>
                        <div className="text-sm text-gray-600">
                          Requested by {approval.requestedBy} on {formatDate(approval.requestedAt)}
                        </div>
                        {approval.approvedBy && (
                          <div className="text-sm text-gray-600">
                            {approval.status} by {approval.approvedBy} on {formatDate(approval.approvedAt!)}
                          </div>
                        )}
                        {approval.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            Reason: {approval.reason}
                          </div>
                        )}
                      </div>
                      <Badge variant={
                        approval.status === 'Approved' ? 'default' :
                        approval.status === 'Rejected' ? 'destructive' : 'secondary'
                      }>
                        {approval.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}