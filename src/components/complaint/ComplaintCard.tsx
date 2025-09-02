import React, { useState } from 'react';
import { Complaint } from '@/types/complaint';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Eye, 
  Edit, 
  QrCode,
  Printer,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ComplaintCardProps {
  complaint: Complaint;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPrint?: (id: string) => void;
  onDelete?: (id: string) => void;
  onQrCode?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Opened': return 'bg-red-100 text-red-800 border-red-200';
    case 'Acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'COMPLAINT': return 'bg-red-100 text-red-800 border-red-200';
    case 'RETUR': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ComplaintCard({
  complaint,
  isSelected = false,
  onToggleSelection,
  onView,
  onEdit,
  onPrint,
  onDelete,
  onQrCode
}: ComplaintCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-4">
        {/* Header row with checkbox, title, and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {onToggleSelection && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(complaint.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight mb-1 text-gray-900">
                {complaint.reason}
              </h3>
              <p className="text-sm text-gray-600">
                {complaint.supplier} • Created {dayjs(complaint.createdAt).fromNow()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge className={cn("text-xs font-medium", getStatusColor(complaint.status))}>
              {complaint.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(complaint.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(complaint.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                  </DropdownMenuItem>
                )}
                {onPrint && (
                  <DropdownMenuItem onClick={() => onPrint(complaint.id)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(complaint.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quantity and Value row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Quantity</p>
            <p className="text-xl font-bold text-gray-900">
              {complaint.qty} {complaint.uom}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Value</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(complaint.nominal, complaint.currency)}
            </p>
          </div>
        </div>

        {/* Free slab badge */}
        {complaint.isFreeSlab && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              Free Slab (Excluded from metrics)
            </Badge>
          </div>
        )}

        {/* Show More section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2 h-8 text-sm text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show More
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3 border-t mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Code</p>
                <p className="font-medium font-mono">{complaint.code}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Type</p>
                <Badge className={cn("text-xs", getTypeColor(complaint.type))}>
                  {complaint.type}
                </Badge>
              </div>
              
              {complaint.sku && (
                <div>
                  <p className="text-gray-500 mb-1">SKU</p>
                  <p className="font-medium">{complaint.sku}</p>
                </div>
              )}
              
              <div>
                <p className="text-gray-500 mb-1">Age</p>
                <p className="font-medium">{complaint.ageDays} days</p>
              </div>
            </div>

            {/* References */}
            {(complaint.ref.poCode || complaint.ref.grnCode) && (
              <div>
                <p className="text-gray-500 mb-2 text-sm">References</p>
                <div className="space-y-1">
                  {complaint.ref.poCode && (
                    <p className="text-sm">
                      <span className="text-gray-500">PO:</span> 
                      <span className="font-mono ml-2">{complaint.ref.poCode}</span>
                    </p>
                  )}
                  {complaint.ref.grnCode && (
                    <p className="text-sm">
                      <span className="text-gray-500">GRN:</span> 
                      <span className="font-mono ml-2">{complaint.ref.grnCode}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* QR Code button */}
            {onQrCode && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onQrCode(complaint.id)}
                  className="w-full"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  View QR Code
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}