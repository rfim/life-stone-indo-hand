import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { WarehouseFormData } from './schema';

interface WarehouseFieldsProps {
  form: UseFormReturn<WarehouseFormData>;
}

export function WarehouseFields({ form }: WarehouseFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter location (optional)" 
              rows={3}
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
