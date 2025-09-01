import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Base schema for all masters
const baseMasterSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().default(true),
});

export type BaseMasterFormData = z.infer<typeof baseMasterSchema>;

interface MasterFormProps<T extends BaseMasterFormData> {
  title: string;
  open: boolean;
  isEdit: boolean;
  initial?: Partial<T>;
  onSave: (data: Omit<T, 'id'|'createdAt'|'updatedAt'>) => void;
  onCancel: () => void;
  schema?: z.ZodSchema<T>;
  renderExtra?: (formState: {
    form: UseFormReturn<T>;
    setValue: (name: keyof T, value: any) => void;
    watch: (name: keyof T) => any;
  }) => ReactNode;
  isLoading?: boolean;
}

export function MasterForm<T extends BaseMasterFormData>({
  title,
  open,
  isEdit,
  initial,
  onSave,
  onCancel,
  schema = baseMasterSchema as z.ZodSchema<T>,
  renderExtra,
  isLoading = false
}: MasterFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      active: true,
      ...(initial || {})
    } as T
  });

  React.useEffect(() => {
    if (initial && open) {
      form.reset({
        code: '',
        name: '',
        active: true,
        ...initial
      } as T);
    } else if (!initial && open) {
      form.reset({
        code: '',
        name: '',
        active: true
      } as T);
    }
  }, [initial, open, form]);

  const onSubmit = (data: T) => {
    onSave(data);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <SheetContent className="sm:max-w-[540px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>{isEdit ? `Edit ${title}` : `Create ${title}`}</SheetTitle>
              <SheetDescription>
                {isEdit ? `Update ${title.toLowerCase()} information` : `Add a new ${title.toLowerCase()}`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 py-6 space-y-6 overflow-y-auto">
              {/* Base fields */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="code" as any
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name" as any
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active" as any
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this item for use in the system
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Extra fields */}
              {renderExtra && renderExtra({
                form,
                setValue: form.setValue,
                watch: form.watch
              })}
            </div>

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}