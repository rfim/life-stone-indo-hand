import { BaseEntity } from '@/lib/db/connection'

// User roles for access control
export type UserRole = 'Director' | 'Supervisor' | 'Finance' | 'Admin'

// Approval types
export type ApprovalType = 
  | 'PurchaseRequest'
  | 'ClientDiscount'
  | 'HRGAPayment'
  | 'ShippingCost'
  | 'FinalPayment'
  | 'SocialMediaContent'
  | 'SalesOrder'
  | 'PurchaseOrder'

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

// Content Request types
export interface ContentRequest extends BaseEntity {
  title: string
  description: string
  productDetails: {
    productId: string
    productName: string
    category: string
    specifications?: string
    targetAudience?: string
    brandingGuidelines?: string
  }
  requestedBy: string
  department: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  deadline?: string
  status: 'Draft' | 'Submitted' | 'InProgress' | 'Review' | 'Approved' | 'Published' | 'Rejected'
  assignedTo?: string
  attachments?: string[]
  approvals: ApprovalRecord[]
  deliverables: {
    type: 'SocialMediaPost' | 'Brochure' | 'ProductVideo' | 'WebsiteContent' | 'Advertisement'
    platform?: string
    dimensions?: string
    format?: string
  }[]
}

// Approval workflow interface
export interface ApprovalRecord extends BaseEntity {
  entityType: ApprovalType
  entityId: string
  requestedBy: string
  requestedAt: string
  requiredApprovers: string[]
  currentApprover?: string
  status: ApprovalStatus
  reason?: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  metadata?: Record<string, any>
}

// Financial Health Metrics
export interface FinancialHealthRatio {
  period: '1month' | '6months' | '12months'
  currentRatio: number
  quickRatio: number
  debtToEquityRatio: number
  grossProfitMargin: number
  netProfitMargin: number
  returnOnAssets: number
  returnOnEquity: number
  inventoryTurnover: number
  accountsReceivableTurnover: number
  workingCapitalRatio: number
}

// Dashboard KPIs
export interface DirectorKPIs {
  totalRevenue: { value: number; change: number; period: string }
  netProfit: { value: number; change: number; period: string }
  pendingApprovals: { count: number; urgent: number }
  cashFlow: { value: number; change: number; period: string }
  outstandingAR: { value: number; change: number }
  outstandingAP: { value: number; change: number }
  inventoryValue: { value: number; change: number }
  activeProjects: { count: number; change: number }
}

// Report types
export type ReportType = 
  | 'GeneralLedger'
  | 'ProfitLoss'
  | 'BalanceSheet'
  | 'APAging'
  | 'ARAging'
  | 'DebtCreditCard'
  | 'SalesRevenue'
  | 'SalesPerformance'
  | 'Purchasing'
  | 'Inventory'
  | 'CashFlow'

export interface ReportDefinition {
  type: ReportType
  title: string
  description: string
  parameters: ReportParameter[]
  refreshInterval?: number
  exportFormats: ('CSV' | 'Excel' | 'PDF')[]
}

export interface ReportParameter {
  name: string
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number'
  label: string
  required: boolean
  defaultValue?: any
  options?: { label: string; value: any }[]
}

// Meeting Minutes notification
export interface MeetingMinuteNotification extends BaseEntity {
  meetingMinuteId: string
  daysOverdue: number
  lastNotificationSent?: string
  remindersSent: number
  assignedTo: string[]
  status: 'Active' | 'Resolved' | 'Dismissed'
}

// Dashboard configuration
export interface DashboardConfig extends BaseEntity {
  userId: string
  role: UserRole
  widgetConfig: {
    layout: 'grid' | 'list'
    columns: number
    widgets: DashboardWidget[]
  }
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'approval' | 'notification'
  title: string
  position: { row: number; col: number; width: number; height: number }
  config: Record<string, any>
  visible: boolean
}

// Stock analysis
export interface StockAnalysis {
  fastMovingItems: Array<{
    productId: string
    productName: string
    turnoverRate: number
    currentStock: number
    averageMonthlySales: number
  }>
  slowMovingItems: Array<{
    productId: string
    productName: string
    turnoverRate: number
    currentStock: number
    daysOfStock: number
  }>
  deadStock: Array<{
    productId: string
    productName: string
    currentStock: number
    lastSaleDate?: string
    daysWithoutSale: number
    suggestedAction: 'Discount' | 'Liquidate' | 'Return'
  }>
}

// Project area trends
export interface ProjectAreaTrend {
  area: string
  currentMonth: { revenue: number; projects: number }
  previousMonth: { revenue: number; projects: number }
  growth: { revenue: number; projects: number }
  topProducts: Array<{
    productId: string
    productName: string
    revenue: number
    quantity: number
  }>
}