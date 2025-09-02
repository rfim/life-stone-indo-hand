import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Truck,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { useSalesOrdersApi, useDeliveryOrdersApi, useColdCallsApi, useCommissionEntriesApi } from '@/lib/api/marketing'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useMemo } from 'react'

export function MarketingDashboard() {
  // Fetch data from APIs
  const { data: salesOrdersResult } = useSalesOrdersApi.useList({ pageSize: 100 })
  const { data: deliveryOrdersResult } = useDeliveryOrdersApi.useList({ pageSize: 100 })
  const { data: coldCallsResult } = useColdCallsApi.useList({ pageSize: 100 })
  const { data: commissionsResult } = useCommissionEntriesApi.useList({ pageSize: 100 })

  const salesOrders = salesOrdersResult?.data || []
  const deliveryOrders = deliveryOrdersResult?.data || []
  const coldCalls = coldCallsResult?.data || []
  const commissions = commissionsResult?.data || []

  // Calculate metrics
  const metrics = useMemo(() => {
    const openSOs = salesOrders.filter(so => so.status === 'Confirmed').length
    const doInTransit = deliveryOrders.filter(delivery => delivery.status === 'InTransit').length
    const pendingApprovals = salesOrders.filter(so => so.status === 'Submitted').length
    
    // Mock WhatsApp sends this week
    const waSendsThisWeek = 12 // TODO: Get from WhatsApp service logs
    
    return {
      openSOs,
      doInTransit,
      pendingApprovals,
      waSendsThisWeek
    }
  }, [salesOrders, deliveryOrders])

  // Chart data
  const soValueOverTime = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleDateString('en', { month: 'short' }),
        value: Math.floor(Math.random() * 100000) + 50000 // Mock data
      }
    })
    return last6Months
  }, [])

  const topCustomers = useMemo(() => {
    // Mock data - in real implementation, aggregate from SOs
    return [
      { name: 'PT ABC Construction', value: 150000, orders: 8 },
      { name: 'CV XYZ Contractor', value: 120000, orders: 6 },
      { name: 'PT DEF Builder', value: 95000, orders: 4 },
      { name: 'UD GHI Stone', value: 80000, orders: 5 },
      { name: 'CV JKL Interior', value: 65000, orders: 3 }
    ]
  }, [])

  const discountApprovalRate = useMemo(() => {
    const totalSOs = salesOrders.length
    const approvedDiscounts = salesOrders.filter(so => 
      so.approvals?.some(approval => approval.type === 'DirectorDiscount' && approval.status === 'Approved')
    ).length
    
    return [
      { name: 'Approved', value: approvedDiscounts, color: '#22c55e' },
      { name: 'Without Discount', value: totalSOs - approvedDiscounts, color: '#e5e7eb' }
    ]
  }, [salesOrders])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground">Overview of marketing activities and performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Sales Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openSOs}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DO In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.doInTransit}</div>
            <p className="text-xs text-muted-foreground">
              -1 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require director review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WA Sends This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.waSendsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Messages sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* SO Value Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Order Value Over Time</CardTitle>
            <CardDescription>Monthly sales order values</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={soValueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By order value this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Discount vs Approval Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Approval Rate</CardTitle>
            <CardDescription>Orders requiring director approval</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={discountApprovalRate}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                >
                  {discountApprovalRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest marketing activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Sales Order SO-2024-001 confirmed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">$25,000</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Truck className="h-4 w-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Delivery Order DO-2024-015 issued</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
                <Badge variant="outline">In Transit</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Meeting minutes created for PT ABC</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <Badge variant="secondary">Follow-up</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Users className="h-4 w-4 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Cold call scheduled with CV XYZ</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Badge variant="outline">Planned</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Commission calculated for Q4</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <Badge variant="secondary">$5,200</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}