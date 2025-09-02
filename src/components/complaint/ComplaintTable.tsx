import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Complaint } from '@/types/complaint';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit,
  Printer,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface ComplaintTableProps {
  complaints: Complaint[];
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPrint?: (id: string) => void;
  onDelete?: (id: string) => void;
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'COMPLAINT': return 'destructive';
    case 'RETUR': return 'secondary';
    default: return 'secondary';
  }
};

export function ComplaintTable({
  complaints,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  isAllSelected,
  onView,
  onEdit,
  onPrint,
  onDelete
}: ComplaintTableProps) {
  
  const columns: ColumnDef<Complaint>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={() => onToggleSelection(row.original.id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('code')}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={getTypeColor(row.getValue('type'))}>
          {row.getValue('type')}
        </Badge>
      ),
    },
    {
      accessorKey: 'supplier',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {row.getValue('supplier')}
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.getValue('reason')}
        </div>
      ),
    },
    {
      accessorKey: 'qty',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Qty (UoM)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.qty} {row.original.uom}
        </div>
      ),
    },
    {
      accessorKey: 'nominal',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Nominal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-600">
          {formatCurrency(row.original.nominal, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.getValue('status'))}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'ageDays',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Age (days)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue('ageDays')}
        </div>
      ),
    },
    {
      id: 'references',
      header: 'PO/GRN Ref',
      cell: ({ row }) => {
        const { ref } = row.original;
        return (
          <div className="text-sm">
            {ref.poCode && (
              <div className="font-mono">{ref.poCode}</div>
            )}
            {ref.grnCode && (
              <div className="font-mono text-gray-600">{ref.grnCode}</div>
            )}
            {!ref.poCode && !ref.grnCode && (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {dayjs(row.getValue('createdAt')).format('MMM DD, YYYY')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const complaint = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(complaint.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(complaint.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
              )}
              {onPrint && (
                <DropdownMenuItem onClick={() => onPrint(complaint.id)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(complaint.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-gray-400 text-lg mb-2">
          Table view would render here — switch to Cards to see sample data.
        </div>
        <div className="text-gray-500 text-sm">
          No complaints or returns found. Create a new one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* This would be replaced with actual DataTable implementation */}
      <div className="text-sm text-gray-600">
        Table view with {complaints.length} items (Table implementation would go here)
      </div>
    </div>
  );
}