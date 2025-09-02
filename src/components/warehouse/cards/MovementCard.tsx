import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowRight,
  Eye,
  MapPin,
  Calendar,
  Package
} from 'lucide-react'
import { MovementSummary, MovementType } from '@/data/warehouse-types'

interface MovementCardProps {
  movement: MovementSummary
  index: number
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
      return <Package className="h-4 w-4" />
  }
}

const getMovementColor = (type: MovementType) => {
  switch (type) {
    case 'INBOUND':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'OUTBOUND':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'TRANSFER':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
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

export function MovementCard({ movement, index }: MovementCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-md border ${getMovementColor(movement.type)}`}>
              {getMovementIcon(movement.type)}
              <span className="font-medium text-sm">{movement.type}</span>
            </div>
            <CardTitle className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {movement.skuCode}
            </CardTitle>
          </div>
          <Badge variant={getStatusColor(movement.status)}>
            {movement.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* SKU Information */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {movement.skuName}
          </p>
        </div>

        {/* Movement Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{movement.qty} {movement.uom}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>
              {movement.type === 'TRANSFER' 
                ? `${movement.fromLocation} → ${movement.toLocation}`
                : (movement.fromLocation || movement.toLocation || 'N/A')
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(new Date(movement.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/warehouse/movements/${movement.id}`)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}