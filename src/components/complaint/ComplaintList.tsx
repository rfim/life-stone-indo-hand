import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Complaint, ComplaintType, ComplaintStatus } from '@/types/complaint';
import { useComplaints, ComplaintFilters } from '@/hooks/useComplaints';
import { ComplaintCard } from './ComplaintCard';
import { ComplaintTable } from './ComplaintTable';
import { StatusModal } from './StatusModal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Search,
  Filter,
  Settings,
  List,
  Grid3X3,
  Download,
  FileText,
  Printer,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'table' | 'cards';

export function ComplaintList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // View mode state (persisted in URL)
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'cards'
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ComplaintFilters>({
    excludeFreeSlab: true
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Use the complaints hook
  const {
    complaints,
    selectedIds,
    selectedComplaints,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    updateStatus,
    getUniqueSuppliers,
    isAllSelected,
    hasSelection,
  } = useComplaints({ filters, searchQuery });

  // Update URL when view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams);
  };

  // Filter handlers
  const handleStatusFilter = (status: ComplaintStatus, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...(prev.status || []), status]
        : prev.status?.filter(s => s !== status) || []
    }));
  };

  const handleTypeFilter = (type: ComplaintType, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      type: checked 
        ? [...(prev.type || []), type]
        : prev.type?.filter(t => t !== type) || []
    }));
  };

  const handleSupplierFilter = (supplier: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      supplier: checked 
        ? [...(prev.supplier || []), supplier]
        : prev.supplier?.filter(s => s !== supplier) || []
    }));
  };

  const clearAllFilters = () => {
    setFilters({ excludeFreeSlab: true });
    setSearchQuery('');
  };

  // Action handlers
  const handleView = (id: string) => {
    navigate(`/warehouse/complaint-retur/${id}/view`);
  };

  const handleEdit = (id: string) => {
    navigate(`/warehouse/complaint-retur/${id}/edit`);
  };

  const handleQrCode = (id: string) => {
    navigate(`/complaint/${id}/qr`);
  };

  const handlePrint = (id: string) => {
    console.log('Print complaint:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete complaint:', id);
  };

  const handleBulkStatusUpdate = async (status: ComplaintStatus, note?: string) => {
    try {
      await updateStatus(selectedIds, status);
      setIsStatusModalOpen(false);
      clearSelection();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Export ${format} for ${selectedIds.length} items`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.type?.length) count += filters.type.length;
    if (filters.supplier?.length) count += filters.supplier.length;
    return count;
  };

  const uniqueSuppliers = getUniqueSuppliers();
  const statusOptions: ComplaintStatus[] = ['Opened', 'Acknowledged', 'Resolved', 'Closed'];
  const typeOptions: ComplaintType[] = ['COMPLAINT', 'RETUR'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Complaint / Purchase Retur</h1>
      </div>

      {/* Top Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left side - Search */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && handleViewModeChange(value as ViewMode)}
              >
                <ToggleGroupItem value="table" aria-label="Table view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="cards" aria-label="Card view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Filters */}
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="h-auto p-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Status filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <div className="space-y-2">
                        {statusOptions.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.status?.includes(status) || false}
                              onCheckedChange={(checked) => 
                                handleStatusFilter(status, checked as boolean)
                              }
                            />
                            <label htmlFor={`status-${status}`} className="text-sm">
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Type filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <div className="space-y-2">
                        {typeOptions.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={filters.type?.includes(type) || false}
                              onCheckedChange={(checked) => 
                                handleTypeFilter(type, checked as boolean)
                              }
                            />
                            <label htmlFor={`type-${type}`} className="text-sm">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Supplier filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Supplier</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uniqueSuppliers.map((supplier) => (
                          <div key={supplier} className="flex items-center space-x-2">
                            <Checkbox
                              id={`supplier-${supplier}`}
                              checked={filters.supplier?.includes(supplier) || false}
                              onCheckedChange={(checked) => 
                                handleSupplierFilter(supplier, checked as boolean)
                              }
                            />
                            <label htmlFor={`supplier-${supplier}`} className="text-sm">
                              {supplier}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Free Slab exclusion */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-free-slab"
                        checked={filters.excludeFreeSlab || false}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, excludeFreeSlab: checked as boolean }))
                        }
                      />
                      <label htmlFor="exclude-free-slab" className="text-sm">
                        Exclude Free Slab
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Columns (only for table view) */}
              {viewMode === 'table' && (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              )}
            </div>
          </div>

          {/* Bulk selection bar */}
          {complaints.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all items"
                  />
                  <label className="text-sm">
                    Select all {complaints.length} items
                  </label>
                </div>
                
                {hasSelection && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedIds.length} selected
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsStatusModalOpen(true)}
                    >
                      Update Status
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                          onClick={() => handleExport('csv')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Export CSV
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          onClick={() => handleExport('pdf')}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Export PDF
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Content based on view mode */}
          {viewMode === 'cards' ? (
            complaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    isSelected={selectedIds.includes(complaint.id)}
                    onToggleSelection={toggleSelection}
                    onView={handleView}
                    onEdit={handleEdit}
                    onPrint={handlePrint}
                    onDelete={handleDelete}
                    onQrCode={handleQrCode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-lg mb-2">
                  No complaints or returns found
                </div>
                <div className="text-gray-500 text-sm">
                  Try adjusting your search or filters
                </div>
              </div>
            )
          ) : (
            <ComplaintTable
              complaints={complaints}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onToggleSelectAll={toggleSelectAll}
              isAllSelected={isAllSelected}
              onView={handleView}
              onEdit={handleEdit}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleBulkStatusUpdate}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}