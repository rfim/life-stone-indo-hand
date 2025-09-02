import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useMarketingSettingsApi } from '@/lib/api/marketing'
import { MarketingSettings } from '@/types/marketing'
import { ArrowLeft, Save, Settings } from 'lucide-react'

interface SettingsFormData {
  staggerDefaultPeriod: number
  externalExpeditionPolicy: {
    whoCanAssignCarrier: 'MarketingLead' | 'Logistics'
    costBookedTo: 'SO_CHARGE' | 'LOGISTICS_EXPENSE'
    visibility: string[]
  }
  tax: {
    isPPNEnabled: boolean
    defaultPPNRate: number
    defaultNonPPNRate: number
  }
  whatsappConfig: {
    provider: string
    apiKey?: string
    templates: {
      meetingMinutes: string
      salesOrder: string
      contract: string
      deliveryOrder: string
    }
  }
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useMarketingSettingsApi.useList()
  const { mutate: updateSettings, isPending: isUpdating } = useMarketingSettingsApi.useUpdate()
  const { mutate: createSettings, isPending: isCreating } = useMarketingSettingsApi.useCreate()

  const [visibilityRole, setVisibilityRole] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SettingsFormData>({
    defaultValues: {
      staggerDefaultPeriod: 30,
      externalExpeditionPolicy: {
        whoCanAssignCarrier: 'MarketingLead',
        costBookedTo: 'SO_CHARGE',
        visibility: []
      },
      tax: {
        isPPNEnabled: true,
        defaultPPNRate: 11,
        defaultNonPPNRate: 0
      },
      whatsappConfig: {
        provider: 'Mock',
        apiKey: '',
        templates: {
          meetingMinutes: 'Hello {{client_name}}, please find attached the meeting minutes from our discussion on {{date}}. Next meeting: {{next_meeting}}.',
          salesOrder: 'Dear {{client_name}}, your sales order {{so_number}} has been created. Total amount: {{total_amount}}. Please review and confirm.',
          contract: 'Dear {{client_name}}, your contract {{contract_number}} is ready for review. Please check the attached document.',
          deliveryOrder: 'Hi {{client_name}}, your delivery order {{do_number}} has been issued. Expected delivery: {{delivery_date}}.'
        }
      }
    }
  })

  useEffect(() => {
    if (settings && settings.length > 0) {
      const currentSettings = settings[0]
      reset(currentSettings)
    }
  }, [settings, reset])

  const watchedVisibility = watch('externalExpeditionPolicy.visibility')

  const addVisibilityRole = () => {
    if (visibilityRole.trim() && !watchedVisibility.includes(visibilityRole.trim())) {
      setValue('externalExpeditionPolicy.visibility', [...watchedVisibility, visibilityRole.trim()])
      setVisibilityRole('')
    }
  }

  const removeVisibilityRole = (role: string) => {
    setValue('externalExpeditionPolicy.visibility', watchedVisibility.filter(r => r !== role))
  }

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const settingsData: Partial<MarketingSettings> = data

      if (settings && settings.length > 0) {
        // Update existing settings
        await updateSettings({
          id: settings[0].id,
          data: settingsData
        }, {
          onSuccess: () => {
            toast.success('Settings updated successfully')
          },
          onError: () => {
            toast.error('Failed to update settings')
          }
        })
      } else {
        // Create new settings
        await createSettings(settingsData, {
          onSuccess: () => {
            toast.success('Settings created successfully')
          },
          onError: () => {
            toast.error('Failed to create settings')
          }
        })
      }
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketing/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="h-8 w-8 mr-2" />
            Marketing Settings
          </h1>
          <p className="text-gray-600">Configure marketing module settings and policies</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="staggerDefaultPeriod">Default Stagger Period (days)</Label>
              <Controller
                name="staggerDefaultPeriod"
                control={control}
                rules={{ required: 'Stagger period is required', min: { value: 1, message: 'Must be at least 1 day' } }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
              {errors.staggerDefaultPeriod && (
                <p className="text-sm text-red-500">{errors.staggerDefaultPeriod.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Default period for stagger returns on loan items
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Expedition Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Who can assign carrier</Label>
              <Controller
                name="externalExpeditionPolicy.whoCanAssignCarrier"
                control={control}
                render={({ field }) => (
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="MarketingLead"
                        checked={field.value === 'MarketingLead'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mr-2"
                      />
                      Marketing Lead
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Logistics"
                        checked={field.value === 'Logistics'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mr-2"
                      />
                      Logistics Team
                    </label>
                  </div>
                )}
              />
            </div>

            <div>
              <Label>Cost booking</Label>
              <Controller
                name="externalExpeditionPolicy.costBookedTo"
                control={control}
                render={({ field }) => (
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="SO_CHARGE"
                        checked={field.value === 'SO_CHARGE'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mr-2"
                      />
                      Sales Order Charge
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="LOGISTICS_EXPENSE"
                        checked={field.value === 'LOGISTICS_EXPENSE'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mr-2"
                      />
                      Logistics Expense
                    </label>
                  </div>
                )}
              />
            </div>

            <div>
              <Label>Cost visibility roles</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="Add role"
                  value={visibilityRole}
                  onChange={(e) => setVisibilityRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVisibilityRole())}
                />
                <Button type="button" onClick={addVisibilityRole}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedVisibility.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeVisibilityRole(role)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="tax.isPPNEnabled"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Enable PPN/VAT by default</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax.defaultPPNRate">Default PPN Rate (%)</Label>
                <Controller
                  name="tax.defaultPPNRate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="tax.defaultNonPPNRate">Default Non-PPN Rate (%)</Label>
                <Controller
                  name="tax.defaultNonPPNRate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsappConfig.provider">Provider</Label>
                <Controller
                  name="whatsappConfig.provider"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="WhatsApp provider" />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="whatsappConfig.apiKey">API Key</Label>
                <Controller
                  name="whatsappConfig.apiKey"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="password" placeholder="API key (optional)" />
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsappConfig.templates.meetingMinutes">Meeting Minutes Template</Label>
              <Controller
                name="whatsappConfig.templates.meetingMinutes"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={3} />
                )}
              />
            </div>

            <div>
              <Label htmlFor="whatsappConfig.templates.salesOrder">Sales Order Template</Label>
              <Controller
                name="whatsappConfig.templates.salesOrder"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={3} />
                )}
              />
            </div>

            <div>
              <Label htmlFor="whatsappConfig.templates.contract">Contract Template</Label>
              <Controller
                name="whatsappConfig.templates.contract"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={3} />
                )}
              />
            </div>

            <div>
              <Label htmlFor="whatsappConfig.templates.deliveryOrder">Delivery Order Template</Label>
              <Controller
                name="whatsappConfig.templates.deliveryOrder"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={3} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/marketing/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUpdating || isCreating}
          >
            {(isUpdating || isCreating) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            )}
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}