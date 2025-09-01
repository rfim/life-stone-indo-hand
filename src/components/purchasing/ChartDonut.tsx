import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface ChartDonutProps {
  title: string
  data: any[]
  dataKey: string
  nameKey: string
  height?: number
  onDrillDown?: (dataPoint: any) => void
  onViewData?: () => void
  className?: string
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(220 70% 50%)',
  'hsl(280 70% 50%)',
  'hsl(340 70% 50%)',
  'hsl(60 70% 50%)',
  'hsl(120 70% 50%)',
]

export function ChartDonut({
  title,
  data,
  dataKey,
  nameKey,
  height = 300,
  onDrillDown,
  onViewData,
  className
}: ChartDonutProps) {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              onClick={onDrillDown}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => {
                const numValue = Number(value)
                return [
                  new Intl.NumberFormat().format(numValue),
                  'Value'
                ]
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}