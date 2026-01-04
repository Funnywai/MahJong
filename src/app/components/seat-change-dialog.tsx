'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
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
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOrderedUsers(users);
    }
  }, [isOpen, users]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    setDraggingItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.toString()); // For Firefox
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
    const list = [...orderedUsers];
    const dragItemContent = list[dragItem.current!];
    if (dragItem.current === index) return;
    list.splice(dragItem.current!, 1);
    list.splice(dragOverItem.current!, 0, dragItemContent);
    dragItem.current = index;
    setOrderedUsers(list);
  };
  
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingItem(null);
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
            Drag and drop users to change the order of dealer succession.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Current Order</h3>
            </div>
          {orderedUsers.map((user, index) => (
            <div
              key={user.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "flex items-center gap-4 p-2 border rounded-md bg-secondary/30 cursor-grab active:cursor-grabbing",
                draggingItem === index && "opacity-50 border-primary"
              )}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
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
