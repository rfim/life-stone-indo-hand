import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format, isAfter, differenceInDays, subDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Eye,
  MessageSquare,
  FileX
} from 'lucide-react'
import { FilterParams, ComplaintSummary } from '@/data/purchasing-types'
import { 
  useKpis, 
  useComplaints,
  usePOs
} from '@/hooks/purchasing/usePurchasingQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { KpiTile } from '../KpiTile'
import { ChartArea } from '../ChartArea'
import { ChartBar } from '../ChartBar'
import { DataTable } from '../DataTable'

interface QualityDashboardProps {
  filterParams: FilterParams
}

export function QualityDashboard({ filterParams }: QualityDashboardProps) {
  const navigate = useNavigate()
  
  // Data queries
  const { data: kpis, isLoading: kpisLoading } = useKpis(filterParams)
  const { data: complaints = [], isLoading: complaintsLoading } = useComplaints(filterParams)
  const { data: pos = [], isLoading: posLoading } = usePOs(filterParams)

  // Filter data for quality view
  const openComplaints = useMemo(() => 
    complaints.filter(c => c.status === 'Opened' || c.status === 'Acknowledged'), 
    [complaints]
  )

  const complaintsAging = useMemo(() => {
    const agingBuckets = complaints.reduce((acc, complaint) => {
      let bucket: string
      if (complaint.ageDays <= 3) bucket = '0-3 days'
      else if (complaint.ageDays <= 7) bucket = '4-7 days'
      else if (complaint.ageDays <= 14) bucket = '8-14 days'
      else bucket = '15+ days'
      
      if (!acc[bucket]) acc[bucket] = { bucket, count: 0, totalNominal: 0 }
      acc[bucket].count += 1
      acc[bucket].totalNominal += complaint.nominal
      return acc
    }, {} as Record<string, { bucket: string; count: number; totalNominal: number }>)

    return Object.values(agingBuckets)
  }, [complaints])

  // Chart data
  const defectTrendData = useMemo(() => {
    // Simulate defect trend over time based on complaint data
    const dailyDefects = complaints.reduce((acc, complaint) => {
      // Estimate complaint date from ageDays
      const complaintDate = subDays(new Date(), complaint.ageDays)
      const day = format(complaintDate, 'MMM dd')
      
      if (!acc[day]) acc[day] = { day, count: 0, nominal: 0 }
      acc[day].count += 1
      acc[day].nominal += complaint.nominal
      return acc
    }, {} as Record<string, { day: string; count: number; nominal: number }>)

    return Object.values(dailyDefects).sort((a, b) => 
      new Date(a.day, 'MMM DD').getTime() - new Date(b.day, 'MMM DD').getTime()
    )
  }, [complaints])

  const deductionsBySupplierData = useMemo(() => {
    const supplierDeductions = complaints.reduce((acc, complaint) => {
      if (!acc[complaint.supplier]) {
        acc[complaint.supplier] = { supplier: complaint.supplier, count: 0, totalDeduction: 0 }
      }
      acc[complaint.supplier].count += 1
      acc[complaint.supplier].totalDeduction += complaint.nominal
      return acc
    }, {} as Record<string, { supplier: string; count: number; totalDeduction: number }>)

    return Object.values(supplierDeductions)
      .sort((a, b) => b.totalDeduction - a.totalDeduction)
      .slice(0, 6)
  }, [complaints])

  const complaintStatusData = useMemo(() => {
    const statusCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }))
  }, [complaints])

  // Complaint columns
  const complaintColumns: ColumnDef<ComplaintSummary>[] = [
    {
      accessorKey: 'code',
      header: 'Complaint Code',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto"
          onClick={() => navigate(`/complaint/${row.original.id}`)}
        >
          {row.original.code}
        </Button>
      )
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier'
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.reason}>
          {row.original.reason}
        </div>
      )
    },
    {
      accessorKey: 'nominal',
      header: 'Deduction Amount',
      cell: ({ row }) => (
        <div className="text-right font-medium text-red-600">
          {row.original.nominal > 0 ? (
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(row.original.nominal)
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Opened' ? 'destructive' : 
                      status === 'Acknowledged' ? 'secondary' :
                      status === 'Resolved' ? 'default' : 'outline'
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'ageDays',
      header: 'Age',
      cell: ({ row }) => {
        const age = row.original.ageDays
        const isOld = age > 7
        
        return (
          <div className={`flex items-center space-x-2 ${isOld ? 'text-red-600' : ''}`}>
            <span>{age} days</span>
            {isOld && <Clock className="h-4 w-4" />}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/complaint/${row.original.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Case
        </Button>
      )
    }
  ]

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      mockDataProvider.exportToCSV(data, filename)
    } else {
      mockDataProvider.exportToPDF(data, filename)
    }
  }

  if (kpisLoading || complaintsLoading || posLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="Open Complaints"
          value={kpis?.complaintsOpen || 0}
          subtitle={`${openComplaints.length} active cases`}
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => navigate('/complaint?status=open')}
        />
        
        <KpiTile
          title="Defect Rate"
          value={kpis?.defectRatePct || 0}
          format="percentage"
          subtitle="Overall quality score"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Total Deductions"
          value={complaints.reduce((sum, c) => sum + c.nominal, 0)}
          format="currency"
          currency="IDR"
          subtitle="This period"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <KpiTile
          title="Avg Resolution Time"
          value={complaints.length > 0 ? Math.round(
            complaints
              .filter(c => c.status === 'Resolved' || c.status === 'Closed')
              .reduce((sum, c) => sum + c.ageDays, 0) / 
            complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
          ) : 0}
          subtitle="days to resolve"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartArea
          title="Defect Rate Trend"
          data={defectTrendData}
          dataKey="count"
          xAxisKey="day"
          onDrillDown={(data) => navigate(`/quality/defects?date=${data.day}`)}
        />
        
        <ChartBar
          title="Complaints Aging Analysis"
          data={complaintsAging}
          dataKey="count"
          xAxisKey="bucket"
          onDrillDown={(data) => navigate(`/complaint?age=${data.bucket}`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBar
          title="Deductions by Supplier"
          data={deductionsBySupplierData}
          dataKey="totalDeduction"
          xAxisKey="supplier"
          onDrillDown={(data) => navigate(`/supplier/${data.supplier}/quality`)}
        />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quality Metrics Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(100 - (kpis?.defectRatePct || 0))}%
              </div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'Resolved').length}
              </div>
              <p className="text-sm text-muted-foreground">Resolved Cases</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {complaints.filter(c => c.ageDays > 7).length}
              </div>
              <p className="text-sm text-muted-foreground">Overdue Cases</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {complaints.filter(c => c.isFreeSlab).length}
              </div>
              <p className="text-sm text-muted-foreground">Free Slab Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6">
        <DataTable
          title="Open Complaints/Retur Cases"
          data={openComplaints}
          columns={complaintColumns}
          searchPlaceholder="Search complaints..."
          onExport={(format) => handleExport(openComplaints, 'open_complaints', format)}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Quality Actions Required</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Pending supplier response</span>
                <Badge variant="secondary">{complaints.filter(c => c.status === 'Acknowledged').length}</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Awaiting deduction approval</span>
                <Badge variant="destructive">{complaints.filter(c => c.nominal > 0 && c.status === 'Opened').length}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Ready for closure</span>
                <Badge variant="default">{complaints.filter(c => c.status === 'Resolved').length}</Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Recent Quality Events</h4>
            <div className="space-y-2">
              {complaints.slice(0, 5).map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{complaint.code}</p>
                    <p className="text-xs text-muted-foreground">{complaint.supplier}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {complaint.ageDays}d ago
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}