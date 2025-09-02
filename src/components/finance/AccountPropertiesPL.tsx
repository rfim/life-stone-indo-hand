import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  TreeView,
  TreeViewItem,
  TreeViewIndicator,
  TreeViewContent
} from '@/components/ui/tree-view'
import { 
  FolderTree, 
  Plus,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  FileText,
  Save,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Building,
  CreditCard,
  Coins,
  Receipt,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { 
  FinanceFilterParams, 
  ChartOfAccountSummary, 
  AccountType,
  ProfitLossReport,
  BalanceSheetReport
} from '@/data/finance-types'
import { 
  useChartOfAccounts,
  useProfitLossReport,
  useBalanceSheetReport
} from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Account Type Configuration
const ACCOUNT_TYPE_CONFIG = {
  ASSET: { label: 'Asset', color: 'bg-blue-100 text-blue-800', icon: Building },
  LIABILITY: { label: 'Liability', color: 'bg-red-100 text-red-800', icon: CreditCard },
  EQUITY: { label: 'Equity', color: 'bg-purple-100 text-purple-800', icon: Coins },
  REVENUE: { label: 'Revenue', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  EXPENSE: { label: 'Expense', color: 'bg-orange-100 text-orange-800', icon: TrendingDown }
}

interface AccountPropertiesPLProps {}

export function AccountPropertiesPL({}: AccountPropertiesPLProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FinanceFilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccountSummary | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('accounts')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Report date filters
  const [reportPeriod, setReportPeriod] = useState({
    fromDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'), // Start of year
    toDate: format(new Date(), 'yyyy-MM-dd'),
    compareFromDate: format(new Date(new Date().getFullYear() - 1, 0, 1), 'yyyy-MM-dd'), // Previous year
    compareToDate: format(new Date(new Date().getFullYear() - 1, 11, 31), 'yyyy-MM-dd')
  })

  // Form state for account creation/editing
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'ASSET' as AccountType,
    isProfitLoss: false,
    parentId: '',
    allowPosting: true,
    currency: 'IDR',
    description: ''
  })

  // Fetch data with React Query
  const { data: accounts = [], isLoading } = useChartOfAccounts(filters)
  const { data: plReport } = useProfitLossReport({
    dateFrom: reportPeriod.fromDate,
    dateTo: reportPeriod.toDate,
    compareFromDate: reportPeriod.compareFromDate,
    compareToDate: reportPeriod.compareToDate
  })
  const { data: bsReport } = useBalanceSheetReport({
    asOfDate: reportPeriod.toDate,
    compareAsOfDate: reportPeriod.compareToDate
  })

  // Filter accounts based on search term
  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts
    return accounts.filter(account => 
      account.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [accounts, searchTerm])

  // Build account hierarchy for tree view
  const accountHierarchy = useMemo(() => {
    const rootAccounts = accounts.filter(acc => !acc.parentId)
    const childAccounts = accounts.filter(acc => acc.parentId)
    
    const buildTree = (parentId: string | null = null): ChartOfAccountSummary[] => {
      return accounts
        .filter(acc => acc.parentId === parentId)
        .map(acc => ({
          ...acc,
          children: buildTree(acc.id)
        }))
    }
    
    return buildTree()
  }, [accounts])

  // Account columns for data table
  const accountColumns: ColumnDef<ChartOfAccountSummary>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Account Code',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          <div className="text-sm text-muted-foreground">{row.original.name}</div>
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const config = ACCOUNT_TYPE_CONFIG[row.original.type as keyof typeof ACCOUNT_TYPE_CONFIG]
        const Icon = config.icon
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'isProfitLoss',
      header: 'P&L Account',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isProfitLoss ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <Receipt className="w-3 h-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <span className="text-muted-foreground">No</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'allowPosting',
      header: 'Allow Posting',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.allowPosting ? '✓' : '✗'}
        </div>
      )
    },
    {
      accessorKey: 'currency',
      header: 'Currency',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.currency || 'IDR'}
        </div>
      )
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            {row.original.currency || 'IDR'} {row.original.balance?.toLocaleString('id-ID') || '0'}
          </div>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAccount(row.original)
              setFormData({
                code: row.original.code,
                name: row.original.name,
                type: row.original.type,
                isProfitLoss: row.original.isProfitLoss,
                parentId: row.original.parentId || '',
                allowPosting: row.original.allowPosting,
                currency: row.original.currency || 'IDR',
                description: row.original.description || ''
              })
              setEditDialogOpen(true)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [])

  const handleCreateAccount = async () => {
    try {
      await mockDataProvider.createAccount(formData)
      
      setCreateDialogOpen(false)
      setFormData({
        code: '',
        name: '',
        type: 'ASSET',
        isProfitLoss: false,
        parentId: '',
        allowPosting: true,
        currency: 'IDR',
        description: ''
      })
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  const handleEditAccount = async () => {
    if (!selectedAccount) return
    
    try {
      await mockDataProvider.updateAccount(selectedAccount.id, formData)
      setEditDialogOpen(false)
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderAccountTree = (accounts: ChartOfAccountSummary[], level = 0): JSX.Element[] => {
    return accounts.map(account => {
      const hasChildren = account.children && account.children.length > 0
      const isExpanded = expandedNodes.has(account.id)
      const config = ACCOUNT_TYPE_CONFIG[account.type as keyof typeof ACCOUNT_TYPE_CONFIG]
      const Icon = config.icon

      return (
        <div key={account.id}>
          <div 
            className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded-md`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => hasChildren && toggleNode(account.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4" />
            )}
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium text-sm">{account.code} - {account.name}</div>
              <div className="text-xs text-muted-foreground">
                <Badge variant="outline" className={config.color + " text-xs"}>
                  {config.label}
                </Badge>
                {account.isProfitLoss && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs ml-1">
                    P&L
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right text-sm">
              {account.currency || 'IDR'} {account.balance?.toLocaleString('id-ID') || '0'}
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div>
              {renderAccountTree(account.children || [], level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Properties & P&L Management</h1>
          <p className="text-muted-foreground">Manage chart of accounts and generate financial reports</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="hierarchy">Account Hierarchy</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>

        {/* Chart of Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by code, name, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.accountType || 'ALL'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, accountType: value === 'ALL' ? undefined : value }))
                }>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.isProfitLoss?.toString() || 'ALL'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, isProfitLoss: value === 'ALL' ? undefined : value === 'true' }))
                }>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Accounts</SelectItem>
                    <SelectItem value="true">P&L Accounts Only</SelectItem>
                    <SelectItem value="false">Non-P&L Accounts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>All accounts with their properties and current balances</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={accountColumns}
                data={filteredAccounts}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Hierarchy</CardTitle>
              <CardDescription>Tree view of all accounts with parent-child relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {renderAccountTree(accountHierarchy)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss Tab */}
        <TabsContent value="profit-loss" className="space-y-4">
          {/* Report Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>From Date</Label>
                  <DatePicker
                    date={new Date(reportPeriod.fromDate)}
                    onSelect={(date) => setReportPeriod(prev => ({ 
                      ...prev, 
                      fromDate: date ? format(date, 'yyyy-MM-dd') : prev.fromDate 
                    }))}
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <DatePicker
                    date={new Date(reportPeriod.toDate)}
                    onSelect={(date) => setReportPeriod(prev => ({ 
                      ...prev, 
                      toDate: date ? format(date, 'yyyy-MM-dd') : prev.toDate 
                    }))}
                  />
                </div>
                <div>
                  <Label>Compare From</Label>
                  <DatePicker
                    date={new Date(reportPeriod.compareFromDate)}
                    onSelect={(date) => setReportPeriod(prev => ({ 
                      ...prev, 
                      compareFromDate: date ? format(date, 'yyyy-MM-dd') : prev.compareFromDate 
                    }))}
                  />
                </div>
                <div>
                  <Label>Compare To</Label>
                  <DatePicker
                    date={new Date(reportPeriod.compareToDate)}
                    onSelect={(date) => setReportPeriod(prev => ({ 
                      ...prev, 
                      compareToDate: date ? format(date, 'yyyy-MM-dd') : prev.compareToDate 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit & Loss Report */}
          {plReport && (
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>
                  Period: {format(new Date(reportPeriod.fromDate), 'MMM dd, yyyy')} - {format(new Date(reportPeriod.toDate), 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-700">Revenue</h3>
                    {plReport.revenue.map(item => (
                      <div key={item.accountId} className="flex justify-between py-1">
                        <span>{item.accountName}</span>
                        <div className="flex gap-8">
                          <span className="w-32 text-right">IDR {item.currentAmount.toLocaleString('id-ID')}</span>
                          <span className="w-32 text-right text-muted-foreground">IDR {item.compareAmount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Revenue</span>
                      <div className="flex gap-8">
                        <span className="w-32 text-right">IDR {plReport.totalRevenue.toLocaleString('id-ID')}</span>
                        <span className="w-32 text-right">IDR {plReport.totalRevenueCompare.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expense Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-700">Expenses</h3>
                    {plReport.expenses.map(item => (
                      <div key={item.accountId} className="flex justify-between py-1">
                        <span>{item.accountName}</span>
                        <div className="flex gap-8">
                          <span className="w-32 text-right">IDR {item.currentAmount.toLocaleString('id-ID')}</span>
                          <span className="w-32 text-right text-muted-foreground">IDR {item.compareAmount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Expenses</span>
                      <div className="flex gap-8">
                        <span className="w-32 text-right">IDR {plReport.totalExpenses.toLocaleString('id-ID')}</span>
                        <span className="w-32 text-right">IDR {plReport.totalExpensesCompare.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Net Income */}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Net Income</span>
                    <div className="flex gap-8">
                      <span className="w-32 text-right">IDR {plReport.netIncome.toLocaleString('id-ID')}</span>
                      <span className="w-32 text-right">IDR {plReport.netIncomeCompare.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance-sheet" className="space-y-4">
          {/* Balance Sheet Report */}
          {bsReport && (
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>
                  As of {format(new Date(reportPeriod.toDate), 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  {/* Assets & Liabilities */}
                  <div className="space-y-6">
                    {/* Assets */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-700">Assets</h3>
                      {bsReport.assets.map(item => (
                        <div key={item.accountId} className="flex justify-between py-1">
                          <span>{item.accountName}</span>
                          <span>IDR {item.amount.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Assets</span>
                        <span>IDR {bsReport.totalAssets.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Liabilities */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-700">Liabilities</h3>
                      {bsReport.liabilities.map(item => (
                        <div key={item.accountId} className="flex justify-between py-1">
                          <span>{item.accountName}</span>
                          <span>IDR {item.amount.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Liabilities</span>
                        <span>IDR {bsReport.totalLiabilities.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Equity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-purple-700">Equity</h3>
                    {bsReport.equity.map(item => (
                      <div key={item.accountId} className="flex justify-between py-1">
                        <span>{item.accountName}</span>
                        <span>IDR {item.amount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Equity</span>
                      <span>IDR {bsReport.totalEquity.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="mt-8 pt-4 border-t-2">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Liabilities & Equity</span>
                        <span>IDR {(bsReport.totalLiabilities + bsReport.totalEquity).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to the chart of accounts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-code">Account Code</Label>
                <Input
                  id="account-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., 1001"
                />
              </div>
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash in Bank"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-type">Account Type</Label>
                <Select value={formData.type} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, type: value as AccountType }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parent-account">Parent Account</Label>
                <Select value={formData.parentId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, parentId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, currency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-posting"
                    checked={formData.allowPosting}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, allowPosting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="allow-posting">Allow Posting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="profit-loss"
                    checked={formData.isProfitLoss}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isProfitLoss: checked as boolean }))
                    }
                  />
                  <Label htmlFor="profit-loss">P&L Account</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Account description (optional)"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAccount}>
                <Save className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update account properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create, but with edit handler */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-account-code">Account Code</Label>
                <Input
                  id="edit-account-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., 1001"
                />
              </div>
              <div>
                <Label htmlFor="edit-account-name">Account Name</Label>
                <Input
                  id="edit-account-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash in Bank"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-profit-loss"
                  checked={formData.isProfitLoss}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isProfitLoss: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-profit-loss">P&L Account</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allow-posting"
                  checked={formData.allowPosting}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, allowPosting: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-allow-posting">Allow Posting</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAccount}>
                <Save className="w-4 h-4 mr-2" />
                Update Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}