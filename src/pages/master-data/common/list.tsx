import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit } from 'lucide-react';
import { formatDate } from './util';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface MasterListProps<T> {
  title: string;
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  columns: Column<T>[];
  isLoading?: boolean;
}

export function MasterList<T extends { id: string; code: string; name: string; active: boolean; updatedAt: string }>({
  title,
  rows,
  total,
  page,
  pageSize,
  searchQuery,
  onPageChange,
  onSearch,
  onCreate,
  onEdit,
  columns,
  isLoading = false
}: MasterListProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                Manage {title.toLowerCase()} master data
              </CardDescription>
            </div>
            <Button onClick={onCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code or name..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={String(column.key)}>{column.header}</TableHead>
                    ))}
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        {columns.map((column) => (
                          <TableCell key={String(column.key)}>
                            {column.render ? column.render(row) : String(row[column.key as keyof T] || '')}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {total === 0 ? 'Showing 0 to 0 of 0 entries' : `Showing ${startIndex} to ${endIndex} of ${total} entries`}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default columns for common master data fields
export const getDefaultColumns = <T extends { id: string; code: string; name: string; active: boolean; updatedAt: string }>(): Column<T>[] => [
  {
    key: 'code',
    header: 'Code'
  },
  {
    key: 'name',
    header: 'Name'
  },
  {
    key: 'active',
    header: 'Status',
    render: (row: T) => (
      <Badge variant={row.active ? 'default' : 'secondary'}>
        {row.active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    render: (row: T) => formatDate(row.updatedAt, 'dd/MM/yyyy HH:mm')
  }
];