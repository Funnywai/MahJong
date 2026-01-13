'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

interface MultiHitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loser: UserData;
  users: UserData[];
  dealerId: number;
  consecutiveWins: number;
  currentWinnerId: number | null;
  onSave: (loserUserId: number, winners: number[], value: number) => void;
}

interface ScorePreview {
  winnerId: number;
  winnerName: string;
  base: number;
  dealerBonus: number;
  laBonus: number;
  total: number;
}

export function MultiHitDialog({
  isOpen,
  onClose,
  loser,
  users,
  dealerId,
  consecutiveWins,
  currentWinnerId,
  onSave,
}: MultiHitDialogProps) {
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedWinners([]);
      setValue('');
    }
  }, [isOpen]);

  const opposingUsers = useMemo(() => users.filter(u => u.id !== loser.id), [users, loser]);

  const toggleWinner = (userId: number) => {
    setSelectedWinners(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        if (prev.length < 3) {
          return [...prev, userId];
        }
        return prev;
      }
    });
  };

  const scoresPreviews = useMemo<ScorePreview[]>(() => {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue <= 0 || selectedWinners.length === 0) {
      return [];
    }

    const previews: ScorePreview[] = [];
    const dealerBonusValue = 2 * consecutiveWins - 1;
    const previousWinner = users.find(u => u.id === currentWinnerId);

    selectedWinners.forEach(winnerId => {
      const winner = users.find(u => u.id === winnerId);
      if (!winner) return;

      let base = parsedValue;
      let dealerBonus = 0;
      let laBonus = 0;

      // Dealer bonus logic
      if (winnerId === dealerId) {
        dealerBonus = dealerBonusValue;
        base += dealerBonus;
      } else if (loser.id === dealerId) {
        dealerBonus = dealerBonusValue;
        base += dealerBonus;
      }

      // La bonus logic (拉)
      if (previousWinner && previousWinner.id === winnerId) {
        const previousScore = winner.winValues[loser.id] || 0;
        if (previousScore > 0) {
          laBonus = Math.round(previousScore * 0.5);
          base += laBonus;
        }
      } else if (winnerId !== currentWinnerId && currentWinnerId !== null && previousWinner && loser.id === previousWinner.id) {
        const previousScoreOnLoser = previousWinner.winValues[winnerId] || 0;
        if (previousScoreOnLoser > 0) {
          laBonus = Math.floor(previousScoreOnLoser / 2);
          base += laBonus;
        }
      }

      previews.push({
        winnerId,
        winnerName: winner.name,
        base: base - dealerBonus - laBonus,
        dealerBonus,
        laBonus,
        total: base,
      });
    });

    return previews;
  }, [value, selectedWinners, loser, users, dealerId, consecutiveWins, currentWinnerId]);

  const handleSave = () => {
    if (value && selectedWinners.length >= 2 && selectedWinners.length <= 3) {
      onSave(loser.id, selectedWinners, parseInt(value, 10));
      onClose();
    }
  };

  const handleNumpadClick = (num: string) => {
    setValue(prev => prev + num);
  };

  const handleClear = () => {
    setValue('');
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1));
  };

  if (!loser) return null;

  const numpadButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>一炮多響</DialogTitle>
          <DialogDescription>
            選擇 {loser.name} 被同時食胡的玩家 (2-3人)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>輸家: {loser.name}</Label>
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-sm text-center font-semibold text-secondary-foreground">
                {loser.name} 被同時食胡
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              贏家: ({selectedWinners.length}/2-3)
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {opposingUsers.map(user => (
                <Button
                  key={user.id}
                  variant={selectedWinners.includes(user.id) ? 'default' : 'outline'}
                  onClick={() => toggleWinner(user.id)}
                  disabled={!selectedWinners.includes(user.id) && selectedWinners.length >= 3}
                  className="relative"
                >
                  {user.name}
                  {selectedWinners.includes(user.id) && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary">
                      {selectedWinners.indexOf(user.id) + 1}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value-input">番數:</Label>
            <Input
              id="value-input"
              type="number"
              inputMode="none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number"
              className="text-center text-lg h-12"
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {numpadButtons.map(num => (
                <Button key={num} variant="outline" size="lg" onClick={() => handleNumpadClick(num)}>
                  {num}
                </Button>
              ))}
              <Button variant="outline" size="lg" onClick={handleClear}>
                清除
              </Button>
              <Button variant="outline" size="lg" onClick={() => handleNumpadClick('0')}>
                0
              </Button>
              <Button variant="outline" size="lg" onClick={handleBackspace}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {scoresPreviews.length > 0 && (
            <Card className="bg-secondary/50">
              <CardContent className="p-3 pt-3">
                <div className="space-y-2">
                  {scoresPreviews.map((preview) => (
                    <div key={preview.winnerId} className="border-b last:border-b-0 pb-2 last:pb-0">
                      <p className="text-sm font-semibold mb-1">{preview.winnerName}</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">番</p>
                          <p className="font-semibold">{preview.base}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">莊</p>
                          <p className="font-semibold">{preview.dealerBonus}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">拉</p>
                          <p className="font-semibold">{preview.laBonus}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">總</p>
                          <p className="font-bold">{preview.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!value || selectedWinners.length < 2 || selectedWinners.length > 3}
          >
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
