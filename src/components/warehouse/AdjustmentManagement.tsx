import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  AlertTriangle, 
  Wrench, 
  Scissors,
  Calculator,
  Search,
  Plus,
  Eye
} from 'lucide-react'
import { 
  WarehouseFilterParams, 
  AdjustmentSummary, 
  AdjustmentType 
} from '@/data/warehouse-types'
import { useAdjustments } from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataListView, ViewMode } from '@/components/ui/data-list-view'
import { AdjustmentCard } from '@/components/warehouse/cards'

interface AdjustmentManagementProps {
  filterParams: WarehouseFilterParams
}

const getAdjustmentIcon = (type: AdjustmentType) => {
  switch (type) {
    case 'COUNT_CORRECTION':
      return <Calculator className="h-4 w-4" />
    case 'DAMAGE':
      return <AlertTriangle className="h-4 w-4" />
    case 'UOM_CONVERSION':
      return <Settings className="h-4 w-4" />
    case 'FINISHING_CHANGE':
      return <Wrench className="h-4 w-4" />
    case 'CUTTING':
      return <Scissors className="h-4 w-4" />
    case 'LOST_FOUND':
      return <Search className="h-4 w-4" />
    case 'CYCLE_COUNT':
      return <Calculator className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

const getAdjustmentColor = (type: AdjustmentType) => {
  switch (type) {
    case 'COUNT_CORRECTION':
    case 'CYCLE_COUNT':
      return 'text-blue-600'
    case 'DAMAGE':
      return 'text-red-600'
    case 'UOM_CONVERSION':
      return 'text-purple-600'
    case 'FINISHING_CHANGE':
      return 'text-orange-600'
    case 'CUTTING':
      return 'text-gray-600'
    case 'LOST_FOUND':
      return 'text-green-600'
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

const formatAdjustmentType = (type: AdjustmentType) => {
  switch (type) {
    case 'COUNT_CORRECTION':
      return 'Count Correction'
    case 'DAMAGE':
      return 'Damage/Breakage'
    case 'UOM_CONVERSION':
      return 'UoM Conversion'
    case 'FINISHING_CHANGE':
      return 'Finishing Change'
    case 'CUTTING':
      return 'Cutting/Trimming'
    case 'LOST_FOUND':
      return 'Lost & Found'
    case 'CYCLE_COUNT':
      return 'Cycle Count'
    default:
      return type
  }
}

export function AdjustmentManagement({ filterParams }: AdjustmentManagementProps) {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<AdjustmentType | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  
  // Data queries
  const { data: adjustments = [], isLoading: adjustmentsLoading } = useAdjustments(filterParams)

  // Filter by selected type
  const filteredAdjustments = useMemo(() => {
    if (selectedType === 'ALL') return adjustments
    return adjustments.filter(adj => adj.adjType === selectedType)
  }, [adjustments, selectedType])

  // Table columns
  const adjustmentColumns: ColumnDef<AdjustmentSummary>[] = [
    {
      accessorKey: 'adjType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('adjType') as AdjustmentType
        return (
          <div className={`flex items-center space-x-2 ${getAdjustmentColor(type)}`}>
            {getAdjustmentIcon(type)}
            <span className="font-medium text-sm">
              {formatAdjustmentType(type)}
            </span>
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
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('location')}</Badge>
      )
    },
    {
      accessorKey: 'qtyDelta',
      header: 'Qty Delta',
      cell: ({ row }) => {
        const delta = row.getValue('qtyDelta') as number
        const color = delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-600'
        const sign = delta > 0 ? '+' : ''
        
        return (
          <div className={`text-right font-medium ${color}`}>
            {sign}{delta} {row.original.uom}
          </div>
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
            onClick={() => navigate(`/warehouse/adjustments/${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      )
    }
  ]

  const adjustmentTypes: Array<{ type: AdjustmentType | 'ALL'; label: string; icon: any }> = [
    { type: 'ALL', label: 'All Types', icon: Settings },
    { type: 'COUNT_CORRECTION', label: 'Count Correction', icon: Calculator },
    { type: 'DAMAGE', label: 'Damage', icon: AlertTriangle },
    { type: 'UOM_CONVERSION', label: 'UoM Conversion', icon: Settings },
    { type: 'FINISHING_CHANGE', label: 'Finishing Change', icon: Wrench },
    { type: 'CUTTING', label: 'Cutting', icon: Scissors },
    { type: 'LOST_FOUND', label: 'Lost & Found', icon: Search },
    { type: 'CYCLE_COUNT', label: 'Cycle Count', icon: Calculator }
  ]

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  // Card renderer for adjustments
  const renderAdjustmentCard = (item: AdjustmentSummary, index: number) => (
    <AdjustmentCard adjustment={item} index={index} />
  )

  if (adjustmentsLoading) {
    return <div className="p-6">Loading adjustments...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock Adjustments</h2>
          <p className="text-muted-foreground">
            Track and manage inventory adjustments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/warehouse/adjustments/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {adjustmentTypes.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="flex items-center space-x-1"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Adjustments Table */}
      <DataListView
        title={`Stock Adjustments (${filteredAdjustments.length})`}
        data={filteredAdjustments}
        columns={adjustmentColumns}
        searchPlaceholder="Search adjustments..."
        onExport={(format) => handleExport(filteredAdjustments, `warehouse-adjustments-${selectedType.toLowerCase()}`, format)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardRenderer={renderAdjustmentCard}
        defaultViewMode="table"
      />
    </div>
  )
}