import { useState, useMemo } from 'react';
import { Complaint, ComplaintType, ComplaintStatus } from '@/types/complaint';
import { complaintSeeds } from '@/data/complaint-seeds';

export interface ComplaintFilters {
  status?: ComplaintStatus[];
  type?: ComplaintType[];
  supplier?: string[];
  dateRange?: { from: Date; to: Date };
  excludeFreeSlab?: boolean;
}

export interface UseComplaintsOptions {
  filters?: ComplaintFilters;
  searchQuery?: string;
}

export function useComplaints(options: UseComplaintsOptions = {}) {
  const { filters = {}, searchQuery = '' } = options;
  
  // In a real app, this would come from an API or database
  const [complaints] = useState<Complaint[]>(complaintSeeds);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      result = result.filter(complaint => filters.status!.includes(complaint.status));
    }

    if (filters.type && filters.type.length > 0) {
      result = result.filter(complaint => filters.type!.includes(complaint.type));
    }

    if (filters.supplier && filters.supplier.length > 0) {
      result = result.filter(complaint => filters.supplier!.includes(complaint.supplier));
    }

    if (filters.excludeFreeSlab) {
      result = result.filter(complaint => !complaint.isFreeSlab);
    }

    if (filters.dateRange) {
      result = result.filter(complaint => {
        const createdDate = new Date(complaint.createdAt);
        return createdDate >= filters.dateRange!.from && createdDate <= filters.dateRange!.to;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(complaint =>
        complaint.code.toLowerCase().includes(query) ||
        complaint.supplier.toLowerCase().includes(query) ||
        complaint.reason.toLowerCase().includes(query) ||
        complaint.sku?.toLowerCase().includes(query) ||
        complaint.type.toLowerCase().includes(query)
      );
    }

    return result;
  }, [complaints, filters, searchQuery]);

  // Selection management
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredComplaints.map(complaint => complaint.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredComplaints.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  // Status update (in-memory for demo)
  const updateStatus = async (ids: string[], newStatus: ComplaintStatus) => {
    // In a real app, this would call an API
    console.log(`Updating status of ${ids.length} complaints to ${newStatus}`);
    
    // For demo purposes, just log the action
    return Promise.resolve();
  };

  // Get unique values for filter options
  const getUniqueSuppliers = () => {
    return Array.from(new Set(complaints.map(c => c.supplier)));
  };

  const selectedComplaints = filteredComplaints.filter(complaint => 
    selectedIds.includes(complaint.id)
  );

  return {
    complaints: filteredComplaints,
    selectedIds,
    selectedComplaints,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    updateStatus,
    getUniqueSuppliers,
    isAllSelected: selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0,
    hasSelection: selectedIds.length > 0,
  };
}