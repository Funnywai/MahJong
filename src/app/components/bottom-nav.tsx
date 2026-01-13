'use client';

import { Button } from '@/components/ui/button';
import { Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentView: 'game' | 'analytics';
  onViewChange: (view: 'game' | 'analytics') => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 flex items-center justify-around safe-area-inset-bottom">
      <Button
        variant="ghost"
        className={cn(
          'flex-1 h-16 rounded-none flex flex-col items-center justify-center gap-1',
          currentView === 'game' && 'bg-primary/10 border-b-2 border-primary'
        )}
        onClick={() => onViewChange('game')}
      >
        <Users className="h-6 w-6" />
        <span className="text-xs font-bold">遊戲</span>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          'flex-1 h-16 rounded-none flex flex-col items-center justify-center gap-1',
          currentView === 'analytics' && 'bg-primary/10 border-b-2 border-primary'
        )}
        onClick={() => onViewChange('analytics')}
      >
        <BarChart3 className="h-6 w-6" />
        <span className="text-xs font-bold">統計</span>
      </Button>
    </nav>
  );
}
