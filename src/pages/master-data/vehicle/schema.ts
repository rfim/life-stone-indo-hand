import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const vehicleSchema = baseMasterSchema.extend({
  plateNo: z.string().min(1, 'Plate number is required'),
  capacity: z.number().positive().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;