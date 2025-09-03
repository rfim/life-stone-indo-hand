import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  Package,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react'
import { formatCurrency } from '@/lib/format-currency'
import { directorDashboardApi, useApprovalsApi } from '@/lib/api/director-dashboard'
import { DirectorKPIs, FinancialHealthRatio, UserRole } from '@/types/director-dashboard'

interface DirectorDashboardProps {
  userRole: UserRole
}

interface KpiTileProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<any>
  onClick?: () => void
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
}

function KpiTile({ title, value, change, icon: Icon, onClick, subtitle, color = 'blue' }: KpiTileProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(change)}% from last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FinancialHealthSection({ ratios }: { ratios: FinancialHealthRatio[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Financial Health Ratios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1month" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1month">1 Month</TabsTrigger>
            <TabsTrigger value="6months">6 Months</TabsTrigger>
            <TabsTrigger value="12months">12 Months</TabsTrigger>
          </TabsList>
          
          {ratios.map((ratio) => (
            <TabsContent key={ratio.period} value={ratio.period} className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Current Ratio</p>
                  <p className="text-lg font-bold text-blue-900">{ratio.currentRatio}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Quick Ratio</p>
                  <p className="text-lg font-bold text-green-900">{ratio.quickRatio}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Gross Profit Margin</p>
                  <p className="text-lg font-bold text-purple-900">{(ratio.grossProfitMargin * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">ROE</p>
                  <p className="text-lg font-bold text-yellow-900">{(ratio.returnOnEquity * 100).toFixed(1)}%</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export function DirectorDashboard({ userRole }: DirectorDashboardProps) {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<DirectorKPIs | null>(null)
  const [financialRatios, setFinancialRatios] = useState<FinancialHealthRatio[]>([])
  const [loading, setLoading] = useState(true)

  const { data: pendingApprovals = [] } = useApprovalsApi.useList()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [kpisData, ratiosData] = await Promise.all([
          directorDashboardApi.getDirectorKPIs(),
          directorDashboardApi.getFinancialHealthRatios()
        ])
        
        setKpis(kpisData)
        setFinancialRatios(ratiosData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const urgentApprovals = pendingApprovals.filter(a => a.priority === 'Urgent' && a.status === 'Pending')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of business performance and approvals
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboards/report-generation')}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Reports
          </Button>
          <Button onClick={() => navigate('/dashboards/approval-management')}>
            <Clock className="h-4 w-4 mr-2" />
            Manage Approvals
          </Button>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentApprovals.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {urgentApprovals.length} urgent approval{urgentApprovals.length > 1 ? 's' : ''} require immediate attention
                </p>
                <p className="text-sm text-red-700">
                  Click "Manage Approvals" to review pending requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Performance Indicators */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiTile
            title="Total Revenue"
            value={kpis.totalRevenue.value}
            change={kpis.totalRevenue.change}
            subtitle={kpis.totalRevenue.period}
            icon={DollarSign}
            color="green"
            onClick={() => navigate('/dashboards/financial')}
          />
          
          <KpiTile
            title="Net Profit"
            value={kpis.netProfit.value}
            change={kpis.netProfit.change}
            subtitle={kpis.netProfit.period}
            icon={TrendingUp}
            color="blue"
            onClick={() => navigate('/dashboards/financial')}
          />
          
          <KpiTile
            title="Pending Approvals"
            value={`${kpis.pendingApprovals.count} items`}
            subtitle={`${kpis.pendingApprovals.urgent} urgent`}
            icon={Clock}
            color={kpis.pendingApprovals.urgent > 0 ? 'red' : 'yellow'}
            onClick={() => navigate('/dashboards/approval-management')}
          />
          
          <KpiTile
            title="Cash Flow"
            value={kpis.cashFlow.value}
            change={kpis.cashFlow.change}
            subtitle={kpis.cashFlow.period}
            icon={Activity}
            color={kpis.cashFlow.change >= 0 ? 'green' : 'red'}
            onClick={() => navigate('/dashboards/financial')}
          />
          
          <KpiTile
            title="Outstanding A/R"
            value={kpis.outstandingAR.value}
            change={kpis.outstandingAR.change}
            icon={FileText}
            color="purple"
            onClick={() => navigate('/finance/invoice-management')}
          />
          
          <KpiTile
            title="Outstanding A/P"
            value={kpis.outstandingAP.value}
            change={kpis.outstandingAP.change}
            icon={Users}
            color="blue"
            onClick={() => navigate('/finance/payment-management')}
          />
          
          <KpiTile
            title="Inventory Value"
            value={kpis.inventoryValue.value}
            change={kpis.inventoryValue.change}
            icon={Package}
            color="gray"
            onClick={() => navigate('/warehouse/stock-overview')}
          />
          
          <KpiTile
            title="Active Projects"
            value={`${kpis.activeProjects.count} projects`}
            change={kpis.activeProjects.change}
            icon={Target}
            color="green"
            onClick={() => navigate('/masters/projects')}
          />
        </div>
      )}

      {/* Financial Health Ratios */}
      {financialRatios.length > 0 && (
        <FinancialHealthSection ratios={financialRatios} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboards/content-requests')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Content Requests</h3>
                <p className="text-sm text-gray-600">Manage marketing content creation</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboards/meeting-minutes')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Meeting Minutes</h3>
                <p className="text-sm text-gray-600">Track and manage meeting follow-ups</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboards/director-approvals')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">SO/PO Approvals</h3>
                <p className="text-sm text-gray-600">Review sales and purchase orders</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}