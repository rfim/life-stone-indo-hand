import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const customerSchema = baseMasterSchema.extend({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  typeId: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;