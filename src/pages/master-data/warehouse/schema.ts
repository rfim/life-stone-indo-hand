import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const warehouseSchema = baseMasterSchema.extend({
  description: z.string().optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;
