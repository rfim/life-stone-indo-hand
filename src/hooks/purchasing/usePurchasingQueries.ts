import { useQuery } from '@tanstack/react-query'
import { FilterParams, KpiBundle } from '@/data/purchasing-types'
import { mockDataProvider } from '@/data/mockProvider'

export function useKpis(params: FilterParams) {
  return useQuery<KpiBundle>({
    queryKey: ['purchasing', 'kpis', params],
    queryFn: () => mockDataProvider.getKpis(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePRs(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'prs', params],
    queryFn: () => mockDataProvider.getPRs(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePOs(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'pos', params],
    queryFn: () => mockDataProvider.getPOs(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useInvoices(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'invoices', params],
    queryFn: () => mockDataProvider.getInvoices(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGRNs(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'grns', params],
    queryFn: () => mockDataProvider.getGRNs(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSkuGaps(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'sku-gaps', params],
    queryFn: () => mockDataProvider.getSkuGaps(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useComplaints(params: FilterParams) {
  return useQuery({
    queryKey: ['purchasing', 'complaints', params],
    queryFn: () => mockDataProvider.getComplaints(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['purchasing', 'suppliers'],
    queryFn: () => mockDataProvider.getSuppliers(),
    staleTime: 30 * 60 * 1000, // 30 minutes - suppliers don't change often
  })
}