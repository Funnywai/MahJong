'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameState {
  action: string;
}

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameState[];
}

export function HistoryDialog({ isOpen, onClose, history }: HistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game History</DialogTitle>
          <DialogDescription>
            A log of all scoring events in the current game.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4">
            {history.slice().reverse().map((state, index) => (
                <div key={index} className="text-sm p-2 border-b">
                    {history.length - index}. {state.action}
                </div>
            ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
