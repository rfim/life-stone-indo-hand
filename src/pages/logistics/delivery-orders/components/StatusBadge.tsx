import { Badge } from '@/components/ui/badge';
import { Edit, Truck, CheckCircle, XCircle } from 'lucide-react';
import { DOStatus } from '../types';

interface StatusBadgeProps {
  status: DOStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<DOStatus, { variant: any; label: string; icon: React.ReactNode }> = {
    draft: { 
      variant: 'secondary', 
      label: 'Draft', 
      icon: <Edit className="w-3 h-3" /> 
    },
    released: { 
      variant: 'default', 
      label: 'Released', 
      icon: <Truck className="w-3 h-3" /> 
    },
    invoiced: { 
      variant: 'default', 
      label: 'Invoiced', 
      icon: <CheckCircle className="w-3 h-3" /> 
    },
    closed: { 
      variant: 'outline', 
      label: 'Closed', 
      icon: <CheckCircle className="w-3 h-3" /> 
    },
    cancelled: { 
      variant: 'destructive', 
      label: 'Cancelled', 
      icon: <XCircle className="w-3 h-3" /> 
    }
  };
  
  const config = variants[status];
  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className || ''}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}