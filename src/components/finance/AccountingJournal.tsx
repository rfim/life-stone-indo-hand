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
import { DatePicker } from '@/components/ui/date-picker'
import { 
  BookOpen, 
  Plus,
  Eye,
  Edit,
  Send,
  Check,
  X,
  Clock,
  Calculator,
  FileText,
  Save,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  CalendarDays
} from 'lucide-react'
import { 
  FinanceFilterParams, 
  JournalEntrySummary, 
  JournalLine, 
  JournalEntryStatus,
  ChartOfAccountSummary 
} from '@/data/finance-types'
import { 
  useJournalEntries,
  useJournalStats,
  useChartOfAccounts
} from '@/hooks/finance/useFinanceQueries'
import { mockDataProvider } from '@/data/mockProvider'
import { DataTable } from '@/components/purchasing/DataTable'

// Journal Entry Status Configuration
const JOURNAL_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  POSTED: { label: 'Posted', color: 'bg-green-100 text-green-800', icon: Check }
}

// Account Types
const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']

interface JournalLineForm {
  accountId: string
  accountName: string
  debit: string
  credit: string
  description: string
  customerId?: string
  projectId?: string
  categoryId?: string
}

interface AccountingJournalProps {}

export function AccountingJournal({}: AccountingJournalProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FinanceFilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJournal, setSelectedJournal] = useState<JournalEntrySummary | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [postDialogOpen, setPostDialogOpen] = useState(false)

  // Form state for new journal entry
  const [formData, setFormData] = useState({
    code: '',
    memo: '',
    journalDate: new Date(),
    lines: [] as JournalLineForm[]
  })

  // Fetch data with React Query
  const { data: journalEntries = [], isLoading } = useJournalEntries(filters)
  const { data: stats } = useJournalStats(filters)
  const { data: accounts = [] } = useChartOfAccounts({})

  // Filter journal entries based on search term
  const filteredJournalEntries = useMemo(() => {
    if (!searchTerm) return journalEntries
    return journalEntries.filter(journal => 
      journal.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [journalEntries, searchTerm])

  // Calculate totals for journal form
  const formTotals = useMemo(() => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0)
    const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)
    const isBalanced = totalDebit === totalCredit && totalDebit > 0
    return { totalDebit, totalCredit, isBalanced }
  }, [formData.lines])

  // Journal Entry columns for data table
  const journalColumns: ColumnDef<JournalEntrySummary>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Journal Code',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          <div className="text-sm text-muted-foreground">{row.original.memo}</div>
        </div>
      )
    },
    {
      accessorKey: 'journalDate',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.journalDate), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            IDR {row.original.totalAmount?.toLocaleString('id-ID') || '0'}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = JOURNAL_STATUS_CONFIG[row.original.status as keyof typeof JOURNAL_STATUS_CONFIG]
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
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.createdBy || '-'}
        </div>
      )
    },
    {
      accessorKey: 'postedAt',
      header: 'Posted At',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.postedAt ? format(new Date(row.original.postedAt), 'MMM dd, yyyy HH:mm') : '-'}
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
              setSelectedJournal(row.original)
              setDetailDialogOpen(true)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'DRAFT' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Edit functionality would go here
                  console.log('Edit journal', row.original.id)
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedJournal(row.original)
                  setPostDialogOpen(true)
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ], [])

  const addJournalLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        accountId: '',
        accountName: '',
        debit: '',
        credit: '',
        description: '',
        customerId: '',
        projectId: '',
        categoryId: ''
      }]
    }))
  }

  const removeJournalLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const updateJournalLine = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === index) {
          if (field === 'accountId') {
            const account = accounts.find(acc => acc.id === value)
            return { 
              ...line, 
              accountId: value, 
              accountName: account?.name || ''
            }
          }
          return { ...line, [field]: value }
        }
        return line
      })
    }))
  }

  const handleCreateJournal = async () => {
    try {
      const journalData = {
        ...formData,
        lines: formData.lines.map(line => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description,
          customerId: line.customerId || undefined,
          projectId: line.projectId || undefined,
          categoryId: line.categoryId || undefined
        }))
      }
      
      await mockDataProvider.createJournalEntry(journalData)
      
      setCreateDialogOpen(false)
      setFormData({
        code: '',
        memo: '',
        journalDate: new Date(),
        lines: []
      })
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  const handlePostJournal = async () => {
    if (!selectedJournal) return
    
    try {
      await mockDataProvider.postJournalEntry(selectedJournal.id)
      setPostDialogOpen(false)
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Post failed:', error)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting & Journal</h1>
          <p className="text-muted-foreground">Manage journal entries and accounting transactions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Journal Entry
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftEntries}</div>
              <p className="text-xs text-muted-foreground">
                Pending posting
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posted Entries</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.postedEntries}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Calculator className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                IDR {stats.totalAmount?.toLocaleString('id-ID') || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Posted entries
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Tabs */}
      <Tabs defaultValue="ALL" onValueChange={(value) => 
        setFilters(prev => ({ ...prev, status: value === 'ALL' ? undefined : value }))
      }>
        <TabsList>
          <TabsTrigger value="ALL">All Entries</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="POSTED">Posted</TabsTrigger>
        </TabsList>

        <TabsContent value="ALL" className="space-y-4">
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
                      placeholder="Search by code, memo, or created by..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <DatePicker
                  date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => setFilters(prev => ({ 
                    ...prev, 
                    dateFrom: date ? format(date, 'yyyy-MM-dd') : undefined 
                  }))}
                  placeholder="Date From"
                />
                <DatePicker
                  date={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => setFilters(prev => ({ 
                    ...prev, 
                    dateTo: date ? format(date, 'yyyy-MM-dd') : undefined 
                  }))}
                  placeholder="Date To"
                />
              </div>
            </CardContent>
          </Card>

          {/* Journal Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>All journal entries and their posting status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={journalColumns}
                data={filteredJournalEntries}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab contents would be similar with filtered data */}
      </Tabs>

      {/* Create Journal Entry Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Journal Entry</DialogTitle>
            <DialogDescription>
              Create a new manual journal entry with multiple lines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="journal-code">Journal Code</Label>
                <Input
                  id="journal-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter journal code"
                />
              </div>
              <div>
                <Label htmlFor="journal-date">Journal Date</Label>
                <DatePicker
                  date={formData.journalDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, journalDate: date || new Date() }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="memo">Memo</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                placeholder="Enter journal entry description"
              />
            </div>

            {/* Journal Lines */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Journal Lines</Label>
                <Button type="button" onClick={addJournalLine} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              {formData.lines.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-3">Account</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Debit</div>
                    <div className="col-span-2">Credit</div>
                    <div className="col-span-1">Project</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <Select
                          value={line.accountId}
                          onValueChange={(value) => updateJournalLine(index, 'accountId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={line.description}
                          onChange={(e) => updateJournalLine(index, 'description', e.target.value)}
                          placeholder="Line description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={line.debit}
                          onChange={(e) => updateJournalLine(index, 'debit', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={line.credit}
                          onChange={(e) => updateJournalLine(index, 'credit', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          value={line.projectId || ''}
                          onChange={(e) => updateJournalLine(index, 'projectId', e.target.value)}
                          placeholder="Project"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeJournalLine(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Totals Row */}
                  <div className="grid grid-cols-12 gap-2 border-t pt-2 font-medium">
                    <div className="col-span-6 text-right">Totals:</div>
                    <div className="col-span-2 text-right">
                      IDR {formTotals.totalDebit.toLocaleString('id-ID')}
                    </div>
                    <div className="col-span-2 text-right">
                      IDR {formTotals.totalCredit.toLocaleString('id-ID')}
                    </div>
                    <div className="col-span-2">
                      {formTotals.isBalanced ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Balanced
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Unbalanced
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateJournal} 
                disabled={!formTotals.isBalanced || formData.lines.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Journal Entry Details</DialogTitle>
            <DialogDescription>
              {selectedJournal?.code} - {selectedJournal?.memo}
            </DialogDescription>
          </DialogHeader>
          {selectedJournal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Journal Date</Label>
                  <div className="text-sm">{format(new Date(selectedJournal.journalDate), 'MMM dd, yyyy')}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>
                    <Badge variant="outline" className={JOURNAL_STATUS_CONFIG[selectedJournal.status].color}>
                      {JOURNAL_STATUS_CONFIG[selectedJournal.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label>Memo</Label>
                <div className="text-sm">{selectedJournal.memo}</div>
              </div>
              {selectedJournal.postedAt && (
                <div>
                  <Label>Posted At</Label>
                  <div className="text-sm">{format(new Date(selectedJournal.postedAt), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              )}
              {/* Journal lines would be displayed here */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Post Journal Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to post journal entry {selectedJournal?.code}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePostJournal}>
              <Send className="w-4 h-4 mr-2" />
              Post Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}