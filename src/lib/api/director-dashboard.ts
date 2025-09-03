import { createEntityService } from './base'
import { 
  ContentRequest, 
  ApprovalRecord, 
  FinancialHealthRatio, 
  DirectorKPIs, 
  ReportDefinition, 
  MeetingMinuteNotification,
  DashboardConfig,
  StockAnalysis,
  ProjectAreaTrend,
  UserRole,
  ApprovalType,
  ReportType
} from '@/types/director-dashboard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Create entity services
const contentRequestsService = createEntityService<ContentRequest>('contentRequests', ['title', 'description', 'productDetails.productName'])
const approvalsService = createEntityService<ApprovalRecord>('approvals', ['entityType', 'requestedBy', 'reason'])
const meetingMinuteNotificationsService = createEntityService<MeetingMinuteNotification>('meetingMinuteNotifications', [])
const dashboardConfigService = createEntityService<DashboardConfig>('dashboardConfigs', [])

// Content Request API hooks
export const useContentRequestsApi = {
  useList: (params?: any) => useQuery({
    queryKey: ['contentRequests', params],
    queryFn: () => contentRequestsService.list(params)
  }),
  
  useGetById: (id: string) => useQuery({
    queryKey: ['contentRequests', id],
    queryFn: () => contentRequestsService.get(id),
    enabled: !!id
  }),
  
  useCreate: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: Partial<ContentRequest>) => contentRequestsService.create(data as any),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contentRequests'] })
      }
    })
  },
  
  useUpdate: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ContentRequest> }) => 
        contentRequestsService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contentRequests'] })
      }
    })
  }
}

// Approval Management API hooks
export const useApprovalsApi = {
  useList: (params?: any) => useQuery({
    queryKey: ['approvals', params],
    queryFn: async () => {
      try {
        const result = await approvalsService.list(params)
        return result.data || []
      } catch (error) {
        console.error('Error fetching approvals:', error)
        return []
      }
    }
  }),
  
  useGetById: (id: string) => useQuery({
    queryKey: ['approvals', id],
    queryFn: () => approvalsService.get(id),
    enabled: !!id
  }),
  
  useCreate: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: Partial<ApprovalRecord>) => approvalsService.create(data as any),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['approvals'] })
      }
    })
  },
  
  useUpdate: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ApprovalRecord> }) => 
        approvalsService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['approvals'] })
      }
    })
  }
}

// Meeting Minute Notifications API hooks
export const useMeetingMinuteNotificationsApi = {
  useList: (params?: any) => useQuery({
    queryKey: ['meetingMinuteNotifications', params],
    queryFn: async () => {
      try {
        const result = await meetingMinuteNotificationsService.list(params)
        return result.data || []
      } catch (error) {
        console.error('Error fetching meeting minute notifications:', error)
        return []
      }
    }
  })
}

// Dashboard Configuration API hooks
export const useDashboardConfigApi = {
  useList: (params?: any) => useQuery({
    queryKey: ['dashboardConfigs', params],
    queryFn: async () => {
      try {
        const result = await dashboardConfigService.list(params)
        return result.data || []
      } catch (error) {
        console.error('Error fetching dashboard configs:', error)
        return []
      }
    }
  })
}

// Mock data generators for Director Dashboard

// Financial Health Ratios mock data
export const mockFinancialHealthRatios: FinancialHealthRatio[] = [
  {
    period: '1month',
    currentRatio: 2.5,
    quickRatio: 1.8,
    debtToEquityRatio: 0.4,
    grossProfitMargin: 0.35,
    netProfitMargin: 0.12,
    returnOnAssets: 0.08,
    returnOnEquity: 0.15,
    inventoryTurnover: 6.2,
    accountsReceivableTurnover: 8.5,
    workingCapitalRatio: 1.9
  },
  {
    period: '6months',
    currentRatio: 2.3,
    quickRatio: 1.7,
    debtToEquityRatio: 0.45,
    grossProfitMargin: 0.33,
    netProfitMargin: 0.11,
    returnOnAssets: 0.075,
    returnOnEquity: 0.14,
    inventoryTurnover: 5.8,
    accountsReceivableTurnover: 8.1,
    workingCapitalRatio: 1.8
  },
  {
    period: '12months',
    currentRatio: 2.1,
    quickRatio: 1.6,
    debtToEquityRatio: 0.5,
    grossProfitMargin: 0.31,
    netProfitMargin: 0.10,
    returnOnAssets: 0.07,
    returnOnEquity: 0.13,
    inventoryTurnover: 5.5,
    accountsReceivableTurnover: 7.8,
    workingCapitalRatio: 1.7
  }
]

