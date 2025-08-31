import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Truck,
  Package,
  Calendar,
  User,
  MapPin,
  FileText,
  Printer,
  Download,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  Clock,
  Building2,
  Hash,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { 
  DeliveryOrder, 
  DeliveryOrderLine
} from '@/lib/api/delivery-orders'

interface DeliveryOrderViewProps {
  deliveryOrder: DeliveryOrder
  onClose: () => void
  onVoid: (id: string, reason: string) => void
  onPrint: (deliveryOrder: DeliveryOrder) => void
}

export function DeliveryOrderView({ deliveryOrder, onClose, onVoid, onPrint }: DeliveryOrderViewProps) {
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  // Status configuration
  const getStatusConfig = (status: DeliveryOrder['status']) => {
    const configs = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: <FileText className="w-4 h-4" />, color: 'text-gray-600' },
      released: { variant: 'default' as const, label: 'Released', icon: <Truck className="w-4 h-4" />, color: 'text-blue-600' },
      invoiced: { variant: 'success' as const, label: 'Invoiced', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
      closed: { variant: 'outline' as const, label: 'Closed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-gray-600' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: 'text-red-600' }
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(deliveryOrder.status)

  // Calculate delivery progress
  const getDeliveryProgress = (line: DeliveryOrderLine) => {
    if (line.orderedQuantity === 0) return 0
    const totalDelivered = line.alreadyDeliveredQuantity + line.quantityToDeliver
    return Math.round((totalDelivered / line.orderedQuantity) * 100)
  }

  const getOverallProgress = () => {
    if (deliveryOrder.lines.length === 0) return 0
    const totalOrdered = deliveryOrder.lines.reduce((sum, line) => sum + line.orderedQuantity, 0)
    const totalDelivered = deliveryOrder.lines.reduce((sum, line) => sum + line.alreadyDeliveredQuantity + line.quantityToDeliver, 0)
    return totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0
  }

  const handleVoid = () => {
    if (voidReason.trim()) {
      onVoid(deliveryOrder.id, voidReason)
      setVoidDialogOpen(false)
      setVoidReason('')
    }
  }

  const canVoid = deliveryOrder.isVoidable && deliveryOrder.status !== 'cancelled' && deliveryOrder.status !== 'closed'

  return (
    <div className="space-y-6 max-h-[80vh] overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{deliveryOrder.deliveryOrderNumber}</h2>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(deliveryOrder.deliveryDate), 'dd MMM yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Created {format(new Date(deliveryOrder.createdAt), 'dd MMM yyyy HH:mm')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onPrint(deliveryOrder)}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          {canVoid && (
            <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Void
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Void Delivery Order</DialogTitle>
                  <DialogDescription>
                    This action will cancel the delivery order and reverse all stock movements. 
                    This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="void-reason">Reason for voiding *</Label>
                    <Textarea
                      id="void-reason"
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      placeholder="Enter the reason for voiding this delivery order..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleVoid}
                    disabled={!voidReason.trim()}
                  >
                    Void Delivery Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Void Information */}
      {deliveryOrder.status === 'cancelled' && deliveryOrder.voidReason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">This delivery order has been voided</div>
              <div className="text-sm">
                Reason: {deliveryOrder.voidReason}
              </div>
              {deliveryOrder.voidedAt && (
                <div className="text-sm">
                  Voided on: {format(new Date(deliveryOrder.voidedAt), 'dd MMM yyyy HH:mm')}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Items</div>
                <div className="text-xl font-bold">{deliveryOrder.lines.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Qty</div>
                <div className="text-xl font-bold">{deliveryOrder.totalQuantity}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-xl font-bold">{getOverallProgress()}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-lg font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(deliveryOrder.totalAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">DO Number</Label>
                <div className="font-medium">{deliveryOrder.deliveryOrderNumber}</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Delivery Date</Label>
                <div className="font-medium">
                  {format(new Date(deliveryOrder.deliveryDate), 'dd MMM yyyy')}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Sales Order</Label>
              <div className="font-medium">{deliveryOrder.salesOrderId}</div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Expedition</Label>
              <div className="font-medium">{deliveryOrder.expeditionId}</div>
            </div>

            {deliveryOrder.notes && (
              <div>
                <Label className="text-sm text-muted-foreground">Notes</Label>
                <div className="text-sm p-3 bg-muted rounded-md">
                  {deliveryOrder.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Customer Name</Label>
              <div className="font-medium">{deliveryOrder.customerName}</div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Customer ID</Label>
              <div className="font-medium text-muted-foreground">{deliveryOrder.customerId}</div>
            </div>

            {/* Status and Progress */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Delivery Progress</Label>
              <div className="space-y-2">
                <Progress value={getOverallProgress()} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {getOverallProgress()}% of ordered items will be delivered
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Delivery Items
          </CardTitle>
          <CardDescription>
            Items to be delivered with quantities and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveryOrder.lines.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No items to deliver.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Ordered</TableHead>
                    <TableHead className="text-center">Delivered</TableHead>
                    <TableHead className="text-center">To Deliver</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryOrder.lines.map((line, index) => {
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
                            <div className="text-xs text-muted-foreground">
                              Unit: {line.unitOfMeasure}
                            </div>
                          </div>
                        </TableCell>

                        {/* Ordered Quantity */}
                        <TableCell className="text-center">
                          <div className="font-medium">{line.orderedQuantity}</div>
                        </TableCell>

                        {/* Already Delivered */}
                        <TableCell className="text-center">
                          <div>{line.alreadyDeliveredQuantity}</div>
                        </TableCell>

                        {/* Quantity to Deliver */}
                        <TableCell className="text-center">
                          <div className="font-medium text-primary">
                            {line.quantityToDeliver}
                          </div>
                        </TableCell>

                        {/* Warehouse */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{line.warehouseId}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {line.stockAvailable}
                          </div>
                        </TableCell>

                        {/* Progress */}
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2 w-16 mx-auto" />
                            <div className="text-xs text-muted-foreground">
                              {progress}%
                            </div>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR'
                            }).format(line.totalAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @ {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR'
                            }).format(line.pricePerUnit)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Summary Row */}
              <div className="border-t bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Total Items: {deliveryOrder.lines.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Quantity: {deliveryOrder.totalQuantity}
                    </div>
                  </div>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(deliveryOrder.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Audit Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <div>{format(new Date(deliveryOrder.createdAt), 'dd MMM yyyy HH:mm:ss')}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Created By</Label>
              <div>{deliveryOrder.createdBy || 'System'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <div>{format(new Date(deliveryOrder.updatedAt), 'dd MMM yyyy HH:mm:ss')}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated By</Label>
              <div>{deliveryOrder.updatedBy || 'System'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}