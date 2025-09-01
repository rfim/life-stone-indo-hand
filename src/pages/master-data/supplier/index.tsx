import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MasterList, getDefaultColumns } from '../common/list';
import { MasterForm } from '../common/form';
import { makeLocalStorageAdapter, seedMasters } from '../common/adapters';
import { Supplier } from '../common/types';
import { SupplierFields } from './fields';
import { supplierSchema, SupplierFormData } from './schema';

const adapter = makeLocalStorageAdapter<Supplier>('erp.master.supplier');

export function SupplierPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingData, setEditingData] = useState<Supplier | undefined>();
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
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
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
      console.error('Failed to load supplier:', error);
      toast.error('Failed to load supplier');
    }
  };

  const handleSave = async (data: Omit<SupplierFormData, 'id'|'createdAt'|'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await adapter.update(editingId, data);
        toast.success('Supplier updated successfully');
      } else {
        await adapter.create(data);
        toast.success('Supplier created successfully');
      }
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Failed to save supplier:', error);
      toast.error('Failed to save supplier');
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
    ...getDefaultColumns<Supplier>(),
    {
      key: 'city' as keyof Supplier,
      header: 'City',
      render: (row: Supplier) => row.city || '-'
    },
    {
      key: 'ratingAvg' as keyof Supplier,
      header: 'Rating',
      render: (row: Supplier) => row.ratingAvg ? `${row.ratingAvg}/5` : '-'
    }
  ];

  return (
    <div className="p-6">
      <MasterList
        title="Suppliers"
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

      <MasterForm<SupplierFormData>
        title="Supplier"
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData}
        onSave={handleSave}
        onCancel={handleCancel}
        schema={supplierSchema}
        renderExtra={({ form }) => <SupplierFields form={form} />}
        isLoading={isLoading}
      />
    </div>
  );
}