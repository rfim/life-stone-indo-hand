import { BaseEntity } from '@/lib/db/connection'
import { createEntityService } from './base'

// ===============================
// PURCHASE REQUEST INTERFACES
// ===============================

export interface PurchaseRequest extends BaseEntity {
  requestNumber: string
  quantity: number
  productId: string
  description: string
  requestedBy: string
  department: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  expectedDate: Date
  suppliers: PurchaseRequestSupplier[]
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  selectedSupplierId?: string
  notes?: string
  approvedBy?: string
  approvedAt?: Date
  rejectedReason?: string
}

export interface PurchaseRequestSupplier extends BaseEntity {
  purchaseRequestId: string
  supplierId: string
  supplierName: string
  price: number
  currency: string
  leadTime: number
  terms: string
  notes?: string
  quotationFile?: string
  isSelected: boolean
}

// ===============================
// PURCHASE ORDER INTERFACES
// ===============================

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string
  purchaseRequestId: string
  supplierId: string
  supplierName: string
  orderDate: Date
  expectedDeliveryDate: Date
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  paymentInfo: PaymentInfo
  productInfo: ProductInfo
  lineItems: PurchaseOrderLineItem[]
  deductions: PurchaseOrderDeduction[]
  additionalPayments: AdditionalPayment[]
  totalAmount: number
  currency: string
  notes?: string
  sentAt?: Date
  confirmedAt?: Date
  shippedAt?: Date
  receivedAt?: Date
}

export interface PaymentInfo {
  termsOfPayment: string
  leadTime: number
  shippingCosts: number
  portFees: number
  discount: number
  discountType: 'percentage' | 'fixed'
  isVAT: boolean
  vatPercentage?: number
}

export interface ProductInfo {
  packingList?: string
  loadingPhotos: string[]
  productPhotos: string[]
  totalVolume: number
  totalWeight: number
  dimensions: Dimensions
  packagingType: string
  specialInstructions?: string
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'mm' | 'cm' | 'm'
}

export interface PurchaseOrderLineItem extends BaseEntity {
  purchaseOrderId: string
  productId: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unitOfMeasure: string
  specifications?: string
}

export interface PurchaseOrderDeduction extends BaseEntity {
  purchaseOrderId: string
  type: 'cracked' | 'broken' | 'damaged' | 'missing' | 'other'
  description: string
  quantity: number
  unitPrice: number
  totalDeduction: number
  photos: string[]
  reportedAt: Date
  reportedBy: string
}

export interface AdditionalPayment extends BaseEntity {
  purchaseOrderId: string
  description: string
  amount: number
  currency: string
  type: 'shipping' | 'insurance' | 'customs' | 'handling' | 'other'
  invoiceNumber?: string
  paidAt?: Date
  notes?: string
}

// ===============================
// PURCHASE INVOICE INTERFACES
// ===============================

export interface PurchaseInvoice extends BaseEntity {
  invoiceNumber: string
  purchaseOrderId: string
  supplierId: string
  supplierName: string
  invoiceDate: Date
  dueDate: Date
  amount: number
  currency: string
  taxAmount: number
  totalAmount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  qrCode: string
  paymentReference?: string
  paidAt?: Date
  notes?: string
  notificationsSent: NotificationLog[]
}

export interface NotificationLog extends BaseEntity {
  invoiceId: string
  type: 'email' | 'sms' | 'system'
  recipient: string
  subject: string
  message: string
  sentAt: Date
  status: 'sent' | 'delivered' | 'failed'
}

// ===============================
// SKU MANAGEMENT INTERFACES
// ===============================

export interface SKU extends BaseEntity {
  skuCode: string
  productId: string
  productName: string
  name: string
  description: string
  category: string
  supplier: string
  costPrice: number
  artisticValue: number
  profitMargin: number
  sellingPrice: number
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderLevel: number
  maxStockLevel: number
  qrCode: string
  barcode: string
  images: string[]
  dimensions: Dimensions
  weight: number
  specifications?: Record<string, any>
  isActive: boolean
}

// ===============================
// RECEIVE ITEMS INTERFACES
// ===============================

export interface ReceivedItem extends BaseEntity {
  receiptNumber: string
  purchaseOrderId: string
  purchaseOrderNumber: string
  receivedDate: Date
  receivedBy: string
  warehouseId: string
  warehouseName: string
  lineItems: ReceivedItemLine[]
  actualDimensions: Dimensions
  actualArea: number
  actualWeight: number
  deductions: ItemDeduction[]
  complaints: ItemComplaint[]
  qrCode: string
  photos: string[]
  notes?: string
  status: 'received' | 'inspected' | 'accepted' | 'rejected'
  inspectedBy?: string
  inspectedAt?: Date
}

export interface ReceivedItemLine extends BaseEntity {
  receivedItemId: string
  purchaseOrderLineId: string
  productId: string
  productName: string
  orderedQuantity: number
  receivedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  unitOfMeasure: string
  actualDimensions?: Dimensions
  hasSKU: boolean
  skuId?: string
  notes?: string
}

export interface ItemDeduction extends BaseEntity {
  receivedItemId: string
  type: 'cracked' | 'broken' | 'damaged' | 'scratched' | 'discolored' | 'other'
  description: string
  quantity: number
  percentage: number
  monetaryValue: number
  photos: string[]
  reportedBy: string
  reportedAt: Date
}

