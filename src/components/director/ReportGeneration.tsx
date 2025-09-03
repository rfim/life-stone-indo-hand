import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter, 
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  CreditCard,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { reportDefinitions, directorDashboardApi } from '@/lib/api/director-dashboard'
import { ReportType, ReportDefinition } from '@/types/director-dashboard'
import { toast } from 'sonner'

interface ReportCardProps {
  report: ReportDefinition
  onGenerate: (reportType: ReportType) => void
}

function ReportCard({ report, onGenerate }: ReportCardProps) {
  const getIcon = (type: ReportType) => {
    switch (type) {
      case 'GeneralLedger': return FileText
      case 'ProfitLoss': return TrendingUp
      case 'BalanceSheet': return BarChart3
      case 'APAging': case 'ARAging': return CreditCard
      case 'SalesRevenue': case 'SalesPerformance': return DollarSign
      case 'Purchasing': return Users
      case 'Inventory': return Package
      default: return PieChart
    }
  }

  const Icon = getIcon(report.type)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{report.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {report.exportFormats.map((format) => (
                <Badge key={format} variant="secondary" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button 
          onClick={() => onGenerate(report.type)} 
          className="w-full"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  )
}

interface ReportParameterFormProps {
  report: ReportDefinition
  onGenerate: (parameters: Record<string, any>) => void
  onCancel: () => void
  loading: boolean
}

function ReportParameterForm({ report, onGenerate, onCancel, loading }: ReportParameterFormProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required parameters
    const missingRequired = report.parameters
      .filter(p => p.required && !parameters[p.name] && !(p.type === 'dateRange' && dateRange.from && dateRange.to))
      .map(p => p.label)

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
      return
    }

    // Prepare parameters
    const finalParameters = { ...parameters }
    if (dateRange.from && dateRange.to) {
      finalParameters.dateRange = {
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd')
      }
    }

    onGenerate(finalParameters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {report.title} - Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {report.parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <Label htmlFor={param.name}>
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {param.type === 'text' && (
                <Input
                  id={param.name}
                  value={parameters[param.name] || ''}
                  onChange={(e) => setParameters(prev => ({ ...prev, [param.name]: e.target.value }))}
                  required={param.required}
                />
              )}
              
              {param.type === 'select' && (
                <Select
                  value={parameters[param.name] || ''}
                  onValueChange={(value) => setParameters(prev => ({ ...prev, [param.name]: value }))}
                  required={param.required}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {param.type === 'date' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !parameters[param.name] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {parameters[param.name] ? (
                        format(new Date(parameters[param.name]), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={parameters[param.name] ? new Date(parameters[param.name]) : undefined}
                      onSelect={(date) => setParameters(prev => ({ 
                        ...prev, 
                        [param.name]: date ? format(date, 'yyyy-MM-dd') : ''
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              
              {param.type === 'dateRange' && (
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, 'PPP') : 'From date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, 'PPP') : 'To date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function ReportGeneration() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerateReport = (reportType: ReportType) => {
    const report = reportDefinitions.find(r => r.type === reportType)
    if (report) {
      setSelectedReport(report)
    }
  }

  const handleGenerateWithParameters = async (parameters: Record<string, any>) => {
    if (!selectedReport) return

    setGenerating(true)
    try {
      const result = await directorDashboardApi.generateReport(selectedReport.type, parameters)
      
      toast.success(`Report generated successfully: ${result.filename}`)
      
      // In a real app, this would trigger a download
      console.log('Generated report:', result)
      
      setSelectedReport(null)
    } catch (error) {
      toast.error('Failed to generate report')
      console.error('Report generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const financialReports = reportDefinitions.filter(r => 
    ['GeneralLedger', 'ProfitLoss', 'BalanceSheet', 'APAging', 'ARAging'].includes(r.type)
  )
  
  const operationalReports = reportDefinitions.filter(r => 
    ['SalesRevenue', 'SalesPerformance', 'Purchasing', 'Inventory'].includes(r.type)
  )

  if (selectedReport) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        
        <ReportParameterForm
          report={selectedReport}
          onGenerate={handleGenerateWithParameters}
          onCancel={() => setSelectedReport(null)}
          loading={generating}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Generation</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive business reports and financial statements
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboards/overview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialReports.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onGenerate={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="operational" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationalReports.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onGenerate={handleGenerateReport}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}