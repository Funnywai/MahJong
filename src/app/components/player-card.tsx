'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  id: number;
  name: string;
  totalScore: number;
  isDealer: boolean;
  consecutiveWins?: number;
  opponentScores: { [opponentId: number]: number };
  opponentNames: { [opponentId: number]: string };
  laCount?: number;
  canSurrender?: boolean;
  onDealerClick: () => void;
  onConsecutiveWinClick?: () => void;
  onMultiHitClick?: () => void;
  onFoodHuClick?: () => void;
  onSpecialActionClick?: () => void;
  onSurrender?: () => void;
}

export function PlayerCard({
  id,
  name,
  totalScore,
  isDealer,
  consecutiveWins = 1,
  opponentScores,
  opponentNames,
  laCount = 0,
  canSurrender = false,
  onDealerClick,
  onConsecutiveWinClick,
  onMultiHitClick,
  onFoodHuClick,
  onSpecialActionClick,
  onSurrender,
}: PlayerCardProps) {
  const hasPreviousWins = Object.values(opponentScores).some(score => score > 0);

  return (
    <Card className={cn(
      'shadow-md transition-all duration-200',
      isDealer && 'bg-yellow-50 border-yellow-300 border-2',
      hasPreviousWins && 'ring-2 ring-green-400'
    )}>
      <CardContent className="p-3 sm:p-4">
        {/* Header: Name & Total Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 flex-shrink-0 text-primary" />
              <h3 className="font-bold text-sm sm:text-base truncate">{name}</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              {totalScore.toLocaleString()}
            </div>
          </div>

          {/* Dealer Badge */}
          {isDealer && (
            <Badge className="bg-yellow-400 text-yellow-900 font-bold text-sm whitespace-nowrap flex-shrink-0">
              <Trophy className="h-3 w-3 mr-1" />
              {consecutiveWins > 1 ? `連${consecutiveWins - 1}` : ''}莊
            </Badge>
          )}
        </div>

        {/* La Count Status */}
        {laCount > 0 && (
          <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
            <div className="text-red-700 font-bold text-sm">拉{laCount}</div>
            {canSurrender && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full mt-2 h-9"
                onClick={onSurrender}
              >
                投降
              </Button>
            )}
          </div>
        )}

        {/* Opponent Scores - Horizontal Scroll */}
        {Object.keys(opponentScores).length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">對手番數</div>
            <div className="overflow-x-auto -mx-3 px-3 sm:overflow-visible">
              <div className="flex gap-2 pb-2 sm:pb-0">
                {Object.entries(opponentScores).map(([opponentId, score]) => (
                  <div 
                    key={opponentId}
                    className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 min-w-[80px] text-center"
                  >
                    <div className="text-xs font-semibold text-blue-900 truncate mb-1">
                      {opponentNames[parseInt(opponentId)]}
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          {/* Dealer Button & Consecutive Win Button */}
          <div className="flex gap-2">
            <Button
              onClick={onDealerClick}
              variant={isDealer ? "default" : "outline"}
              className={cn(
                'flex-1 h-10 font-semibold',
                isDealer && 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
              )}
            >
              {isDealer ? '莊' : '換莊'}
            </Button>
            {isDealer && (
              <Button
                onClick={onConsecutiveWinClick}
                variant="secondary"
                className="flex-1 h-10 font-semibold"
              >
                連莊
              </Button>
            )}
          </div>

          {/* Win Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onFoodHuClick}
              variant="outline"
              className="h-10 font-semibold"
            >
              食胡
            </Button>
            <Button
              onClick={onMultiHitClick}
              variant="outline"
              className="h-10 font-semibold"
            >
              一炮多響
            </Button>
          </div>

          {/* Secondary Action Button */}
          <Button
            onClick={onSpecialActionClick}
            variant="outline"
            className="w-full h-10 font-semibold"
          >
            特別賞罰
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
