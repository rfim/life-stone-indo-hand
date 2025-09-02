import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useContractsApi, whatsappService, generateQRPayload, generatePDF } from '@/lib/api/marketing'
import { formatDate } from '@/lib/utils'
import { ContractStatus } from '@/types/marketing'
import {
  ArrowLeft, Edit, Send, Loader2, FileText, QrCode, Archive, Calendar,
  Users, Building, CreditCard, PenTool, Paperclip
} from 'lucide-react'

const getStatusColor = (status: ContractStatus) => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800'
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Archived':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ViewContractPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contract, isLoading } = useContractsApi.useGetById(id!)
  const { mutate: updateContract } = useContractsApi.useUpdate()
  
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const handleActivate = async () => {
    if (!contract || contract.status !== 'Draft') return

    try {
      await updateContract({
        id: contract.id,
        data: { status: 'Active' }
      }, {
        onSuccess: () => {
          toast.success('Contract activated successfully')
          window.location.reload()
        },
        onError: () => {
          toast.error('Failed to activate contract')
        }
      })
    } catch (error) {
      toast.error('Failed to activate contract')
    }
  }

  const handleArchive = async () => {
    if (!contract || contract.status === 'Archived') return

    setArchiving(true)
    try {
      await updateContract({
        id: contract.id,
        data: { status: 'Archived' }
      }, {
        onSuccess: () => {
          toast.success('Contract archived successfully')
          window.location.reload()
        },
        onError: () => {
          toast.error('Failed to archive contract')
        }
      })
    } catch (error) {
      toast.error('Failed to archive contract')
    } finally {
      setArchiving(false)
    }
  }

  const sendWhatsAppMessage = async () => {
    if (!contract) return

    setSendingWhatsApp(true)
    try {
      const client = contract.parties.find(p => p.role === 'Client')
      const result = await whatsappService.sendMessage({
        template: 'Contract',
        to: `customer_${client?.name || 'unknown'}`,
        variables: {
          client_name: client?.name || 'Customer',
          contract_number: contract.code,
          scope: contract.scope,
          start_date: formatDate(contract.validity.startDate),
          end_date: formatDate(contract.validity.endDate),
          status: contract.status
        },
        attachments: [{
          filename: `contract_${contract.code}.pdf`,
          url: `/api/pdf/contracts/${contract.id}.pdf`,
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

  const generateContractPDF = async () => {
    if (!contract) return

    setGeneratingPDF(true)
    try {
      const qrPayload = generateQRPayload('Contract', contract)
      const pdfUrl = await generatePDF('Contract', contract)
      
      // Update contract with QR payload and PDF URL
      await updateContract({
        id: contract.id,
        data: { qrPayload, pdfUrl }
      }, {
        onSuccess: () => {
          toast.success('PDF generated successfully')
          window.open(pdfUrl, '_blank')
        },
        onError: () => {
          toast.error('Failed to generate PDF')
        }
      })
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const canActivate = contract?.status === 'Draft'
  const canArchive = contract?.status === 'Active'

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
          <p className="text-gray-600 mb-4">The requested contract could not be found.</p>
          <Button onClick={() => navigate('/marketing/contracts')}>
            Back to Contracts
          </Button>
        </div>
      </div>
    )
  }

  const client = contract.parties.find(p => p.role === 'Client')
  const contractor = contract.parties.find(p => p.role === 'Contractor')

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketing/contracts')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contract {contract.code}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(contract.status)}>
                {contract.status}
              </Badge>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{formatDate(contract.createdAt)}</span>
            </div>
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
            onClick={generateContractPDF}
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate PDF
          </Button>

          <Button onClick={() => navigate(`/marketing/contracts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Contract Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contract Code</label>
                <p className="text-lg font-mono font-semibold">{contract.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tax Type</label>
                <p className="text-lg">
                  <Badge variant={contract.taxType === 'PPN' ? "default" : "outline"}>
                    {contract.taxType}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Project</label>
                <p className="text-lg">
                  {contract.projectId ? (
                    <Badge variant="secondary">{contract.projectId}</Badge>
                  ) : (
                    <span className="text-gray-400">Standalone</span>
                  )}
                </p>
              </div>
            </div>

            {contract.soId && (
              <div>
                <label className="text-sm font-medium text-gray-500">Sales Order</label>
                <p className="text-lg">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => navigate(`/marketing/sales-orders/${contract.soId}/view`)}
                  >
                    {contract.soId}
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Contract Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Client</h4>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    {client.address && <p className="text-gray-600">{client.address}</p>}
                    {client.contactPerson && (
                      <p className="text-gray-600">Contact: {client.contactPerson}</p>
                    )}
                  </div>
                </div>
              )}

              {contractor && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Contractor</h4>
                  <div>
                    <p className="font-medium">{contractor.name}</p>
                    {contractor.address && <p className="text-gray-600">{contractor.address}</p>}
                    {contractor.contactPerson && (
                      <p className="text-gray-600">Contact: {contractor.contactPerson}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {contract.parties.length > 2 && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-2">Other Parties</h4>
                <div className="space-y-2">
                  {contract.parties
                    .filter(p => p.role !== 'Client' && p.role !== 'Contractor')
                    .map((party, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{party.name}</p>
                            <Badge variant="outline">{party.role}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scope of Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{contract.scope}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Contract Validity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-lg">{formatDate(contract.validity.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-lg">{formatDate(contract.validity.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Terms of Payment</label>
              <p className="text-lg">{contract.paymentTerms.top} days</p>
            </div>

            {contract.paymentTerms.milestones && contract.paymentTerms.milestones.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Milestones</label>
                <div className="mt-2 space-y-2">
                  {contract.paymentTerms.milestones.map((milestone, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{milestone.description}</p>
                          {milestone.dueDate && (
                            <p className="text-sm text-gray-600">
                              Due: {formatDate(milestone.dueDate)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{milestone.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {contract.signatures && contract.signatures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="h-5 w-5 mr-2" />
                Signatures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contract.signatures.map((signature, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{signature.party}</div>
                        {signature.signedBy && signature.signedAt ? (
                          <div className="text-sm text-gray-600">
                            Signed by {signature.signedBy} on {formatDate(signature.signedAt)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Pending signature</div>
                        )}
                      </div>
                      <Badge variant={signature.signedBy ? 'default' : 'secondary'}>
                        {signature.signedBy ? 'Signed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {contract.attachments && contract.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Paperclip className="h-5 w-5 mr-2" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contract.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span>{attachment}</span>
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
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {canActivate && (
                <Button onClick={handleActivate}>
                  Activate Contract
                </Button>
              )}
              
              {canArchive && (
                <Button onClick={handleArchive} variant="outline" disabled={archiving}>
                  {archiving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Contract
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-500">Created At</label>
                <p>{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-500">Updated At</label>
                <p>{formatDate(contract.updatedAt)}</p>
              </div>
              {contract.qrPayload && (
                <div>
                  <label className="font-medium text-gray-500">QR Code</label>
                  <p className="text-xs font-mono break-all">{contract.qrPayload}</p>
                </div>
              )}
              {contract.pdfUrl && (
                <div>
                  <label className="font-medium text-gray-500">PDF URL</label>
                  <p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-xs"
                      onClick={() => window.open(contract.pdfUrl, '_blank')}
                    >
                      View PDF
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