import { BaseMaster } from './types';
import { loadFromStorage, saveToStorage, generateId, nowISO, searchInText, paginate, hasBeenSeeded, markAsSeeded } from './util';

export interface CrudAdapter<T extends { id: string }> {
  list(params: { q?: string; page: number; pageSize: number; }): Promise<{ data: T[]; total: number }>;
  get(id: string): Promise<T>;
  create(payload: Omit<T, 'id'|'createdAt'|'updatedAt'>): Promise<string>;
  update(id: string, patch: Partial<T>): Promise<void>;
  getAll(): Promise<T[]>;
}

export class LocalStorageAdapter<T extends BaseMaster> implements CrudAdapter<T> {
  constructor(private storageKey: string) {}

  async list(params: { q?: string; page: number; pageSize: number; }): Promise<{ data: T[]; total: number }> {
    try {
      const items = loadFromStorage<T>(this.storageKey);
      
      // Filter by search query
      let filteredItems = items;
      if (params.q) {
        filteredItems = items.filter(item => 
          searchInText(item.code, params.q!) || 
          searchInText(item.name, params.q!)
        );
      }
      
      // Sort by updated date (newest first)
      filteredItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      // Paginate
      return paginate(filteredItems, params.page, params.pageSize);
    } catch (error) {
      console.error(`Failed to list data from ${this.storageKey}:`, error);
      // Return empty result as fallback
      return { data: [], total: 0 };
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const items = loadFromStorage<T>(this.storageKey);
      // Sort by updated date (newest first)
      return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error(`Failed to get all data from ${this.storageKey}:`, error);
      // Return empty array as fallback
      return [];
    }
  }

  async get(id: string): Promise<T> {
    try {
      const items = loadFromStorage<T>(this.storageKey);
      const item = items.find(i => i.id === id);
      if (!item) {
        throw new Error(`Item with id ${id} not found`);
      }
      return item;
    } catch (error) {
      console.error(`Failed to get item ${id} from ${this.storageKey}:`, error);
      throw error;
    }
  }

  async create(payload: Omit<T, 'id'|'createdAt'|'updatedAt'>): Promise<string> {
    try {
      const items = loadFromStorage<T>(this.storageKey);
      const now = nowISO();
      const id = generateId();
      
      const newItem = {
        ...payload,
        id,
        createdAt: now,
        updatedAt: now,
      } as T;
      
      items.push(newItem);
      saveToStorage(this.storageKey, items);
      
      return id;
    } catch (error) {
      console.error(`Failed to create item in ${this.storageKey}:`, error);
      throw new Error('Failed to save data. Please try again.');
    }
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    try {
      const items = loadFromStorage<T>(this.storageKey);
      const index = items.findIndex(i => i.id === id);
      
      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }
      
      items[index] = {
        ...items[index],
        ...patch,
        updatedAt: nowISO(),
      };
      
      saveToStorage(this.storageKey, items);
    } catch (error) {
      console.error(`Failed to update item ${id} in ${this.storageKey}:`, error);
      throw new Error('Failed to update data. Please try again.');
    }
  }
}

export function makeLocalStorageAdapter<T extends BaseMaster>(key: string): LocalStorageAdapter<T> {
  return new LocalStorageAdapter<T>(key);
}

