import { useQuery } from '@tanstack/react-query'
import { FinanceFilterParams, FinancialKpis, FinanceChartData, ProfitLossReport, BalanceSheetReport } from '@/data/finance-types'
import { mockDataProvider } from '@/data/mockProvider'

export function useFinancialKpis(params: FinanceFilterParams) {
  return useQuery<FinancialKpis>({
    queryKey: ['finance', 'kpis', params],
    queryFn: () => mockDataProvider.getFinancialKpis(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFinanceChartData(params: FinanceFilterParams) {
  return useQuery<FinanceChartData>({
    queryKey: ['finance', 'charts', params],
    queryFn: () => mockDataProvider.getFinanceChartData(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCustomers(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'customers', params],
    queryFn: () => mockDataProvider.getCustomers(params),
    staleTime: 30 * 60 * 1000, // 30 minutes - customers don't change often
  })
}

export function useProjects(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'projects', params],
    queryFn: () => mockDataProvider.getProjects(params),
    staleTime: 10 * 60 * 1000,
  })
}

export function useSalesOrders(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'sales-orders', params],
    queryFn: () => mockDataProvider.getSalesOrders(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSalesInvoices(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'sales-invoices', params],
    queryFn: () => mockDataProvider.getSalesInvoices(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - invoices change frequently
  })
}

export function usePaymentRequests(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'payment-requests', params],
    queryFn: () => mockDataProvider.getPaymentRequests(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function usePayments(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'payments', params],
    queryFn: () => mockDataProvider.getPayments(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useReimbursements(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'reimbursements', params],
    queryFn: () => mockDataProvider.getReimbursements(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useChartOfAccounts(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'chart-of-accounts', params],
    queryFn: () => mockDataProvider.getChartOfAccounts(params),
    staleTime: 30 * 60 * 1000, // 30 minutes - COA doesn't change often
  })
}

export function useJournalEntries(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'journal-entries', params],
    queryFn: () => mockDataProvider.getJournalEntries(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useJournalLines(journalId: string) {
  return useQuery({
    queryKey: ['finance', 'journal-lines', journalId],
    queryFn: () => mockDataProvider.getJournalLines(journalId),
    staleTime: 10 * 60 * 1000,
    enabled: !!journalId,
  })
}

export function usePurchaseBudgets(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'purchase-budgets', params],
    queryFn: () => mockDataProvider.getPurchaseBudgets(params),
    staleTime: 10 * 60 * 1000,
  })
}

export function useProfitLossReport(params: FinanceFilterParams) {
  return useQuery<ProfitLossReport>({
    queryKey: ['finance', 'profit-loss-report', params],
    queryFn: () => mockDataProvider.getProfitLossReport(params),
    staleTime: 10 * 60 * 1000,
    enabled: !!(params.dateFrom && params.dateTo),
  })
}

export function useBalanceSheetReport(params: { asOfDate: string; currency?: string }) {
  return useQuery<BalanceSheetReport>({
    queryKey: ['finance', 'balance-sheet-report', params],
    queryFn: () => mockDataProvider.getBalanceSheetReport(params),
    staleTime: 10 * 60 * 1000,
    enabled: !!params.asOfDate,
  })
}

export function useWhatsAppMessages(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'whatsapp-messages', params],
    queryFn: () => mockDataProvider.getWhatsAppMessages(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditLogs(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'audit-logs', params],
    queryFn: () => mockDataProvider.getAuditLogs(params),
    staleTime: 2 * 60 * 1000,
  })
}

// Stats hooks for various modules
export function usePaymentStats(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'payment-stats', params],
    queryFn: () => mockDataProvider.getPaymentStats(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useReimbursementStats(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'reimbursement-stats', params],
    queryFn: () => mockDataProvider.getReimbursementStats(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useJournalStats(params: FinanceFilterParams = {}) {
  return useQuery({
    queryKey: ['finance', 'journal-stats', params],
    queryFn: () => mockDataProvider.getJournalStats(params),
    staleTime: 5 * 60 * 1000,
  })
}