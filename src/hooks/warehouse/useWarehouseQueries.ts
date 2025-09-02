import { useQuery } from '@tanstack/react-query'
import { WarehouseFilterParams, WarehouseKpis } from '@/data/warehouse-types'
import { mockDataProvider } from '@/data/mockProvider'

export function useWarehouseKpis(params: WarehouseFilterParams) {
  return useQuery<WarehouseKpis>({
    queryKey: ['warehouse', 'kpis', params],
    queryFn: () => mockDataProvider.getWarehouseKpis(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLocations() {
  return useQuery({
    queryKey: ['warehouse', 'locations'],
    queryFn: () => mockDataProvider.getLocations(),
    staleTime: 30 * 60 * 1000, // 30 minutes - locations don't change often
  })
}

export function useSKUs(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'skus', params],
    queryFn: () => mockDataProvider.getSKUs(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useInventory(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'inventory', params],
    queryFn: () => mockDataProvider.getInventory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - inventory changes frequently
  })
}

export function useMovements(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'movements', params],
    queryFn: () => mockDataProvider.getMovements(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdjustments(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'adjustments', params],
    queryFn: () => mockDataProvider.getAdjustments(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStockCard(skuId: string, params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'stock-card', skuId, params],
    queryFn: () => mockDataProvider.getStockCard(skuId, params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSIKs(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'siks', params],
    queryFn: () => mockDataProvider.getSIKs(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useInboundRequests(params: WarehouseFilterParams) {
  return useQuery({
    queryKey: ['warehouse', 'inbound-requests', params],
    queryFn: () => mockDataProvider.getInboundRequests(params),
    staleTime: 2 * 60 * 1000, // Frequent updates expected
  })
}