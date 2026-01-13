'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, Zap } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

interface MobilePlayerCardProps {
  user: UserData;
  isDealer: boolean;
  totalScore: number;
  consecutiveWins: number;
  laCount?: number;
  canSurrender?: boolean;
  onSetDealer: (userId: number) => void;
  onManualConsecutiveWin: () => void;
  onWinAction: (user: UserData) => void;
  onSpecialAction: (user: UserData) => void;
  onMultiHit: (user: UserData) => void;
  onSurrender: (userId: number) => void;
}

export function MobilePlayerCard({
  user,
  isDealer,
  totalScore,
  consecutiveWins,
  laCount,
  canSurrender,
  onSetDealer,
  onManualConsecutiveWin,
  onWinAction,
  onSpecialAction,
  onMultiHit,
  onSurrender,
}: MobilePlayerCardProps) {
  return (
    <Card className="w-full border-l-4 overflow-hidden" style={{ borderLeftColor: isDealer ? '#fbbf24' : '#e5e7eb' }}>
      <CardContent className="p-4 space-y-3">
        {/* Player Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-black text-lg">{user.name}</h3>
          </div>
          {isDealer && (
            <Badge className="bg-yellow-400 text-yellow-800 font-black">
              {consecutiveWins > 1 ? `連${consecutiveWins - 1}` : ''}莊
            </Badge>
          )}
        </div>

        {/* Total Score */}
        <div className="bg-primary/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground font-bold mb-1">TOTAL SCORE</div>
          <div className="text-3xl font-black text-primary">{totalScore.toLocaleString()}</div>
        </div>

        {/* La Count Alert */}
        {laCount && laCount > 0 && (
          <div className={`rounded-lg p-2 text-center ${canSurrender ? 'bg-destructive/20 border-2 border-destructive' : 'bg-yellow-100'}`}>
            <div className="font-black text-sm">拉 {laCount}</div>
            {canSurrender && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-1 h-8"
                onClick={() => onSurrender(user.id)}
              >
                投降
              </Button>
            )}
          </div>
        )}

        {/* Dealer Controls */}
        {isDealer && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={() => onSetDealer(user.id)}
            >
              交莊
            </Button>
            <Button
              size="sm"
              className="flex-1 h-9 bg-blue-500 hover:bg-blue-600"
              onClick={onManualConsecutiveWin}
            >
              <Plus className="h-4 w-4 mr-1" />
              連莊
            </Button>
          </div>
        )}
        {!isDealer && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9"
            onClick={() => onSetDealer(user.id)}
          >
            成為莊家
          </Button>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-9"
            onClick={() => onWinAction(user)}
          >
            食胡
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-9"
            onClick={() => onMultiHit(user)}
          >
            一炮多響
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full h-9"
          onClick={() => onSpecialAction(user)}
        >
          <Zap className="h-4 w-4 mr-1" />
          特別賞罰
        </Button>

        {/* Win Values Grid */}
        {Object.keys(user.winValues).length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs font-bold text-muted-foreground mb-2">vs 其他玩家</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(user.winValues).map(([opponentId, value]) => (
                value > 0 && (
                  <div key={opponentId} className="text-center p-2 rounded bg-green-50 border border-green-200">
                    <div className="text-xs text-muted-foreground">vs {opponentId}</div>
                    <div className="font-black text-green-600">{value}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
