import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const supplierSchema = baseMasterSchema.extend({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  ratingAvg: z.number().min(0).max(5).optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;