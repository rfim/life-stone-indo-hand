// Finance Module Data Types

export type Currency = 'IDR' | 'USD' | 'EUR'

export type CustomerSummary = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  creditLimit?: number
  paymentTerms?: string
  isActive: boolean
}

export type ProjectSummary = {
  id: string
  code: string
  customerId: string
  customerName: string
  name: string
  area: string
  source: string
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  budget?: number
  createdAt: string
}

export type SalesOrderSummary = {
  id: string
  code: string
  customerId: string
  customerName: string
  projectId: string
  projectName: string
  status: 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'DELIVERED' | 'CLOSED'
  currency: Currency
  top: string // Terms of Payment
  isPPN: boolean // VAT included
  total: number
  createdAt: string
}

export type SalesOrderLine = {
  id: string
  soId: string
  productId: string
  productName: string
  qty: number
  uom: string
  unitPrice: number
  discountPct: number
  taxPct: number
  lineTotal: number
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export type SalesInvoiceSummary = {
  id: string
  code: string
  soId?: string
  soCode?: string
  customerId: string
  customerName: string
  projectId?: string
  projectName?: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  currency: Currency
  subtotal: number
  taxAmount: number
  total: number
  paidAmount: number
  remainingAmount: number
  qrPayload?: string
  pdfUrl?: string
  sentAt?: string
  createdAt: string
  agingDays?: number
}

export type InvoiceLine = {
  id: string
  invoiceId: string
  productId: string
  productName: string
  qty: number
  uom: string
  unitPrice: number
  discountPct: number
  taxPct: number
  lineTotal: number
}

export type PaymentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'POSTED'
export type PaymentSourceType = 'PURCHASE_ORDER' | 'INVOICE' | 'REIMBURSEMENT'

export type PaymentRequestSummary = {
  id: string
  sourceType: PaymentSourceType
  sourceId: string
  sourceCode: string
  requestedBy: string
  requestedAt: string
  amount: number
  currency: Currency
  status: PaymentRequestStatus
  note?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

export type PaymentSummary = {
  id: string
  sourceType: PaymentSourceType
  sourceId: string
  sourceCode: string
  requestId?: string
  payeeId?: string
  amount: number
  currency: Currency
  status: PaymentStatus
  description?: string
  approvedBy?: string
  verifiedBy?: string
  paidAt?: string
  proofUrl?: string
  note?: string
  createdAt: string
}

export type PaymentAllocation = {
  id: string
  paymentId: string
  invoiceId: string
  invoiceCode: string
  amountApplied: number
}

export type ReimbursementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'POSTED'
export type ReimbursementCategory = 'FINISHING_CHANGE' | 'TRAVEL' | 'OFFICE_SUPPLIES' | 'ENTERTAINMENT' | 'OTHER'

export type ReimbursementSummary = {
  id: string
  code: string
  requesterId: string
  requesterName: string
  projectId?: string
  projectName?: string
  category: ReimbursementCategory
  amount: number
  currency: Currency
  status: ReimbursementStatus
  description: string
  receiptsCount: number
  createdAt: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  paidAt?: string
  postedAt?: string
  proofUrl?: string
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
export type JournalStatus = 'DRAFT' | 'POSTED'

export type ChartOfAccountSummary = {
  id: string
  code: string
  name: string
  type: AccountType
  isProfitLoss: boolean
  parentId?: string
  parentName?: string
  allowPosting: boolean
  currency: Currency
  isActive: boolean
  balance?: number
  description?: string
  children?: ChartOfAccountSummary[]
}

export type JournalEntrySummary = {
  id: string
  code: string
  memo: string
  status: JournalStatus
  journalDate: string
  totalDebit: number
  totalCredit: number
  totalAmount?: number
  createdBy: string
  createdAt: string
  postedAt?: string
  postedBy?: string
}

export type JournalLine = {
  id: string
  journalId: string
  accountId: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  currency: Currency
  customerId?: string
  customerName?: string
  projectId?: string
  projectName?: string
  categoryId?: string
  categoryName?: string
  description?: string
}

export type LedgerBalance = {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  periodMonth: number
  periodYear: number
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
  closingBalance: number
}

// Financial Dashboard KPIs
export type FinancialKpis = {
  // Financial Health Ratios
  currentRatio: number
  quickRatio: number
  cashRatio: number
  grossMarginPct: number
  netMarginPct: number
  dso: number // Days Sales Outstanding
  dpo: number // Days Payable Outstanding
  inventoryTurnover: number
  
  // Key Metrics
  totalRevenue: { value: number; delta: number }
  totalExpenses: { value: number; delta: number }
  netIncome: { value: number; delta: number }
  totalAR: { value: number; delta: number }
  totalAP: { value: number; delta: number }
  cashBalance: { value: number; delta: number }
  
  // Operational Metrics
  invoicesIssued: { count: number; value: number }
  invoicesOverdue: { count: number; value: number }
  paymentsApproved: { count: number; value: number }
  reimbursementsPending: { count: number; value: number }
}

// Chart Data for Dashboard
export type FinanceChartData = {
  // Sales trend (daily/monthly)
  salesTrend: Array<{
    date: string
    sales: number
    previousPeriod?: number
  }>
  
  // Cash flow (inflows vs outflows)
  cashFlow: Array<{
    date: string
    inflows: number
    outflows: number
    netCash: number
  }>
  
  // AR Aging
  arAging: Array<{
    bucket: string
    amount: number
    count: number
  }>
  
  // Currency exposure
  currencyExposure: Array<{
    currency: Currency
    amount: number
    percentage: number
  }>
  
  // Category breakdown (expenses/revenue)
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
    type: 'REVENUE' | 'EXPENSE'
  }>
}

// Purchase Budget for Finance Dashboard
export type PurchaseBudgetSummary = {
  id: string
  periodMonth: number
  periodYear: number
  projectId?: string
  projectName?: string
  categoryId?: string
  categoryName?: string
  budgetAmount: number
  actualAmount: number
  variance: number
  variancePct: number
  currency: Currency
}

// Inventory Analytics for Finance Dashboard
export type InventoryAnalytics = {
  onHandValue: number
  reservedValue: number
  availableValue: number
  agingBuckets: Array<{
    bucket: string
    value: number
    count: number
  }>
  fastMovingItems: Array<{
    skuId: string
    skuCode: string
    skuName: string
    velocity: number
    value: number
  }>
  slowMovingItems: Array<{
    skuId: string
    skuCode: string
    skuName: string
    velocity: number
    value: number
  }>
  deadStockItems: Array<{
    skuId: string
    skuCode: string
    skuName: string
    daysSinceMove: number
    value: number
  }>
}

// Filter Parameters for Finance Queries
export type FinanceFilterParams = {
  dateFrom?: string
  dateTo?: string
  compareFromDate?: string
  compareToDate?: string
  from?: string
  to?: string
  customerIds?: string[]
  projectIds?: string[]
  categoryIds?: string[]
  currency?: Currency
  accountIds?: string[]
  status?: string
  accountType?: string
  isProfitLoss?: boolean
  category?: string
  q?: string
}

// Financial Reports
export type ProfitLossReport = {
  periodFrom: string
  periodTo: string
  comparisonPeriodFrom?: string
  comparisonPeriodTo?: string
  currency: Currency
  
  revenue: Array<{
    accountId: string
    accountCode: string
    accountName: string
    currentAmount: number
    compareAmount: number
    variance?: number
    variancePct?: number
  }>
  
  expenses: Array<{
    accountId: string
    accountCode: string
    accountName: string
    currentAmount: number
    compareAmount: number
    variance?: number
    variancePct?: number
  }>
  
  totalRevenue: number
  totalRevenueCompare: number
  totalExpenses: number
  totalExpensesCompare: number
  grossProfit: number
  netIncome: number
  netIncomeCompare: number
  grossMarginPct: number
  netMarginPct: number
}

export type BalanceSheetReport = {
  asOfDate: string
  comparisonDate?: string
  currency: Currency
  
  assets: Array<{
    accountId: string
    accountCode: string
    accountName: string
    amount: number
    comparisonAmount?: number
    variance?: number
    variancePct?: number
  }>
  
  liabilities: Array<{
    accountId: string
    accountCode: string
    accountName: string
    amount: number
    comparisonAmount?: number
    variance?: number
    variancePct?: number
  }>
  
  equity: Array<{
    accountId: string
    accountCode: string
    accountName: string
    amount: number
    comparisonAmount?: number
    variance?: number
    variancePct?: number
  }>
  
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

// WhatsApp Integration
export type WhatsAppMessage = {
  id: string
  template: string
  toPhone: string
  payloadJson: string
  sentAt?: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'
  errorMessage?: string
}

// Audit Log
export type AuditLog = {
  id: string
  entity: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PAYMENT' | 'APPROVAL'
  actorId: string
  actorName: string
  diff?: Record<string, any>
  timestamp: string
}

export type ExportFormat = 'csv' | 'pdf'
export type DateWindow = '1M' | '6M' | '12M'
export type TimeRange = '7D' | '30D' | '90D'

// Stats types for various modules
export type PaymentStats = {
  totalPayments: number
  totalAmount: number
  pendingCount: number
  pendingAmount: number
  verifiedCount: number
  verifiedAmount: number
  postedCount: number
  postedAmount: number
}

export type ReimbursementStats = {
  totalReimbursements: number
  totalAmount: number
  pendingCount: number
  pendingAmount: number
  approvedCount: number
  approvedAmount: number
  paidCount: number
  paidAmount: number
}

export type JournalStats = {
  totalEntries: number
  totalAmount: number
  draftEntries: number
  postedEntries: number
}