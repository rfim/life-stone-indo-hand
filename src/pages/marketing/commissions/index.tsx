import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import { useCommissionRulesApi, useCommissionEntriesApi } from '@/lib/api/marketing'
import { CommissionRule, CommissionEntry, CommissionCalc, CommissionTrigger } from '@/types/marketing'
import { Plus, Eye, Edit, DollarSign, TrendingUp, Users } from 'lucide-react'

const getCalcColor = (calc: CommissionCalc) => {
  switch (calc) {
    case 'PCT_OF_NET_MARGIN': return 'bg-green-100 text-green-800'
    case 'PCT_OF_GROSS': return 'bg-blue-100 text-blue-800'
    case 'FIXED_PER_UNIT': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function CommissionsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: commissionRules, isLoading: rulesLoading } = useCommissionRulesApi.useList()
  const { data: commissionEntries, isLoading: entriesLoading } = useCommissionEntriesApi.useList()

  const rulesColumns = [
    {
      accessorKey: 'name',
      header: 'Rule Name',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <span className="font-medium">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'appliesTo',
      header: 'Type',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <Badge variant={row.original.appliesTo === 'TEAM' ? 'default' : 'secondary'}>
          {row.original.appliesTo}
        </Badge>
      )
    },
    {
      accessorKey: 'calc',
      header: 'Calculation',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <Badge className={getCalcColor(row.original.calc)}>
          {row.original.calc.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <span>
          {row.original.calc === 'FIXED_PER_UNIT' 
            ? `${row.original.fixedAmount || 0} per unit`
            : `${row.original.rate}%`
          }
        </span>
      )
    },
    {
      accessorKey: 'trigger',
      header: 'Trigger',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <Badge variant="outline">
          {row.original.trigger.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: CommissionRule } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/commissions/rules/${row.original.id}/view`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/commissions/rules/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const entriesColumns = [
    {
      accessorKey: 'payableTo',
      header: 'Payable To',
      cell: ({ row }: { row: { original: CommissionEntry } }) => (
        <span className="font-medium">{row.original.payableTo}</span>
      )
    },
    {
      accessorKey: 'payableType',
      header: 'Type',
      cell: ({ row }: { row: { original: CommissionEntry } }) => (
        <Badge variant={row.original.payableType === 'User' ? 'default' : 'secondary'}>
          {row.original.payableType}
        </Badge>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: { original: CommissionEntry } }) => (
        <span className="font-semibold">
          {row.original.amount.toLocaleString('id-ID', { 
            style: 'currency', 
            currency: row.original.currency 
          })}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: CommissionEntry } }) => (
        <Badge variant={
          row.original.status === 'Paid' ? 'default' :
          row.original.status === 'Payable' ? 'destructive' : 'secondary'
        }>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'soId',
      header: 'Source',
      cell: ({ row }: { row: { original: CommissionEntry } }) => (
        row.original.soId ? (
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => navigate(`/marketing/sales-orders/${row.original.soId}/view`)}
          >
            SO: {row.original.soId}
          </Button>
        ) : row.original.invoiceId ? (
          <span>Invoice: {row.original.invoiceId}</span>
        ) : (
          <span>DO: {row.original.doId}</span>
        )
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: { original: CommissionEntry } }) => formatDate(row.original.createdAt, 'MMM dd, yyyy')
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Commissions</h1>
          <p className="text-gray-600">Manage commission rules and track earnings</p>
        </div>
        <Button onClick={() => navigate('/marketing/commissions/rules/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Commission Rule
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <DataTable
            data={commissionRules || []}
            columns={rulesColumns}
            loading={rulesLoading}
            searchable={true}
            searchPlaceholder="Search commission rules..."
          />
        </TabsContent>

        <TabsContent value="entries">
          <DataTable
            data={commissionEntries || []}
            columns={entriesColumns}
            loading={entriesLoading}
            searchable={true}
            searchPlaceholder="Search commission entries..."
          />
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Accrued</h3>
              <p className="text-2xl font-bold text-blue-600">
                {(commissionEntries?.filter(e => e.status === 'Accrued')
                  .reduce((sum, e) => sum + e.amount, 0) || 0)
                  .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Payable</h3>
              <p className="text-2xl font-bold text-orange-600">
                {(commissionEntries?.filter(e => e.status === 'Payable')
                  .reduce((sum, e) => sum + e.amount, 0) || 0)
                  .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Paid</h3>
              <p className="text-2xl font-bold text-green-600">
                {(commissionEntries?.filter(e => e.status === 'Paid')
                  .reduce((sum, e) => sum + e.amount, 0) || 0)
                  .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}