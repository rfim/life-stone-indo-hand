import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Search,
  Filter,
  Settings,
  List,
  Grid3X3,
  MoreVertical,
  Eye,
  Edit,
  Printer,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Simple demo data matching the specifications
const demoData = [
  {
    id: 'cmp_9001',
    code: 'CMP-2025-021',
    type: 'COMPLAINT',
    supplier: 'Mentari Stone',
    reason: 'Sample Item 1',
    sku: 'CRR-A12',
    qty: 150,
    uom: 'units',
    nominal: 2500000,
    currency: 'IDR',
    status: 'Opened',
    ageDays: 2,
    isFreeSlab: false,
    createdAt: '2025-08-30T03:00:00Z',
    ref: { poCode: 'PO-2025-010', grnCode: 'GRN-2025-030' }
  },
  {
    id: 'cmp_9002',
    code: 'CMP-2025-022',
    type: 'RETUR',
    supplier: 'Cipta Marmer Alam',
    reason: 'Ujung batu retak',
    sku: 'BLK-K2',
    qty: 4,
    uom: 'SLAB',
    nominal: 2000000,
    currency: 'IDR',
    status: 'Acknowledged',
    ageDays: 1,
    isFreeSlab: false,
    createdAt: '2025-08-31T09:00:00Z',
    ref: { poCode: 'PO-2025-013' }
  },
  {
    id: 'cmp_9003',
    code: 'CMP-2025-023',
    type: 'COMPLAINT',
    supplier: 'Global Granite',
    reason: 'Free slab gores (free slab)',
    sku: 'CRR-A12',
    qty: 1,
    uom: 'SLAB',
    nominal: 0,
    currency: 'IDR',
    status: 'Resolved',
    ageDays: 3,
    isFreeSlab: true,
    createdAt: '2025-08-29T08:00:00Z',
    ref: { grnCode: 'GRN-2025-031' }
  }
];

function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Opened': return 'destructive';
    case 'Acknowledged': return 'secondary';  
    case 'Resolved': return 'default';
    case 'Closed': return 'outline';
    default: return 'secondary';
  }
};

function ComplaintCardDemo({ complaint, isSelected, onToggleSelection }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        {/* Header row with checkbox, title, and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.(complaint.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight mb-1 text-gray-900">
                {complaint.reason}
              </h3>
              <p className="text-sm text-gray-600">
                {complaint.supplier} • Created {complaint.ageDays} days ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={getStatusColor(complaint.status)}>
              {complaint.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quantity and Value row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Quantity</p>
            <p className="text-xl font-bold text-gray-900">
              {complaint.qty} {complaint.uom}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Value</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrencyIDR(complaint.nominal)}
            </p>
          </div>
        </div>

        {/* Free slab badge */}
        {complaint.isFreeSlab && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              Free Slab (Excluded from metrics)
            </Badge>
          </div>
        )}

        {/* Show More section */}
        <div className="border-t pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2 h-8 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show More
              </>
            )}
          </Button>
          
          {isExpanded && (
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Code</p>
                  <p className="font-medium font-mono">{complaint.code}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Type</p>
                  <Badge variant={complaint.type === 'COMPLAINT' ? 'destructive' : 'secondary'}>
                    {complaint.type}
                  </Badge>
                </div>
                
                {complaint.sku && (
                  <div>
                    <p className="text-gray-500 mb-1">SKU</p>
                    <p className="font-medium">{complaint.sku}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500 mb-1">Age</p>
                  <p className="font-medium">{complaint.ageDays} days</p>
                </div>
              </div>

              {/* References */}
              {(complaint.ref?.poCode || complaint.ref?.grnCode) && (
                <div>
                  <p className="text-gray-500 mb-2 text-sm">References</p>
                  <div className="space-y-1">
                    {complaint.ref.poCode && (
                      <p className="text-sm">
                        <span className="text-gray-500">PO:</span> 
                        <span className="font-mono ml-2">{complaint.ref.poCode}</span>
                      </p>
                    )}
                    {complaint.ref.grnCode && (
                      <p className="text-sm">
                        <span className="text-gray-500">GRN:</span> 
                        <span className="font-mono ml-2">{complaint.ref.grnCode}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TableViewDemo() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-400 text-lg mb-2">
        Table view would render here — switch to Cards to see sample data.
      </div>
      <div className="text-gray-500 text-sm">
        Complete table implementation with sortable columns, filters, and pagination would be displayed here.
      </div>
    </div>
  );
}

export function ComplaintListDemo() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === demoData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(demoData.map(item => item.id));
    }
  };

  const isAllSelected = selectedIds.length === demoData.length && demoData.length > 0;

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
                onValueChange={(value) => value && setViewMode(value as 'table' | 'cards')}
              >
                <ToggleGroupItem value="table" aria-label="Table view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="cards" aria-label="Card view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Filters */}
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

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
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all items"
                />
                <label className="text-sm">
                  Select all {demoData.length} items
                </label>
              </div>
              
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedIds.length} selected
                  </Badge>
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Content based on view mode */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {demoData.map((complaint) => (
                <ComplaintCardDemo
                  key={complaint.id}
                  complaint={complaint}
                  isSelected={selectedIds.includes(complaint.id)}
                  onToggleSelection={toggleSelection}
                />
              ))}
            </div>
          ) : (
            <TableViewDemo />
          )}
        </CardContent>
      </Card>
    </div>
  );
}