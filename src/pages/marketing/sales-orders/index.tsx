import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { SalesOrder, SOStatus } from '@/types/marketing'
import { useSalesOrdersApi } from '@/lib/api/marketing'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const getStatusIcon = (status: SOStatus) => {
  switch (status) {
    case 'Draft':
      return <Clock className="h-3 w-3" />
    case 'Submitted':
      return <AlertCircle className="h-3 w-3" />
    case 'DirectorApproved':
      return <CheckCircle className="h-3 w-3" />
    case 'DirectorRejected':
      return <XCircle className="h-3 w-3" />
    case 'Confirmed':
      return <CheckCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

const getStatusColor = (status: SOStatus) => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'Submitted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'DirectorApproved':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'DirectorRejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'Confirmed':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function SalesOrdersPage() {
  const navigate = useNavigate()

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'code',
      header: 'SO Number',
      cell: ({ row }) => {
        return <span className="font-mono font-medium">{row.original.code}</span>
      }
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }) => {
        // TODO: Lookup customer name from customer ID
        return <span className="font-medium">Customer {row.original.customerId.slice(-4)}</span>
      }
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => {
        return row.original.projectId ? (
          <span>Project {row.original.projectId.slice(-4)}</span>
        ) : (
          <span className="text-muted-foreground">No project</span>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1">{status}</span>
          </Badge>
        )
      }
    },
    {
      accessorKey: 'lines',
      header: 'Items',
      cell: ({ row }) => {
        const lineCount = row.original.lines?.length || 0
        return <span>{lineCount} item{lineCount !== 1 ? 's' : ''}</span>
      }
    },
    {
      accessorKey: 'top',
      header: 'TOP',
      cell: ({ row }) => {
        return <span>{row.original.top} days</span>
      }
    },
    {
      accessorKey: 'isPPN',
      header: 'Tax',
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isPPN ? 'default' : 'secondary'}>
            {row.original.isPPN ? 'PPN' : 'Non-PPN'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), 'MMM dd, yyyy')
      }
    }
  ]

  const handleCreate = () => {
    navigate('/marketing/sales-orders/create')
  }

  const handleRowClick = (salesOrder: SalesOrder) => {
    navigate(`/marketing/sales-orders/${salesOrder.id}/view`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and approvals</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Sales Order
        </Button>
      </div>

      <DataTable
        entity="sales-orders"
        title="Sales Orders"
        subtitle="Track and manage customer sales orders"
        icon={ShoppingCart}
        columns={columns}
        useEntityHooks={useSalesOrdersApi}
        onRowClick={handleRowClick}
        showActions={true}
        showCreate={true}
      />
    </div>
  )
}