import { useNavigate } from 'react-router-dom'
import { ColdCallForm } from './cold-call-form'

export function CreateColdCallPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/marketing/cold-calls')
  }

  const handleCancel = () => {
    navigate('/marketing/cold-calls')
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Cold Call</h1>
        <p className="text-muted-foreground">Schedule a new customer outreach call</p>
      </div>
      
      <ColdCallForm 
        mode="create" 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}