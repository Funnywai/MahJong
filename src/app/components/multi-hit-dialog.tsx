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
  onSave: (loserUserId: number, winners: number[], values: Record<number, number>) => void;
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
  const [winnerValues, setWinnerValues] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedWinners([]);
      setWinnerValues({});
    }
  }, [isOpen]);

  const opposingUsers = useMemo(() => users.filter(u => u.id !== loser.id), [users, loser]);

  const toggleWinner = (userId: number) => {
    setSelectedWinners(prev => {
      if (prev.includes(userId)) {
        const next = prev.filter(id => id !== userId);
        setWinnerValues(values => {
          const updated = { ...values };
          delete updated[userId];
          return updated;
        });
        return next;
      } else {
        if (prev.length < 3) {
          return [...prev, userId];
        }
        return prev;
      }
    });
  };

  const handleValueChange = (winnerId: number, val: string) => {
    setWinnerValues(prev => ({ ...prev, [winnerId]: val }));
  };

  const scoresPreviews = useMemo<ScorePreview[]>(() => {
    const previews: ScorePreview[] = [];
    const dealerBonusValue = 2 * consecutiveWins - 1;

    // Check if there are other users (not in selectedWinners) with active scores
    const usersWithActiveWinValues = users.filter(
      u => !selectedWinners.includes(u.id) && u.id !== loser.id && Object.values(u.winValues).some(score => score > 0)
    );
    const hasOtherUsersWithScores = usersWithActiveWinValues.length > 0;

    selectedWinners.forEach(winnerId => {
      const winner = users.find(u => u.id === winnerId);
      if (!winner) return;

      const parsedValue = parseInt(winnerValues[winnerId] || '', 10);
      if (isNaN(parsedValue) || parsedValue <= 0) return;

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

      // La bonus logic (拉): Check if THIS winner has a previous score against the loser
      const previousScore = winner.winValues[loser.id] || 0;
      if (previousScore > 0) {
        laBonus = Math.round(previousScore * 0.5);
        base += laBonus;
      } else if (hasOtherUsersWithScores) {
        // 踢 bonus: Check if the loser has a previous score against THIS winner
        const previousScoreOnWinner = loser.winValues[winnerId] || 0;
        if (previousScoreOnWinner > 0) {
          laBonus = Math.floor(previousScoreOnWinner / 2);
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
  }, [selectedWinners, loser, users, dealerId, consecutiveWins, winnerValues]);

  const handleSave = () => {
    if (selectedWinners.length < 2 || selectedWinners.length > 3) return;

    const parsedValues: Record<number, number> = {};
    let allValid = true;

    selectedWinners.forEach(id => {
      const parsed = parseInt(winnerValues[id] || '', 10);
      if (isNaN(parsed) || parsed <= 0) {
        allValid = false;
      } else {
        parsedValues[id] = parsed;
      }
    });

    if (!allValid) return;

    onSave(loser.id, selectedWinners, parsedValues);
    onClose();
  };

  if (!loser) return null;

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

          {selectedWinners.length > 0 && (
            <div className="space-y-3">
              <Label>番數 (每位贏家可不同):</Label>
              <div className="space-y-2">
                {selectedWinners.map((winnerId, idx) => {
                  const winner = users.find(u => u.id === winnerId);
                  return (
                    <div key={winnerId} className="flex items-center gap-2">
                      <Badge variant="secondary" className="min-w-7 justify-center">{idx + 1}</Badge>
                      <span className="min-w-[80px] text-sm font-semibold">{winner?.name}</span>
                      <Input
                        type="number"
                        value={winnerValues[winnerId] || ''}
                        onChange={(e) => handleValueChange(winnerId, e.target.value)}
                        placeholder="番數"
                        className="h-10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            disabled={selectedWinners.length < 2 || selectedWinners.length > 3}
          >
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
