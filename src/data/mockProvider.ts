import { format, subDays, addDays, isAfter, isBefore, isEqual, differenceInDays } from 'date-fns'
import {
  PRSummary,
  POSummary,
  InvoiceSummary,
  GRNSummary,
  SKUGap,
  ComplaintSummary,
  KpiBundle,
  FilterParams
} from './purchasing-types'
import {
  Location,
  SKU,
  Inventory,
  Movement,
  Adjustment,
  StockCardRow,
  SIK,
  InboundRequest,
  MovementSummary,
  AdjustmentSummary,
  InventorySummary,
  WarehouseKpis,
  WarehouseFilterParams
} from './warehouse-types'
import {
  CustomerSummary,
  ProjectSummary,
  SalesOrderSummary,
  SalesInvoiceSummary,
  PaymentRequestSummary,
  PaymentSummary,
  PaymentAllocation,
  ReimbursementSummary,
  ChartOfAccountSummary,
  JournalEntrySummary,
  JournalLine,
  PurchaseBudgetSummary,
  FinancialKpis,
  FinanceChartData,
  FinanceFilterParams,
  ProfitLossReport,
  BalanceSheetReport,
  WhatsAppMessage,
  AuditLog,
  InventoryAnalytics,
  ReimbursementSummary,
  JournalEntrySummary,
  JournalLine,
  ChartOfAccountSummary
} from './finance-types'
import seedData from './seeds.json'

class MockDataProvider {
  private prs: PRSummary[] = []
  private pos: POSummary[] = []
  private invoices: InvoiceSummary[] = []
  private grns: GRNSummary[] = []
  private skuGaps: SKUGap[] = []
  private complaints: ComplaintSummary[] = []
  private suppliers: string[] = []
  
  // Warehouse data
  private locations: Location[] = []
  private skus: SKU[] = []
  private inventory: Inventory[] = []
  private movements: Movement[] = []
  private adjustments: Adjustment[] = []
  private stockCards: StockCardRow[] = []
  private siks: SIK[] = []
  private inboundRequests: InboundRequest[] = []
  
  // Finance data
  private customers: CustomerSummary[] = []
  private projects: ProjectSummary[] = []
  private salesOrders: SalesOrderSummary[] = []
  private salesInvoices: SalesInvoiceSummary[] = []
  private paymentRequests: PaymentRequestSummary[] = []
  private payments: PaymentSummary[] = []
  private paymentAllocations: PaymentAllocation[] = []
  private reimbursements: ReimbursementSummary[] = []
  private chartOfAccounts: ChartOfAccountSummary[] = []
  private journalEntries: JournalEntrySummary[] = []
  private journalLines: JournalLine[] = []
  private purchaseBudgets: PurchaseBudgetSummary[] = []
  private whatsappMessages: WhatsAppMessage[] = []
  private auditLogs: AuditLog[] = []

  constructor() {
    this.loadSeedData()
  }

  private loadSeedData() {
    this.suppliers = seedData.suppliers
    this.prs = seedData.prs as PRSummary[]
    this.pos = seedData.pos as POSummary[]
    this.invoices = seedData.invoices as InvoiceSummary[]
    this.grns = seedData.grns as GRNSummary[]
    this.skuGaps = seedData.skuGaps as SKUGap[]
    this.complaints = seedData.complaints as ComplaintSummary[]
    
    // Load warehouse data
    this.locations = (seedData as any).locations as Location[]
    this.skus = (seedData as any).skus as SKU[]
    this.inventory = (seedData as any).inventory as Inventory[]
    this.movements = (seedData as any).movements as Movement[]
    this.adjustments = (seedData as any).adjustments as Adjustment[]
    this.stockCards = (seedData as any).stockCards as StockCardRow[]
    this.siks = (seedData as any).siks as SIK[]
    this.inboundRequests = (seedData as any).inboundRequests as InboundRequest[]
    
    // Load finance data
    this.customers = (seedData as any).customers as CustomerSummary[]
    this.projects = (seedData as any).projects as ProjectSummary[]
    this.salesOrders = (seedData as any).salesOrders as SalesOrderSummary[]
    this.salesInvoices = (seedData as any).salesInvoices as SalesInvoiceSummary[]
    this.paymentRequests = (seedData as any).paymentRequests as PaymentRequestSummary[]
    this.payments = (seedData as any).payments as PaymentSummary[]
    this.paymentAllocations = (seedData as any).paymentAllocations as PaymentAllocation[]
    this.reimbursements = (seedData as any).reimbursements as ReimbursementSummary[]
    this.chartOfAccounts = (seedData as any).chartOfAccounts as ChartOfAccountSummary[]
    this.journalEntries = (seedData as any).journalEntries as JournalEntrySummary[]
    this.journalLines = (seedData as any).journalLines as JournalLine[]
    this.purchaseBudgets = (seedData as any).purchaseBudgets as PurchaseBudgetSummary[]
    this.whatsappMessages = (seedData as any).whatsappMessages as WhatsAppMessage[]
    this.auditLogs = (seedData as any).auditLogs as AuditLog[]
  }

