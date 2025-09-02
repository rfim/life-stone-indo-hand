import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  MapPin, 
  Palette,
  Eye,
  ArrowUpDown,
  AlertTriangle 
} from 'lucide-react'
import { InventorySummary } from '@/data/warehouse-types'

interface InventoryCardProps {
  inventory: InventorySummary
  index: number
}

export function InventoryCard({ inventory, index }: InventoryCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {inventory.skuCode}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {inventory.skuName}
            </p>
          </div>
          {inventory.belowMin && (
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location and Finishing */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{inventory.locationName}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Palette className="h-4 w-4 text-gray-500" />
            <Badge variant="secondary" className="text-xs">
              {inventory.finishing || 'No Finishing'}
            </Badge>
          </div>
        </div>

        {/* Stock Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">On Hand:</span>
            <span className="font-medium">{inventory.onHand} {inventory.uom}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Reserved:</span>
            <span>{inventory.reserved} {inventory.uom}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Available:</span>
            <span className="font-medium text-green-600">
              {inventory.available} {inventory.uom}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <Badge variant={inventory.belowMin ? 'destructive' : 'default'}>
            {inventory.belowMin ? 'Below Min' : 'OK'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/warehouse/stock-card/${inventory.skuId}`)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Stock Card
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/warehouse/movements/create?sku=${inventory.skuId}`)}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Move
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}