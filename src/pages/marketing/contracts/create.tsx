import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useContractsApi, useProjectsApi, useSalesOrdersApi } from '@/lib/api/marketing'
import { Contract, Project } from '@/types/marketing'
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'

interface ContractFormData {
  code: string
  soId?: string
  projectId?: string
  parties: Array<{
    name: string
    role: 'Client' | 'Contractor'
    address?: string
    contactPerson?: string
  }>
  scope: string
  paymentTerms: {
    top: number
    milestones?: Array<{
      description: string
      percentage: number
      dueDate?: string
    }>
  }
  taxType: 'PPN' | 'Non-PPN'
  validity: {
    startDate: string
    endDate: string
  }
  signatures: Array<{
    party: string
    signedBy?: string
    signedAt?: string
  }>
  attachments: string[]
  newProjectName?: string
}

export function CreateContractPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const soId = searchParams.get('soId')

  const { mutate: createContract, isPending: isCreating } = useContractsApi.useCreate()
  const { mutate: createProject, isPending: isCreatingProject } = useProjectsApi.useCreate()
  const { data: projects } = useProjectsApi.useList()
  const { data: salesOrders } = useSalesOrdersApi.useList()
  const { data: salesOrder } = useSalesOrdersApi.useGetById(soId || '')

  const [createNewProject, setCreateNewProject] = useState(false)
  const [partyInput, setPartyInput] = useState({ name: '', role: 'Client', address: '', contactPerson: '' })
  const [milestoneInput, setMilestoneInput] = useState({ description: '', percentage: '', dueDate: '' })
  const [attachmentInput, setAttachmentInput] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ContractFormData>({
    defaultValues: {
      code: '',
      parties: [],
      scope: '',
      paymentTerms: {
        top: 30,
        milestones: []
      },
      taxType: 'PPN',
      validity: {
        startDate: '',
        endDate: ''
      },
      signatures: [],
      attachments: [],
      soId: soId || undefined
    }
  })

  const { fields: partyFields, append: appendParty, remove: removeParty } = useFieldArray({
    control,
    name: 'parties'
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: 'paymentTerms.milestones'
  })

  useEffect(() => {
    // Generate contract code
    const timestamp = Date.now().toString().slice(-6)
    setValue('code', `CON-${timestamp}`)

    // Set default validity (1 year from now)
    const now = new Date()
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    setValue('validity.startDate', now.toISOString().split('T')[0])
    setValue('validity.endDate', nextYear.toISOString().split('T')[0])
  }, [setValue])

  useEffect(() => {
    if (salesOrder) {
      setValue('projectId', salesOrder.projectId)
      // Pre-fill some fields from sales order
      setValue('scope', `Supply and delivery as per sales order ${salesOrder.code}`)
      setValue('paymentTerms.top', salesOrder.top)
      setValue('taxType', salesOrder.isPPN ? 'PPN' : 'Non-PPN')
      
      // Add customer as client party
      appendParty({
        name: salesOrder.customerId,
        role: 'Client',
        address: '',
        contactPerson: ''
      })
    }
  }, [salesOrder, setValue, appendParty])

  const addParty = () => {
    if (partyInput.name) {
      appendParty({
        name: partyInput.name,
        role: partyInput.role as 'Client' | 'Contractor',
        address: partyInput.address,
        contactPerson: partyInput.contactPerson
      })
      setPartyInput({ name: '', role: 'Client', address: '', contactPerson: '' })
    }
  }

  const addMilestone = () => {
    if (milestoneInput.description && milestoneInput.percentage) {
      appendMilestone({
        description: milestoneInput.description,
        percentage: parseFloat(milestoneInput.percentage),
        dueDate: milestoneInput.dueDate || undefined
      })
      setMilestoneInput({ description: '', percentage: '', dueDate: '' })
    }
  }

  const addAttachment = () => {
    if (attachmentInput.trim()) {
      const currentAttachments = watch('attachments')
      setValue('attachments', [...currentAttachments, attachmentInput.trim()])
      setAttachmentInput('')
    }
  }

  const removeAttachment = (index: number) => {
    const currentAttachments = watch('attachments')
    setValue('attachments', currentAttachments.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ContractFormData) => {
    try {
      let projectId = data.projectId

      // Create new project if requested
      if (createNewProject && data.newProjectName?.trim()) {
        const newProject: Partial<Project> = {
          name: data.newProjectName,
          customerId: data.parties.find(p => p.role === 'Client')?.name || '',
          source: 'SO',
          description: `Project created from contract ${data.code}`
        }

        const projectResult = await new Promise<Project>((resolve, reject) => {
          createProject(newProject, {
            onSuccess: resolve,
            onError: reject
          })
        })

        projectId = projectResult.id
      }

      const contractData: Partial<Contract> = {
        code: data.code,
        soId: data.soId,
        projectId,
        parties: data.parties,
        scope: data.scope,
        paymentTerms: data.paymentTerms,
        taxType: data.taxType,
        validity: data.validity,
        signatures: data.signatures,
        attachments: data.attachments,
        status: 'Draft'
      }

      createContract(contractData, {
        onSuccess: (result) => {
          toast.success('Contract created successfully')
          navigate(`/marketing/contracts/${result.id}/view`)
        },
        onError: () => {
          toast.error('Failed to create contract')
        }
      })
    } catch (error) {
      toast.error('Failed to create contract')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketing/contracts')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Contract</h1>
          {salesOrder && (
            <p className="text-gray-600">Linked to Sales Order: {salesOrder.code}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">Contract Code *</Label>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: 'Contract code is required' }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter contract code" />
                  )}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="soId">Sales Order</Label>
                <Controller
                  name="soId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales order (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No sales order</SelectItem>
                        {salesOrders?.map((so) => (
                          <SelectItem key={so.id} value={so.id}>
                            {so.code} - {so.customerId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="taxType">Tax Type</Label>
                <Controller
                  name="taxType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PPN">PPN</SelectItem>
                        <SelectItem value="Non-PPN">Non-PPN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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

            {createNewProject && (
              <div>
                <Label htmlFor="newProjectName">New Project Name *</Label>
                <Controller
                  name="newProjectName"
                  control={control}
                  rules={{ required: createNewProject ? 'Project name is required' : false }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter new project name" />
                  )}
                />
                {errors.newProjectName && (
                  <p className="text-sm text-red-500">{errors.newProjectName.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input
                placeholder="Party name"
                value={partyInput.name}
                onChange={(e) => setPartyInput(prev => ({ ...prev, name: e.target.value }))}
              />
              <Select
                value={partyInput.role}
                onValueChange={(value) => setPartyInput(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Address"
                value={partyInput.address}
                onChange={(e) => setPartyInput(prev => ({ ...prev, address: e.target.value }))}
              />
              <Input
                placeholder="Contact person"
                value={partyInput.contactPerson}
                onChange={(e) => setPartyInput(prev => ({ ...prev, contactPerson: e.target.value }))}
              />
              <Button type="button" onClick={addParty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {partyFields.map((field, index) => (
                <div key={field.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{field.name}</div>
                    <div className="text-sm text-gray-600">
                      <Badge variant="outline">{field.role}</Badge>
                      {field.address && <span className="ml-2">{field.address}</span>}
                      {field.contactPerson && <span className="ml-2">• {field.contactPerson}</span>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParty(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {partyFields.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No parties added. Add at least one client and one contractor.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scope">Scope of Work *</Label>
              <Controller
                name="scope"
                control={control}
                rules={{ required: 'Scope is required' }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Describe the scope of work and deliverables..."
                    rows={4}
                  />
                )}
              />
              {errors.scope && (
                <p className="text-sm text-red-500">{errors.scope.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validity.startDate">Start Date *</Label>
                <Controller
                  name="validity.startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <Input {...field} type="date" />
                  )}
                />
                {errors.validity?.startDate && (
                  <p className="text-sm text-red-500">{errors.validity.startDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="validity.endDate">End Date *</Label>
                <Controller
                  name="validity.endDate"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <Input {...field} type="date" />
                  )}
                />
                {errors.validity?.endDate && (
                  <p className="text-sm text-red-500">{errors.validity.endDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentTerms.top">Terms of Payment (days)</Label>
              <Controller
                name="paymentTerms.top"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                  />
                )}
              />
            </div>

            <div>
              <Label>Payment Milestones (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Description"
                  value={milestoneInput.description}
                  onChange={(e) => setMilestoneInput(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Percentage"
                  value={milestoneInput.percentage}
                  onChange={(e) => setMilestoneInput(prev => ({ ...prev, percentage: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Due date"
                  value={milestoneInput.dueDate}
                  onChange={(e) => setMilestoneInput(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Button type="button" onClick={addMilestone}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {milestoneFields.map((field, index) => (
                  <div key={field.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{field.description}</span>
                      <Badge variant="outline" className="ml-2">{field.percentage}%</Badge>
                      {field.dueDate && (
                        <span className="text-sm text-gray-600 ml-2">Due: {field.dueDate}</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Attachment name or URL"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachment())}
              />
              <Button type="button" onClick={addAttachment}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {watch('attachments').map((attachment, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{attachment}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/marketing/contracts')}
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
            Create Contract
          </Button>
        </div>
      </form>
    </div>
  )
}