export interface ItemComplaint extends BaseEntity {
  receivedItemId: string
  complaintNumber: string
  type: 'quality' | 'quantity' | 'delivery' | 'documentation' | 'other'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  reportedBy: string
  reportedAt: Date
  assignedTo?: string
  resolution?: string
  resolvedAt?: Date
  photos: string[]
}

// ===============================
// COMPLAINT AND RETURN INTERFACES
// ===============================

export interface ComplaintReturn extends BaseEntity {
  complaintNumber: string
  receivedItemId?: string
  purchaseOrderId?: string
  type: 'complaint' | 'return' | 'exchange'
  reason: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reportedBy: string
  reportedAt: Date
  assignedTo?: string
  expectedResolutionDate?: Date
  actualResolutionDate?: Date
  deductionAmount: number
  isEditableDeduction: boolean
  isFreeSlabExcluded: boolean
  qrCode: string
  resolution?: string
  compensationType?: 'refund' | 'replacement' | 'credit' | 'discount'
  compensationAmount?: number
  photos: string[]
  documents: string[]
  communications: ComplaintCommunication[]
}

export interface ComplaintCommunication extends BaseEntity {
  complaintReturnId: string
  type: 'internal_note' | 'supplier_email' | 'customer_call' | 'meeting'
  subject: string
  message: string
  communicatedBy: string
  communicatedAt: Date
  recipient?: string
  attachments: string[]
}

// ===============================
// VALIDATION FUNCTIONS
// ===============================

export const validatePurchaseRequest = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.requestNumber?.trim()) errors.requestNumber = 'Request number is required'
  if (!data.quantity || data.quantity <= 0) errors.quantity = 'Quantity must be greater than 0'
  if (!data.productId?.trim()) errors.productId = 'Product is required'
  if (!data.requestedBy?.trim()) errors.requestedBy = 'Requested by is required'
  if (!data.department?.trim()) errors.department = 'Department is required'
  if (!data.expectedDate) errors.expectedDate = 'Expected date is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validatePurchaseOrder = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.orderNumber?.trim()) errors.orderNumber = 'Order number is required'
  if (!data.purchaseRequestId?.trim()) errors.purchaseRequestId = 'Purchase request is required'
  if (!data.supplierId?.trim()) errors.supplierId = 'Supplier is required'
  if (!data.orderDate) errors.orderDate = 'Order date is required'
  if (!data.expectedDeliveryDate) errors.expectedDeliveryDate = 'Expected delivery date is required'
  if (!data.lineItems || data.lineItems.length === 0) errors.lineItems = 'At least one line item is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validatePurchaseInvoice = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.invoiceNumber?.trim()) errors.invoiceNumber = 'Invoice number is required'
  if (!data.purchaseOrderId?.trim()) errors.purchaseOrderId = 'Purchase order is required'
  if (!data.amount || data.amount <= 0) errors.amount = 'Amount must be greater than 0'
  if (!data.invoiceDate) errors.invoiceDate = 'Invoice date is required'
  if (!data.dueDate) errors.dueDate = 'Due date is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateSKU = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.skuCode?.trim()) errors.skuCode = 'SKU code is required'
  if (!data.productId?.trim()) errors.productId = 'Product is required'
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.costPrice || data.costPrice < 0) errors.costPrice = 'Cost price must be greater than or equal to 0'
  if (!data.profitMargin || data.profitMargin < 0) errors.profitMargin = 'Profit margin must be greater than or equal to 0'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateReceivedItem = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.receiptNumber?.trim()) errors.receiptNumber = 'Receipt number is required'
  if (!data.purchaseOrderId?.trim()) errors.purchaseOrderId = 'Purchase order is required'
  if (!data.receivedDate) errors.receivedDate = 'Received date is required'
  if (!data.receivedBy?.trim()) errors.receivedBy = 'Received by is required'
  if (!data.warehouseId?.trim()) errors.warehouseId = 'Warehouse is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateComplaintReturn = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.complaintNumber?.trim()) errors.complaintNumber = 'Complaint number is required'
  if (!data.type?.trim()) errors.type = 'Type is required'
  if (!data.reason?.trim()) errors.reason = 'Reason is required'
  if (!data.description?.trim()) errors.description = 'Description is required'
  if (!data.reportedBy?.trim()) errors.reportedBy = 'Reported by is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

// ===============================
// API SERVICES
// ===============================

export const purchaseRequestsService = createEntityService<PurchaseRequest>(
  'purchase-requests', 
  ['requestNumber', 'description', 'requestedBy'], 
  validatePurchaseRequest
)

export const purchaseOrdersService = createEntityService<PurchaseOrder>(
  'purchase-orders',
  ['orderNumber', 'supplierName', 'notes'],
  validatePurchaseOrder
)

export const purchaseInvoicesService = createEntityService<PurchaseInvoice>(
  'purchase-invoices',
  ['invoiceNumber', 'supplierName', 'paymentReference'],
  validatePurchaseInvoice
)

export const skuService = createEntityService<SKU>(
  'skus',
  ['skuCode', 'name', 'productName', 'description'],
  validateSKU
)

export const receivedItemsService = createEntityService<ReceivedItem>(
  'received-items',
  ['receiptNumber', 'purchaseOrderNumber', 'receivedBy'],
  validateReceivedItem
)

export const complaintReturnsService = createEntityService<ComplaintReturn>(
  'complaint-returns',
  ['complaintNumber', 'reason', 'description', 'reportedBy'],
  validateComplaintReturn
)