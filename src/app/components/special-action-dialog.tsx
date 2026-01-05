'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserData {
  id: number;
  name: string;
}

interface SpecialActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  onSave: (mainUserId: number, action: 'collect' | 'pay') => void;
}

export function SpecialActionDialog({ isOpen, onClose, mainUser, onSave }: SpecialActionDialogProps) {
  if (!mainUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>特別賞罰 - {mainUser.name}</DialogTitle>
          <DialogDescription>
            Choose to collect from or pay to all other users.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex justify-center gap-4">
          <Button size="lg" onClick={() => onSave(mainUser.id, 'collect')}>
            收
          </Button>
          <Button size="lg" variant="destructive" onClick={() => onSave(mainUser.id, 'pay')}>
            賠
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
