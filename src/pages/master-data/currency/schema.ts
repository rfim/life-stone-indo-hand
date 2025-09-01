import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const currencySchema = baseMasterSchema.extend({
  symbol: z.string().min(1, 'Symbol is required'),
  rateToIDR: z.number().positive('Rate must be positive'),
});

export type CurrencyFormData = z.infer<typeof currencySchema>;