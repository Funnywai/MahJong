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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
}

interface PayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserData[];
  totalScores: { [key: number]: number };
}

export function PayoutDialog({ isOpen, onClose, users, totalScores }: PayoutDialogProps) {
  const [divisor, setDivisor] = useState<string>('1');
  const [manualAdjustments, setManualAdjustments] = useState<Record<number, string>>({});

  const handleDivisorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDivisor(e.target.value);
  };

  const handleAdjustmentChange = (userId: number, value: string) => {
    setManualAdjustments(prev => ({ ...prev, [userId]: value }));
  };

  const parsedDivisor = parseFloat(divisor);
  const isValidDivisor = !isNaN(parsedDivisor) && parsedDivisor > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>找數</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="divisor-input">除以</Label>
            <Input
              id="divisor-input"
              type="number"
              inputMode="decimal"
              value={divisor}
              onChange={handleDivisorChange}
              placeholder="輸入倍數"
            />
            <p className="text-xs text-muted-foreground">額外金額不會被分母影響，可用來加入檢數/手續費等。</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>玩家</TableHead>
                <TableHead className="text-right">番數</TableHead>
                <TableHead className="text-right">其他</TableHead>
                <TableHead className="text-right">$HKD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const total = totalScores[user.id] || 0;
                const payout = isValidDivisor ? (total / parsedDivisor) : 0;
                const adjustmentRaw = manualAdjustments[user.id] ?? '';
                const adjustment = parseFloat(adjustmentRaw);
                const safeAdjustment = isNaN(adjustment) ? 0 : adjustment;
                const finalPayout = payout + safeAdjustment;
                const isPositive = finalPayout > 0;
                const isNegative = finalPayout < 0;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-right">{total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={adjustmentRaw}
                        onChange={(e) => handleAdjustmentChange(user.id, e.target.value)}
                        placeholder="0 或 -10"
                        className="h-9 text-right"
                        aria-label="其他金額"
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        isPositive && "text-green-600",
                        isNegative && "text-red-600"
                      )}
                    >
                      {finalPayout.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
