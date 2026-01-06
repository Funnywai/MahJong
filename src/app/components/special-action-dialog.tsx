'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserData {
  id: number;
  name: string;
}

interface SpecialActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  onSave: (mainUserId: number, action: 'collect' | 'pay', amount: number) => void;
}

export function SpecialActionDialog({ isOpen, onClose, mainUser, onSave }: SpecialActionDialogProps) {
  const [amount, setAmount] = useState('5');

  if (!mainUser) return null;

  const handleSave = (action: 'collect' | 'pay') => {
    const parsedAmount = parseInt(amount, 10);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(mainUser.id, action, parsedAmount);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>特別賞罰 - {mainUser.name}</DialogTitle>
          <DialogDescription>
            Choose to collect from or pay to all other users.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount-input">Amount</Label>
                <Input
                id="amount-input"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter a number"
                />
            </div>
            <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => handleSave('collect')}>
                收
            </Button>
            <Button size="lg" variant="destructive" onClick={() => handleSave('pay')}>
                賠
            </Button>
            </div>
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
