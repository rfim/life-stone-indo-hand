import { z } from 'zod';

const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export const departmentSchema = baseMasterSchema.extend({
  description: z.string().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
