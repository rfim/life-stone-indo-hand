import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { VehicleFormData } from './schema';

interface VehicleFieldsProps {
  form: UseFormReturn<VehicleFormData>;
}

export function VehicleFields({ form }: VehicleFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="plateNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plate Number</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter plate number (e.g., B 1234 XYZ)" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capacity (kg)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                placeholder="Enter capacity in kg" 
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