// Purchasing Dashboard Data Types

export type PRSummary = {
  id: string
  code: string
  requester: string
  suppliers: string[]
  total: number
  currency: 'IDR' | 'USD' | 'EUR'
  neededBy: string
  status: 'Draft' | 'Submitted' | 'DirectorApproved' | 'Rejected'
  createdAt: string
}

export type POSummary = {
  id: string
  code: string
  supplier: string
  status: 'Draft' | 'Sent' | 'Confirmed' | 'InTransit' | 'Delivered' | 'Closed'
  eta?: string
  unpaid: boolean
  top: string
  total: number
  currency: 'IDR' | 'USD' | 'EUR'
}

export type InvoiceSummary = {
  id: string
  code: string
  supplier: string
  dueDate: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Archived'
  total: number
  currency: 'IDR' | 'USD' | 'EUR'
  qrUrl?: string
}

export type GRNSummary = {
  id: string
  code: string
  poCode: string
  receivedAt: string
  defectsPct: number
  itemsCount: number
  hasUnsku: boolean
}

export type SKUGap = {
  id: string
  tempItemName: string
  qty: number
  area: number
  receivedAt: string
  grnId: string
}

export type ComplaintSummary = {
  id: string
  code: string
  supplier: string
  reason: string
  nominal: number
  status: 'Opened' | 'Acknowledged' | 'Resolved' | 'Closed'
  ageDays: number
  isFreeSlab: boolean
}

export type KpiBundle = {
  prAwaiting: { count: number; value: number }
  poUnpaid: { count: number; value: number }
  invoicesDue7: { count: number; value: number }
  shipmentsH3: number
  complaintsOpen: number
  itemsNoSku: number
  leadTimeAvg: number
  onTimePct: number
  defectRatePct: number
}

export type FilterParams = {
  from: string
  to: string
  supplierIds?: string[]
  currency?: 'IDR' | 'USD' | 'EUR'
  q?: string
}

export type ChartData = {
  id: string
  label: string
  value: number
  date?: string
  currency?: string
  supplier?: string
  [key: string]: any
}

export type ExportFormat = 'csv' | 'pdf'

export type DateRange = 'Today' | '7d' | '30d' | 'Quarter' | 'Custom'