// Director KPIs mock data
export const mockDirectorKPIs: DirectorKPIs = {
  totalRevenue: { value: 12500000000, change: 8.5, period: 'MTD' },
  netProfit: { value: 1500000000, change: 12.3, period: 'MTD' },
  pendingApprovals: { count: 23, urgent: 5 },
  cashFlow: { value: 2300000000, change: -2.1, period: 'MTD' },
  outstandingAR: { value: 4200000000, change: 5.2 },
  outstandingAP: { value: 2800000000, change: -3.1 },
  inventoryValue: { value: 8900000000, change: 1.8 },
  activeProjects: { count: 147, change: 12 }
}

// Report definitions
export const reportDefinitions: ReportDefinition[] = [
  {
    type: 'GeneralLedger',
    title: 'General Ledger',
    description: 'Complete general ledger with all account transactions',
    parameters: [
      { name: 'dateRange', type: 'dateRange', label: 'Date Range', required: true },
      { name: 'accounts', type: 'multiSelect', label: 'Accounts', required: false, options: [] }
    ],
    exportFormats: ['CSV', 'Excel', 'PDF']
  },
  {
    type: 'ProfitLoss',
    title: 'Profit & Loss Statement',
    description: 'Income statement showing revenues and expenses',
    parameters: [
      { name: 'period', type: 'select', label: 'Period', required: true, 
        options: [
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Yearly', value: 'yearly' }
        ]
      },
      { name: 'dateRange', type: 'dateRange', label: 'Date Range', required: true }
    ],
    exportFormats: ['Excel', 'PDF']
  },
  {
    type: 'BalanceSheet',
    title: 'Balance Sheet',
    description: 'Financial position showing assets, liabilities, and equity',
    parameters: [
      { name: 'asOfDate', type: 'date', label: 'As of Date', required: true },
      { name: 'consolidated', type: 'select', label: 'View', required: true,
        options: [
          { label: 'Consolidated', value: 'true' },
          { label: 'By Department', value: 'false' }
        ]
      }
    ],
    exportFormats: ['Excel', 'PDF']
  },
  {
    type: 'APAging',
    title: 'Accounts Payable Aging',
    description: 'Outstanding payables by aging buckets',
    parameters: [
      { name: 'asOfDate', type: 'date', label: 'As of Date', required: true },
      { name: 'suppliers', type: 'multiSelect', label: 'Suppliers', required: false, options: [] }
    ],
    exportFormats: ['CSV', 'Excel', 'PDF']
  },
  {
    type: 'ARAging',
    title: 'Accounts Receivable Aging',
    description: 'Outstanding receivables by aging buckets',
    parameters: [
      { name: 'asOfDate', type: 'date', label: 'As of Date', required: true },
      { name: 'customers', type: 'multiSelect', label: 'Customers', required: false, options: [] }
    ],
    exportFormats: ['CSV', 'Excel', 'PDF']
  },
  {
    type: 'SalesRevenue',
    title: 'Sales Revenue Report',
    description: 'Sales revenue analysis by product, customer, and period',
    parameters: [
      { name: 'dateRange', type: 'dateRange', label: 'Date Range', required: true },
      { name: 'groupBy', type: 'select', label: 'Group By', required: true,
        options: [
          { label: 'Product', value: 'product' },
          { label: 'Customer', value: 'customer' },
          { label: 'Sales Rep', value: 'salesRep' },
          { label: 'Region', value: 'region' }
        ]
      }
    ],
    exportFormats: ['CSV', 'Excel', 'PDF']
  },
  {
    type: 'Inventory',
    title: 'Inventory Report',
    description: 'Stock levels, valuation, and movement analysis',
    parameters: [
      { name: 'asOfDate', type: 'date', label: 'As of Date', required: true },
      { name: 'warehouse', type: 'multiSelect', label: 'Warehouses', required: false, options: [] },
      { name: 'analysis', type: 'select', label: 'Analysis Type', required: true,
        options: [
          { label: 'Stock Levels', value: 'levels' },
          { label: 'Valuation', value: 'valuation' },
          { label: 'Movement', value: 'movement' },
          { label: 'Fast/Slow/Dead Stock', value: 'velocity' }
        ]
      }
    ],
    exportFormats: ['CSV', 'Excel', 'PDF']
  }
]

