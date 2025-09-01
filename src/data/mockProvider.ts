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
import seedData from './seeds.json'

class MockDataProvider {
  private prs: PRSummary[] = []
  private pos: POSummary[] = []
  private invoices: InvoiceSummary[] = []
  private grns: GRNSummary[] = []
  private skuGaps: SKUGap[] = []
  private complaints: ComplaintSummary[] = []
  private suppliers: string[] = []

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