  private filterByDateRange(data: any[], params: FilterParams, dateField: string) {
    const fromDate = new Date(params.from)
    const toDate = new Date(params.to)
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return isAfter(itemDate, fromDate) && isBefore(itemDate, toDate)
    })
  }

  private filterBySuppliers(data: any[], params: FilterParams, supplierField: string) {
    if (!params.supplierIds || params.supplierIds.length === 0) return data
    
    return data.filter(item => {
      const suppliers = Array.isArray(item[supplierField]) 
        ? item[supplierField] 
        : [item[supplierField]]
      return suppliers.some((supplier: string) => params.supplierIds!.includes(supplier))
    })
  }

  private filterByCurrency(data: any[], params: FilterParams) {
    if (!params.currency) return data
    return data.filter(item => item.currency === params.currency)
  }

  private filterBySearch(data: any[], params: FilterParams, searchFields: string[]) {
    if (!params.q) return data
    const query = params.q.toLowerCase()
    
    return data.filter(item => 
      searchFields.some(field => 
        item[field] && String(item[field]).toLowerCase().includes(query)
      )
    )
  }

  private applyFilters(data: any[], params: FilterParams, config: {
    dateField: string
    supplierField: string
    searchFields: string[]
  }) {
    let filtered = data

    // Apply date range filter
    filtered = this.filterByDateRange(filtered, params, config.dateField)
    
    // Apply supplier filter
    filtered = this.filterBySuppliers(filtered, params, config.supplierField)
    
    // Apply currency filter
    filtered = this.filterByCurrency(filtered, params)
    
    // Apply search filter
    filtered = this.filterBySearch(filtered, params, config.searchFields)

    return filtered
  }

  // Calculate previous period for delta comparison
  private getPreviousPeriod(params: FilterParams): FilterParams {
    const fromDate = new Date(params.from)
    const toDate = new Date(params.to)
    const duration = differenceInDays(toDate, fromDate)
    
    const prevTo = subDays(fromDate, 1)
    const prevFrom = subDays(prevTo, duration)
    
    return {
      ...params,
      from: prevFrom.format('YYYY-MM-DD'),
      to: prevTo.format('YYYY-MM-DD')
    }
  }

  async getPRs(params: FilterParams): Promise<PRSummary[]> {
    return this.applyFilters(this.prs, params, {
      dateField: 'createdAt',
      supplierField: 'suppliers',
      searchFields: ['code', 'requester']
    })
  }

  async getPOs(params: FilterParams): Promise<POSummary[]> {
    return this.applyFilters(this.pos, params, {
      dateField: 'eta',
      supplierField: 'supplier',
      searchFields: ['code', 'supplier']
    })
  }

  async getInvoices(params: FilterParams): Promise<InvoiceSummary[]> {
    return this.applyFilters(this.invoices, params, {
      dateField: 'dueDate',
      supplierField: 'supplier',
      searchFields: ['code', 'supplier']
    })
  }

  async getGRNs(params: FilterParams): Promise<GRNSummary[]> {
    return this.applyFilters(this.grns, params, {
      dateField: 'receivedAt',
      supplierField: 'supplier', // We'll need to match via PO
      searchFields: ['code', 'poCode']
    })
  }

  async getSkuGaps(params: FilterParams): Promise<SKUGap[]> {
    return this.applyFilters(this.skuGaps, params, {
      dateField: 'receivedAt',
      supplierField: 'supplier', // We'll need to match via GRN
      searchFields: ['tempItemName']
    })
  }

  async getComplaints(params: FilterParams): Promise<ComplaintSummary[]> {
    // Filter out free slabs
    const filtered = this.complaints.filter(c => !c.isFreeSlab)
    
    return this.applyFilters(filtered, params, {
      dateField: 'createdAt', // We'll use ageDays to calculate this
      supplierField: 'supplier',
      searchFields: ['code', 'supplier', 'reason']
    })
  }

  async getKpis(params: FilterParams): Promise<KpiBundle> {
    const prs = await this.getPRs(params)
    const pos = await this.getPOs(params)
    const invoices = await this.getInvoices(params)
    const grns = await this.getGRNs(params)
    const skuGaps = await this.getSkuGaps(params)
    const complaints = await this.getComplaints(params)

    // Calculate current period KPIs
    const prAwaiting = prs.filter(pr => pr.status === 'Submitted')
    const poUnpaid = pos.filter(po => po.unpaid)
    
    // Invoices due within 7 days
    const now = new Date()
    const invoicesDue7 = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      return differenceInDays(dueDate, now) <= 7 && inv.status !== 'Paid' && inv.status !== 'Archived'
    })

    // Shipments H-3 (ETA within next 3 days)
    const shipmentsH3 = pos.filter(po => {
      if (!po.eta) return false
      const eta = new Date(po.eta)
      return differenceInDays(eta, now) <= 3 && isAfter(eta, now)
    }).length

    // Open complaints (excluding free slabs)
    const complaintsOpen = complaints.filter(c => c.status === 'Opened').length

    // Items without SKU
    const itemsNoSku = skuGaps.length

    // Calculate lead time average (simplified - using PR created to PO ETA)
    let totalLeadTime = 0
    let leadTimeCount = 0
    
    prs.forEach(pr => {
      // Find related PO by supplier match
      const relatedPo = pos.find(po => pr.suppliers.includes(po.supplier))
      if (relatedPo && relatedPo.eta) {
        const leadTime = new Date(relatedPo.eta); differenceInDays(new Date(), new Date(pr.createdAt))
        if (leadTime > 0) {
          totalLeadTime += leadTime
          leadTimeCount++
        }
      }
    })
    
    const leadTimeAvg = leadTimeCount > 0 ? Math.round(totalLeadTime / leadTimeCount) : 0

    // On-time delivery percentage (Delivered POs where ETA >= receivedAt)
    const deliveredPos = pos.filter(po => po.status === 'Delivered')
    let onTimeCount = 0
    
    deliveredPos.forEach(po => {
      const grn = grns.find(g => g.poCode === po.code)
      if (grn && po.eta) {
        const isOnTime = new Date(grn.receivedAt); (isEqual(item.date, new Date(po.eta)) || isBefore(item.date, new Date(po.eta)))
        if (isOnTime) onTimeCount++
      }
    })
    
    const onTimePct = deliveredPos.length > 0 ? Math.round((onTimeCount / deliveredPos.length) * 100) : 0

    // Defect rate percentage (weighted average of GRN defects)
    let totalItems = 0
    let totalDefectWeight = 0
    
    grns.forEach(grn => {
      totalItems += grn.itemsCount
      totalDefectWeight += grn.defectsPct * grn.itemsCount
    })
    
    const defectRatePct = totalItems > 0 ? Math.round(totalDefectWeight / totalItems * 100) / 100 : 0

    return {
      prAwaiting: {
        count: prAwaiting.length,
        value: prAwaiting.reduce((sum, pr) => sum + pr.total, 0)
      },
      poUnpaid: {
        count: poUnpaid.length,
        value: poUnpaid.reduce((sum, po) => sum + po.total, 0)
      },
      invoicesDue7: {
        count: invoicesDue7.length,
        value: invoicesDue7.reduce((sum, inv) => sum + inv.total, 0)
      },
      shipmentsH3,
      complaintsOpen,
      itemsNoSku,
      leadTimeAvg,
      onTimePct,
      defectRatePct
    }
  }

  async getSuppliers(): Promise<string[]> {
    return this.suppliers
  }

  // Warehouse Management Methods
  
  async getLocations(): Promise<Location[]> {
    return this.locations
  }

  async getSKUs(params: WarehouseFilterParams = {}): Promise<SKU[]> {
    let filtered = this.skus
    
    if (params.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter(sku => 
        sku.code.toLowerCase().includes(query) ||
        sku.name.toLowerCase().includes(query) ||
        sku.description?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }

  async getInventory(params: WarehouseFilterParams = {}): Promise<InventorySummary[]> {
    let filtered = this.inventory
    
    if (params.skuIds?.length) {
      filtered = filtered.filter(inv => params.skuIds!.includes(inv.skuId))
    }
    
    if (params.locationIds?.length) {
      filtered = filtered.filter(inv => params.locationIds!.includes(inv.locationId))
    }
    
    if (params.finishing) {
      filtered = filtered.filter(inv => inv.finishing === params.finishing)
    }
    
    // Convert to summary format with joined data
    return filtered.map(inv => {
      const sku = this.skus.find(s => s.id === inv.skuId)
      const location = this.locations.find(l => l.id === inv.locationId)
      
      return {
        skuId: inv.skuId,
        skuCode: sku?.code || 'Unknown',
        skuName: sku?.name || 'Unknown',
        locationId: inv.locationId,
        locationName: location?.name || 'Unknown',
        finishing: inv.finishing,
        onHand: inv.onHand,
        reserved: inv.reserved,
        available: inv.available,
        incoming: inv.incoming,
        outgoing: inv.outgoing,
        uom: sku?.uom || 'PCS',
        minLevel: sku?.minLevel,
        belowMin: inv.available < (sku?.minLevel || 0)
      } as InventorySummary
    })
  }

  async getMovements(params: WarehouseFilterParams = {}): Promise<MovementSummary[]> {
    let filtered = this.movements
    
    // Apply date filter
    if (params.from && params.to) {
      filtered = this.filterByDateRange(filtered, { from: params.from, to: params.to }, 'createdAt')
    }
    
    if (params.type) {
      filtered = filtered.filter(mov => mov.type === params.type)
    }
    
    if (params.status) {
      filtered = filtered.filter(mov => mov.status === params.status)
    }
    
    if (params.skuIds?.length) {
      filtered = filtered.filter(mov => params.skuIds!.includes(mov.skuId))
    }
    
    // Convert to summary format
    return filtered.map(mov => {
      const sku = this.skus.find(s => s.id === mov.skuId)
      const fromLocation = mov.fromLocationId ? this.locations.find(l => l.id === mov.fromLocationId) : null
      const toLocation = mov.toLocationId ? this.locations.find(l => l.id === mov.toLocationId) : null
      
      return {
        id: mov.id,
        type: mov.type,
        skuCode: sku?.code || 'Unknown',
        skuName: sku?.name || 'Unknown',
        qty: mov.qty,
        uom: mov.uom,
        fromLocation: fromLocation?.name,
        toLocation: toLocation?.name,
        status: mov.status,
        createdAt: mov.createdAt
      } as MovementSummary
    })
  }

  async getAdjustments(params: WarehouseFilterParams = {}): Promise<AdjustmentSummary[]> {
    let filtered = this.adjustments
    
    // Apply date filter
    if (params.from && params.to) {
      filtered = this.filterByDateRange(filtered, { from: params.from, to: params.to }, 'createdAt')
    }
    
    if (params.type) {
      filtered = filtered.filter(adj => adj.adjType === params.type)
    }
    
    if (params.status) {
      filtered = filtered.filter(adj => adj.status === params.status)
    }
    
    // Convert to summary format
    return filtered.map(adj => {
      const sku = this.skus.find(s => s.id === adj.skuId)
      const location = this.locations.find(l => l.id === adj.locationId)
      
      return {
        id: adj.id,
        adjType: adj.adjType,
        skuCode: sku?.code || 'Unknown',
        skuName: sku?.name || 'Unknown',
        qtyDelta: adj.qtyDelta,
        uom: adj.uom,
        location: location?.name || 'Unknown',
        status: adj.status,
        createdAt: adj.createdAt
      } as AdjustmentSummary
    })
  }

  async getStockCard(skuId: string, params: WarehouseFilterParams = {}): Promise<StockCardRow[]> {
    let filtered = this.stockCards.filter(card => card.skuId === skuId)
    
    // Apply date filter
    if (params.from && params.to) {
      filtered = this.filterByDateRange(filtered, { from: params.from, to: params.to }, 'ts')
    }
    
    if (params.locationIds?.length) {
      filtered = filtered.filter(card => 
        !card.locationId || params.locationIds!.includes(card.locationId)
      )
    }
    
    if (params.finishing) {
      filtered = filtered.filter(card => 
        !card.finishing || card.finishing === params.finishing
      )
    }
    
    return filtered.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  }

  async getSIKs(params: WarehouseFilterParams = {}): Promise<SIK[]> {
    let filtered = this.siks
    
    if (params.type) {
      filtered = filtered.filter(sik => sik.sikType === params.type)
    }
    
    if (params.status) {
      filtered = filtered.filter(sik => sik.status === params.status)
    }
    
    return filtered
  }

  async getInboundRequests(params: WarehouseFilterParams = {}): Promise<InboundRequest[]> {
    let filtered = this.inboundRequests
    
    if (params.status) {
      filtered = filtered.filter(req => req.status === params.status)
    }
    
    return filtered
  }

  async getWarehouseKpis(params: WarehouseFilterParams = {}): Promise<WarehouseKpis> {
    const inventory = await this.getInventory(params)
    const movements = await this.getMovements(params)
    const adjustments = await this.getAdjustments(params)
    const siks = await this.getSIKs(params)
    const inboundRequests = await this.getInboundRequests(params)
    
    // Calculate KPIs
    const totalOnHand = inventory.reduce((sum, inv) => sum + inv.onHand, 0)
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved, 0)
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.available, 0)
    const totalIncoming = inventory.reduce((sum, inv) => sum + inv.incoming, 0)
    const totalOutgoing = inventory.reduce((sum, inv) => sum + inv.outgoing, 0)
    const itemsBelowMin = inventory.filter(inv => inv.belowMin).length
    
    const today = format(new Date(), 'yyyy-MM-dd')
    const movementsToday = movements.filter(mov => 
      mov.createdAt.startsWith(today)
    ).length
    const adjustmentsToday = adjustments.filter(adj => 
      adj.createdAt.startsWith(today)
    ).length
    
    const siksActive = siks.filter(sik => 
      sik.status === 'Issued' || sik.status === 'InProgress'
    ).length
    
    const inboundRequestsPending = inboundRequests.filter(req => 
      req.status === 'Planned' || req.status === 'Scheduled'
    ).length

    return {
      totalOnHand: { value: totalOnHand },
      totalReserved: { value: totalReserved },
      totalAvailable: { value: totalAvailable },
      totalIncoming: { value: totalIncoming },
      totalOutgoing: { value: totalOutgoing },
      itemsBelowMin: { value: itemsBelowMin },
      movementsToday: { value: movementsToday },
      adjustmentsToday: { value: adjustmentsToday },
      siksActive: { value: siksActive },
      inboundRequestsPending: { value: inboundRequestsPending }
    }
  }

  // Finance Management Methods
  
  // Helper method to apply finance filters
  private applyFinanceFilters(data: any[], params: FinanceFilterParams, config: {
    dateField: string
    customerField?: string
    projectField?: string
    searchFields: string[]
  }) {
    let filtered = data

    // Apply date range filter
    if (params.from && params.to) {
      filtered = this.filterByDateRange(filtered, { from: params.from, to: params.to } as FilterParams, config.dateField)
    }
    
    // Apply customer filter
    if (params.customerIds?.length && config.customerField) {
      filtered = filtered.filter(item => params.customerIds!.includes(item[config.customerField!]))
    }
    
    // Apply project filter
    if (params.projectIds?.length && config.projectField) {
      filtered = filtered.filter(item => params.projectIds!.includes(item[config.projectField!]))
    }
    
    // Apply currency filter
    if (params.currency) {
      filtered = filtered.filter(item => item.currency === params.currency)
    }
    
    // Apply status filter
    if (params.status) {
      filtered = filtered.filter(item => item.status === params.status)
    }
    
    // Apply search filter
    if (params.q) {
      filtered = this.filterBySearch(filtered, { q: params.q } as FilterParams, config.searchFields)
    }

    return filtered
  }

  async getCustomers(params: FinanceFilterParams = {}): Promise<CustomerSummary[]> {
    let filtered = this.customers
    
    if (params.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter(cust => 
        cust.name.toLowerCase().includes(query) ||
        cust.email?.toLowerCase().includes(query) ||
        cust.phone?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }

  async getProjects(params: FinanceFilterParams = {}): Promise<ProjectSummary[]> {
    return this.applyFinanceFilters(this.projects, params, {
      dateField: 'createdAt',
      customerField: 'customerId',
      searchFields: ['code', 'name', 'customerName']
    })
  }

  async getSalesOrders(params: FinanceFilterParams = {}): Promise<SalesOrderSummary[]> {
    return this.applyFinanceFilters(this.salesOrders, params, {
      dateField: 'createdAt',
      customerField: 'customerId',
      projectField: 'projectId',
      searchFields: ['code', 'customerName', 'projectName']
    })
  }

  async getSalesInvoices(params: FinanceFilterParams = {}): Promise<SalesInvoiceSummary[]> {
    let filtered = this.applyFinanceFilters(this.salesInvoices, params, {
      dateField: 'issueDate',
      customerField: 'customerId',
      projectField: 'projectId',
      searchFields: ['code', 'customerName', 'projectName']
    })
    
    // Calculate aging days for each invoice
    const now = new Date()
    filtered = filtered.map(inv => ({
      ...inv,
      agingDays: differenceInDays(now, new Date(inv.dueDate))
    }))
    
    return filtered
  }

  async getPaymentRequests(params: FinanceFilterParams = {}): Promise<PaymentRequestSummary[]> {
    return this.applyFinanceFilters(this.paymentRequests, params, {
      dateField: 'requestedAt',
      searchFields: ['sourceCode', 'requestedBy']
    })
  }

  async getPayments(params: FinanceFilterParams = {}): Promise<PaymentSummary[]> {
    return this.applyFinanceFilters(this.payments, params, {
      dateField: 'createdAt',
      searchFields: ['sourceCode', 'note']
    })
  }

  async getReimbursements(params: FinanceFilterParams = {}): Promise<ReimbursementSummary[]> {
    return this.applyFinanceFilters(this.reimbursements, params, {
      dateField: 'createdAt',
      projectField: 'projectId',
      searchFields: ['code', 'requesterName', 'description']
    })
  }

  async getChartOfAccounts(params: FinanceFilterParams = {}): Promise<ChartOfAccountSummary[]> {
    let filtered = this.chartOfAccounts
    
    if (params.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter(acc => 
        acc.code.toLowerCase().includes(query) ||
        acc.name.toLowerCase().includes(query)
      )
    }
    
    if (params.accountIds?.length) {
      filtered = filtered.filter(acc => params.accountIds!.includes(acc.id))
    }
    
    return filtered
  }

  async getJournalEntries(params: FinanceFilterParams = {}): Promise<JournalEntrySummary[]> {
    return this.applyFinanceFilters(this.journalEntries, params, {
      dateField: 'journalDate',
      searchFields: ['code', 'memo', 'createdBy']
    })
  }

  async getJournalLines(journalId: string): Promise<JournalLine[]> {
    return this.journalLines.filter(line => line.journalId === journalId)
  }

  async getPurchaseBudgets(params: FinanceFilterParams = {}): Promise<PurchaseBudgetSummary[]> {
    let filtered = this.purchaseBudgets
    
    if (params.projectIds?.length) {
      filtered = filtered.filter(budget => 
        !budget.projectId || params.projectIds!.includes(budget.projectId)
      )
    }
    
    if (params.categoryIds?.length) {
      filtered = filtered.filter(budget => 
        !budget.categoryId || params.categoryIds!.includes(budget.categoryId)
      )
    }
    
    return filtered
  }

  async getFinancialKpis(params: FinanceFilterParams): Promise<FinancialKpis> {
    const salesInvoices = await this.getSalesInvoices(params)
    const payments = await this.getPayments(params)
    const reimbursements = await this.getReimbursements(params)
    const accounts = await this.getChartOfAccounts()
    
    // Get previous period for delta calculation
    const fromDate = new Date(params.from)
    const toDate = new Date(params.to)
    const duration = differenceInDays(toDate, fromDate)
    const prevTo = subDays(fromDate, 1)
    const prevFrom = subDays(prevTo, duration)
    
    const prevParams = {
      ...params,
      from: format(prevFrom, 'yyyy-MM-dd'),
      to: format(prevTo, 'yyyy-MM-dd')
    }
    
    const prevSalesInvoices = await this.getSalesInvoices(prevParams)
    
    // Calculate key metrics
    const totalRevenue = salesInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const prevTotalRevenue = prevSalesInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const revenueGrowth = prevTotalRevenue ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0
    
    const totalAR = salesInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0)
    const totalAP = 100200000 // From seed data, could be calculated from PO invoices
    
    // Financial ratios (simplified calculations)
    const currentAssets = 125000000 + totalAR + 450000000 // Cash + AR + Inventory
    const currentLiabilities = totalAP + 74175000 // AP + VAT Payable
    const currentRatio = currentLiabilities ? currentAssets / currentLiabilities : 0
    
    const quickAssets = 125000000 + totalAR // Cash + AR (no inventory)
    const quickRatio = currentLiabilities ? quickAssets / currentLiabilities : 0
    
    const cashRatio = currentLiabilities ? 125000000 / currentLiabilities : 0
    
    // Operational metrics
    const invoicesOverdue = salesInvoices.filter(inv => 
      inv.status === 'OVERDUE' || (inv.agingDays && inv.agingDays > 0 && inv.remainingAmount > 0)
    )
    
    const paymentsApproved = payments.filter(pay => pay.status === 'VERIFIED' || pay.status === 'POSTED')
    const reimbursementsPending = reimbursements.filter(reimb => 
      reimb.status === 'SUBMITTED' || reimb.status === 'APPROVED'
    )

    return {
      // Financial Health Ratios
      currentRatio: Math.round(currentRatio * 100) / 100,
      quickRatio: Math.round(quickRatio * 100) / 100,
      cashRatio: Math.round(cashRatio * 100) / 100,
      grossMarginPct: 40, // Simplified calculation
      netMarginPct: 25, // Simplified calculation
      dso: 35, // Days Sales Outstanding - simplified
      dpo: 30, // Days Payable Outstanding - simplified
      inventoryTurnover: 6.5, // Simplified calculation
      
      // Key Metrics with deltas
      totalRevenue: { value: totalRevenue, delta: revenueGrowth },
      totalExpenses: { value: 1109500000, delta: -5.2 }, // From seed data
      netIncome: { value: totalRevenue - 1109500000, delta: 15.8 },
      totalAR: { value: totalAR, delta: 12.3 },
      totalAP: { value: totalAP, delta: -8.7 },
      cashBalance: { value: 125000000, delta: 22.1 },
      
      // Operational Metrics
      invoicesIssued: { count: salesInvoices.length, value: totalRevenue },
      invoicesOverdue: { count: invoicesOverdue.length, value: invoicesOverdue.reduce((sum, inv) => sum + inv.remainingAmount, 0) },
      paymentsApproved: { count: paymentsApproved.length, value: paymentsApproved.reduce((sum, pay) => sum + pay.amount, 0) },
      reimbursementsPending: { count: reimbursementsPending.length, value: reimbursementsPending.reduce((sum, reimb) => sum + reimb.amount, 0) }
    }
  }

  async getFinanceChartData(params: FinanceFilterParams): Promise<FinanceChartData> {
    const salesInvoices = await this.getSalesInvoices(params)
    const payments = await this.getPayments(params)
    const accounts = await this.getChartOfAccounts()
    
    // Sales trend (daily aggregation)
    const salesTrend = salesInvoices.reduce((acc, inv) => {
      const date = format(new Date(inv.issueDate), 'yyyy-MM-dd')
      acc[date] = (acc[date] || 0) + inv.total
      return acc
    }, {} as Record<string, number>)
    
    const salesTrendData = Object.entries(salesTrend).map(([date, sales]) => ({
      date,
      sales,
      previousPeriod: sales * 0.85 // Simulated previous period data
    }))
    
    // Cash flow (simplified)
    const cashFlow = payments.map(pay => ({
      date: format(new Date(pay.createdAt), 'yyyy-MM-dd'),
      inflows: pay.sourceType === 'INVOICE' ? pay.amount : 0,
      outflows: pay.sourceType !== 'INVOICE' ? pay.amount : 0,
      netCash: pay.sourceType === 'INVOICE' ? pay.amount : -pay.amount
    }))
    
    // AR Aging
    const arAging = [
      { bucket: '0-30 days', amount: salesInvoices.filter(inv => (inv.agingDays || 0) <= 30).reduce((sum, inv) => sum + inv.remainingAmount, 0), count: salesInvoices.filter(inv => (inv.agingDays || 0) <= 30).length },
      { bucket: '31-60 days', amount: salesInvoices.filter(inv => (inv.agingDays || 0) > 30 && (inv.agingDays || 0) <= 60).reduce((sum, inv) => sum + inv.remainingAmount, 0), count: salesInvoices.filter(inv => (inv.agingDays || 0) > 30 && (inv.agingDays || 0) <= 60).length },
      { bucket: '61-90 days', amount: salesInvoices.filter(inv => (inv.agingDays || 0) > 60 && (inv.agingDays || 0) <= 90).reduce((sum, inv) => sum + inv.remainingAmount, 0), count: salesInvoices.filter(inv => (inv.agingDays || 0) > 60 && (inv.agingDays || 0) <= 90).length },
      { bucket: '90+ days', amount: salesInvoices.filter(inv => (inv.agingDays || 0) > 90).reduce((sum, inv) => sum + inv.remainingAmount, 0), count: salesInvoices.filter(inv => (inv.agingDays || 0) > 90).length }
    ]
    
    // Currency exposure
    const currencyTotals = salesInvoices.reduce((acc, inv) => {
      acc[inv.currency] = (acc[inv.currency] || 0) + inv.remainingAmount
      return acc
    }, {} as Record<string, number>)
    
    const totalExposure = Object.values(currencyTotals).reduce((sum, amount) => sum + amount, 0)
    const currencyExposure = Object.entries(currencyTotals).map(([currency, amount]) => ({
      currency: currency as any,
      amount,
      percentage: totalExposure ? (amount / totalExposure) * 100 : 0
    }))
    
    // Category breakdown (simplified)
    const categoryBreakdown = [
      { category: 'Sales Revenue', amount: 1535000000, percentage: 58.5, type: 'REVENUE' as const },
      { category: 'Cost of Goods Sold', amount: 920000000, percentage: 35.1, type: 'EXPENSE' as const },
      { category: 'Operating Expenses', amount: 185000000, percentage: 7.1, type: 'EXPENSE' as const },
      { category: 'Reimbursements', amount: 4500000, percentage: 0.2, type: 'EXPENSE' as const }
    ]

    return {
      salesTrend: salesTrendData,
      cashFlow,
      arAging,
      currencyExposure,
      categoryBreakdown
    }
  }

  async getProfitLossReport(params: FinanceFilterParams): Promise<ProfitLossReport> {
    const accounts = await this.getChartOfAccounts()
    const revenueAccounts = accounts.filter(acc => acc.type === 'REVENUE' && acc.isProfitLoss)
    const expenseAccounts = accounts.filter(acc => acc.type === 'EXPENSE' && acc.isProfitLoss)
    
    // Simplified P&L calculation using account balances
    const revenue = revenueAccounts.map(acc => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      currentPeriod: acc.balance || 0,
      comparisonPeriod: (acc.balance || 0) * 0.85, // Simulated comparison
      variance: (acc.balance || 0) * 0.15,
      variancePct: 15
    }))
    
    const expenses = expenseAccounts.map(acc => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      currentPeriod: acc.balance || 0,
      comparisonPeriod: (acc.balance || 0) * 1.1, // Simulated comparison
      variance: -(acc.balance || 0) * 0.1,
      variancePct: -10
    }))
    
    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.currentPeriod, 0)
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.currentPeriod, 0)
    const grossProfit = totalRevenue - totalExpenses
    const netIncome = grossProfit // Simplified
    
    return {
      periodFrom: params.from,
      periodTo: params.to,
      currency: params.currency || 'IDR',
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      grossProfit,
      netIncome,
      grossMarginPct: totalRevenue ? (grossProfit / totalRevenue) * 100 : 0,
      netMarginPct: totalRevenue ? (netIncome / totalRevenue) * 100 : 0
    }
  }

  async getBalanceSheetReport(params: { asOfDate: string; currency?: string }): Promise<BalanceSheetReport> {
    const accounts = await this.getChartOfAccounts()
    const assetAccounts = accounts.filter(acc => acc.type === 'ASSET')
    const liabilityAccounts = accounts.filter(acc => acc.type === 'LIABILITY')
    const equityAccounts = accounts.filter(acc => acc.type === 'EQUITY')
    
    const assets = assetAccounts.map(acc => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      currentBalance: acc.balance || 0,
      comparisonBalance: (acc.balance || 0) * 0.9,
      variance: (acc.balance || 0) * 0.1,
      variancePct: 10
    }))
    
    const liabilities = liabilityAccounts.map(acc => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      currentBalance: acc.balance || 0,
      comparisonBalance: (acc.balance || 0) * 1.05,
      variance: -(acc.balance || 0) * 0.05,
      variancePct: -5
    }))
    
    const equity = equityAccounts.map(acc => ({
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      currentBalance: acc.balance || 0,
      comparisonBalance: (acc.balance || 0) * 0.95,
      variance: (acc.balance || 0) * 0.05,
      variancePct: 5
    }))
    
    return {
      asOfDate: params.asOfDate,
      currency: params.currency || 'IDR',
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((sum, acc) => sum + acc.currentBalance, 0),
      totalLiabilities: liabilities.reduce((sum, acc) => sum + acc.currentBalance, 0),
      totalEquity: equity.reduce((sum, acc) => sum + acc.currentBalance, 0)
    }
  }

  async getWhatsAppMessages(params: FinanceFilterParams = {}): Promise<WhatsAppMessage[]> {
    let filtered = this.whatsappMessages
    
    if (params.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter(msg => 
        msg.template.toLowerCase().includes(query) ||
        msg.toPhone.includes(query)
      )
    }
    
    return filtered
  }

  async getAuditLogs(params: FinanceFilterParams = {}): Promise<AuditLog[]> {
    let filtered = this.auditLogs
    
    if (params.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter(log => 
        log.entity.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.actorName.toLowerCase().includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // WhatsApp Integration (stub)
  async sendWhatsAppMessage(template: string, toPhone: string, payload: any): Promise<WhatsAppMessage> {
    const message: WhatsAppMessage = {
      id: `wa_${Date.now()}`,
      template,
      toPhone,
      payloadJson: JSON.stringify(payload),
      sentAt: new Date().toISOString(),
      status: 'SENT'
    }
    
    this.whatsappMessages.push(message)
    console.log('WhatsApp message sent (stub):', message)
    
    return message
  }

  // Audit logging
  async logAudit(entity: string, entityId: string, action: string, actorId: string, actorName: string, diff?: any): Promise<void> {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      entity,
      entityId,
      action: action as any,
      actorId,
      actorName,
      diff,
      timestamp: new Date().toISOString()
    }
    
    this.auditLogs.push(log)
  }

  // Export functionality
  exportToCSV(data: any[], filename: string): void {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  exportToPDF(data: any[], filename: string): void {
    // Simplified PDF export - in a real app you'd use a library like jsPDF
    console.log('PDF export not implemented in mock - would export:', { data, filename })
    alert('PDF export would be implemented with a library like jsPDF')
  }

  // Payment Management Methods
  async getPaymentStats(params: FinanceFilterParams = {}): Promise<any> {
    const payments = await this.getPayments(params)
    
    const totalPayments = payments.length
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const pendingPayments = payments.filter(p => p.status === 'PENDING')
    const verifiedPayments = payments.filter(p => p.status === 'VERIFIED')
    const postedPayments = payments.filter(p => p.status === 'POSTED')
    
    return {
      totalPayments,
      totalAmount,
      pendingCount: pendingPayments.length,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      verifiedCount: verifiedPayments.length,
      verifiedAmount: verifiedPayments.reduce((sum, p) => sum + p.amount, 0),
      postedCount: postedPayments.length,
      postedAmount: postedPayments.reduce((sum, p) => sum + p.amount, 0)
    }
  }

  async uploadPaymentProof(paymentId: string, formData: FormData): Promise<void> {
    const payment = this.payments.find(p => p.id === paymentId)
    if (payment) {
      payment.proofUrl = `/uploads/payment-proof-${paymentId}.pdf`
      payment.status = 'VERIFIED'
      payment.verifiedBy = 'current_user'
      await this.logAudit('payment', paymentId, 'PROOF_UPLOADED', 'current_user', 'Current User')
    }
  }

  async updatePaymentStatus(paymentId: string, status: any, notes?: string): Promise<void> {
    const payment = this.payments.find(p => p.id === paymentId)
    if (payment) {
      const oldStatus = payment.status
      payment.status = status
      payment.note = notes
      if (status === 'VERIFIED') {
        payment.verifiedBy = 'current_user'
      }
      await this.logAudit('payment', paymentId, 'STATUS_CHANGE', 'current_user', 'Current User', {
        oldStatus,
        newStatus: status,
        notes
      })
    }
  }

  // Reimbursement Management Methods
  async getReimbursementStats(params: FinanceFilterParams = {}): Promise<any> {
    const reimbursements = await this.getReimbursements(params)
    
    const totalReimbursements = reimbursements.length
    const totalAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0)
    const pendingReimbursements = reimbursements.filter(r => r.status === 'SUBMITTED')
    const approvedReimbursements = reimbursements.filter(r => r.status === 'APPROVED')
    const paidReimbursements = reimbursements.filter(r => r.status === 'PAID')
    
    return {
      totalReimbursements,
      totalAmount,
      pendingCount: pendingReimbursements.length,
      pendingAmount: pendingReimbursements.reduce((sum, r) => sum + r.amount, 0),
      approvedCount: approvedReimbursements.length,
      approvedAmount: approvedReimbursements.reduce((sum, r) => sum + r.amount, 0),
      paidCount: paidReimbursements.length,
      paidAmount: paidReimbursements.reduce((sum, r) => sum + r.amount, 0)
    }
  }

  async createReimbursement(data: any): Promise<ReimbursementSummary> {
    const reimbursement: ReimbursementSummary = {
      id: `reimb_${Date.now()}`,
      code: `REIMB-${format(new Date(), 'yyyy-MM')}-${String(this.reimbursements.length + 1).padStart(3, '0')}`,
      requesterId: data.requesterId,
      requesterName: data.requesterId, // In real app, would lookup name
      projectId: data.projectId,
      projectName: data.projectId ? `Project ${data.projectId}` : undefined,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      description: data.description,
      receiptsCount: data.receipts?.length || 0,
      createdAt: new Date().toISOString()
    }
    
    this.reimbursements.push(reimbursement)
    await this.logAudit('reimbursement', reimbursement.id, 'CREATE', 'current_user', 'Current User')
    
    return reimbursement
  }

  async updateReimbursementStatus(reimbursementId: string, status: any, notes?: string): Promise<void> {
    const reimbursement = this.reimbursements.find(r => r.id === reimbursementId)
    if (reimbursement) {
      const oldStatus = reimbursement.status
      reimbursement.status = status
      
      if (status === 'SUBMITTED') {
        reimbursement.submittedAt = new Date().toISOString()
      } else if (status === 'APPROVED') {
        reimbursement.approvedBy = 'current_user'
        reimbursement.approvedAt = new Date().toISOString()
      } else if (status === 'PAID') {
        reimbursement.paidAt = new Date().toISOString()
      } else if (status === 'POSTED') {
        reimbursement.postedAt = new Date().toISOString()
      }
      
      await this.logAudit('reimbursement', reimbursementId, 'STATUS_CHANGE', 'current_user', 'Current User', {
        oldStatus,
        newStatus: status,
        notes
      })
    }
  }

  // Journal Management Methods
  async getJournalStats(params: FinanceFilterParams = {}): Promise<any> {
    const journals = await this.getJournalEntries(params)
    
    const totalEntries = journals.length
    const draftEntries = journals.filter(j => j.status === 'DRAFT').length
    const postedEntries = journals.filter(j => j.status === 'POSTED').length
    const totalAmount = journals.reduce((sum, j) => sum + (j.totalAmount || j.totalDebit || 0), 0)
    
    return {
      totalEntries,
      totalAmount,
      draftEntries,
      postedEntries
    }
  }

  async createJournalEntry(data: any): Promise<JournalEntrySummary> {
    const journal: JournalEntrySummary = {
      id: `je_${Date.now()}`,
      code: data.code || `JE-${format(new Date(), 'yyyy-MM')}-${String(this.journalEntries.length + 1).padStart(3, '0')}`,
      memo: data.memo,
      status: 'DRAFT',
      journalDate: format(data.journalDate || new Date(), 'yyyy-MM-dd'),
      totalDebit: data.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0),
      totalCredit: data.lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0),
      totalAmount: data.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0),
      createdBy: 'current_user',
      createdAt: new Date().toISOString()
    }
    
    this.journalEntries.push(journal)
    
    // Create journal lines
    data.lines.forEach((lineData: any) => {
      const line: JournalLine = {
        id: `jl_${Date.now()}_${Math.random()}`,
        journalId: journal.id,
        accountId: lineData.accountId,
        accountCode: '',
        accountName: lineData.accountName || '',
        debit: lineData.debit || 0,
        credit: lineData.credit || 0,
        currency: 'IDR',
        customerId: lineData.customerId,
        projectId: lineData.projectId,
        categoryId: lineData.categoryId,
        description: lineData.description
      }
      this.journalLines.push(line)
    })
    
    await this.logAudit('journal_entry', journal.id, 'CREATE', 'current_user', 'Current User')
    
    return journal
  }

  async postJournalEntry(journalId: string): Promise<void> {
    const journal = this.journalEntries.find(j => j.id === journalId)
    if (journal && journal.status === 'DRAFT') {
      journal.status = 'POSTED'
      journal.postedAt = new Date().toISOString()
      journal.postedBy = 'current_user'
      
      await this.logAudit('journal_entry', journalId, 'POSTED', 'current_user', 'Current User')
    }
  }

  // Account Management Methods
  async createAccount(data: any): Promise<ChartOfAccountSummary> {
    const account: ChartOfAccountSummary = {
      id: `acc_${Date.now()}`,
      code: data.code,
      name: data.name,
      type: data.type,
      isProfitLoss: data.isProfitLoss,
      parentId: data.parentId || undefined,
      allowPosting: data.allowPosting,
      currency: data.currency,
      isActive: true,
      balance: 0,
      description: data.description
    }
    
    this.chartOfAccounts.push(account)
    await this.logAudit('chart_of_accounts', account.id, 'CREATE', 'current_user', 'Current User')
    
    return account
  }

  async updateAccount(accountId: string, data: any): Promise<void> {
    const account = this.chartOfAccounts.find(a => a.id === accountId)
    if (account) {
      const oldData = { ...account }
      Object.assign(account, data)
      
      await this.logAudit('chart_of_accounts', accountId, 'UPDATE', 'current_user', 'Current User', {
        oldData,
        newData: data
      })
    }
  }
}

// Export singleton instance
export const mockDataProvider = new MockDataProvider()