// Mock stock analysis data
export const mockStockAnalysis: StockAnalysis = {
  fastMovingItems: [
    {
      productId: 'P001',
      productName: 'Granite Tiles Premium',
      turnoverRate: 12.5,
      currentStock: 500,
      averageMonthlySales: 250
    },
    {
      productId: 'P002',
      productName: 'Marble Slab White',
      turnoverRate: 10.8,
      currentStock: 300,
      averageMonthlySales: 180
    }
  ],
  slowMovingItems: [
    {
      productId: 'P010',
      productName: 'Exotic Stone Pattern',
      turnoverRate: 2.1,
      currentStock: 150,
      daysOfStock: 85
    }
  ],
  deadStock: [
    {
      productId: 'P025',
      productName: 'Old Design Tiles',
      currentStock: 200,
      lastSaleDate: '2024-08-15',
      daysWithoutSale: 120,
      suggestedAction: 'Discount'
    }
  ]
}

// Mock project area trends
export const mockProjectAreaTrends: ProjectAreaTrend[] = [
  {
    area: 'Residential',
    currentMonth: { revenue: 2500000000, projects: 45 },
    previousMonth: { revenue: 2200000000, projects: 38 },
    growth: { revenue: 13.6, projects: 18.4 },
    topProducts: [
      { productId: 'P001', productName: 'Granite Tiles Premium', revenue: 800000000, quantity: 320 },
      { productId: 'P002', productName: 'Marble Slab White', revenue: 600000000, quantity: 200 }
    ]
  },
  {
    area: 'Commercial',
    currentMonth: { revenue: 4200000000, projects: 12 },
    previousMonth: { revenue: 3800000000, projects: 15 },
    growth: { revenue: 10.5, projects: -20.0 },
    topProducts: [
      { productId: 'P015', productName: 'Commercial Grade Stone', revenue: 1500000000, quantity: 450 }
    ]
  }
]

// API functions for dashboard data
export const directorDashboardApi = {
  getFinancialHealthRatios: async (): Promise<FinancialHealthRatio[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockFinancialHealthRatios
  },

  getDirectorKPIs: async (): Promise<DirectorKPIs> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDirectorKPIs
  },

  getStockAnalysis: async (): Promise<StockAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockStockAnalysis
  },

  getProjectAreaTrends: async (): Promise<ProjectAreaTrend[]> => {
    await new Promise(resolve => setTimeout(resolve, 350))
    return mockProjectAreaTrends
  },

  generateReport: async (reportType: ReportType, parameters: Record<string, any>): Promise<{ url: string; filename: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return {
      url: `/api/reports/${reportType.toLowerCase()}-${Date.now()}.pdf`,
      filename: `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
    }
  },

  exportData: async (data: any[], filename: string, format: 'CSV' | 'Excel' | 'PDF'): Promise<{ url: string; filename: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      url: `/api/exports/${filename}.${format.toLowerCase()}`,
      filename: `${filename}.${format.toLowerCase()}`
    }
  }
}