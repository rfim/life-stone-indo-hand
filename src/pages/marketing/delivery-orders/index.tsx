import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useDeliveryOrdersApi } from '@/lib/api/marketing'
import { DeliveryOrder, DOStatus } from '@/types/marketing'
import { Plus, Eye, Edit, Package, Truck } from 'lucide-react'

const getStatusColor = (status: DOStatus) => {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-800'
    case 'Issued': return 'bg-blue-100 text-blue-800'
    case 'InTransit': return 'bg-yellow-100 text-yellow-800'
    case 'Delivered': return 'bg-green-100 text-green-800'
    case 'Closed': return 'bg-gray-100 text-gray-800'
    case 'Canceled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function DeliveryOrdersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: deliveryOrders, isLoading } = useDeliveryOrdersApi.useList()

  const columns = [
    {
      accessorKey: 'code',
      header: 'DO Code',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      )
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <span className="font-medium">{row.original.customerId}</span>
      )
    },
    {
      accessorKey: 'soId',
      header: 'Sales Order',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => navigate(`/marketing/sales-orders/${row.original.soId}/view`)}
        >
          {row.original.soId}
        </Button>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'lines',
      header: 'Items',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <span>{row.original.lines.length} item{row.original.lines.length !== 1 ? 's' : ''}</span>
      )
    },
    {
      accessorKey: 'externalExpedition',
      header: 'Expedition',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        row.original.externalExpedition?.enabled ? (
          <Badge variant="outline">
            <Truck className="h-3 w-3 mr-1" />
            {row.original.externalExpedition.carrier || 'External'}
          </Badge>
        ) : (
          <span className="text-gray-400">Internal</span>
        )
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => formatDate(row.original.createdAt, 'MMM dd, yyyy')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: DeliveryOrder } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/delivery-orders/${row.original.id}/view`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/delivery-orders/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Orders</h1>
          <p className="text-gray-600">Manage delivery orders and shipments</p>
        </div>
        <Button onClick={() => navigate('/marketing/delivery-orders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Delivery Order
        </Button>
      </div>

      <DataTable
        data={deliveryOrders || []}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Search delivery orders..."
      />
    </div>
  )
}