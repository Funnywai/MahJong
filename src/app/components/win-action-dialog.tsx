'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

interface WinActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mainUser: UserData;
  users: UserData[];
  currentWinnerId: number | null;
  dealerId: number;
  consecutiveWins: number;
  onSave: (mainUserId: number, value: number, targetUserId?: number) => void;
  onLaunchMultiHit: (loserId?: number) => void;
}

interface ScorePreview {
  base: number;
  dealerBonus: number;
  laBonus: number;
  total: number;
}

export function WinActionDialog({ 
  isOpen, 
  onClose, 
  mainUser, 
  users, 
  currentWinnerId,
  dealerId,
  consecutiveWins,
  onSave,
  onLaunchMultiHit,
}: WinActionDialogProps) {
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isZimo, setIsZimo] = useState(false);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetUserId(null);
      setIsZimo(false);
      setValue('');
    }
  }, [isOpen]);

  const opponentUsers = useMemo(() => users.filter(u => u.id !== mainUser.id), [users, mainUser]);

  const scorePreview = useMemo<ScorePreview | null>(() => {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue <= 0 || (!targetUserId && !isZimo)) {
      return null;
    }

    let base = parsedValue;
    let dealerBonus = 0;
    let laBonus = 0;

    const dealerBonusValue = 2 * consecutiveWins - 1;
    
    // Check if any OTHER users (not the current winner) have active winValues
    const usersWithActiveWinValues = users.filter(
      u => u.id !== mainUser.id && Object.values(u.winValues).some(score => score > 0)
    );
    const isNewWinner = usersWithActiveWinValues.length > 0;

    if (isZimo) {
        let totalLaBonus = 0;
        let totalDealerBonus = 0;

        opponentUsers.forEach(opponent => {
            let currentScoreForOpponent = parsedValue;
            // Dealer Bonus
            if (mainUser.id === dealerId) {
                totalDealerBonus += dealerBonusValue;
                currentScoreForOpponent += dealerBonusValue;
            } else if (opponent.id === dealerId) {
                totalDealerBonus += dealerBonusValue;
                currentScoreForOpponent += dealerBonusValue;
            }
            
            // La Bonus: Check if mainUser had a previous score against this opponent
            const previousScore = mainUser.winValues[opponent.id] || 0;
            if (previousScore > 0) {
                const bonus = Math.round(previousScore * 0.5);
                totalLaBonus += bonus;
            } else if (isNewWinner) {
                // 踢 Bonus: Check if this opponent had a previous score against mainUser
                const previousScoreOnWinner = opponent.winValues[mainUser.id] || 0;
                if (previousScoreOnWinner > 0) {
                    totalLaBonus += Math.floor(previousScoreOnWinner / 2);
                }
            }
        });

        base = parsedValue * opponentUsers.length;
        dealerBonus = totalDealerBonus;
        laBonus = totalLaBonus;
        
    } else if (targetUserId) {
        let currentScore = parsedValue;
        const parsedTargetId = parseInt(targetUserId, 10);

        // Dealer Bonus
        if (mainUser.id === dealerId) {
            dealerBonus = dealerBonusValue;
            currentScore += dealerBonus;
        } else if (parsedTargetId === dealerId) {
            dealerBonus = dealerBonusValue;
            currentScore += dealerBonus;
        }

        // La Bonus: Check if mainUser had a previous score against the target
        const previousScore = mainUser.winValues[parsedTargetId] || 0;
        if (previousScore > 0) {
            laBonus = Math.round(previousScore * 0.5);
        } else if (isNewWinner) {
            // 踢 Bonus: Check if the target had a previous score against mainUser
            const targetUser = users.find(u => u.id === parsedTargetId);
            const previousScoreOnWinner = targetUser?.winValues[mainUser.id] || 0;
            if (previousScoreOnWinner > 0) {
                laBonus = Math.floor(previousScoreOnWinner / 2);
            }
        }
    }
    
    return {
        base,
        dealerBonus,
        laBonus,
        total: base + dealerBonus + laBonus
    };
  }, [value, targetUserId, isZimo, mainUser, users, currentWinnerId, dealerId, consecutiveWins, opponentUsers]);

  const handleSave = () => {
    if (value && (targetUserId || isZimo)) {
      onSave(mainUser.id, parseInt(value, 10), isZimo ? undefined : parseInt(targetUserId!, 10));
      onClose();
    }
  };

  const handleUserSelect = (userId: string) => {
    setTargetUserId(userId);
    setIsZimo(false);
  };
  
  const handleZimoSelect = () => {
    setIsZimo(true);
    setTargetUserId(null);
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


  if (!mainUser) return null;

  const numpadButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>食胡</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>輸家:</Label>
            <div className="grid grid-cols-4 gap-2">
                {opponentUsers.map(user => (
                    <Button
                        key={user.id}
                        variant={targetUserId === user.id.toString() ? 'default' : 'outline'}
                        onClick={() => handleUserSelect(user.id.toString())}
                    >
                        {user.name}
                    </Button>
                ))}
                 <Button
                    key="zimo"
                    variant={isZimo ? 'default' : 'outline'}
                    onClick={handleZimoSelect}
                >
                    自摸
                </Button>
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

          <Card className="bg-secondary/30">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase">Multi</Badge>
                  一炮多響
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onLaunchMultiHit(targetUserId ? parseInt(targetUserId, 10) : undefined);
                  onClose();
                }}
              >
                開啟
              </Button>
            </CardContent>
          </Card>

          {scorePreview && (
            <Card className="bg-secondary/50">
              <CardContent className="p-2 pt-2">
                  <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                          <p className="text-sm text-muted-foreground">番</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">莊</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">拉</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">總</p>
                      </div>
                      <div>
                          <p className="font-semibold text-lg">{scorePreview.base}</p>
                      </div>
                      <div>
                          <p className="font-semibold text-lg">{scorePreview.dealerBonus}</p>
                      </div>
                      <div>
                          <p className="font-semibold text-lg">{scorePreview.laBonus}</p>
                      </div>
                      <div>
                          <p className="font-bold text-lg">{scorePreview.total}</p>
                      </div>
                  </div>
              </CardContent>
            </Card>
          )}

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" onClick={handleSave} disabled={!value || (!targetUserId && !isZimo)}>
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