// Seeding function
export function seedMasters(): void {
  if (hasBeenSeeded()) {
    console.log('Masters already seeded, skipping...');
    return;
  }

  console.log('Seeding master data...');

  // Categories
  const categoryAdapter = makeLocalStorageAdapter<import('./types').Category>('erp.master.category');
  categoryAdapter.create({ code: 'PAINT', name: 'Paint', active: true, description: 'Paint products' });
  categoryAdapter.create({ code: 'TOOLS', name: 'Tools', active: true, description: 'Tool products' });

  // Finishing
  const finishingAdapter = makeLocalStorageAdapter<import('./types').Finishing>('erp.master.finishing');
  finishingAdapter.create({ code: 'MATTE', name: 'Matte', active: true, description: 'Matte finish' });
  finishingAdapter.create({ code: 'GLOSS', name: 'Glossy', active: true, description: 'Glossy finish' });

  // Material Types
  const materialTypeAdapter = makeLocalStorageAdapter<import('./types').MaterialType>('erp.master.material-type');
  materialTypeAdapter.create({ code: 'ALUM', name: 'Aluminium', active: true, description: 'Aluminium material' });
  materialTypeAdapter.create({ code: 'STEEL', name: 'Steel', active: true, description: 'Steel material' });

  // Suppliers
  const supplierAdapter = makeLocalStorageAdapter<import('./types').Supplier>('erp.master.supplier');
  supplierAdapter.create({ 
    code: 'SUP001', 
    name: 'PT Supplier One', 
    active: true, 
    email: 'contact@supplier1.com',
    phone: '+62123456789',
    address: 'Jl. Supplier 1',
    city: 'Jakarta',
    ratingAvg: 4.5
  });
  supplierAdapter.create({ 
    code: 'SUP002', 
    name: 'CV Supplier Two', 
    active: true, 
    email: 'info@supplier2.com',
    phone: '+62123456790',
    address: 'Jl. Supplier 2',
    city: 'Bandung',
    ratingAvg: 4.2
  });

  // Customer Types
  const customerTypeAdapter = makeLocalStorageAdapter<import('./types').CustomerType>('erp.master.customer-type');
  customerTypeAdapter.create({ code: 'RETAIL', name: 'Retail', active: true, description: 'Retail customers' });
  customerTypeAdapter.create({ code: 'WHOLESALE', name: 'Wholesale', active: true, description: 'Wholesale customers' });

  // Customers
  const customerAdapter = makeLocalStorageAdapter<import('./types').Customer>('erp.master.customer');
  customerAdapter.create({ 
    code: 'CUST001', 
    name: 'PT Customer One', 
    active: true, 
    email: 'contact@customer1.com',
    phone: '+62123456791',
    address: 'Jl. Customer 1',
    typeId: 'ms_retail'
  });
  customerAdapter.create({ 
    code: 'CUST002', 
    name: 'CV Customer Two', 
    active: true, 
    email: 'info@customer2.com',
    phone: '+62123456792',
    address: 'Jl. Customer 2',
    typeId: 'ms_wholesale'
  });

  // Currency
  const currencyAdapter = makeLocalStorageAdapter<import('./types').Currency>('erp.master.currency');
  currencyAdapter.create({ code: 'IDR', name: 'Indonesian Rupiah', active: true, symbol: 'Rp', rateToIDR: 1 });
  currencyAdapter.create({ code: 'USD', name: 'US Dollar', active: true, symbol: '$', rateToIDR: 15000 });

  // Warehouses
  const warehouseAdapter = makeLocalStorageAdapter<import('./types').Warehouse>('erp.master.warehouse');
  warehouseAdapter.create({ code: 'GDG-CMA', name: 'Gudang CMA', active: true, location: 'Cikarang' });
  warehouseAdapter.create({ code: 'GDG-PST', name: 'Gudang Pusat', active: true, location: 'Jakarta' });

  // Vehicles
  const vehicleAdapter = makeLocalStorageAdapter<import('./types').Vehicle>('erp.master.vehicle');
  vehicleAdapter.create({ code: 'TRK001', name: 'Truck 001', active: true, plateNo: 'B 1234 XYZ', capacity: 1000 });
  vehicleAdapter.create({ code: 'VAN001', name: 'Van 001', active: true, plateNo: 'B 5678 ABC', capacity: 500 });

  // Expeditions
  const expeditionAdapter = makeLocalStorageAdapter<import('./types').Expedition>('erp.master.expedition');
  expeditionAdapter.create({ 
    code: 'EXP001', 
    name: 'Eksp. CV UTAMA', 
    active: true, 
    contact: 'Budi',
    phone: '+62123456793'
  });

  // Departments
  const departmentAdapter = makeLocalStorageAdapter<import('./types').Department>('erp.master.department');
  departmentAdapter.create({ code: 'SALES', name: 'Sales', active: true, head: 'John Doe' });
  departmentAdapter.create({ code: 'WAREHOUSE', name: 'Warehouse', active: true, head: 'Jane Smith' });

  // Accounts
  const accountAdapter = makeLocalStorageAdapter<import('./types').Account>('erp.master.account');
  accountAdapter.create({ code: 'ACC-001', name: 'Cash', active: true, number: '1-001', type: 'asset' });
  accountAdapter.create({ code: 'ACC-002', name: 'Bank', active: true, number: '1-002', type: 'asset' });

  // Sizes
  const sizeAdapter = makeLocalStorageAdapter<import('./types').Size>('erp.master.size');
  sizeAdapter.create({ code: 'SML', name: 'Small', active: true, dimension: '10x10x5 cm' });
  sizeAdapter.create({ code: 'MED', name: 'Medium', active: true, dimension: '20x20x10 cm' });

  // Account Categories
  const accountCategoryAdapter = makeLocalStorageAdapter<import('./types').AccountCategory>('erp.master.account-category');
  accountCategoryAdapter.create({ code: 'ASSET', name: 'Assets', active: true });
  accountCategoryAdapter.create({ code: 'LIABILITY', name: 'Liabilities', active: true });

  // Account Sub Categories
  const accountSubCategoryAdapter = makeLocalStorageAdapter<import('./types').AccountSubCategory>('erp.master.account-subcategory');
  accountSubCategoryAdapter.create({ code: 'CURRENT', name: 'Current Assets', active: true, categoryId: 'ms_asset' });
  accountSubCategoryAdapter.create({ code: 'FIXED', name: 'Fixed Assets', active: true, categoryId: 'ms_asset' });

  // Projects
  const projectAdapter = makeLocalStorageAdapter<import('./types').Project>('erp.master.project');
  projectAdapter.create({ 
    code: 'PRJ001', 
    name: 'Project Alpha', 
    active: true, 
    customerId: 'ms_customer1',
    pm: 'Alice Johnson',
    status: 'open',
    fee: 100000000
  });

  // Promotions
  const promotionAdapter = makeLocalStorageAdapter<import('./types').Promotion>('erp.master.promotion');
  promotionAdapter.create({ 
    code: 'PROMO01', 
    name: 'New Year Promo', 
    active: true, 
    discountPct: 10,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  // Armadas
  const armadaAdapter = makeLocalStorageAdapter<import('./types').Armada>('erp.master.armada');
  armadaAdapter.create({ 
    code: 'ARM001', 
    name: 'Armada 1', 
    active: true, 
    vehicleId: 'ms_vehicle1',
    driver: 'Driver One'
  });

  // Origins
  const originAdapter = makeLocalStorageAdapter<import('./types').Origin>('erp.master.origin');
  originAdapter.create({ code: 'IDN', name: 'Indonesia', active: true, address: 'Jakarta, Indonesia' });
  originAdapter.create({ code: 'CHN', name: 'China', active: true, address: 'Guangzhou, China' });

  // Bank Accounts
  const bankAccountAdapter = makeLocalStorageAdapter<import('./types').BankAccount>('erp.master.bank-account');
  bankAccountAdapter.create({ 
    code: 'BCA001', 
    name: 'BCA Main Account', 
    active: true, 
    bankName: 'Bank Central Asia',
    accountNo: '1234567890',
    holderName: 'PT Company',
    currencyCode: 'IDR'
  });

  // Vendors
  const vendorAdapter = makeLocalStorageAdapter<import('./types').Vendor>('erp.master.vendor');
  vendorAdapter.create({ 
    code: 'VND001', 
    name: 'Vendor One', 
    active: true, 
    contact: 'Contact Person',
    email: 'vendor@example.com',
    phone: '+62123456794'
  });

  // Item Suppliers
  const itemSupplierAdapter = makeLocalStorageAdapter<import('./types').SupplierItem>('erp.master.item-supplier');
  itemSupplierAdapter.create({ 
    code: 'IS001', 
    name: 'Item Supplier 1', 
    active: true, 
    supplierId: 'ms_supplier1',
    supplierSku: 'SKU001',
    price: 10000
  });

  markAsSeeded();
  console.log('Master data seeding completed!');
}