import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { usePriceListsApi } from '@/lib/api/marketing'
import { PriceList } from '@/types/marketing'
import { Plus, Eye, Edit, DollarSign, Calendar } from 'lucide-react'

export function PriceListsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: priceLists, isLoading } = usePriceListsApi.useList()

  const currentPage = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')

  const columns = [
    {
      accessorKey: 'name',
      header: 'Price List Name',
      cell: ({ row }: { row: { original: PriceList } }) => (
        <span className="font-medium">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'effectiveFrom',
      header: 'Effective From',
      cell: ({ row }: { row: { original: PriceList } }) => (
        <span>{formatDate(row.original.effectiveFrom, 'MMM dd, yyyy')}</span>
      )
    },
    {
      accessorKey: 'effectiveTo',
      header: 'Effective To',
      cell: ({ row }: { row: { original: PriceList } }) => (
        row.original.effectiveTo ? (
          <span>{formatDate(row.original.effectiveTo, 'MMM dd, yyyy')}</span>
        ) : (
          <Badge variant="outline">Ongoing</Badge>
        )
      )
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }: { row: { original: PriceList } }) => (
        <span>{row.original.items.length} item{row.original.items.length !== 1 ? 's' : ''}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: { row: { original: PriceList } }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: { original: PriceList } }) => formatDate(row.original.createdAt, 'MMM dd, yyyy')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: PriceList } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/price-lists/${row.original.id}/view`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/price-lists/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString())
      return prev
    })
  }

  const handlePageSizeChange = (size: number) => {
    setSearchParams(prev => {
      prev.set('pageSize', size.toString())
      prev.set('page', '1')
      return prev
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Price Lists</h1>
          <p className="text-gray-600">Manage versioned price lists and product pricing</p>
        </div>
        <Button onClick={() => navigate('/marketing/price-lists/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Price List
        </Button>
      </div>

      <DataTable
        data={priceLists || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          total: priceLists?.length || 0,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        searchable={true}
        searchPlaceholder="Search price lists..."
      />
    </div>
  )
}