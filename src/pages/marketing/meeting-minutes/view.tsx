import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useMeetingMinutesApi, whatsappService } from '@/lib/api/marketing'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Edit, Copy, Send, Loader2, Calendar, Users, Package, CheckSquare } from 'lucide-react'
import { useState } from 'react'

export function ViewMeetingMinutesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: meetingMinutes, isLoading } = useMeetingMinutesApi.useGetById(id!)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)

  const sendWhatsAppMessage = async () => {
    if (!meetingMinutes) return

    setSendingWhatsApp(true)
    try {
      const result = await whatsappService.sendMessage({
        template: 'MeetingMinutes',
        to: `customer_${meetingMinutes.customerId}`,
        variables: {
          client_name: meetingMinutes.customerId,
          date: formatDate(meetingMinutes.createdAt),
          next_meeting: meetingMinutes.nextMeetingDate ? formatDate(meetingMinutes.nextMeetingDate) : 'TBD',
          attendees: meetingMinutes.attendees.join(', '),
          products: meetingMinutes.productsDiscussed.join(', '),
          follow_ups: meetingMinutes.followUps.join('; ')
        },
        attachments: [{
          filename: `meeting_minutes_${meetingMinutes.id}.pdf`,
          url: `/api/pdf/meeting-minutes/${meetingMinutes.id}.pdf`,
          type: 'application/pdf'
        }]
      })

      if (result.success) {
        toast.success(`WhatsApp message sent successfully (ID: ${result.messageId})`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message')
    } finally {
      setSendingWhatsApp(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!meetingMinutes) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meeting Minutes Not Found</h2>
          <p className="text-gray-600 mb-4">The requested meeting minutes could not be found.</p>
          <Button onClick={() => navigate('/marketing/meeting-minutes')}>
            Back to Meeting Minutes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketing/meeting-minutes')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Meeting Minutes</h1>
            <p className="text-gray-600">{formatDate(meetingMinutes.createdAt)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={sendWhatsAppMessage}
            disabled={sendingWhatsApp}
          >
            {sendingWhatsApp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/marketing/meeting-minutes/${id}/clone`)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Button onClick={() => navigate(`/marketing/meeting-minutes/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-lg font-semibold">{meetingMinutes.customerId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Project</label>
                <p className="text-lg">
                  {meetingMinutes.projectId ? (
                    <Badge variant="secondary">{meetingMinutes.projectId}</Badge>
                  ) : (
                    <span className="text-gray-400">No project linked</span>
                  )}
                </p>
              </div>
              {meetingMinutes.coldCallId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cold Call</label>
                  <p className="text-lg">
                    <Badge variant="outline">{meetingMinutes.coldCallId}</Badge>
                  </p>
                </div>
              )}
              {meetingMinutes.nextMeetingDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Meeting</label>
                  <p className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(meetingMinutes.nextMeetingDate)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Attendees ({meetingMinutes.attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {meetingMinutes.attendees.map((attendee, index) => (
                <Badge key={index} variant="secondary">
                  {attendee}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{meetingMinutes.notes}</p>
            </div>
          </CardContent>
        </Card>

        {meetingMinutes.productsDiscussed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Products Discussed ({meetingMinutes.productsDiscussed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {meetingMinutes.productsDiscussed.map((product, index) => (
                  <Badge key={index} variant="outline">
                    {product}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {meetingMinutes.followUps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Follow-up Actions ({meetingMinutes.followUps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {meetingMinutes.followUps.map((followUp, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-blue-500 rounded-full" />
                    <span className="text-gray-700">{followUp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {meetingMinutes.attachments && meetingMinutes.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {meetingMinutes.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center p-2 border rounded">
                    <span className="flex-grow">{attachment}</span>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-500">Created At</label>
                <p>{formatDate(meetingMinutes.createdAt)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-500">Updated At</label>
                <p>{formatDate(meetingMinutes.updatedAt)}</p>
              </div>
              {meetingMinutes.clonedFrom && (
                <div>
                  <label className="font-medium text-gray-500">Cloned From</label>
                  <p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => navigate(`/marketing/meeting-minutes/${meetingMinutes.clonedFrom}/view`)}
                    >
                      {meetingMinutes.clonedFrom}
                    </Button>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}