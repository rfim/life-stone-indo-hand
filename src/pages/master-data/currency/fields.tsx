import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { CurrencyFormData } from './schema';

interface CurrencyFieldsProps {
  form: UseFormReturn<CurrencyFormData>;
}

export function CurrencyFields({ form }: CurrencyFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="symbol"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Symbol</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter currency symbol (e.g., $, Rp)" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rateToIDR"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rate to IDR</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter exchange rate to IDR" 
                {...field} 
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}