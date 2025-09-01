// Data model for Delivery Order module

export type DOStatus = 'draft' | 'released' | 'invoiced' | 'closed' | 'cancelled';

export interface DeliveryOrder {
  id: string;                         // internal id, e.g. "do_2025_08_000123"
  deliveryOrderNumber: string;        // "DO/YYYY/MM/####"
  deliveryDate: string;               // ISO string
  salesOrderId: string;               // FK to SO
  salesOrderNumber: string;           // cached for display
  customerId: string;
  customerName: string;
  expeditionId?: string;
  expeditionName?: string;
  notes?: string;
  status: DOStatus;
  totalQuantity: number;              // sum of all line qtyToDeliver
  totalAmount: number;                // sum(lineAmount)
  createdBy?: string;
  createdAt: string;                  // ISO
  updatedAt: string;                  // ISO
  releasedAt?: string;                // ISO
  invoicedAt?: string;                // ISO
  closedAt?: string;                  // ISO
  cancelledAt?: string;               // ISO
  cancelReason?: string;
  auditLog?: Array<{ at: string; by?: string; action: string; details?: string }>;
}

export interface DeliveryOrderLine {
  id: string;
  deliveryOrderId: string;
  salesOrderLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  uom: string;
  orderedQty: number;                 // from SO line
  deliveredQtyToDate: number;         // sum from all DOs for this SO line
  remainingQty: number;               // orderedQty - deliveredQtyToDate
  qtyToDeliver: number;               // input for this DO
  warehouseId: string;
  warehouseName: string;
  stockAvailable: number;             // on-hand at that warehouse
  price: number;                      // unit price
  discount?: number;                  // optional
  taxRate?: number;                   // optional
  lineAmount: number;                 // computed (qtyToDeliver * price - disc + tax)
  lineNotes?: string;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  date: string;                       // ISO
  customerId: string;
  customerName: string;
  status: 'active' | 'closed' | 'cancelled';
}

export interface SalesOrderLine {
  id: string;
  salesOrderId: string;
  productId: string;
  productCode: string;
  productName: string;
  uom: string;
  orderedQty: number;
  deliveredQtyToDate: number;         // populated from DOs
  price: number;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface InventoryLedgerEntry {
  id: string;
  date: string;               // ISO
  refType: 'DO';
  refId: string;              // DO id
  productId: string;
  warehouseId: string;
  qtyOut: number;             // negative movement
  unitPrice: number;
  amount: number;             // qtyOut * unitPrice
  createdAt: string;
}

// For expeditions (carriers)
export interface Expedition {
  id: string;
  name: string;
}

// List response interface
export interface ListResponse<T> {
  data: T[];
  total: number;
}

// List parameters interface
export interface ListParams {
  q?: string;
  status?: DOStatus | 'all' | 'uninvoiced';
  page: number;
  pageSize: number;
}