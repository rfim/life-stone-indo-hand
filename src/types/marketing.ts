import { BaseEntity } from '@/lib/db/connection'

// Status types
export type DOStatus = 'Draft' | 'Issued' | 'InTransit' | 'Delivered' | 'Closed' | 'Canceled'
export type ColdCallStatus = 'Planned' | 'Visited' | 'NoShow' | 'Converted' | 'Dropped'
export type SOStatus = 'Draft' | 'Submitted' | 'DirectorApproved' | 'DirectorRejected' | 'Confirmed'
export type ContractStatus = 'Draft' | 'Active' | 'Archived'
export type CommissionCalc = 'PCT_OF_NET_MARGIN' | 'PCT_OF_GROSS' | 'FIXED_PER_UNIT'
export type CommissionTrigger = 'ON_SO_CONFIRMED' | 'ON_INVOICE_PAID' | 'ON_DELIVERY'
export type CommissionEntryStatus = 'Accrued' | 'Payable' | 'Paid'

// Settings
export interface MarketingSettings extends BaseEntity {
  staggerDefaultPeriod: number // days
  externalExpeditionPolicy: {
    whoCanAssignCarrier: 'MarketingLead' | 'Logistics'
    costBookedTo: 'SO_CHARGE' | 'LOGISTICS_EXPENSE'
    visibility: string[] // roles that can see costs
  }
  tax: {
    isPPNEnabled: boolean
    defaultPPNRate: number
    defaultNonPPNRate: number
  }
  whatsappConfig: {
    provider: string
    apiKey?: string
    templates: {
      meetingMinutes: string
      salesOrder: string
      contract: string
      deliveryOrder: string
    }
  }
}

// Stagger items for loans
export interface StaggerItem {
  soLineId: string
  qty: number
  uom: string
  dueDate: string
  sikId?: string
  returnedQty?: number
}

// Delivery Order
export interface DeliveryOrder extends BaseEntity {
  code: string
  soId: string
  customerId: string
  lines: Array<{
    soLineId: string
    qty: number
    uom: string
    isStagger?: boolean
    stagger?: StaggerItem
  }>
  externalExpedition?: {
    enabled: boolean
    carrier?: string
    assignedBy?: string
    trackingNo?: string
    cost?: number
    costBookedTo: 'SO_CHARGE' | 'LOGISTICS_EXPENSE'
  }
  status: DOStatus
  qrPayload?: string
  printUrl?: string
  issuedAt?: string
  deliveredAt?: string
}

// Cold Calls
export interface ColdCall extends BaseEntity {
  customerId: string
  ownerId: string // salesperson
  scheduledAt: string
  status: ColdCallStatus
  meetingMinuteId?: string
  notes?: string
  followUpDate?: string
}

// Meeting Minutes / Notulen
export interface MeetingMinutes extends BaseEntity {
  customerId: string
  projectId?: string
  coldCallId?: string
  attendees: string[]
  notes: string
  productsDiscussed: string[]
  followUps: string[]
  nextMeetingDate?: string
  clonedFrom?: string
  attachments?: string[]
}

// Project
export interface Project extends BaseEntity {
  customerId: string
  name: string
  source: 'ColdCall' | 'SO' | 'Manual'
  description?: string
  status?: string
}

// Sales Order
export interface SalesOrder extends BaseEntity {
  code: string
  customerId: string
  projectId?: string
  meetingMinuteId?: string
  status: SOStatus
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
  top: number // terms of payment in days
  isPPN: boolean
  approvals: Array<{
    type: 'DirectorDiscount' | 'General'
    requestedBy: string
    requestedAt: string
    approvedBy?: string
    approvedAt?: string
    status: 'Pending' | 'Approved' | 'Rejected'
    reason?: string
  }>
  quotationLogRef?: string
  qrPayload?: string
  printUrl?: string
}

// Contract
export interface Contract extends BaseEntity {
  code: string
  soId?: string
  projectId?: string
  parties: Array<{
    name: string
    role: 'Client' | 'Contractor'
    address?: string
    contactPerson?: string
  }>
  scope: string
  paymentTerms: {
    top: number
    milestones?: Array<{
      description: string
      percentage: number
      dueDate?: string
    }>
  }
  taxType: 'PPN' | 'Non-PPN'
  validity: {
    startDate: string
    endDate: string
  }
  signatures: Array<{
    party: string
    signedBy?: string
    signedAt?: string
  }>
  attachments: string[]
  status: ContractStatus
  qrPayload?: string
  pdfUrl?: string
}

// Price List
export interface PriceList extends BaseEntity {
  name: string
  effectiveFrom: string
  effectiveTo?: string
  items: Array<{
    productId: string
    customerId?: string
    groupId?: string
    regionId?: string
    price: number
    currency: string
    discountTiers?: Array<{
      minQty: number
      discountPercent: number
    }>
    notes?: string
  }>
  isActive: boolean
}

// Commission Rule
export interface CommissionRule extends BaseEntity {
  name: string
  appliesTo: 'TEAM' | 'REFERRAL'
  productIds?: string[]
  customerIds?: string[]
  projectType?: string
  calc: CommissionCalc
  rate: number
  fixedAmount?: number // if FIXED_PER_UNIT
  trigger: CommissionTrigger
  split?: Array<{
    role: 'Sales' | 'SalesLead' | 'Architect'
    pct: number
  }>
  active: boolean
}

// Commission Entry
export interface CommissionEntry extends BaseEntity {
  ruleId: string
  soId?: string
  invoiceId?: string
  doId?: string
  payableTo: string // user or vendor ID
  payableType: 'User' | 'Vendor'
  amount: number
  currency: string
  status: CommissionEntryStatus
  calculationDetails: {
    baseAmount: number
    rate?: number
    fixedAmount?: number
    splitDetails?: Array<{
      role: string
      amount: number
    }>
  }
  paidAt?: string
}

// WhatsApp message payload
export interface WhatsAppMessage {
  template: 'MeetingMinutes' | 'SalesOrder' | 'Contract' | 'DeliveryOrder'
  to: string
  variables: Record<string, any>
  attachments?: Array<{
    filename: string
    url: string
    type: string
  }>
}

// Quotation price log for history
export interface QuotationPriceLog extends BaseEntity {
  customerId: string
  productId: string
  soId: string
  unitPrice: number
  currency: string
  quotedAt: string
  quotedBy: string
}