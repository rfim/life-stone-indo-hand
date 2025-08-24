import { ReactNode, useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  mode: 'create' | 'edit' | 'view'
  status?: {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  children: ReactNode
  onSave?: () => void
  onSaveAndClose?: () => void
  onCancel?: () => void
  onBack?: () => void
  saving?: boolean
  className?: string
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  mode,
  status,
  children,
  onSave,
  onSaveAndClose,
  onCancel,
  onBack,
  saving = false,
  className
}: FormSheetProps) {
  const isMobile = useIsMobile()
  const [isDirty, setIsDirty] = useState(false)

  const isReadOnly = mode === 'view'
  const showSaveActions = !isReadOnly && (onSave || onSaveAndClose)

  const handleClose = () => {
    if (isDirty && !isReadOnly) {
      // TODO: Show confirmation dialog
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return
    }
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave()
      setIsDirty(false)
    }
  }

  const handleSaveAndClose = async () => {
    if (onSaveAndClose) {
      await onSaveAndClose()
      setIsDirty(false)
      onOpenChange(false)
    }
  }

  const StickyHeader = () => (
    <div 
      className={cn(
        "sticky top-0 z-10 border-b bg-background/95 backdrop-blur",
        isMobile && "pt-safe"
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMobile && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              {status && (
                <Badge variant={status.variant} className="shrink-0">
                  {status.label}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClose}
          className="h-9 w-9 p-0 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const StickyFooter = () => {
    if (!showSaveActions) return null

    return (
      <div 
        className={cn(
          "sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur",
          isMobile && "pb-safe"
        )}
      >
        <div className="flex items-center justify-between p-4 gap-3">
          <Button
            variant="ghost"
            onClick={onCancel || (() => onOpenChange(false))}
            disabled={saving}
            className={cn(isMobile && "flex-1")}
          >
            Cancel
          </Button>
          
          <div className={cn("flex gap-2", isMobile && "flex-1")}>
            {onSave && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
                className={cn(isMobile && "flex-1")}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
            {onSaveAndClose && (
              <Button
                onClick={handleSaveAndClose}
                disabled={saving}
                className={cn(isMobile && "flex-1")}
              >
                {saving ? 'Saving...' : 'Save & Close'}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const FormContent = () => (
    <div className="flex flex-col min-h-0">
      <StickyHeader />
      
      <div className={cn("flex-1 overflow-y-auto", isMobile ? "p-4" : "p-6")}>
        {children}
      </div>
      
      <StickyFooter />
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className={cn(
            "w-full p-0 flex flex-col",
            className
          )}
          style={{
            maxWidth: '100vw',
            height: '100vh',
            borderRadius: 0
          }}
        >
          <FormContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-full h-[90vh] p-0 flex flex-col",
          className
        )}
      >
        <FormContent />
      </DialogContent>
    </Dialog>
  )
}

// For backward compatibility, export individual components
export function FormDialog(props: FormSheetProps) {
  return <FormSheet {...props} />
}