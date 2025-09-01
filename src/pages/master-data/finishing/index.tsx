import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MasterList, getDefaultColumns } from '../common/list';
import { MasterForm } from '../common/form';
import { makeLocalStorageAdapter, seedMasters } from '../common/adapters';
import { Finishing } from '../common/types';
import { FinishingFields } from './fields';
import { finishingSchema, FinishingFormData } from './schema';

const adapter = makeLocalStorageAdapter<Finishing>('erp.master.finishing');

export function FinishingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Finishing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingData, setEditingData] = useState<Finishing | undefined>();
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
      console.error('Failed to load finishing types:', error);
      toast.error('Failed to load finishing types');
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
      console.error('Failed to load finishing type:', error);
      toast.error('Failed to load finishing type');
    }
  };

  const handleSave = async (data: Omit<FinishingFormData, 'id'|'createdAt'|'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await adapter.update(editingId, data);
        toast.success('Finishing type updated successfully');
      } else {
        await adapter.create(data);
        toast.success('Finishing type created successfully');
      }
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Failed to save finishing type:', error);
      toast.error('Failed to save finishing type');
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
    ...getDefaultColumns<Finishing>(),
    {
      key: 'description' as keyof Finishing,
      header: 'Description',
      render: (row: Finishing) => (
        <span className="max-w-xs truncate block" title={row.description || ''}>
          {row.description || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <MasterList
        title="Finishing Types"
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

      <MasterForm<FinishingFormData>
        title="Finishing Type"
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData}
        onSave={handleSave}
        onCancel={handleCancel}
        schema={finishingSchema}
        renderExtra={({ form }) => <FinishingFields form={form} />}
        isLoading={isLoading}
      />
    </div>
  );
}