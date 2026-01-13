'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserData {
    id: number;
    name: string;
}

interface ScoresToResetEntry {
  previousWinnerName: string;
  previousWinnerId: number;
  scores: { [opponentId: number]: number };
}

interface ScoresToReset {
  currentWinnerName: string;
  currentWinnerId: number;
  winners: ScoresToResetEntry[];
}

interface ResetScoresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scoresToReset: ScoresToReset | null;
  users: UserData[];
}

export function ResetScoresDialog({ isOpen, onClose, scoresToReset, users }: ResetScoresDialogProps) {
  if (!scoresToReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{scoresToReset.currentWinnerName} 開新莊，清除籌碼</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Winner</TableHead>
                        {users.map(user => (
                            <TableHead key={user.id} className="text-center">{user.name}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
              {scoresToReset.winners.map(entry => (
                <TableRow key={entry.previousWinnerId}>
                <TableCell className="font-semibold">{entry.previousWinnerName}</TableCell>
                {users.map(user => (
                  <TableCell key={user.id} className="text-center font-semibold text-destructive">
                    {entry.previousWinnerId === user.id ? '-' : ((entry.scores[user.id]) || 0).toLocaleString()}
                  </TableCell>
                ))}
                </TableRow>
              ))}
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
