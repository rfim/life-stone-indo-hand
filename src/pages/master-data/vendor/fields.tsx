import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { VendorFormData } from './schema';

interface VendorFieldsProps {
  form: UseFormReturn<VendorFormData>;
}

export function VendorFields({ form }: VendorFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter description (optional)" 
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
