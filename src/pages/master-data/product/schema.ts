import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  sellName: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  images: z.string().optional(),
  categoryId: z.string().optional(),
  finishingId: z.string().optional(),
  materialTypeId: z.string().optional(),
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;