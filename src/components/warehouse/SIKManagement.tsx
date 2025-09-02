import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wrench, 
  Scissors, 
  QrCode,
  Eye,
  Plus,
  Printer,
  User,
  Calendar
} from 'lucide-react'
import { WarehouseFilterParams, SIK, SIKType, SIKStatus } from '@/data/warehouse-types'
import { useSIKs } from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

interface SIKManagementProps {
  filterParams: WarehouseFilterParams
}

const getSIKIcon = (type: SIKType) => {
  switch (type) {
    case 'FINISHING_CHANGE':
      return <Wrench className="h-4 w-4" />
    case 'CUTTING':
      return <Scissors className="h-4 w-4" />
    default:
      return <Wrench className="h-4 w-4" />
  }
}

const getSIKColor = (type: SIKType) => {
  switch (type) {
    case 'FINISHING_CHANGE':
      return 'text-orange-600'
    case 'CUTTING':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusColor = (status: SIKStatus) => {
  switch (status) {
    case 'Done':
      return 'default'
    case 'InProgress':
      return 'secondary'
    case 'Issued':
      return 'outline'
    case 'Draft':
      return 'outline'
    case 'Canceled':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getStatusIcon = (status: SIKStatus) => {
  switch (status) {
    case 'InProgress':
      return '🔄'
    case 'Done':
      return '✅'
    case 'Issued':
      return '📋'
    case 'Draft':
      return '📝'
    case 'Canceled':
      return '❌'
    default:
      return '📋'
  }
}

export function SIKManagement({ filterParams }: SIKManagementProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: siks = [], isLoading: siksLoading } = useSIKs(filterParams)

  // Table columns
  const sikColumns: ColumnDef<SIK>[] = [
    {
      accessorKey: 'code',
      header: 'SIK Code',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
            {row.getValue('code')}
          </code>
          {row.original.qrPayload && (
            <QrCode className="h-4 w-4 text-gray-500" />
          )}
        </div>
      )
    },
    {
      accessorKey: 'sikType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('sikType') as SIKType
        return (
          <div className={`flex items-center space-x-2 ${getSIKColor(type)}`}>
            {getSIKIcon(type)}
            <span className="font-medium">
              {type === 'FINISHING_CHANGE' ? 'Finishing Change' : 'Cutting'}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const items = row.getValue('items') as SIK['items']
        return (
          <div className="text-sm">
            <div className="font-medium">{items.length} item(s)</div>
            <div className="text-gray-500 text-xs">
              {items.map(item => `${item.qty} ${item.uom}`).join(', ')}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const assignedTo = row.getValue('assignedTo') as string
        return assignedTo ? (
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )
      }
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.getValue('dueDate') as string
        if (!dueDate) return <span className="text-gray-400">No due date</span>
        
        const date = new Date(dueDate)
        const isOverdue = date < new Date()
        
        return (
          <div className={`flex items-center space-x-1 text-sm ${
            isOverdue ? 'text-red-600' : 'text-gray-700'
          }`}>
            <Calendar className="h-4 w-4" />
            <span>{format(date, 'MMM dd, yyyy')}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as SIKStatus
        return (
          <div className="flex items-center space-x-2">
            <span>{getStatusIcon(status)}</span>
            <Badge variant={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
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
            onClick={() => navigate(`/warehouse/siks/${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {row.original.printUrl && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(row.original.printUrl, '_blank')}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          )}
        </div>
      )
    }
  ]

  // Statistics
  const sikStats = useMemo(() => {
    const stats = siks.reduce((acc, sik) => {
      acc.total++
      acc.byStatus[sik.status] = (acc.byStatus[sik.status] || 0) + 1
      acc.byType[sik.sikType] = (acc.byType[sik.sikType] || 0) + 1
      
      if (sik.dueDate) {
        const dueDate = new Date(sik.dueDate)
        const now = new Date()
        if (dueDate < now && sik.status !== 'Done' && sik.status !== 'Canceled') {
          acc.overdue++
        }
      }
      
      return acc
    }, {
      total: 0,
      overdue: 0,
      byStatus: {} as Record<SIKStatus, number>,
      byType: {} as Record<SIKType, number>
    })
    
    return stats
  }, [siks])

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (siksLoading) {
    return <div className="p-6">Loading SIKs...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Surat Instruksi Kerja (SIK)</h2>
          <p className="text-muted-foreground">
            Work instructions for finishing changes and cutting operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/warehouse/siks/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New SIK
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total SIKs</p>
              <p className="text-2xl font-bold">{sikStats.total}</p>
            </div>
            <div className="text-gray-400">📋</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{sikStats.byStatus.InProgress || 0}</p>
            </div>
            <div className="text-blue-500">🔄</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{sikStats.overdue}</p>
            </div>
            <div className="text-red-500">⚠️</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{sikStats.byStatus.Done || 0}</p>
            </div>
            <div className="text-green-500">✅</div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/siks?type=FINISHING_CHANGE')}
        >
          <Wrench className="h-4 w-4 mr-1 text-orange-600" />
          Finishing Change
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/siks?type=CUTTING')}
        >
          <Scissors className="h-4 w-4 mr-1 text-gray-600" />
          Cutting
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/siks?status=InProgress')}
        >
          In Progress
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/siks?overdue=true')}
        >
          Overdue
        </Button>
      </div>

      {/* SIK Table */}
      <DataTable
        title={`Work Instructions (${siks.length})`}
        data={siks}
        columns={sikColumns}
        searchPlaceholder="Search SIKs..."
        onExport={(format) => handleExport(siks, 'warehouse-siks', format)}
      />
    </div>
  )
}