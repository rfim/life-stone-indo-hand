import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface ChartAreaProps {
  title: string
  data: any[]
  dataKey: string
  xAxisKey: string
  height?: number
  onDrillDown?: (dataPoint: any) => void
  onViewData?: () => void
  className?: string
}

export function ChartArea({
  title,
  data,
  dataKey,
  xAxisKey,
  height = 300,
  onDrillDown,
  onViewData,
  className
}: ChartAreaProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {onViewData && (
          <Button variant="outline" size="sm" onClick={onViewData}>
            <Eye className="h-4 w-4 mr-2" />
            View Data
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} onClick={onDrillDown}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`
                }
                return value.toString()
              }}
            />
            <Tooltip 
              formatter={(value: any) => {
                const numValue = Number(value)
                return [
                  new Intl.NumberFormat().format(numValue),
                  dataKey
                ]
              }}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}