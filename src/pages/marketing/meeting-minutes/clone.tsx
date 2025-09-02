import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useMeetingMinutesApi, useProjectsApi } from '@/lib/api/marketing'
import { MeetingMinutes, Project } from '@/types/marketing'
import { ArrowLeft, Plus, X, Loader2, Copy } from 'lucide-react'

interface MeetingMinutesFormData {
  customerId: string
  projectId?: string
  attendees: string[]
  notes: string
  productsDiscussed: string[]
  followUps: string[]
  nextMeetingDate?: string
  newProjectName?: string
}

export function CloneMeetingMinutesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: originalMeetingMinutes, isLoading } = useMeetingMinutesApi.useGetById(id!)
  const { mutate: createMeetingMinutes, isPending: isCreating } = useMeetingMinutesApi.useCreate()
  const { mutate: createProject, isPending: isCreatingProject } = useProjectsApi.useCreate()
  const { data: projects } = useProjectsApi.useList()

  const [attendeeInput, setAttendeeInput] = useState('')
  const [productInput, setProductInput] = useState('')
  const [followUpInput, setFollowUpInput] = useState('')
  const [createNewProject, setCreateNewProject] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<MeetingMinutesFormData>({
    defaultValues: {
      customerId: '',
      attendees: [],
      notes: '',
      productsDiscussed: [],
      followUps: []
    }
  })

  useEffect(() => {
    if (originalMeetingMinutes) {
      reset({
        customerId: originalMeetingMinutes.customerId,
        projectId: originalMeetingMinutes.projectId,
        attendees: [...originalMeetingMinutes.attendees],
        notes: originalMeetingMinutes.notes,
        productsDiscussed: [...originalMeetingMinutes.productsDiscussed],
        followUps: [...originalMeetingMinutes.followUps],
        nextMeetingDate: originalMeetingMinutes.nextMeetingDate
      })
    }
  }, [originalMeetingMinutes, reset])

  const watchedAttendees = watch('attendees')
  const watchedProducts = watch('productsDiscussed')
  const watchedFollowUps = watch('followUps')

  const addAttendee = () => {
    if (attendeeInput.trim()) {
      setValue('attendees', [...watchedAttendees, attendeeInput.trim()])
      setAttendeeInput('')
    }
  }

  const removeAttendee = (index: number) => {
    setValue('attendees', watchedAttendees.filter((_, i) => i !== index))
  }

  const addProduct = () => {
    if (productInput.trim()) {
      setValue('productsDiscussed', [...watchedProducts, productInput.trim()])
      setProductInput('')
    }
  }

  const removeProduct = (index: number) => {
    setValue('productsDiscussed', watchedProducts.filter((_, i) => i !== index))
  }

  const addFollowUp = () => {
    if (followUpInput.trim()) {
      setValue('followUps', [...watchedFollowUps, followUpInput.trim()])
      setFollowUpInput('')
    }
  }

  const removeFollowUp = (index: number) => {
    setValue('followUps', watchedFollowUps.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: MeetingMinutesFormData) => {
    if (!originalMeetingMinutes) return

    try {
      let projectId = data.projectId

      // Create new project if requested
      if (createNewProject && data.newProjectName?.trim()) {
        const newProject: Partial<Project> = {
          name: data.newProjectName,
          customerId: data.customerId,
          source: 'ColdCall',
          description: `Project created from cloned meeting minutes`
        }

        const projectResult = await new Promise<Project>((resolve, reject) => {
          createProject(newProject, {
            onSuccess: resolve,
            onError: reject
          })
        })

        projectId = projectResult.id
      }

      const meetingMinutesData: Partial<MeetingMinutes> = {
        customerId: data.customerId,
        projectId,
        attendees: data.attendees,
        notes: data.notes,
        productsDiscussed: data.productsDiscussed,
        followUps: data.followUps,
        nextMeetingDate: data.nextMeetingDate,
        clonedFrom: originalMeetingMinutes.id
      }

      createMeetingMinutes(meetingMinutesData, {
        onSuccess: (result) => {
          toast.success('Meeting minutes cloned successfully')
          navigate(`/marketing/meeting-minutes/${result.id}/view`)
        },
        onError: () => {
          toast.error('Failed to clone meeting minutes')
        }
      })
    } catch (error) {
      toast.error('Failed to clone meeting minutes')
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

  if (!originalMeetingMinutes) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meeting Minutes Not Found</h2>
          <p className="text-gray-600 mb-4">The original meeting minutes could not be found.</p>
          <Button onClick={() => navigate('/marketing/meeting-minutes')}>
            Back to Meeting Minutes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/marketing/meeting-minutes/${id}/view`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Copy className="h-8 w-8 mr-2" />
            Clone Meeting Minutes
          </h1>
          <p className="text-gray-600">Cloning from: {originalMeetingMinutes.customerId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Customer *</Label>
                <Controller
                  name="customerId"
                  control={control}
                  rules={{ required: 'Customer is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter customer ID"
                    />
                  )}
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="projectId">Project</Label>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={createNewProject ? 'new' : field.value || ''}
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setCreateNewProject(true)
                          field.onChange('')
                        } else {
                          setCreateNewProject(false)
                          field.onChange(value || undefined)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        <SelectItem value="new">+ Create New Project</SelectItem>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {createNewProject && (
              <div>
                <Label htmlFor="newProjectName">New Project Name *</Label>
                <Controller
                  name="newProjectName"
                  control={control}
                  rules={{ required: createNewProject ? 'Project name is required' : false }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter new project name"
                    />
                  )}
                />
                {errors.newProjectName && (
                  <p className="text-sm text-red-500">{errors.newProjectName.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="nextMeetingDate">Next Meeting Date</Label>
              <Controller
                name="nextMeetingDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Add attendee name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
              />
              <Button type="button" onClick={addAttendee}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedAttendees.map((attendee, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  {attendee}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeAttendee(index)}
                  />
                </Badge>
              ))}
            </div>
            {errors.attendees && (
              <p className="text-sm text-red-500">At least one attendee is required</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="notes"
              control={control}
              rules={{ required: 'Meeting notes are required' }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter detailed meeting notes..."
                  rows={6}
                />
              )}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products Discussed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Add product discussed"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
              />
              <Button type="button" onClick={addProduct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedProducts.map((product, index) => (
                <Badge key={index} variant="outline" className="flex items-center">
                  {product}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeProduct(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Add follow-up action"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFollowUp())}
              />
              <Button type="button" onClick={addFollowUp}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedFollowUps.map((followUp, index) => (
                <Badge key={index} variant="outline" className="flex items-center">
                  {followUp}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeFollowUp(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/marketing/meeting-minutes/${id}/view`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isCreatingProject}
          >
            {(isCreating || isCreatingProject) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Clone Meeting Minutes
          </Button>
        </div>
      </form>
    </div>
  )
}