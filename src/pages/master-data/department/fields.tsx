import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DepartmentFormData } from './schema';

interface DepartmentFieldsProps {
  form: UseFormReturn<DepartmentFormData>;
}

export function DepartmentFields({ form }: DepartmentFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="head"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Department Head</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter department head name (optional)" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
