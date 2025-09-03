import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table'
import { 
  Plus, 
  FileText, 
  Image, 
  Video, 
  Globe, 
  Target,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { useContentRequestsApi } from '@/lib/api/director-dashboard'
import { ContentRequest } from '@/types/director-dashboard'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'

interface CreateContentRequestDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateContentRequestDialog({ open, onClose, onSuccess }: CreateContentRequestDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productDetails: {
      productId: '',
      productName: '',
      category: '',
      specifications: '',
      targetAudience: '',
      brandingGuidelines: ''
    },
    department: '',
    priority: 'Medium' as const,
    deadline: '',
    deliverables: [{
      type: 'SocialMediaPost' as const,
      platform: '',
      dimensions: '',
      format: ''
    }]
  })

  const { mutate: createContentRequest, isPending } = useContentRequestsApi.useCreate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const contentRequest: Partial<ContentRequest> = {
      ...formData,
      requestedBy: 'current_user', // In real app, get from auth
      status: 'Draft',
      approvals: []
    }

    createContentRequest(contentRequest, {
      onSuccess: () => {
        toast.success('Content request created successfully')
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          title: '',
          description: '',
          productDetails: {
            productId: '',
            productName: '',
            category: '',
            specifications: '',
            targetAudience: '',
            brandingGuidelines: ''
          },
          department: '',
          priority: 'Medium',
          deadline: '',
          deliverables: [{
            type: 'SocialMediaPost',
            platform: '',
            dimensions: '',
            format: ''
          }]
        })
      },
      onError: () => {
        toast.error('Failed to create content request')
      }
    })
  }

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, {
        type: 'SocialMediaPost',
        platform: '',
        dimensions: '',
        format: ''
      }]
    }))
  }

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Content Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    value={formData.productDetails.productId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      productDetails: { ...prev.productDetails, productId: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.productDetails.productName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      productDetails: { ...prev.productDetails, productName: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.productDetails.category}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    productDetails: { ...prev.productDetails, category: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  value={formData.productDetails.specifications}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    productDetails: { ...prev.productDetails, specifications: e.target.value }
                  }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.productDetails.targetAudience}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      productDetails: { ...prev.productDetails, targetAudience: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandingGuidelines">Branding Guidelines</Label>
                  <Input
                    id="brandingGuidelines"
                    value={formData.productDetails.brandingGuidelines}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      productDetails: { ...prev.productDetails, brandingGuidelines: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Deliverables</CardTitle>
                <Button type="button" onClick={addDeliverable} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Deliverable {index + 1}</h4>
                    {formData.deliverables.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => removeDeliverable(index)} 
                        size="sm" 
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={deliverable.type} 
                        onValueChange={(value) => {
                          const newDeliverables = [...formData.deliverables]
                          newDeliverables[index] = { ...deliverable, type: value as any }
                          setFormData(prev => ({ ...prev, deliverables: newDeliverables }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SocialMediaPost">Social Media Post</SelectItem>
                          <SelectItem value="Brochure">Brochure</SelectItem>
                          <SelectItem value="ProductVideo">Product Video</SelectItem>
                          <SelectItem value="WebsiteContent">Website Content</SelectItem>
                          <SelectItem value="Advertisement">Advertisement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Platform/Format</Label>
                      <Input
                        value={deliverable.platform || ''}
                        onChange={(e) => {
                          const newDeliverables = [...formData.deliverables]
                          newDeliverables[index] = { ...deliverable, platform: e.target.value }
                          setFormData(prev => ({ ...prev, deliverables: newDeliverables }))
                        }}
                        placeholder="e.g., Instagram, YouTube, PDF"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dimensions</Label>
                      <Input
                        value={deliverable.dimensions || ''}
                        onChange={(e) => {
                          const newDeliverables = [...formData.deliverables]
                          newDeliverables[index] = { ...deliverable, dimensions: e.target.value }
                          setFormData(prev => ({ ...prev, deliverables: newDeliverables }))
                        }}
                        placeholder="e.g., 1080x1080, A4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>File Format</Label>
                      <Input
                        value={deliverable.format || ''}
                        onChange={(e) => {
                          const newDeliverables = [...formData.deliverables]
                          newDeliverables[index] = { ...deliverable, format: e.target.value }
                          setFormData(prev => ({ ...prev, deliverables: newDeliverables }))
                        }}
                        placeholder="e.g., JPG, MP4, PDF"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />}
              Create Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Draft': return 'gray'
    case 'Submitted': return 'yellow'
    case 'InProgress': return 'blue'
    case 'Review': return 'purple'
    case 'Approved': return 'green'
    case 'Published': return 'green'
    case 'Rejected': return 'red'
    default: return 'gray'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Urgent': return 'red'
    case 'High': return 'orange'
    case 'Medium': return 'yellow'
    case 'Low': return 'green'
    default: return 'gray'
  }
}

function getDeliverableIcon(type: string) {
  switch (type) {
    case 'SocialMediaPost': return Image
    case 'ProductVideo': return Video
    case 'WebsiteContent': return Globe
    case 'Advertisement': return Target
    default: return FileText
  }
}

export function ContentRequestManagement() {
  const navigate = useNavigate()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const { data: contentRequests = [], isLoading, refetch } = useContentRequestsApi.useList()

  const columns: ColumnDef<ContentRequest>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-gray-500">{row.original.productDetails.productName}</p>
        </div>
      )
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <span>{row.original.department}</span>
        </div>
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className={`border-${getPriorityColor(row.original.priority)}-200 text-${getPriorityColor(row.original.priority)}-700`}
        >
          {row.original.priority}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className={`border-${getStatusColor(row.original.status)}-200 text-${getStatusColor(row.original.status)}-700`}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'deliverables',
      header: 'Deliverables',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.deliverables.slice(0, 3).map((deliverable, index) => {
            const Icon = getDeliverableIcon(deliverable.type)
            return (
              <div key={index} className="p-1 bg-gray-100 rounded" title={deliverable.type}>
                <Icon className="h-3 w-3" />
              </div>
            )
          })}
          {row.original.deliverables.length > 3 && (
            <span className="text-xs text-gray-500">+{row.original.deliverables.length - 3}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'deadline',
      header: 'Deadline',
      cell: ({ row }) => {
        if (!row.original.deadline) return <span className="text-gray-400">No deadline</span>
        
        const deadline = new Date(row.original.deadline)
        const now = new Date()
        const isOverdue = deadline < now
        
        return (
          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {deadline.toLocaleDateString()}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{row.original.requestedBy}</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Request Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage marketing content requests with product details
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboards/overview')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{contentRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contentRequests.filter(r => r.status === 'InProgress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {contentRequests.filter(r => r.status === 'Published').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {contentRequests.filter(r => r.priority === 'Urgent' && r.status !== 'Published').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Requests Table */}
      <DataTable
        data={contentRequests}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search content requests..."
      />

      {/* Create Content Request Dialog */}
      <CreateContentRequestDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={refetch}
      />
    </div>
  )
}