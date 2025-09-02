import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowUp,
  ArrowDown,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Download
} from 'lucide-react'
import { WarehouseFilterParams, StockCardRow } from '@/data/warehouse-types'
import { 
  useStockCard,
  useSKUs,
  useInventory 
} from '@/hooks/warehouse/useWarehouseQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

export function StockCard() {
  const { skuId } = useParams<{ skuId: string }>()
  const navigate = useNavigate()
  
  if (!skuId) {
    return <div className="p-6">SKU ID is required</div>
  }

  // Data queries
  const filterParams: WarehouseFilterParams = {} // Can be extended with filters
  const { data: stockCards = [], isLoading: stockCardsLoading } = useStockCard(skuId, filterParams)
  const { data: skus = [] } = useSKUs({ skuIds: [skuId] })
  const { data: inventory = [] } = useInventory({ skuIds: [skuId] })

  const sku = skus.find(s => s.id === skuId)
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalInbound = stockCards
      .filter(card => card.type === '+')
      .reduce((sum, card) => sum + card.qty, 0)
    
    const totalOutbound = stockCards
      .filter(card => card.type === '-')
      .reduce((sum, card) => sum + Math.abs(card.qty), 0)
    
    const currentBalance = stockCards.length > 0 ? stockCards[0].balanceAfter : 0
    
    const inventoryByLocation = inventory.reduce((acc, inv) => {
      acc[inv.locationName] = {
        onHand: inv.onHand,
        reserved: inv.reserved,
        available: inv.available
      }
      return acc
    }, {} as Record<string, { onHand: number; reserved: number; available: number }>)
    
    return {
      totalInbound,
      totalOutbound,
      currentBalance,
      inventoryByLocation,
      transactionCount: stockCards.length
    }
  }, [stockCards, inventory])

  // Table columns
  const stockCardColumns: ColumnDef<StockCardRow>[] = [
    {
      accessorKey: 'ts',
      header: 'Date & Time',
      cell: ({ row }) => {
        const date = new Date(row.getValue('ts'))
        return (
          <div className="text-sm">
            <div className="font-medium">{format(date, 'MMM dd, yyyy')}</div>
            <div className="text-xs text-gray-500">{format(date, 'HH:mm:ss')}</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'refType',
      header: 'Reference',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.getValue('refType')}</div>
          <div className="text-xs text-gray-500">{row.original.refId}</div>
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as '+' | '-'
        return (
          <div className={`flex items-center space-x-2 ${
            type === '+' ? 'text-green-600' : 'text-red-600'
          }`}>
            {type === '+' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span className="font-medium">{type === '+' ? 'IN' : 'OUT'}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'qty',
      header: 'Quantity',
      cell: ({ row }) => {
        const qty = row.getValue('qty') as number
        const type = row.original.type
        const color = type === '+' ? 'text-green-600' : 'text-red-600'
        
        return (
          <div className={`text-right font-medium ${color}`}>
            {type === '+' ? '+' : ''}{qty} {row.original.uom}
          </div>
        )
      }
    },
    {
      accessorKey: 'balanceAfter',
      header: 'Balance After',
      cell: ({ row }) => (
        <div className="text-right font-bold text-blue-600">
          {row.getValue('balanceAfter')} {row.original.uom}
        </div>
      )
    },
    {
      accessorKey: 'locationId',
      header: 'Location',
      cell: ({ row }) => {
        const locationId = row.getValue('locationId') as string
        return locationId ? (
          <Badge variant="outline">{locationId}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    },
    {
      accessorKey: 'finishing',
      header: 'Finishing',
      cell: ({ row }) => {
        const finishing = row.getValue('finishing') as string
        return finishing ? (
          <Badge variant="secondary">{finishing}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => {
        const note = row.getValue('note') as string
        return note ? (
          <div className="text-sm text-gray-600 max-w-xs truncate" title={note}>
            {note}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    }
  ]

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (stockCardsLoading) {
    return <div className="p-6">Loading stock card...</div>
  }

  if (!sku) {
    return <div className="p-6">SKU not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stock Card</h1>
            <p className="text-muted-foreground">
              Chronological ledger for {sku.code} - {sku.name}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => handleExport(stockCards, `stock-card-${sku.code}`, 'csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* SKU Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>SKU Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">SKU Code</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                {sku.code}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{sku.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">UOM</p>
              <Badge variant="outline">{sku.uom}</Badge>
            </div>
            {sku.description && (
              <div className="md:col-span-3">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm">{sku.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.currentBalance} {sku.uom}
                </p>
              </div>
              <div className="text-blue-500">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inbound</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.totalInbound} {sku.uom}
                </p>
              </div>
              <div className="text-green-500">
                <ArrowDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outbound</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.totalOutbound} {sku.uom}
                </p>
              </div>
              <div className="text-red-500">
                <ArrowUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">
                  {summary.transactionCount}
                </p>
              </div>
              <div className="text-gray-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Inventory by Location */}
      {Object.keys(summary.inventoryByLocation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Current Inventory by Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summary.inventoryByLocation).map(([location, inv]) => (
                <div key={location} className="border rounded-lg p-4">
                  <div className="font-medium text-sm text-gray-600 mb-2">{location}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>On Hand:</span>
                      <span className="font-medium">{inv.onHand} {sku.uom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved:</span>
                      <span className="text-orange-600">{inv.reserved} {sku.uom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-bold text-green-600">{inv.available} {sku.uom}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Card Table */}
      <DataTable
        title={`Stock Card Transactions (${stockCards.length})`}
        data={stockCards}
        columns={stockCardColumns}
        searchPlaceholder="Search transactions..."
        onExport={(format) => handleExport(stockCards, `stock-card-${sku.code}`, format)}
      />
    </div>
  )
}