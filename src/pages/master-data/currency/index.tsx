import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MasterList, getDefaultColumns } from '../common/list';
import { MasterForm } from '../common/form';
import { makeLocalStorageAdapter, seedMasters } from '../common/adapters';
import { Currency } from '../common/types';
import { CurrencyFields } from './fields';
import { currencySchema, CurrencyFormData } from './schema';

const adapter = makeLocalStorageAdapter<Currency>('erp.master.currency');

export function CurrencyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<Currency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingData, setEditingData] = useState<Currency | undefined>();
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
      console.error('Failed to load currencies:', error);
      toast.error('Failed to load currencies');
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
      console.error('Failed to load currency:', error);
      toast.error('Failed to load currency');
    }
  };

  const handleSave = async (data: Omit<CurrencyFormData, 'id'|'createdAt'|'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await adapter.update(editingId, data);
        toast.success('Currency updated successfully');
      } else {
        await adapter.create(data);
        toast.success('Currency created successfully');
      }
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Failed to save currency:', error);
      toast.error('Failed to save currency');
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
    ...getDefaultColumns<Currency>(),
    {
      key: 'symbol' as keyof Currency,
      header: 'Symbol',
      render: (row: Currency) => row.symbol
    },
    {
      key: 'rateToIDR' as keyof Currency,
      header: 'Rate to IDR',
      render: (row: Currency) => row.rateToIDR.toLocaleString('id-ID')
    }
  ];

  return (
    <div className="p-6">
      <MasterList
        title="Currencies"
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

      <MasterForm<CurrencyFormData>
        title="Currency"
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData}
        onSave={handleSave}
        onCancel={handleCancel}
        schema={currencySchema}
        renderExtra={({ form }) => <CurrencyFields form={form} />}
        isLoading={isLoading}
      />
    </div>
  );
}