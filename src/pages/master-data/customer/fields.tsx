import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { CustomerFormData } from './schema';
import { makeLocalStorageAdapter } from '../common/adapters';
import { CustomerType } from '../common/types';

interface CustomerFieldsProps {
  form: UseFormReturn<CustomerFormData>;
}

export function CustomerFields({ form }: CustomerFieldsProps) {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);

  useEffect(() => {
    // Load customer types for select
    const loadCustomerTypes = async () => {
      const adapter = makeLocalStorageAdapter<CustomerType>('erp.master.customer-type');
      try {
        const result = await adapter.list({ page: 1, pageSize: 100 });
        setCustomerTypes(result.data.filter(ct => ct.active));
      } catch (error) {
        console.error('Failed to load customer types:', error);
      }
    };
    loadCustomerTypes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter phone number" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="typeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customerTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter address" 
                rows={2}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}