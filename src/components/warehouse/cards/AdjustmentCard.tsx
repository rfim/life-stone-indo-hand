import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText
} from 'lucide-react'
import { AdjustmentSummary, AdjustmentType } from '@/data/warehouse-types'

interface AdjustmentCardProps {
  adjustment: AdjustmentSummary
  index: number
}

const getAdjustmentTypeLabel = (type: AdjustmentType) => {
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

const getAdjustmentTypeColor = (type: AdjustmentType) => {
  switch (type) {
    case 'COUNT_CORRECTION':
    case 'CYCLE_COUNT':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'DAMAGE':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'UOM_CONVERSION':
    case 'FINISHING_CHANGE':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'CUTTING':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'LOST_FOUND':
      return 'text-green-600 bg-green-50 border-green-200'
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

export function AdjustmentCard({ adjustment, index }: AdjustmentCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-md border text-xs ${getAdjustmentTypeColor(adjustment.adjType)}`}>
              <Settings className="h-3 w-3" />
              <span className="font-medium">{getAdjustmentTypeLabel(adjustment.adjType)}</span>
            </div>
            <CardTitle className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {adjustment.skuCode}
            </CardTitle>
          </div>
          <Badge variant={getStatusColor(adjustment.status)}>
            {adjustment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* SKU Information */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {adjustment.skuName}
          </p>
        </div>

        {/* Adjustment Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantity Delta:</span>
            <div className="flex items-center space-x-1">
              {adjustment.qtyDelta > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`font-medium ${adjustment.qtyDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {adjustment.qtyDelta > 0 ? '+' : ''}{adjustment.qtyDelta} {adjustment.uom}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{adjustment.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(new Date(adjustment.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/warehouse/adjustments/${adjustment.id}`)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}