import { useParams, useNavigate } from 'react-router-dom'
import { useColdCallsApi } from '@/lib/api/marketing'
import { ColdCallForm } from './cold-call-form'

export function EditColdCallPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: coldCall, isLoading } = useColdCallsApi.useGet(id!)

  const handleSuccess = () => {
    navigate('/marketing/cold-calls')
  }

  const handleCancel = () => {
    navigate('/marketing/cold-calls')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!coldCall) {
    return (
      <div className="container max-w-2xl py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Cold Call Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested cold call could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Cold Call</h1>
        <p className="text-muted-foreground">Update cold call information</p>
      </div>
      
      <ColdCallForm 
        mode="edit" 
        initialData={coldCall}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}