import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MasterList, getDefaultColumns } from '../common/list';
import { MasterForm } from '../common/form';
import { makeLocalStorageAdapter, seedMasters } from '../common/adapters';
import { Vendor } from '../common/types';
import { VendorFields } from './fields';
import { vendorSchema, VendorFormData } from './schema';

const adapter = makeLocalStorageAdapter<Vendor>('erp.master.vendor');

export function VendorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingData, setEditingData] = useState<Vendor | undefined>();
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
      console.error('Failed to load vendors:', error);
      toast.error('Failed to load vendors');
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
      console.error('Failed to load vendor:', error);
      toast.error('Failed to load vendor');
    }
  };

  const handleSave = async (data: Omit<VendorFormData, 'id'|'createdAt'|'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await adapter.update(editingId, data);
        toast.success('Vendor updated successfully');
      } else {
        await adapter.create(data);
        toast.success('Vendor created successfully');
      }
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Failed to save vendor:', error);
      toast.error('Failed to save vendor');
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
    ...getDefaultColumns<Vendor>(),
    {
      key: 'contact' as keyof Vendor,
      header: 'Contact',
      render: (row: Vendor) => (
        <span className="max-w-xs truncate block" title={row.contact || ''}>
          {row.contact || '-'}
        </span>
      )
    },
    {
      key: 'email' as keyof Vendor,
      header: 'Email',
      render: (row: Vendor) => (
        <span className="max-w-xs truncate block" title={row.email || ''}>
          {row.email || '-'}
        </span>
      )
    },
    {
      key: 'phone' as keyof Vendor,
      header: 'Phone',
      render: (row: Vendor) => (
        <span className="max-w-xs truncate block" title={row.phone || ''}>
          {row.phone || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <MasterList
        title="Vendors"
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

      <MasterForm<VendorFormData>
        title="Vendor"
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData}
        onSave={handleSave}
        onCancel={handleCancel}
        schema={vendorSchema}
        renderExtra={({ form }) => <VendorFields form={form} />}
        isLoading={isLoading}
      />
    </div>
  );
}