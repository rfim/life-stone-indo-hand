// Adapter interface and LocalStorage implementation for Delivery Orders

import { 
  DeliveryOrder, 
  DeliveryOrderLine, 
  DOStatus, 
  SalesOrder, 
  SalesOrderLine, 
  Warehouse, 
  InventoryLedgerEntry,
  Expedition,
  ListResponse,
  ListParams
} from './types';

// Adapter interface
export interface DeliveryOrderAdapter {
  list(params: ListParams): Promise<ListResponse<DeliveryOrder>>;
  get(id: string): Promise<{ header: DeliveryOrder; lines: DeliveryOrderLine[]; }>;
  create(payload: { 
    header: Omit<DeliveryOrder, 'id'|'createdAt'|'updatedAt'|'deliveryOrderNumber'|'status'|'totalQuantity'|'totalAmount'> & { status?: DOStatus }, 
    lines: Array<Omit<DeliveryOrderLine,'id'|'deliveryOrderId'|'remainingQty'|'lineAmount'>>
  }): Promise<string>;
  update(id: string, patch: Partial<DeliveryOrder>, linePatches?: Array<Partial<DeliveryOrderLine>>): Promise<void>;
  release(id: string): Promise<void>;
  void(id: string, reason: string): Promise<void>;
  delete(id: string): Promise<void>;
  printData(id: string): Promise<{ header: DeliveryOrder; lines: DeliveryOrderLine[]; }>;
  listActiveSalesOrders(q?: string): Promise<SalesOrder[]>;
  getSalesOrderLines(soId: string): Promise<SalesOrderLine[]>;
  listWarehouses(): Promise<Warehouse[]>;
  getStock(productId: string, warehouseId: string): Promise<number>;
  writeInventory(entries: InventoryLedgerEntry[]): Promise<void>;
}

// LocalStorage keys
const STORAGE_KEYS = {
  deliveryOrders: 'erp.delivery-orders',
  deliveryOrderLines: 'erp.delivery-order-lines',
  salesOrders: 'erp.sales-orders',
  salesOrderLines: 'erp.sales-order-lines',
  warehouses: 'erp.warehouses',
  inventoryLedger: 'erp.inventory-ledger',
  expeditions: 'erp.expeditions',
  doSequence: 'erp.seq.do',
  stock: 'erp.stock' // Simple stock tracking
};

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateDONumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthKey = `${year}${month}`;
  
  // Get current month sequence
  const sequences = JSON.parse(localStorage.getItem(STORAGE_KEYS.doSequence) || '{}');
  const currentSeq = (sequences[monthKey] || 0) + 1;
  
  // Update sequence
  sequences[monthKey] = currentSeq;
  localStorage.setItem(STORAGE_KEYS.doSequence, JSON.stringify(sequences));
  
  return `DO/${year}/${month}/${String(currentSeq).padStart(4, '0')}`;
}

function normalizeDate(date: string | Date): string {
  return new Date(date).toISOString();
}

function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// LocalStorage adapter implementation
export class LocalStorageDeliveryOrderAdapter implements DeliveryOrderAdapter {
  
