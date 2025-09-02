import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Phone, Users, Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { ColdCall, ColdCallStatus } from '@/types/marketing'
import { useColdCallsApi } from '@/lib/api/marketing'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const getStatusColor = (status: ColdCallStatus) => {
  switch (status) {
    case 'Planned':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Visited':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'NoShow':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'Converted':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'Dropped':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function ColdCallsPage() {
  const navigate = useNavigate()

  const columns: ColumnDef<ColdCall>[] = [
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }) => {
        // TODO: Lookup customer name from customer ID
        return <span className="font-medium">Customer {row.original.customerId.slice(-4)}</span>
      }
    },
    {
      accessorKey: 'ownerId',
      header: 'Salesperson',
      cell: ({ row }) => {
        // TODO: Lookup user name from owner ID
        return <span>User {row.original.ownerId.slice(-4)}</span>
      }
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled Date',
      cell: ({ row }) => {
        return format(new Date(row.original.scheduledAt), 'MMM dd, yyyy HH:mm')
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'meetingMinuteId',
      header: 'Meeting Minutes',
      cell: ({ row }) => {
        return row.original.meetingMinuteId ? (
          <Badge variant="secondary">Created</Badge>
        ) : (
          <span className="text-muted-foreground">None</span>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), 'MMM dd, yyyy')
      }
    }
  ]

  const handleCreate = () => {
    navigate('/marketing/cold-calls/create')
  }

  const handleRowClick = (coldCall: ColdCall) => {
    navigate(`/marketing/cold-calls/${coldCall.id}/view`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cold Calls</h1>
          <p className="text-muted-foreground">Manage customer outreach and follow-ups</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Cold Call
          </Button>
        </div>
      </div>

      <DataTable
        entity="cold-calls"
        title="Cold Calls"
        subtitle="Track and manage customer outreach activities"
        icon={Phone}
        columns={columns}
        useEntityHooks={useColdCallsApi}
        onRowClick={handleRowClick}
        showActions={true}
        showCreate={true}
      />
    </div>
  )
}