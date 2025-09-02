import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowRight,
  Eye,
  Plus,
  FileText
} from 'lucide-react'
import { WarehouseFilterParams, MovementSummary, MovementType } from '@/data/warehouse-types'
import { useMovements } from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

interface MovementManagementProps {
  filterParams: WarehouseFilterParams
}

const getMovementIcon = (type: MovementType) => {
  switch (type) {
    case 'INBOUND':
      return <ArrowDown className="h-4 w-4" />
    case 'OUTBOUND':
      return <ArrowUp className="h-4 w-4" />
    case 'TRANSFER':
      return <ArrowRight className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getMovementColor = (type: MovementType) => {
  switch (type) {
    case 'INBOUND':
      return 'text-green-600'
    case 'OUTBOUND':
      return 'text-red-600'
    case 'TRANSFER':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Posted':
      return 'default'
    case 'Approved':
      return 'secondary'
    case 'Draft':
      return 'outline'
    case 'Canceled':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function MovementManagement({ filterParams }: MovementManagementProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: movements = [], isLoading: movementsLoading } = useMovements(filterParams)

  // Table columns
  const movementColumns: ColumnDef<MovementSummary>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as MovementType
        return (
          <div className={`flex items-center space-x-2 ${getMovementColor(type)}`}>
            {getMovementIcon(type)}
            <span className="font-medium">{type}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'skuCode',
      header: 'SKU Code',
      cell: ({ row }) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {row.getValue('skuCode')}
        </code>
      )
    },
    {
      accessorKey: 'skuName',
      header: 'SKU Name'
    },
    {
      accessorKey: 'qty',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.getValue('qty')} {row.original.uom}
        </div>
      )
    },
    {
      accessorKey: 'fromLocation',
      header: 'From',
      cell: ({ row }) => {
        const fromLocation = row.getValue('fromLocation') as string
        return fromLocation ? (
          <Badge variant="outline">{fromLocation}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    },
    {
      accessorKey: 'toLocation',
      header: 'To',
      cell: ({ row }) => {
        const toLocation = row.getValue('toLocation') as string
        return toLocation ? (
          <Badge variant="outline">{toLocation}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={getStatusColor(status)}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className="text-sm">
            {format(date, 'MMM dd, yyyy')}
            <div className="text-xs text-gray-500">
              {format(date, 'HH:mm')}
            </div>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/warehouse/movements/${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      )
    }
  ]

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (movementsLoading) {
    return <div className="p-6">Loading movements...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock Movements</h2>
          <p className="text-muted-foreground">
            Track and manage all stock movements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/warehouse/movements/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Movement
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/movements?type=INBOUND')}
        >
          <ArrowDown className="h-4 w-4 mr-1 text-green-600" />
          Inbound
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/movements?type=OUTBOUND')}
        >
          <ArrowUp className="h-4 w-4 mr-1 text-red-600" />
          Outbound
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/movements?type=TRANSFER')}
        >
          <ArrowRight className="h-4 w-4 mr-1 text-blue-600" />
          Transfer
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/movements?status=Draft')}
        >
          Draft
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/movements?status=Approved')}
        >
          Approved
        </Button>
      </div>

      {/* Movements Table */}
      <DataTable
        title={`Stock Movements (${movements.length})`}
        data={movements}
        columns={movementColumns}
        searchPlaceholder="Search movements..."
        onExport={(format) => handleExport(movements, 'warehouse-movements', format)}
      />
    </div>
  )
}