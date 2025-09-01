import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MasterList, getDefaultColumns } from '../../master-data/common/list'
import { MasterForm } from '../../master-data/common/form'
import { makeLocalStorageAdapter } from '../../master-data/common/adapters'
import { SKUFields } from './fields'
import { skuSchema, SKUFormData } from './schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Barcode, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// SKU type following the master data pattern
interface SKU {
  id: string
  code: string // will be skuCode
  name: string // will be name
  active: boolean
  createdAt: string
  updatedAt: string
  // SKU specific fields
  skuCode: string
  productId: string
  productName: string
  description: string
  category: string
  supplier: string
  costPrice: number
  artisticValue: number
  profitMargin: number
  sellingPrice: number
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderLevel: number
  maxStockLevel: number
  qrCode?: string
  barcode?: string
  images: string[]
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'mm' | 'cm' | 'm'
  }
  weight: number
  specifications?: Record<string, any>
}

const adapter = makeLocalStorageAdapter<SKU>('erp.warehouse.skus')

export function SKUManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [rows, setRows] = useState<SKU[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [editingData, setEditingData] = useState<SKU | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const pageSize = 10

  // Load data
  const loadData = async () => {
    setIsLoading(true)
    try {
      const result = await adapter.list({ q: searchQuery, page, pageSize })
      setRows(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load SKUs:', error)
      toast.error('Failed to load SKUs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCreate = () => {
    setEditingId(undefined)
    setEditingData(undefined)
    setIsSheetOpen(true)
  }

  const handleEdit = (id: string) => {
    const item = rows.find(r => r.id === id)
    if (item) {
      setEditingId(id)
      setEditingData(item)
      setIsSheetOpen(true)
    }
  }

  // Generate SKU code
  const generateSKUCode = (category: string, name: string) => {
    const categoryCode = category.substring(0, 3).toUpperCase()
    const nameCode = name.substring(0, 3).toUpperCase()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${categoryCode}-${nameCode}-${random}`
  }

  const handleSave = async (data: SKUFormData) => {
    setIsLoading(true)
    try {
      const skuData = {
        ...data,
        skuCode: data.skuCode || generateSKUCode(data.category, data.name),
        code: data.skuCode || generateSKUCode(data.category, data.name), // For master data compatibility
        name: data.name, // For master data compatibility
        productName: data.productId, // In real app, lookup product name
        availableStock: Math.max(0, data.currentStock - data.reservedStock),
        qrCode: data.qrCode || `QR-${data.skuCode}`,
        barcode: data.barcode || `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }

      if (editingId) {
        await adapter.update(editingId, skuData)
        toast.success('SKU updated successfully')
      } else {
        await adapter.create(skuData)
        toast.success('SKU created successfully')
      }
      
      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save SKU')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      const item = rows.find(r => r.id === id)
      if (item) {
        const availableStock = Math.max(0, newStock - item.reservedStock)
        await adapter.update(id, { 
          currentStock: newStock,
          availableStock
        })
        toast.success('Stock updated successfully')
        loadData()
      }
    } catch (error) {
      toast.error('Failed to update stock')
    }
  }

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle }
    if (currentStock <= reorderLevel) return { label: 'Low Stock', variant: 'secondary' as const, icon: TrendingDown }
    return { label: 'In Stock', variant: 'default' as const, icon: Package }
  }

  const getProfitabilityStatus = (profitMargin: number) => {
    if (profitMargin >= 30) return { label: 'High Profit', variant: 'default' as const, icon: TrendingUp }
    if (profitMargin >= 15) return { label: 'Medium Profit', variant: 'secondary' as const, icon: TrendingUp }
    return { label: 'Low Profit', variant: 'destructive' as const, icon: TrendingDown }
  }

  // Custom columns for SKUs
  const columns = [
    {
      key: 'skuCode',
      header: 'SKU Code',
      render: (row: SKU) => (
        <div className="font-mono text-sm">{row.skuCode}</div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (row: SKU) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.description.substring(0, 50)}...</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: SKU) => (
        <Badge variant="outline">{row.category}</Badge>
      )
    },
    {
      key: 'stockInfo',
      header: 'Stock',
      render: (row: SKU) => {
        const status = getStockStatus(row.currentStock, row.reorderLevel)
        const Icon = status.icon
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{row.currentStock}</span>
              <span className="text-sm text-muted-foreground">/ {row.maxStockLevel}</span>
            </div>
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'pricing',
      header: 'Pricing',
      render: (row: SKU) => {
        const profitStatus = getProfitabilityStatus(row.profitMargin)
        const Icon = profitStatus.icon
        return (
          <div className="space-y-1">
            <div className="text-sm">
              <div>Cost: IDR {row.costPrice.toLocaleString()}</div>
              <div className="font-medium">Sell: IDR {row.sellingPrice.toLocaleString()}</div>
            </div>
            <div className="flex items-center space-x-1">
              <Icon className="h-3 w-3" />
              <Badge variant={profitStatus.variant} className="text-xs">
                {row.profitMargin}%
              </Badge>
            </div>
          </div>
        )
      }
    },
    {
      key: 'dimensions',
      header: 'Dimensions',
      render: (row: SKU) => (
        <div className="text-sm">
          <div>{row.dimensions.length} × {row.dimensions.width} × {row.dimensions.height} {row.dimensions.unit}</div>
          <div className="text-muted-foreground">{row.weight} kg</div>
        </div>
      )
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (row: SKU) => {
        // In real app, lookup supplier name
        const supplierMap: Record<string, string> = {
          'sup-001': 'PT. Stone Indonesia',
          'sup-002': 'CV. Marble Jaya',
          'sup-003': 'UD. Granite Sejahtera'
        }
        return supplierMap[row.supplier] || row.supplier
      }
    },
    {
      key: 'codes',
      header: 'Codes',
      render: (row: SKU) => (
        <div className="flex items-center space-x-2">
          {row.qrCode && (
            <Button variant="ghost" size="sm" title={`QR: ${row.qrCode}`}>
              <QrCode className="h-4 w-4" />
            </Button>
          )}
          {row.barcode && (
            <Button variant="ghost" size="sm" title={`Barcode: ${row.barcode}`}>
              <Barcode className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: SKU) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newStock = prompt('Enter new stock level:', row.currentStock.toString())
              if (newStock !== null && !isNaN(Number(newStock))) {
                handleStockUpdate(row.id, Number(newStock))
              }
            }}
            className="h-7"
          >
            Update Stock
          </Button>
        </div>
      )
    }
  ]

  return (
    <>
      <MasterList
        title="SKU Management"
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        searchQuery={searchQuery}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        columns={columns}
        isLoading={isLoading}
      />

      <MasterForm
        title={editingId ? 'Edit SKU' : 'New SKU'}
        open={isSheetOpen}
        isEdit={!!editingId}
        initial={editingData ? {
          skuCode: editingData.skuCode,
          productId: editingData.productId,
          productName: editingData.productName,
          name: editingData.name,
          description: editingData.description,
          category: editingData.category,
          supplier: editingData.supplier,
          costPrice: editingData.costPrice,
          artisticValue: editingData.artisticValue,
          profitMargin: editingData.profitMargin,
          sellingPrice: editingData.sellingPrice,
          currentStock: editingData.currentStock,
          reservedStock: editingData.reservedStock,
          availableStock: editingData.availableStock,
          reorderLevel: editingData.reorderLevel,
          maxStockLevel: editingData.maxStockLevel,
          dimensions: editingData.dimensions,
          weight: editingData.weight,
          specifications: editingData.specifications,
          images: editingData.images || [],
          qrCode: editingData.qrCode,
          barcode: editingData.barcode,
          active: editingData.active
        } : undefined}
        onSave={handleSave}
        onCancel={() => setIsSheetOpen(false)}
        schema={skuSchema}
        renderExtra={(form) => <SKUFields form={form} isEdit={!!editingId} />}
        isLoading={isLoading}
      />
    </>
  )
}