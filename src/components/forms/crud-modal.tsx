import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { BaseEntity } from '@/lib/db/connection'

interface CrudModalProps<T extends BaseEntity> {
  entity: string
  mode: 'view' | 'create' | 'edit'
  id?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  schema?: z.ZodSchema<any>
  onSuccess?: (data: T) => void
  children: React.ReactNode
  useEntityHooks: () => {
    useGet: (id: string) => any
    useCreate: () => any
    useUpdate: () => any
  }
}

export function CrudModal<T extends BaseEntity>({
  entity,
  mode,
  id,
  open,
  onOpenChange,
  title,
  schema,
  onSuccess,
  children,
  useEntityHooks
}: CrudModalProps<T>) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()
  
  const { useGet, useCreate, useUpdate } = useEntityHooks()
  
  // Fetch data for edit/view modes
  const { data: entityData, isLoading: isLoadingData } = useGet(id || '')
  
  // Mutations
  const createMutation = useCreate()
  const updateMutation = useUpdate()
  
  const isLoading = createMutation.isPending || updateMutation.isPending
  
  // Form setup
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  })
  
  // Update form when data loads
  useEffect(() => {
    if (entityData && (mode === 'edit' || mode === 'view')) {
      form.reset(entityData)
    } else if (mode === 'create') {
      form.reset({})
    }
  }, [entityData, mode, form])
  
  // Handle save
  const handleSave = async (data: any, shouldClose: boolean = false) => {
    try {
      if (mode === 'create') {
        const result = await createMutation.mutateAsync(data)
        toast.success(`${entity} created successfully`)
        onSuccess?.(result.data)
        if (shouldClose) {
          handleClose()
        } else {
          // Switch to edit mode with the new ID
          const newParams = new URLSearchParams(searchParams)
          newParams.set('modal', `${entity}.edit`)
          newParams.set('id', result.id)
          setSearchParams(newParams)
        }
      } else if (mode === 'edit' && id) {
        const result = await updateMutation.mutateAsync({ id, data })
        toast.success(`${entity} updated successfully`)
        onSuccess?.(result.data)
        if (shouldClose) {
          handleClose()
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Save failed')
    }
  }
  
  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('modal')
    newParams.delete('id')
    setSearchParams(newParams)
    onOpenChange(false)
  }
  
  const modalTitle = title || `${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} ${entity}`
  
  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur",
        isMobile && "sticky top-0 z-50"
      )}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{modalTitle}</h2>
          {mode === 'view' && entityData && (
            <div className="text-xs text-muted-foreground">
              ID: {entityData.id}
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          {isLoadingData && mode !== 'create' ? (
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit((data) => handleSave(data, true))}>
              {children}
            </form>
          )}
          
          {/* Audit Info for View Mode */}
          {mode === 'view' && entityData && (
            <div className="mt-8 pt-6 border-t space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(entityData.createdAt).toLocaleString()}</div>
                  {entityData.createdBy && <div className="text-xs text-muted-foreground">by {entityData.createdBy}</div>}
                </div>
                <div>
                  <div className="text-muted-foreground">Last Updated</div>
                  <div>{new Date(entityData.updatedAt).toLocaleString()}</div>
                  {entityData.updatedBy && <div className="text-xs text-muted-foreground">by {entityData.updatedBy}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer Actions - Only for Create/Edit */}
      {mode !== 'view' && (
        <div className={cn(
          "flex items-center justify-end gap-3 p-4 border-t bg-background/95 backdrop-blur",
          isMobile && "sticky bottom-0 z-50"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit((data) => handleSave(data, false))}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit((data) => handleSave(data, true))}
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            Save & Close
          </Button>
        </div>
      )}
    </div>
  )
  
  if (mode === 'view') {
    // View mode uses centered dialog
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          {content}
        </DialogContent>
      </Dialog>
    )
  }
  
  if (isMobile) {
    // Mobile uses full-screen sheet
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[95vh] max-h-[95vh] p-0 rounded-t-lg"
        >
          {content}
        </SheetContent>
      </Sheet>
    )
  }
  
  // Desktop create/edit uses side sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
}

// URL-driven modal hook
export function useCrudModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const modalParam = searchParams.get('modal')
  const idParam = searchParams.get('id')
  
  const isOpen = !!modalParam
  const [entity, action] = modalParam?.split('.') || []
  const mode = action as 'create' | 'edit' | 'view'
  const id = idParam || undefined
  
  const openModal = (entity: string, mode: 'create' | 'edit' | 'view', id?: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('modal', `${entity}.${mode}`)
    if (id) {
      newParams.set('id', id)
    } else {
      newParams.delete('id')
    }
    setSearchParams(newParams)
  }
  
  const closeModal = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('modal')
    newParams.delete('id')
    setSearchParams(newParams)
  }
  
  return {
    isOpen,
    entity,
    mode,
    id,
    openModal,
    closeModal
  }
}