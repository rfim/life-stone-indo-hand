import React, { useState } from 'react';
import { ComplaintStatus } from '@/types/complaint';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: ComplaintStatus, note?: string) => void;
  selectedCount: number;
  isLoading?: boolean;
}

const statusOptions: { value: ComplaintStatus; label: string; description: string }[] = [
  {
    value: 'Opened',
    label: 'Opened',
    description: 'Initial status when complaint/return is first reported'
  },
  {
    value: 'Acknowledged',
    label: 'Acknowledged',
    description: 'Complaint/return has been reviewed and acknowledged'
  },
  {
    value: 'Resolved',
    label: 'Resolved',
    description: 'Issue has been resolved and action taken'
  },
  {
    value: 'Closed',
    label: 'Closed',
    description: 'Case is closed and no further action required'
  },
];

export function StatusModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false
}: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, note.trim() || undefined);
      setSelectedStatus('');
      setNote('');
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Change the status of {selectedCount} selected {selectedCount === 1 ? 'item' : 'items'}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedStatus || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}