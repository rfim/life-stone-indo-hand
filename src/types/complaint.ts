export type ComplaintType = 'COMPLAINT' | 'RETUR';
export type ComplaintStatus = 'Opened' | 'Acknowledged' | 'Resolved' | 'Closed';

export type Complaint = {
  id: string;             // e.g., "cmp_6001"
  code: string;           // e.g., "CMP-2025-007"
  type: ComplaintType;
  supplier: string;       // e.g., "Cipta Marmer Alam"
  reason: string;         // e.g., "Ujung batu retak"
  sku?: string;           // e.g., "CRR-A12"
  qty: number;
  uom: string;            // e.g., "SLAB" | "PCS" | "m²"
  nominal: number;        // currency value (IDR)
  currency: 'IDR' | 'USD' | 'EUR';
  status: ComplaintStatus;
  ageDays: number;        // derived
  isFreeSlab: boolean;    // if true, exclude from metrics; still show in list with badge
  createdAt: string;      // ISO
  ref: { poCode?: string; grnCode?: string };
  photos?: string[];
};