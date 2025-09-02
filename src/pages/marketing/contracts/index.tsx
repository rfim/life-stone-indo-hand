import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useContractsApi } from '@/lib/api/marketing'
import { Contract, ContractStatus } from '@/types/marketing'
import { Plus, Eye, Edit, FileText, Archive } from 'lucide-react'

const getStatusColor = (status: ContractStatus) => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800'
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Archived':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ContractsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: contracts, isLoading } = useContractsApi.useList()

  const currentPage = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')

  const columns = [
    {
      accessorKey: 'code',
      header: 'Contract Code',
      cell: ({ row }: { row: { original: Contract } }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      )
    },
    {
      accessorKey: 'parties',
      header: 'Client',
      cell: ({ row }: { row: { original: Contract } }) => {
        const client = row.original.parties.find(p => p.role === 'Client')
        return <span className="font-medium">{client?.name || 'N/A'}</span>
      }
    },
    {
      accessorKey: 'scope',
      header: 'Scope',
      cell: ({ row }: { row: { original: Contract } }) => (
        <span className="truncate max-w-xs">{row.original.scope}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Contract } }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'validity',
      header: 'Valid Until',
      cell: ({ row }: { row: { original: Contract } }) => (
        <span>{formatDate(row.original.validity.endDate, 'MMM dd, yyyy')}</span>
      )
    },
    {
      accessorKey: 'soId',
      header: 'Sales Order',
      cell: ({ row }: { row: { original: Contract } }) => (
        row.original.soId ? (
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => navigate(`/marketing/sales-orders/${row.original.soId}/view`)}
          >
            {row.original.soId}
          </Button>
        ) : (
          <span className="text-gray-400">Standalone</span>
        )
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: { original: Contract } }) => formatDate(row.original.createdAt, 'MMM dd, yyyy')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: Contract } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/contracts/${row.original.id}/view`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/contracts/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.original.status === 'Draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/api/pdf/contracts/${row.original.id}.pdf`, '_blank')}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
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
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-gray-600">Manage customer contracts and agreements</p>
        </div>
        <Button onClick={() => navigate('/marketing/contracts/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      <DataTable
        data={contracts || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          total: contracts?.length || 0,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        searchable={true}
        searchPlaceholder="Search contracts..."
      />
    </div>
  )
}