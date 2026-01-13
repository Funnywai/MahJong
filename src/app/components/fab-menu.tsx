'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Shuffle, HistoryIcon, List, DollarSign, RefreshCw, Plus, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABMenuProps {
  onRename: () => void;
  onSeatChange: () => void;
  onRestore: () => void;
  onReset: () => void;
  onHistory: () => void;
  onPayout: () => void;
  onToggleMode: () => void;
  modeEnabled: boolean;
  historyAvailable: boolean;
}

export function FABMenu({
  onRename,
  onSeatChange,
  onRestore,
  onReset,
  onHistory,
  onPayout,
  onToggleMode,
  modeEnabled,
  historyAvailable,
}: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Pencil, label: '改名', onClick: () => { onRename(); setIsOpen(false); } },
    { icon: Shuffle, label: '換位', onClick: () => { onSeatChange(); setIsOpen(false); } },
    { icon: HistoryIcon, label: '還原', onClick: () => { onRestore(); setIsOpen(false); }, disabled: !historyAvailable },
    { icon: List, label: '歷史', onClick: () => { onHistory(); setIsOpen(false); }, disabled: !historyAvailable },
    { icon: DollarSign, label: '找數', onClick: () => { onPayout(); setIsOpen(false); }, disabled: !historyAvailable },
    { icon: RefreshCw, label: '重置', onClick: () => { onReset(); setIsOpen(false); } },
  ];

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2 items-end z-50">
      {/* Menu Items */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
          <Button
            size="sm"
            variant={modeEnabled ? 'default' : 'outline'}
            className="h-10 px-3 rounded-full shadow-lg whitespace-nowrap"
            onClick={() => {
              onToggleMode();
              setIsOpen(false);
            }}
          >
            <Zap className="h-4 w-4 mr-1" />
            籌碼模式: {modeEnabled ? 'ON' : 'OFF'}
          </Button>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              size="sm"
              variant={item.disabled ? 'ghost' : 'outline'}
              disabled={item.disabled}
              className="h-10 px-3 rounded-full shadow-lg whitespace-nowrap"
              onClick={item.onClick}
            >
              <item.icon className="h-4 w-4 mr-1" />
              {item.label}
            </Button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        size="lg"
        className={cn(
          'h-12 w-12 rounded-full shadow-lg p-0 transition-all',
          isOpen && 'bg-destructive hover:bg-destructive'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
