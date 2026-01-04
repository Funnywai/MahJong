'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { List, ListCollapse, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

interface SeatChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserData[];
  onSave: (users: UserData[]) => void;
}

export function SeatChangeDialog({ isOpen, onClose, users, onSave }: SeatChangeDialogProps) {
  const [orderedUsers, setOrderedUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOrderedUsers(users);
    }
  }, [isOpen, users]);

  const handleRotate = () => {
    setOrderedUsers(prev => {
        const rotated = [...prev];
        const last = rotated.pop();
        if (last) {
            rotated.unshift(last);
        }
        return rotated;
    });
  };

  const handleSave = () => {
    onSave(orderedUsers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Seats (換位)</DialogTitle>
          <DialogDescription>
            Change the order of users to update the dealer succession.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Current Order</h3>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                    <Shuffle className="mr-2 h-4 w-4" /> Rotate
                </Button>
            </div>
          {orderedUsers.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-2 border rounded-md bg-secondary/30"
            >
              <div className="font-bold text-primary">{index + 1}</div>
              <div className="flex-1">{user.name}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    