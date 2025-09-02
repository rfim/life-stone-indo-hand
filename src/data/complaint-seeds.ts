import { Complaint } from '@/types/complaint';

export const complaintSeeds: Complaint[] = [
  {
    id: 'cmp_9001',
    code: 'CMP-2025-021',
    type: 'COMPLAINT',
    supplier: 'Mentari Stone',
    reason: 'Sample Item 1',
    sku: 'CRR-A12',
    qty: 150,
    uom: 'units',
    nominal: 2500000,
    currency: 'IDR',
    status: 'Opened',
    ageDays: 2,
    isFreeSlab: false,
    createdAt: '2025-08-30T03:00:00Z',
    ref: { poCode: 'PO-2025-010', grnCode: 'GRN-2025-030' },
    photos: []
  },
  {
    id: 'cmp_9002',
    code: 'CMP-2025-022',
    type: 'RETUR',
    supplier: 'Cipta Marmer Alam',
    reason: 'Ujung batu retak',
    sku: 'BLK-K2',
    qty: 4,
    uom: 'SLAB',
    nominal: 2000000,
    currency: 'IDR',
    status: 'Acknowledged',
    ageDays: 1,
    isFreeSlab: false,
    createdAt: '2025-08-31T09:00:00Z',
    ref: { poCode: 'PO-2025-013' }
  },
  {
    id: 'cmp_9003',
    code: 'CMP-2025-023',
    type: 'COMPLAINT',
    supplier: 'Global Granite',
    reason: 'Free slab gores (free slab)',
    sku: 'CRR-A12',
    qty: 1,
    uom: 'SLAB',
    nominal: 0,
    currency: 'IDR',
    status: 'Resolved',
    ageDays: 3,
    isFreeSlab: true,
    createdAt: '2025-08-29T08:00:00Z',
    ref: { grnCode: 'GRN-2025-031' }
  }
];