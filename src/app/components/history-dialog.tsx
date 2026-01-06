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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScoreChange } from '@/app/page';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  id: number;
  name: string;
}

interface GameState {
  action: string;
  scoreChanges: ScoreChange[];
}

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameState[];
  users: UserData[];
}

export function HistoryDialog({ isOpen, onClose, history, users }: HistoryDialogProps) {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setFileName(`${format(today, 'yyyy-MM-dd')}-game-history`);
    }
  }, [isOpen]);


  const handleExportCSV = () => {
    if (!history.length || !users.length) return;

    const headers = [...users.map(u => u.name)];
    let csvContent = headers.join(',') + '\n';

    history.slice().reverse().forEach(state => {
      const action = state.action.replace(/,/g, ''); // Basic sanitization for CSV
      const scoreChanges = users.map(user => {
        return state.scoreChanges.find(sc => sc.userId === user.id)?.change ?? 0;
      });
      const row = [...scoreChanges].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>歷史記錄</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <div className="p-4">
            <Table>
                <TableHeader>
                  <TableRow>
                    {users.map(user => (
                      <TableHead key={user.id} className="text-center">{user.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice().reverse().map((state, index) => (
                    <TableRow key={index}>
                      {users.map(user => {
                        const change = state.scoreChanges.find(sc => sc.userId === user.id)?.change ?? 0;
                        const isPositive = change > 0;
                        const isNegative = change < 0;
                        return (
                          <TableCell
                            key={user.id}
                            className={cn(
                              "text-center font-semibold",
                              isPositive && "text-green-600",
                              isNegative && "text-red-600"
                            )}
                          >
                            {isPositive ? `+${change}` : (change !== 0 ? change : '-')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between">
            <div className="flex-1 space-y-2">
              <Label htmlFor="csv-filename">File Name</Label>
              <Input 
                id="csv-filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV} disabled={history.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    儲存
                </Button>
                <Button type="button" onClick={onClose}>
                    關閉
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
