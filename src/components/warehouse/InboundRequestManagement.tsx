import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Eye,
  Plus,
  Calendar,
  Package
} from 'lucide-react'
import { 
  WarehouseFilterParams, 
  InboundRequest, 
  InboundRequestStatus 
} from '@/data/warehouse-types'
import { useInboundRequests } from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

interface InboundRequestManagementProps {
  filterParams: WarehouseFilterParams
}

const getStatusColor = (status: InboundRequestStatus) => {
  switch (status) {
    case 'Closed':
      return 'default'
    case 'Putaway':
      return 'secondary'
    case 'Arrived':
      return 'secondary'
    case 'Scheduled':
      return 'outline'
    case 'Planned':
      return 'outline'
    default:
      return 'outline'
  }
}

const getStatusIcon = (status: InboundRequestStatus) => {
  switch (status) {
    case 'Closed':
      return '✅'
    case 'Putaway':
      return '📦'
    case 'Arrived':
      return '🚛'
    case 'Scheduled':
      return '📅'
    case 'Planned':
      return '📝'
    default:
      return '📋'
  }
}

const getReadyColor = (ready: boolean) => ready ? 'text-green-600' : 'text-red-600'
const getReadyIcon = (ready: boolean) => ready ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />

export function InboundRequestManagement({ filterParams }: InboundRequestManagementProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: inboundRequests = [], isLoading: requestsLoading } = useInboundRequests(filterParams)

  // Mock function to simulate notifying purchasing
  const notifyPurchasing = (requestId: string, message: string) => {
    console.log(`Notify Purchasing - Request ${requestId}: ${message}`)
    alert(`Notification sent to Purchasing team: ${message}`)
  }

  // Table columns
  const requestColumns: ColumnDef<InboundRequest>[] = [
    {
      accessorKey: 'code',
      header: 'Request Code',
      cell: ({ row }) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
          {row.getValue('code')}
        </code>
      )
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue('supplierName') || 'Unknown Supplier'}
        </div>
      )
    },
    {
      accessorKey: 'refPO',
      header: 'Reference PO',
      cell: ({ row }) => {
        const refPO = row.getValue('refPO') as string
        return refPO ? (
          <Badge variant="outline">{refPO}</Badge>
        ) : (
          <span className="text-gray-400">No PO</span>
        )
      }
    },
    {
      accessorKey: 'etaDate',
      header: 'ETA',
      cell: ({ row }) => {
        const etaDate = row.getValue('etaDate') as string
        if (!etaDate) return <span className="text-gray-400">No ETA</span>
        
        const eta = parseISO(etaDate)
        const now = new Date()
        const daysUntil = differenceInDays(eta, now)
        
        let color = 'text-gray-700'
        if (daysUntil < 0) color = 'text-red-600'
        else if (daysUntil <= 1) color = 'text-orange-600'
        else if (daysUntil <= 3) color = 'text-yellow-600'
        
        return (
          <div className={`flex items-center space-x-1 text-sm ${color}`}>
            <Calendar className="h-4 w-4" />
            <div>
              <div>{format(eta, 'MMM dd, yyyy')}</div>
              <div className="text-xs">
                {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                 daysUntil === 0 ? 'Today' :
                 `${daysUntil} days`}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const items = row.getValue('items') as InboundRequest['items']
        const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
        
        return (
          <div className="text-sm">
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{items.length} item(s)</span>
            </div>
            <div className="text-xs text-gray-500">
              Total: {totalQty} units
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'warehouseReady',
      header: 'Warehouse Ready',
      cell: ({ row }) => {
        const ready = row.getValue('warehouseReady') as boolean
        return (
          <div className={`flex items-center space-x-2 ${getReadyColor(ready)}`}>
            {getReadyIcon(ready)}
            <span className="font-medium">{ready ? 'Ready' : 'Not Ready'}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as InboundRequestStatus
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/warehouse/inbound-requests/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {request.status === 'Planned' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => notifyPurchasing(request.id, 'ETA confirmation needed')}
              >
                <Bell className="h-4 w-4 mr-1" />
                Notify
              </Button>
            )}
            
            {request.status === 'Arrived' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/warehouse/movements/create?from=inbound&requestId=${request.id}`)}
              >
                <Truck className="h-4 w-4 mr-1" />
                Receive
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  // Statistics
  const requestStats = useMemo(() => {
    const stats = inboundRequests.reduce((acc, req) => {
      acc.total++
      acc.byStatus[req.status] = (acc.byStatus[req.status] || 0) + 1
      
      if (req.warehouseReady) acc.warehouseReady++
      
      if (req.etaDate) {
        const eta = parseISO(req.etaDate)
        const now = new Date()
        const daysUntil = differenceInDays(eta, now)
        
        if (daysUntil <= 3 && daysUntil >= 0) acc.etaWithin3Days++
        if (daysUntil < 0 && req.status !== 'Closed') acc.overdue++
      }
      
      return acc
    }, {
      total: 0,
      warehouseReady: 0,
      etaWithin3Days: 0,
      overdue: 0,
      byStatus: {} as Record<InboundRequestStatus, number>
    })
    
    return stats
  }, [inboundRequests])

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  const handleToggleReady = (requestId: string, currentReady: boolean) => {
    const newReady = !currentReady
    console.log(`Toggle warehouse ready for ${requestId}: ${newReady}`)
    // In a real app, this would make an API call
    alert(`Warehouse ready status updated to: ${newReady ? 'Ready' : 'Not Ready'}`)
  }

  if (requestsLoading) {
    return <div className="p-6">Loading inbound requests...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Request Barang Masuk</h2>
          <p className="text-muted-foreground">
            Manage incoming inventory requests and notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/warehouse/inbound-requests/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold">{requestStats.total}</p>
            </div>
            <div className="text-gray-400">📦</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warehouse Ready</p>
              <p className="text-2xl font-bold text-green-600">{requestStats.warehouseReady}</p>
            </div>
            <div className="text-green-500">✅</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ETA ≤ 3 Days</p>
              <p className="text-2xl font-bold text-orange-600">{requestStats.etaWithin3Days}</p>
            </div>
            <div className="text-orange-500">🚛</div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{requestStats.overdue}</p>
            </div>
            <div className="text-red-500">⚠️</div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/inbound-requests?status=Planned')}
        >
          <Clock className="h-4 w-4 mr-1" />
          Planned
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/inbound-requests?status=Scheduled')}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Scheduled
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/inbound-requests?status=Arrived')}
        >
          <Truck className="h-4 w-4 mr-1" />
          Arrived
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/warehouse/inbound-requests?ready=false')}
        >
          <XCircle className="h-4 w-4 mr-1 text-red-600" />
          Not Ready
        </Button>
      </div>

      {/* Requests Table */}
      <DataTable
        title={`Inbound Requests (${inboundRequests.length})`}
        data={inboundRequests}
        columns={requestColumns}
        searchPlaceholder="Search requests..."
        onExport={(format) => handleExport(inboundRequests, 'warehouse-inbound-requests', format)}
      />
    </div>
  )
}