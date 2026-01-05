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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

interface ScoresToReset {
  winnerName: string;
  scores: { opponentName: string; score: number }[];
}

interface ResetScoresDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  scoresToReset: ScoresToReset | null;
}

export function ResetScoresDialog({ isOpen, onConfirm, onCancel, scoresToReset }: ResetScoresDialogProps) {
  if (!scoresToReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Winner!</DialogTitle>
          <DialogDescription>
            A new player has won, which will reset the previous winning streak.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Confirm Score Reset</AlertTitle>
            <AlertDescription>
                The following scores from <strong>{scoresToReset.winnerName}</strong> will be erased. Do you want to continue?
                <ul className="mt-2 list-disc pl-5 space-y-1">
                    {scoresToReset.scores.map((item, index) => (
                        <li key={index}>vs {item.opponentName}: {item.score}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel Action
          </Button>
          <Button type="submit" variant="destructive" onClick={onConfirm}>
            Confirm and Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
