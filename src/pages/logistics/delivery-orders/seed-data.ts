// Seed data for Delivery Order module

import { 
  DeliveryOrder, 
  DeliveryOrderLine, 
  SalesOrder, 
  SalesOrderLine, 
  Warehouse, 
  Expedition
} from './types';

const STORAGE_KEYS = {
  deliveryOrders: 'erp.delivery-orders',
  deliveryOrderLines: 'erp.delivery-order-lines',
  salesOrders: 'erp.sales-orders',
  salesOrderLines: 'erp.sales-order-lines',
  warehouses: 'erp.warehouses',
  expeditions: 'erp.expeditions',
  stock: 'erp.stock'
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function seedDeliveryOrderData() {
  // Skip if already seeded
  if (localStorage.getItem(STORAGE_KEYS.warehouses)) {
    return;
  }

  console.log('🚚 Seeding Delivery Order module data...');

  // Seed Warehouses
  const warehouses: Warehouse[] = [
    { id: 'wh_001', name: 'Gudang CMA' },
    { id: 'wh_002', name: 'Gudang Pusat' }
  ];
  
  localStorage.setItem(STORAGE_KEYS.warehouses, JSON.stringify(warehouses));

  // Seed Expeditions
  const expeditions: Expedition[] = [
    { id: 'exp_001', name: 'JNE' },
    { id: 'exp_002', name: 'J&T' },
    { id: 'exp_003', name: 'SAP' },
    { id: 'exp_004', name: 'Eksp. CV UTAMA' }
  ];
  
  localStorage.setItem(STORAGE_KEYS.expeditions, JSON.stringify(expeditions));

  // Seed Sales Orders
  const now = new Date().toISOString();
  
  const salesOrders: SalesOrder[] = [
    {
      id: 'so_001',
      soNumber: 'SO/2025/01/0001',
      date: '2025-01-15T00:00:00.000Z',
      customerId: 'cust_001',
      customerName: 'PT. Mitra Konstruksi',
      status: 'active'
    },
    {
      id: 'so_002',
      soNumber: 'SO/2025/01/0002', 
      date: '2025-01-16T00:00:00.000Z',
      customerId: 'cust_002',
      customerName: 'CV. Bangunan Sejahtera',
      status: 'active'
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(salesOrders));

  // Seed Sales Order Lines
  const salesOrderLines: SalesOrderLine[] = [
    // SO 1 lines
    {
      id: 'sol_001',
      salesOrderId: 'so_001',
      productId: 'prod_001',
      productCode: 'MRB-CAR-60X60',
      productName: 'Marble Carrara White 60x60cm',
      uom: 'M2',
      orderedQty: 100,
      deliveredQtyToDate: 0,
      price: 850000
    },
    {
      id: 'sol_002',
      salesOrderId: 'so_001',
      productId: 'prod_002',
      productCode: 'GRN-BLK-80X80',
      productName: 'Granite Black Galaxy 80x80cm',
      uom: 'M2',
      orderedQty: 50,
      deliveredQtyToDate: 0,
      price: 1200000
    },
    // SO 2 lines
    {
      id: 'sol_003',
      salesOrderId: 'so_002',
      productId: 'prod_003',
      productCode: 'CER-WHT-30X30',
      productName: 'Ceramic White Matt 30x30cm',
      uom: 'M2',
      orderedQty: 200,
      deliveredQtyToDate: 30,
      price: 350000
    },
    {
      id: 'sol_004',
      salesOrderId: 'so_002',
      productId: 'prod_001',
      productCode: 'MRB-CAR-60X60',
      productName: 'Marble Carrara White 60x60cm',
      uom: 'M2',
      orderedQty: 75,
      deliveredQtyToDate: 25,
      price: 850000
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.salesOrderLines, JSON.stringify(salesOrderLines));

  // Seed initial stock levels
  const stockMap = {
    'prod_001_wh_001': 500, // Marble Carrara at Gudang CMA
    'prod_001_wh_002': 300, // Marble Carrara at Gudang Pusat
    'prod_002_wh_001': 200, // Granite Black at Gudang CMA
    'prod_002_wh_002': 150, // Granite Black at Gudang Pusat
    'prod_003_wh_001': 800, // Ceramic White at Gudang CMA
    'prod_003_wh_002': 600, // Ceramic White at Gudang Pusat
  };
  
  localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify([stockMap]));

  // Seed demo delivery orders
  const deliveryOrders: DeliveryOrder[] = [
    {
      id: 'do_001',
      deliveryOrderNumber: 'DO/2025/01/0001',
      deliveryDate: '2025-01-17T00:00:00.000Z',
      salesOrderId: 'so_002',
      salesOrderNumber: 'SO/2025/01/0002',
      customerId: 'cust_002',
      customerName: 'CV. Bangunan Sejahtera',
      expeditionId: 'exp_001',
      expeditionName: 'JNE',
      notes: 'Delivery to project site - handle with care',
      status: 'draft',
      totalQuantity: 55,
      totalAmount: 31750000,
      createdBy: 'admin',
      createdAt: '2025-01-17T08:00:00.000Z',
      updatedAt: '2025-01-17T08:00:00.000Z',
      auditLog: [{
        at: '2025-01-17T08:00:00.000Z',
        by: 'admin',
        action: 'created',
        details: 'Delivery order created from SO/2025/01/0002'
      }]
    },
    {
      id: 'do_002',
      deliveryOrderNumber: 'DO/2025/01/0002',
      deliveryDate: '2025-01-16T00:00:00.000Z',
      salesOrderId: 'so_001',
      salesOrderNumber: 'SO/2025/01/0001',
      customerId: 'cust_001',
      customerName: 'PT. Mitra Konstruksi',
      expeditionId: 'exp_002',
      expeditionName: 'J&T',
      notes: 'First batch delivery',
      status: 'released',
      totalQuantity: 30,
      totalAmount: 25500000,
      createdBy: 'admin',
      createdAt: '2025-01-16T09:00:00.000Z',
      updatedAt: '2025-01-16T14:00:00.000Z',
      releasedAt: '2025-01-16T14:00:00.000Z',
      auditLog: [
        {
          at: '2025-01-16T09:00:00.000Z',
          by: 'admin',
          action: 'created',
          details: 'Delivery order created from SO/2025/01/0001'
        },
        {
          at: '2025-01-16T14:00:00.000Z',
          by: 'admin',
          action: 'released',
          details: 'Delivery order released and inventory updated'
        }
      ]
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.deliveryOrders, JSON.stringify(deliveryOrders));

  // Seed delivery order lines
  const deliveryOrderLines: DeliveryOrderLine[] = [
    // DO 1 lines (draft)
    {
      id: 'dol_001',
      deliveryOrderId: 'do_001',
      salesOrderLineId: 'sol_003',
      productId: 'prod_003',
      productCode: 'CER-WHT-30X30',
      productName: 'Ceramic White Matt 30x30cm',
      uom: 'M2',
      orderedQty: 200,
      deliveredQtyToDate: 30,
      remainingQty: 170,
      qtyToDeliver: 30,
      warehouseId: 'wh_001',
      warehouseName: 'Gudang CMA',
      stockAvailable: 800,
      price: 350000,
      lineAmount: 10500000
    },
    {
      id: 'dol_002',
      deliveryOrderId: 'do_001',
      salesOrderLineId: 'sol_004',
      productId: 'prod_001',
      productCode: 'MRB-CAR-60X60',
      productName: 'Marble Carrara White 60x60cm',
      uom: 'M2',
      orderedQty: 75,
      deliveredQtyToDate: 25,
      remainingQty: 50,
      qtyToDeliver: 25,
      warehouseId: 'wh_001',
      warehouseName: 'Gudang CMA',
      stockAvailable: 500,
      price: 850000,
      lineAmount: 21250000
    },
    // DO 2 lines (released)
    {
      id: 'dol_003',
      deliveryOrderId: 'do_002',
      salesOrderLineId: 'sol_001',
      productId: 'prod_001',
      productCode: 'MRB-CAR-60X60',
      productName: 'Marble Carrara White 60x60cm',
      uom: 'M2',
      orderedQty: 100,
      deliveredQtyToDate: 0,
      remainingQty: 100,
      qtyToDeliver: 30,
      warehouseId: 'wh_002',
      warehouseName: 'Gudang Pusat',
      stockAvailable: 270, // 300 - 30 (already delivered)
      price: 850000,
      lineAmount: 25500000
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.deliveryOrderLines, JSON.stringify(deliveryOrderLines));

  console.log('✅ Delivery Order seed data created successfully!');
}

// Function to clear all seed data (for development)
export function clearDeliveryOrderData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('erp.inventory-ledger');
  localStorage.removeItem('erp.seq.do');
  console.log('🗑️  Delivery Order data cleared');
}