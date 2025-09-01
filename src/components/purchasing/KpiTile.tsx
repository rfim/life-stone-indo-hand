import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiTileProps {
  title: string
  value: string | number
  subtitle?: string
  delta?: {
    value: number
    percentage: number
  }
  icon?: React.ReactNode
  format?: 'number' | 'currency' | 'percentage'
  currency?: string
  onClick?: () => void
  className?: string
}

export function KpiTile({
  title,
  value,
  subtitle,
  delta,
  icon,
  format = 'number',
  currency = 'IDR',
  onClick,
  className
}: KpiTileProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        if (currency === 'IDR') {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(numVal)
        } else {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(numVal)
        }
      case 'percentage':
        return `${numVal}%`
      default:
        return new Intl.NumberFormat().format(numVal)
    }
  }

  const getDeltaIcon = () => {
    if (!delta) return null
    
    if (delta.percentage > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (delta.percentage < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getDeltaColor = () => {
    if (!delta) return 'text-muted-foreground'
    
    if (delta.percentage > 0) {
      return 'text-green-600'
    } else if (delta.percentage < 0) {
      return 'text-red-600'
    } else {
      return 'text-gray-500'
    }
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-1">
            {subtitle}
          </p>
        )}
        {delta && (
          <div className={cn('flex items-center space-x-1 text-xs', getDeltaColor())}>
            {getDeltaIcon()}
            <span>
              {Math.abs(delta.percentage)}% from previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}