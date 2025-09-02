import { createEntityService, createEntityHooks } from '@/lib/api/base'
import {
  MarketingSettings,
  DeliveryOrder,
  ColdCall,
  MeetingMinutes,
  Project,
  SalesOrder,
  Contract,
  PriceList,
  CommissionRule,
  CommissionEntry,
  QuotationPriceLog,
  WhatsAppMessage
} from '@/types/marketing'

// Validation functions
export const validateDeliveryOrder = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.soId?.trim()) errors.soId = 'Sales Order is required'
  if (!data.customerId?.trim()) errors.customerId = 'Customer is required'
  if (!data.lines || data.lines.length === 0) errors.lines = 'At least one line item is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateColdCall = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.customerId?.trim()) errors.customerId = 'Customer is required'
  if (!data.ownerId?.trim()) errors.ownerId = 'Owner/Salesperson is required'
  if (!data.scheduledAt) errors.scheduledAt = 'Scheduled date is required'
  if (!data.status) errors.status = 'Status is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateMeetingMinutes = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.customerId?.trim()) errors.customerId = 'Customer is required'
  if (!data.notes?.trim()) errors.notes = 'Notes are required'
  if (!data.attendees || data.attendees.length === 0) errors.attendees = 'At least one attendee is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateSalesOrder = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.customerId?.trim()) errors.customerId = 'Customer is required'
  if (!data.lines || data.lines.length === 0) errors.lines = 'At least one line item is required'
  if (!data.top || data.top <= 0) errors.top = 'Terms of Payment must be greater than 0'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateContract = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.code?.trim()) errors.code = 'Code is required'
  if (!data.scope?.trim()) errors.scope = 'Scope is required'
  if (!data.parties || data.parties.length === 0) errors.parties = 'At least one party is required'
  if (!data.validity?.startDate) errors.validityStart = 'Start date is required'
  if (!data.validity?.endDate) errors.validityEnd = 'End date is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validatePriceList = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.effectiveFrom) errors.effectiveFrom = 'Effective from date is required'
  if (!data.items || data.items.length === 0) errors.items = 'At least one price item is required'
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

export const validateCommissionRule = (data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) errors.name = 'Name is required'
  if (!data.appliesTo) errors.appliesTo = 'Commission type is required'
  if (!data.calc) errors.calc = 'Calculation method is required'
  if (!data.trigger) errors.trigger = 'Trigger is required'
  if (data.calc === 'FIXED_PER_UNIT' && (!data.fixedAmount || data.fixedAmount <= 0)) {
    errors.fixedAmount = 'Fixed amount is required for fixed per unit calculation'
  }
  if (data.calc !== 'FIXED_PER_UNIT' && (!data.rate || data.rate <= 0)) {
    errors.rate = 'Rate is required for percentage calculations'
  }
  
  return { success: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined }
}

// Services
export const marketingSettingsService = createEntityService<MarketingSettings>('marketing-settings', ['staggerDefaultPeriod'])
export const deliveryOrdersService = createEntityService<DeliveryOrder>('delivery-orders', ['code', 'customerId'], validateDeliveryOrder)
export const coldCallsService = createEntityService<ColdCall>('cold-calls', ['customerId', 'ownerId'], validateColdCall)
export const meetingMinutesService = createEntityService<MeetingMinutes>('meeting-minutes', ['customerId', 'notes'], validateMeetingMinutes)
export const projectsService = createEntityService<Project>('projects', ['name', 'customerId'])
export const salesOrdersService = createEntityService<SalesOrder>('sales-orders', ['code', 'customerId'], validateSalesOrder)
export const contractsService = createEntityService<Contract>('contracts', ['code', 'scope'], validateContract)
export const priceListsService = createEntityService<PriceList>('price-lists', ['name'], validatePriceList)
export const commissionRulesService = createEntityService<CommissionRule>('commission-rules', ['name'], validateCommissionRule)
export const commissionEntriesService = createEntityService<CommissionEntry>('commission-entries', ['payableTo'])
export const quotationPriceLogsService = createEntityService<QuotationPriceLog>('quotation-price-logs', ['customerId', 'productId'])