  async list(params: ListParams): Promise<ListResponse<DeliveryOrder>> {
    const deliveryOrders = loadFromStorage<DeliveryOrder>(STORAGE_KEYS.deliveryOrders);
    
    let filtered = deliveryOrders;
    
    // Apply status filter
    if (params.status && params.status !== 'all') {
      if (params.status === 'uninvoiced') {
        filtered = filtered.filter(deliveryOrder => deliveryOrder.status === 'released' && !deliveryOrder.invoicedAt);
      } else {
        filtered = filtered.filter(deliveryOrder => deliveryOrder.status === params.status);
      }
    }
    
    // Apply search filter
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(deliveryOrder => 
        deliveryOrder.deliveryOrderNumber.toLowerCase().includes(query) ||
        deliveryOrder.salesOrderNumber.toLowerCase().includes(query) ||
        deliveryOrder.customerName.toLowerCase().includes(query)
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filtered.slice(start, end);
    
    return {
      data: paginatedData,
      total: filtered.length
    };
  }

  async get(id: string): Promise<{ header: DeliveryOrder; lines: DeliveryOrderLine[]; }> {
    const deliveryOrders = loadFromStorage<DeliveryOrder>(STORAGE_KEYS.deliveryOrders);
    const lines = loadFromStorage<DeliveryOrderLine>(STORAGE_KEYS.deliveryOrderLines);
    
    const header = deliveryOrders.find(deliveryOrder => deliveryOrder.id === id);
    if (!header) {
      throw new Error('Delivery order not found');
    }
    
    const doLines = lines.filter(line => line.deliveryOrderId === id);
    
    return { header, lines: doLines };
  }

  async create(payload: { 
    header: Omit<DeliveryOrder, 'id'|'createdAt'|'updatedAt'|'deliveryOrderNumber'|'status'|'totalQuantity'|'totalAmount'> & { status?: DOStatus }, 
    lines: Array<Omit<DeliveryOrderLine,'id'|'deliveryOrderId'|'remainingQty'|'lineAmount'>>
  }): Promise<string> {
    const now = normalizeDate(new Date());
    const id = generateId();
    const deliveryOrderNumber = generateDONumber();
    
    // Calculate totals
    const totalQuantity = payload.lines.reduce((sum, line) => sum + line.qtyToDeliver, 0);
    const totalAmount = payload.lines.reduce((sum, line) => {
      const lineAmount = line.qtyToDeliver * line.price;
      return sum + lineAmount;
    }, 0);
    
    // Create header
    const header: DeliveryOrder = {
      ...payload.header,
      id,
      deliveryOrderNumber,
      status: payload.header.status || 'draft',
      totalQuantity,
      totalAmount,
      createdAt: now,
      updatedAt: now,
      auditLog: [{
        at: now,
        action: 'created',
        details: 'Delivery order created'
      }]
    };
    
    // Create lines
    const doLines: DeliveryOrderLine[] = payload.lines.map(line => {
      const lineAmount = line.qtyToDeliver * line.price;
      const remainingQty = line.orderedQty - line.deliveredQtyToDate;
      
      return {
        ...line,
        id: generateId(),
        deliveryOrderId: id,
        remainingQty,
        lineAmount
      };
    });
    
    // Save to storage
    const deliveryOrders = loadFromStorage<DeliveryOrder>(STORAGE_KEYS.deliveryOrders);
    const lines = loadFromStorage<DeliveryOrderLine>(STORAGE_KEYS.deliveryOrderLines);
    
    deliveryOrders.push(header);
    lines.push(...doLines);
    
    saveToStorage(STORAGE_KEYS.deliveryOrders, deliveryOrders);
    saveToStorage(STORAGE_KEYS.deliveryOrderLines, lines);
    
    return id;
  }

  async update(id: string, patch: Partial<DeliveryOrder>, linePatches?: Array<Partial<DeliveryOrderLine>>): Promise<void> {
    const deliveryOrders = loadFromStorage<DeliveryOrder>(STORAGE_KEYS.deliveryOrders);
    const lines = loadFromStorage<DeliveryOrderLine>(STORAGE_KEYS.deliveryOrderLines);
    
    const headerIndex = deliveryOrders.findIndex(deliveryOrder => deliveryOrder.id === id);
    if (headerIndex === -1) {
      throw new Error('Delivery order not found');
    }
    
    const now = normalizeDate(new Date());
    
    // Update header
    deliveryOrders[headerIndex] = {
      ...deliveryOrders[headerIndex],
      ...patch,
      updatedAt: now
    };
    
    // Update lines if provided
    if (linePatches) {
      linePatches.forEach(linePatch => {
        const lineIndex = lines.findIndex(line => line.id === linePatch.id);
        if (lineIndex !== -1) {
          lines[lineIndex] = { ...lines[lineIndex], ...linePatch };
        }
      });
      
      // Recalculate totals
      const doLines = lines.filter(line => line.deliveryOrderId === id);
      const totalQuantity = doLines.reduce((sum, line) => sum + line.qtyToDeliver, 0);
      const totalAmount = doLines.reduce((sum, line) => sum + line.lineAmount, 0);
      
      deliveryOrders[headerIndex].totalQuantity = totalQuantity;
      deliveryOrders[headerIndex].totalAmount = totalAmount;
    }
    
    saveToStorage(STORAGE_KEYS.deliveryOrders, deliveryOrders);
    saveToStorage(STORAGE_KEYS.deliveryOrderLines, lines);
  }

  async release(id: string): Promise<void> {
    const { header, lines } = await this.get(id);
    
    if (header.status !== 'draft') {
      throw new Error('Only draft delivery orders can be released');
    }
    
    const now = normalizeDate(new Date());
    
    // Create inventory ledger entries
    const inventoryEntries: InventoryLedgerEntry[] = lines.map(line => ({
      id: generateId(),
      date: now,
      refType: 'DO' as const,
      refId: id,
      productId: line.productId,
      warehouseId: line.warehouseId,
      qtyOut: line.qtyToDeliver,
      unitPrice: line.price,
      amount: line.lineAmount,
      createdAt: now
    }));
    
    await this.writeInventory(inventoryEntries);
    
    // Update SO lines deliveredQtyToDate
    await this.updateSODeliveredQuantities(lines);
    
    // Update DO status
    await this.update(id, {
      status: 'released',
      releasedAt: now,
      auditLog: [
        ...(header.auditLog || []),
        {
          at: now,
          action: 'released',
          details: 'Delivery order released and inventory updated'
        }
      ]
    });
  }

  async void(id: string, reason: string): Promise<void> {
    const { header, lines } = await this.get(id);
    
    if (!['draft', 'released'].includes(header.status)) {
      throw new Error('Cannot void invoiced or closed delivery orders');
    }
    
    const now = normalizeDate(new Date());
    
    if (header.status === 'released') {
      // Reverse inventory entries
      const reverseEntries: InventoryLedgerEntry[] = lines.map(line => ({
        id: generateId(),
        date: now,
        refType: 'DO' as const,
        refId: id,
        productId: line.productId,
        warehouseId: line.warehouseId,
        qtyOut: -line.qtyToDeliver, // Negative to reverse
        unitPrice: line.price,
        amount: -line.lineAmount,
        createdAt: now
      }));
      
      await this.writeInventory(reverseEntries);
      
      // Reverse SO delivered quantities
      await this.reverseSODeliveredQuantities(lines);
    }
    
    // Update DO status
    await this.update(id, {
      status: 'cancelled',
      cancelledAt: now,
      cancelReason: reason,
      auditLog: [
        ...(header.auditLog || []),
        {
          at: now,
          action: 'voided',
          details: `Delivery order voided: ${reason}`
        }
      ]
    });
  }

  async delete(id: string): Promise<void> {
    const { header, lines } = await this.get(id);
    
    if (header.status !== 'draft' || lines.length > 0) {
      throw new Error('Can only delete draft delivery orders with no lines');
    }
    
    const deliveryOrders = loadFromStorage<DeliveryOrder>(STORAGE_KEYS.deliveryOrders);
    const filtered = deliveryOrders.filter(deliveryOrder => deliveryOrder.id !== id);
    saveToStorage(STORAGE_KEYS.deliveryOrders, filtered);
  }

  async printData(id: string): Promise<{ header: DeliveryOrder; lines: DeliveryOrderLine[]; }> {
    return this.get(id);
  }

  async listActiveSalesOrders(q?: string): Promise<SalesOrder[]> {
    const salesOrders = loadFromStorage<SalesOrder>(STORAGE_KEYS.salesOrders);
    let filtered = salesOrders.filter(salesOrder => salesOrder.status === 'active');
    
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(salesOrder => 
        salesOrder.soNumber.toLowerCase().includes(query) ||
        salesOrder.customerName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  async getSalesOrderLines(soId: string): Promise<SalesOrderLine[]> {
    const lines = loadFromStorage<SalesOrderLine>(STORAGE_KEYS.salesOrderLines);
    return lines.filter(line => line.salesOrderId === soId);
  }

  async listWarehouses(): Promise<Warehouse[]> {
    return loadFromStorage<Warehouse>(STORAGE_KEYS.warehouses);
  }

  async getStock(productId: string, warehouseId: string): Promise<number> {
    const stock = loadFromStorage<{[key: string]: number}>(STORAGE_KEYS.stock);
    const key = `${productId}_${warehouseId}`;
    return stock[0]?.[key] || 0;
  }

  async writeInventory(entries: InventoryLedgerEntry[]): Promise<void> {
    const ledger = loadFromStorage<InventoryLedgerEntry>(STORAGE_KEYS.inventoryLedger);
    ledger.push(...entries);
    saveToStorage(STORAGE_KEYS.inventoryLedger, ledger);
    
    // Update stock levels
    const stock = loadFromStorage<{[key: string]: number}>(STORAGE_KEYS.stock);
    const stockMap = stock[0] || {};
    
    entries.forEach(entry => {
      const key = `${entry.productId}_${entry.warehouseId}`;
      const currentStock = stockMap[key] || 0;
      stockMap[key] = currentStock - entry.qtyOut; // qtyOut is positive for outbound
    });
    
    saveToStorage(STORAGE_KEYS.stock, [stockMap]);
  }

  // Helper methods
  private async updateSODeliveredQuantities(doLines: DeliveryOrderLine[]): Promise<void> {
    const soLines = loadFromStorage<SalesOrderLine>(STORAGE_KEYS.salesOrderLines);
    const salesOrders = loadFromStorage<SalesOrder>(STORAGE_KEYS.salesOrders);
    
    doLines.forEach(doLine => {
      const soLineIndex = soLines.findIndex(line => line.id === doLine.salesOrderLineId);
      if (soLineIndex !== -1) {
        soLines[soLineIndex].deliveredQtyToDate += doLine.qtyToDeliver;
      }
    });
    
    // Check if SO should be closed
    const soIds = [...new Set(doLines.map(line => {
      const soLine = soLines.find(sol => sol.id === line.salesOrderLineId);
      return soLine?.salesOrderId;
    }))];
    
    soIds.forEach(soId => {
      if (!soId) return;
      
      const soLinesForOrder = soLines.filter(line => line.salesOrderId === soId);
      const allDelivered = soLinesForOrder.every(line => line.deliveredQtyToDate >= line.orderedQty);
      
      if (allDelivered) {
        const soIndex = salesOrders.findIndex(salesOrder => salesOrder.id === soId);
        if (soIndex !== -1) {
          salesOrders[soIndex].status = 'closed';
        }
      }
    });
    
    saveToStorage(STORAGE_KEYS.salesOrderLines, soLines);
    saveToStorage(STORAGE_KEYS.salesOrders, salesOrders);
  }

  private async reverseSODeliveredQuantities(doLines: DeliveryOrderLine[]): Promise<void> {
    const soLines = loadFromStorage<SalesOrderLine>(STORAGE_KEYS.salesOrderLines);
    const salesOrders = loadFromStorage<SalesOrder>(STORAGE_KEYS.salesOrders);
    
    doLines.forEach(doLine => {
      const soLineIndex = soLines.findIndex(line => line.id === doLine.salesOrderLineId);
      if (soLineIndex !== -1) {
        soLines[soLineIndex].deliveredQtyToDate -= doLine.qtyToDeliver;
      }
    });
    
    // Reactivate SO if it was closed
    const soIds = [...new Set(doLines.map(line => {
      const soLine = soLines.find(sol => sol.id === line.salesOrderLineId);
      return soLine?.salesOrderId;
    }))];
    
    soIds.forEach(soId => {
      if (!soId) return;
      
      const soIndex = salesOrders.findIndex(salesOrder => salesOrder.id === soId);
      if (soIndex !== -1 && salesOrders[soIndex].status === 'closed') {
        salesOrders[soIndex].status = 'active';
      }
    });
    
    saveToStorage(STORAGE_KEYS.salesOrderLines, soLines);
    saveToStorage(STORAGE_KEYS.salesOrders, salesOrders);
  }
}

// Export singleton instance
export const deliveryOrderAdapter = new LocalStorageDeliveryOrderAdapter();