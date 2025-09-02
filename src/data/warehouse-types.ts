// Warehouse Management Data Types

export type MovementType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER'
export type AdjustmentType = 'COUNT_CORRECTION' | 'DAMAGE' | 'UOM_CONVERSION' | 'FINISHING_CHANGE' | 'CUTTING' | 'LOST_FOUND' | 'CYCLE_COUNT'
export type SIKType = 'FINISHING_CHANGE' | 'CUTTING'
export type DocumentStatus = 'Draft' | 'Approved' | 'Posted' | 'Canceled'
export type SIKStatus = 'Draft' | 'Issued' | 'InProgress' | 'Done' | 'Canceled'
export type InboundRequestStatus = 'Planned' | 'Scheduled' | 'Arrived' | 'Putaway' | 'Closed'

// Core entities
export type Location = {
  id: string
  code: string
  name: string
  type?: string
  parentId?: string
}

export type SKU = {
  id: string
  code: string
  name: string
  description?: string
  uom: string
  categoryId?: string
  dims?: {
    length?: number
    width?: number
    height?: number
  }
  areaRule?: string
  minLevel?: number
  defaultFinishing?: string
  isActive: boolean
  createdAt: string
}

export type Inventory = {
  id: string
  skuId: string
  locationId: string
  finishing?: string
  batch?: string
  onHand: number
  reserved: number
  incoming: number
  outgoing: number
  available: number // calculated: onHand - reserved
  updatedAt: string
}

export type Movement = {
  id: string
  type: MovementType
  skuId: string
  qty: number
  uom: string
  fromLocationId?: string
  toLocationId?: string
  finishing?: string
  batch?: string
  reason?: string
  refDocType?: string
  refDocId?: string
  requestedBy: string
  approvedBy?: string
  status: DocumentStatus
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export type AdjustmentPayload = {
  // Count Correction
  countedQty?: number
  systemQty?: number
  varianceQty?: number
  reason?: string
  photos?: string[]
  
  // Damage/Breakage
  note?: string
  
  // UoM Conversion
  fromQty?: number
  fromUom?: string
  toQty?: number
  toUom?: string
  conversionNote?: string
  
  // Finishing Change
  fromFinishing?: string
  toFinishing?: string
  
  // Cutting/Trimming
  sourceDims?: { length: number; width: number; height?: number }
  sourceArea?: number
  cutPlan?: Array<{
    pieceDims?: { length: number; width: number; height?: number }
    area?: number
    qty: number
  }>
  scrapHandling?: 'return-to-stock' | 'waste'
  
  // Lost & Found
  evidence?: string[]
}

export type Adjustment = {
  id: string
  adjType: AdjustmentType
  payload: AdjustmentPayload
  skuId: string
  locationId: string
  qtyDelta: number
  uom: string
  createdBy: string
  approvedBy?: string
  status: DocumentStatus
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export type StockCardRow = {
  id: string
  skuId: string
  locationId?: string
  finishing?: string
  batch?: string
  ts: string
  refType: string
  refId: string
  type: '+' | '-'
  qty: number
  uom: string
  balanceAfter: number
  note?: string
}

export type SIK = {
  id: string
  code: string
  sikType: SIKType
  items: Array<{
    skuId: string
    qty: number
    uom: string
    fromFinishing?: string
    toFinishing?: string
    cutSpecs?: any
  }>
  assignedTo?: string
  dueDate?: string
  status: SIKStatus
  photos: string[]
  notes: string
  qrPayload?: string
  printUrl?: string
  createdAt: string
  updatedAt: string
}

export type InboundRequest = {
  id: string
  code: string
  supplierId?: string
  supplierName?: string
  refPO?: string
  etaDate?: string
  items: Array<{
    skuId?: string
    skuCode?: string
    desc: string
    qty: number
    uom: string
    finishing?: string
    receivedQty?: number
  }>
  warehouseReady: boolean
  status: InboundRequestStatus
  notes: string
  createdAt: string
  updatedAt: string
}

// Summary types for dashboards
export type MovementSummary = {
  id: string
  type: MovementType
  skuCode: string
  skuName: string
  qty: number
  uom: string
  fromLocation?: string
  toLocation?: string
  status: DocumentStatus
  createdAt: string
}

export type AdjustmentSummary = {
  id: string
  adjType: AdjustmentType
  skuCode: string
  skuName: string
  qtyDelta: number
  uom: string
  location: string
  status: DocumentStatus
  createdAt: string
}

export type InventorySummary = {
  skuId: string
  skuCode: string
  skuName: string
  locationId: string
  locationName: string
  finishing?: string
  onHand: number
  reserved: number
  available: number
  incoming: number
  outgoing: number
  uom: string
  minLevel?: number
  belowMin: boolean
}

// KPI types
export type WarehouseKpis = {
  totalOnHand: { value: number; delta?: number }
  totalReserved: { value: number; delta?: number }
  totalAvailable: { value: number; delta?: number }
  totalIncoming: { value: number; delta?: number }
  totalOutgoing: { value: number; delta?: number }
  itemsBelowMin: { value: number; delta?: number }
  movementsToday: { value: number; delta?: number }
  adjustmentsToday: { value: number; delta?: number }
  siksActive: { value: number; delta?: number }
  inboundRequestsPending: { value: number; delta?: number }
}

// Filter params
export type WarehouseFilterParams = {
  from?: string
  to?: string
  skuIds?: string[]
  locationIds?: string[]
  finishing?: string
  status?: string
  type?: string
  q?: string
}