// API Hooks
export const useMarketingSettingsApi = createEntityHooks('marketing-settings', marketingSettingsService)
export const useDeliveryOrdersApi = createEntityHooks('delivery-orders', deliveryOrdersService)
export const useColdCallsApi = createEntityHooks('cold-calls', coldCallsService)
export const useMeetingMinutesApi = createEntityHooks('meeting-minutes', meetingMinutesService)
export const useProjectsApi = createEntityHooks('projects', projectsService)
export const useSalesOrdersApi = createEntityHooks('sales-orders', salesOrdersService)
export const useContractsApi = createEntityHooks('contracts', contractsService)
export const usePriceListsApi = createEntityHooks('price-lists', priceListsService)
export const useCommissionRulesApi = createEntityHooks('commission-rules', commissionRulesService)
export const useCommissionEntriesApi = createEntityHooks('commission-entries', commissionEntriesService)
export const useQuotationPriceLogsApi = createEntityHooks('quotation-price-logs', quotationPriceLogsService)

// WhatsApp API stub service
export class WhatsAppService {
  private logs: Array<{ timestamp: string; payload: WhatsAppMessage; status: string }> = []

  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Log the message
      this.logs.push({
        timestamp: new Date().toISOString(),
        payload: message,
        status: 'sent'
      })
      
      console.log('WhatsApp Message Sent:', {
        messageId,
        template: message.template,
        to: message.to,
        variables: message.variables,
        attachments: message.attachments
      })
      
      return { success: true, messageId }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return { success: false, error: 'Failed to send message' }
    }
  }

  async getMessageLogs(): Promise<Array<{ timestamp: string; payload: WhatsAppMessage; status: string }>> {
    return this.logs
  }

  async getTemplates(): Promise<Record<string, string>> {
    return {
      MeetingMinutes: `Hello {{client_name}}, please find attached the meeting minutes from our discussion on {{date}}. Next meeting: {{next_meeting}}.`,
      SalesOrder: `Dear {{client_name}}, your sales order {{so_number}} has been created. Total amount: {{total_amount}}. Please review and confirm.`,
      Contract: `Dear {{client_name}}, your contract {{contract_number}} is ready for review. Please check the attached document.`,
      DeliveryOrder: `Hi {{client_name}}, your delivery order {{do_number}} has been issued. Expected delivery: {{delivery_date}}.`
    }
  }
}

export const whatsappService = new WhatsAppService()

// QR Code generation utility
export const generateQRPayload = (type: 'DO' | 'SO' | 'Contract', data: Record<string, any>): string => {
  const payload = {
    type,
    code: data.code,
    id: data.id,
    verificationUrl: `${window.location.origin}/verify/${type.toLowerCase()}/${data.id}`,
    timestamp: new Date().toISOString()
  }
  return JSON.stringify(payload)
}

// PDF generation utility (stub)
export const generatePDF = async (type: 'DO' | 'SO' | 'Contract', data: any): Promise<string> => {
  // Simulate PDF generation
  await new Promise(resolve => setTimeout(resolve, 1000))
  return `${window.location.origin}/api/pdf/${type.toLowerCase()}/${data.id}.pdf`
}

// Utility functions for business logic
export const calculateStaggerDueDate = (createdAt: string, periodDays: number): string => {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + periodDays)
  return date.toISOString()
}

export const validateQuantityAvailable = (soId: string, lineId: string, requestedQty: number): Promise<boolean> => {
  // TODO: Implement stock validation against warehouse
  // For now, always return true
  return Promise.resolve(true)
}

export const calculateCommission = (
  rule: CommissionRule,
  baseAmount: number,
  netMargin?: number
): number => {
  switch (rule.calc) {
    case 'PCT_OF_NET_MARGIN':
      return (netMargin || 0) * (rule.rate / 100)
    case 'PCT_OF_GROSS':
      return baseAmount * (rule.rate / 100)
    case 'FIXED_PER_UNIT':
      return rule.fixedAmount || 0
    default:
      return 0
  }
}