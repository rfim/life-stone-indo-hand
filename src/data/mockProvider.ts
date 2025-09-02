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
}

// Export singleton instance
export const mockDataProvider = new MockDataProvider()