export interface BaseMaster {
  id: string;
  code: string;
  name: string;
  active: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type Category = BaseMaster & { description?: string };
export type Finishing = BaseMaster & { description?: string };
export type MaterialType = BaseMaster & { description?: string };

export type Supplier = BaseMaster & {
  email?: string; 
  phone?: string; 
  address?: string; 
  city?: string; 
  ratingAvg?: number;
};

export type Customer = BaseMaster & {
  email?: string; 
  phone?: string; 
  address?: string; 
  typeId?: string;
};

export type Currency = BaseMaster & { symbol: string; rateToIDR: number };

export type Department = BaseMaster & { head?: string };
export type Warehouse = BaseMaster & { location?: string };
export type Vehicle = BaseMaster & { plateNo: string; capacity?: number };
export type Expedition = BaseMaster & { contact?: string; phone?: string };
export type Account = BaseMaster & { 
  number: string; 
  type: 'asset'|'liability'|'equity'|'income'|'expense'; 
  parentId?: string 
};
export type Size = BaseMaster & { dimension?: string };
export type SupplierItem = BaseMaster & { 
  supplierId: string; 
  productId?: string; 
  supplierSku?: string; 
  price?: number 
};
export type AccountCategory = BaseMaster;
export type AccountSubCategory = BaseMaster & { categoryId: string };
export type Project = BaseMaster & { 
  customerId: string; 
  pm?: string; 
  startDate?: string; 
  endDate?: string; 
  status: 'open'|'on-hold'|'closed'; 
  fee?: number 
};
export type CustomerType = BaseMaster & { description?: string };
export type Promotion = BaseMaster & { 
  discountPct?: number; 
  startDate?: string; 
  endDate?: string 
};
export type Armada = BaseMaster & { 
  vehicleId: string; 
  driver?: string; 
  defaultExpeditionId?: string 
};
export type Origin = BaseMaster & { address?: string };
export type BankAccount = BaseMaster & { 
  bankName: string; 
  accountNo: string; 
  holderName: string; 
  currencyCode: string 
};
export type Vendor = BaseMaster & { 
  contact?: string; 
  email?: string; 
  phone?: string 
};

// Product type with additional fields
export type Product = BaseMaster & {
  sellName?: string;
  status?: 'draft' | 'active' | 'archived';
  images?: string; // multi URL text for now
  categoryId?: string;
  finishingId?: string;
  materialTypeId?: string;
};