import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useMeetingMinutesApi } from '@/lib/api/marketing'
import { MeetingMinutes } from '@/types/marketing'
import { Plus, Eye, Edit, Copy } from 'lucide-react'

export function MeetingMinutesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: meetingMinutes, isLoading } = useMeetingMinutesApi.useList()

  const currentPage = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => formatDate(row.original.createdAt)
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        <span className="font-medium">{row.original.customerId}</span>
      )
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        row.original.projectId ? (
          <Badge variant="secondary">{row.original.projectId}</Badge>
        ) : (
          <span className="text-gray-400">No project</span>
        )
      )
    },
    {
      accessorKey: 'attendees',
      header: 'Attendees',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        <span className="text-sm">
          {row.original.attendees.length} attendee{row.original.attendees.length !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      accessorKey: 'productsDiscussed',
      header: 'Products',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        <span className="text-sm">
          {row.original.productsDiscussed.length} product{row.original.productsDiscussed.length !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      accessorKey: 'nextMeetingDate',
      header: 'Next Meeting',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        row.original.nextMeetingDate ? (
          <Badge variant="outline">{formatDate(row.original.nextMeetingDate)}</Badge>
        ) : (
          <span className="text-gray-400">Not scheduled</span>
        )
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: MeetingMinutes } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/meeting-minutes/${row.original.id}/view`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/meeting-minutes/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/marketing/meeting-minutes/${row.original.id}/clone`)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString())
      return prev
    })
  }

  const handlePageSizeChange = (size: number) => {
    setSearchParams(prev => {
      prev.set('pageSize', size.toString())
      prev.set('page', '1')
      return prev
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Meeting Minutes</h1>
          <p className="text-gray-600">Manage meeting minutes and customer discussions</p>
        </div>
        <Button onClick={() => navigate('/marketing/meeting-minutes/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting Minutes
        </Button>
      </div>

      <DataTable
        data={meetingMinutes || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          total: meetingMinutes?.length || 0,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        searchable={true}
        searchPlaceholder="Search meeting minutes..."
      />
    </div>
  )
}