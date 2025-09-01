import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MasterList, getDefaultColumns } from '../common/list';
import { MasterForm } from '../common/form';
import { makeLocalStorageAdapter, seedMasters } from '../common/adapters';
import { Product } from '../common/types';
import { ProductFields } from './fields';
import { productSchema, ProductFormData } from './schema';

const adapter = makeLocalStorageAdapter<Product>('erp.master.product');

export function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingData, setEditingData] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 10;

  // Initialize seed data
  useEffect(() => {
    seedMasters();
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await adapter.list({ q: searchQuery, page, pageSize });
      setRows(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingId(undefined);
    setEditingData(undefined);
    setIsSheetOpen(true);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('action', 'create');
    setSearchParams(newParams);
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await adapter.get(id);
      setEditingId(id);
      setEditingData(data);
      setIsSheetOpen(true);
      
      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      newParams.set('action', 'edit');
      newParams.set('id', id);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
    }
  };

  const handleSave = async (data: Omit<ProductFormData, 'id'|'createdAt'|'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await adapter.update(editingId, data);
        toast.success('Product updated successfully');
      } else {
        await adapter.create(data);
        toast.success('Product created successfully');
      }
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsSheetOpen(false);
    setEditingId(undefined);
    setEditingData(undefined);
    
    // Clear URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    newParams.delete('id');
    setSearchParams(newParams);
  };

  // Check URL params on mount
  useEffect(() => {
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    
    if (action === 'create') {
      handleCreate();
    } else if (action === 'edit' && id) {
      handleEdit(id);
    }
  }, []);

  const columns = [
    ...getDefaultColumns<Product>(),
    {
      key: 'sellName' as keyof Product,
      header: 'Sell Name',
      render: (row: Product) => (
        <span className="max-w-xs truncate block" title={row.sellName || ''}>
          {row.sellName || '-'}
        </span>
      )
    },
    {
      key: 'status' as keyof Product,
      header: 'Status',
      render: (row: Product) => (
        <span className="capitalize">{row.status || 'active'}</span>
      )
    }
  ];

  return (
    <div className="p-6">
      <MasterList
        title="Products"
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        searchQuery={searchQuery}
        onPageChange={setPage}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        columns={columns}
        isLoading={isLoading}
      />

      <MasterForm<ProductFormData>
        title="Product"
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData}
        onSave={handleSave}
        onCancel={handleCancel}
        schema={productSchema}
        renderExtra={({ form }) => <ProductFields form={form} />}
        isLoading={isLoading}
      />
    </div>
  );
}