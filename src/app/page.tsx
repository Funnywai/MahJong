'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Users, Pencil, History as HistoryIcon, List, Shuffle, DollarSign, Zap, BarChart3, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RenameDialog } from '@/app/components/rename-dialog';
import { WinActionDialog } from '@/app/components/win-action-dialog';
import { HistoryDialog } from '@/app/components/history-dialog';
import { SeatChangeDialog } from '@/app/components/seat-change-dialog';
import { ResetScoresDialog } from '@/app/components/reset-scores-dialog';
import { PayoutDialog } from '@/app/components/payout-dialog';
import { SpecialActionDialog } from '@/app/components/special-action-dialog';
import { MultiHitDialog } from '@/app/components/multi-hit-dialog';
import { ScoreAnalyticsDashboard } from '@/app/components/score-analytics-dashboard';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface UserData {
  id: number;
  name: string;
  winValues: { [opponentId: number]: number };
}

export interface LaCounts {
  [winnerId: number]: {
    [loserId: number]: number;
  };
}

export interface ScoreChange {
  userId: number;
  change: number;
}

interface Payouts {
  [opponentId: number]: number;
}

export interface GameState {
  users: UserData[];
  laCounts: LaCounts;
  currentWinnerId: number | null;
  dealerId: number;
  consecutiveWins: number;
  action: string;
  scoreChanges: ScoreChange[];
}

const generateInitialUsers = (): UserData[] => {
  const userCount = 4;
  return Array.from({ length: userCount }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    winValues: {},
  }));
};

const initialUsers = generateInitialUsers();

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

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState<'game' | 'analytics'>('game');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [users, setUsers] = useState<UserData[]>(() => {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('mahjong-users');
      return savedUsers ? JSON.parse(savedUsers) : initialUsers;
    }
    return initialUsers;
  });
  const [history, setHistory] = useState<GameState[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('mahjong-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    }
    return [];
  });

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isWinActionDialogOpen, setIsWinActionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isSeatChangeDialogOpen, setIsSeatChangeDialogOpen] = useState(false);
  const [isResetScoresDialogOpen, setIsResetScoresDialogOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [isSpecialActionDialogOpen, setIsSpecialActionDialogOpen] = useState(false);
  const [isMultiHitDialogOpen, setIsMultiHitDialogOpen] = useState(false);


  const [currentUserForWinAction, setCurrentUserForWinAction] = useState<UserData | null>(null);
  const [currentUserForSpecialAction, setCurrentUserForSpecialAction] = useState<UserData | null>(null);
  const [multiHitInitialLoserId, setMultiHitInitialLoserId] = useState<number | null>(null);

  const [dealerId, setDealerId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedDealerId = localStorage.getItem('mahjong-dealerId');
      return savedDealerId ? JSON.parse(savedDealerId) : 1;
    }
    return 1;
  });
  const [consecutiveWins, setConsecutiveWins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedConsecutiveWins = localStorage.getItem('mahjong-consecutiveWins');
      return savedConsecutiveWins ? JSON.parse(savedConsecutiveWins) : 1;
    }
    return 1;
  });

  const [currentWinnerId, setCurrentWinnerId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedWinnerId = localStorage.getItem('mahjong-currentWinnerId');
      return savedWinnerId ? JSON.parse(savedWinnerId) : null;
    }
    return null;
  });

  const [laCounts, setLaCounts] = useState<LaCounts>(() => {
    if (typeof window !== 'undefined') {
      const savedLaCounts = localStorage.getItem('mahjong-laCounts');
      return savedLaCounts ? JSON.parse(savedLaCounts) : {};
    }
    return {};
  });
  const [scoresToReset, setScoresToReset] = useState<ScoresToReset | null>(null);

  const [popOnNewWinner, setPopOnNewWinner] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedPopOnNewWinner = localStorage.getItem('mahjong-popOnNewWinner');
      return savedPopOnNewWinner ? JSON.parse(savedPopOnNewWinner) : true;
    }
    return true;
  });


  useEffect(() => {
    if(isClient) {
      localStorage.setItem('mahjong-popOnNewWinner', JSON.stringify(popOnNewWinner));
    }
  }, [isClient, popOnNewWinner]);

  const saveGameData = (data: {
    users?: UserData[];
    history?: GameState[];
    dealerId?: number;
    consecutiveWins?: number;
    currentWinnerId?: number | null;
    laCounts?: LaCounts;
  }) => {
    if (isClient) {
      if (data.users !== undefined) localStorage.setItem('mahjong-users', JSON.stringify(data.users));
      if (data.history !== undefined) localStorage.setItem('mahjong-history', JSON.stringify(data.history));
      if (data.dealerId !== undefined) localStorage.setItem('mahjong-dealerId', JSON.stringify(data.dealerId));
      if (data.consecutiveWins !== undefined) localStorage.setItem('mahjong-consecutiveWins', JSON.stringify(data.consecutiveWins));
      if (data.laCounts !== undefined) localStorage.setItem('mahjong-laCounts', JSON.stringify(data.laCounts));
      if (data.currentWinnerId !== undefined) localStorage.setItem('mahjong-currentWinnerId', JSON.stringify(data.currentWinnerId));
    }
  };


  const saveStateToHistory = (action: string, scoreChanges: ScoreChange[], currentState: Omit<GameState, 'action' | 'scoreChanges'>) => {
    const newHistoryEntry: GameState = {
      ...currentState,
      action,
      scoreChanges,
    };
    const newHistory = [...history, newHistoryEntry];
    setHistory(newHistory);
    return newHistory;
  };

  const handleSetDealer = (userId: number) => {
    const newConsecutiveWins = 1;
    setDealerId(userId);
    setConsecutiveWins(newConsecutiveWins);
    saveGameData({
        dealerId: userId,
        consecutiveWins: newConsecutiveWins,
    });
  };

  const handleManualConsecutiveWin = () => {
    const newConsecutiveWins = consecutiveWins + 1;
    setConsecutiveWins(newConsecutiveWins);
    saveGameData({
        consecutiveWins: newConsecutiveWins,
    });
  };

  const handleOpenWinActionDialog = (user: UserData) => {
    setCurrentUserForWinAction(user);
    setIsWinActionDialogOpen(true);
  };
  
  const handleOpenSpecialActionDialog = (user?: UserData) => {
    setCurrentUserForSpecialAction(user ?? users[0] ?? null);
    setIsSpecialActionDialogOpen(true);
  };

  const handleLaunchMultiHit = (loserId?: number) => {
    setMultiHitInitialLoserId(loserId ?? null);
    setIsMultiHitDialogOpen(true);
  };

  const handleLaunchMultiHitFromWinFlow = (loserId?: number) => {
    handleLaunchMultiHit(loserId);
    setIsWinActionDialogOpen(false);
  };

  const handleExecuteZhaHuAction = (mainUserId: number, payouts: Payouts) => {
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const mainUser = users.find(u => u.id === mainUserId);
    if (!mainUser) return;
  
    let totalPayout = 0;
    const scoreChanges: ScoreChange[] = [];
  
    Object.entries(payouts).forEach(([opponentId, amount]) => {
      const opponentIdNum = parseInt(opponentId, 10);
      if (amount > 0) {
        totalPayout += amount;
        scoreChanges.push({ userId: opponentIdNum, change: amount });
      }
    });
  
    scoreChanges.push({ userId: mainUserId, change: -totalPayout });
  
    const payoutDescriptions = Object.entries(payouts)
        .map(([id, amt]) => `${users.find(u=>u.id === parseInt(id))?.name}: ${amt}`)
        .join(', ');
    const actionDescription = `${mainUser.name} 炸胡, pays out: ${payoutDescriptions}`;

    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
  
    saveGameData({
      history: newHistory,
    });
  
    setIsSpecialActionDialogOpen(false);
  };


  const handleExecuteSpecialAction = (mainUserId: number, actionType: 'collect' | 'pay', amount: number) => {
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const mainUser = users.find(u => u.id === mainUserId);
    if (!mainUser) return;
  
    const scoreChanges: ScoreChange[] = [];
    const opponentIds = users.filter(u => u.id !== mainUserId).map(u => u.id);
  
    let mainUserChange = 0;
    let actionDescription = '';
  
    if (actionType === 'collect') {
      mainUserChange = amount * opponentIds.length;
      opponentIds.forEach(id => scoreChanges.push({ userId: id, change: -amount }));
      actionDescription = `${mainUser.name} 收 ${amount} 番`;
    } else { // pay
      mainUserChange = -amount * opponentIds.length;
      opponentIds.forEach(id => scoreChanges.push({ userId: id, change: amount }));
      actionDescription = `${mainUser.name} 賠 ${amount} 番`;
    }
  
    scoreChanges.push({ userId: mainUserId, change: mainUserChange });
  
    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
  
    saveGameData({
      history: newHistory,
    });
  
    setIsSpecialActionDialogOpen(false);
  };

  const handleWin = (winnerId: number, currentDealerId: number, currentConsecutiveWins: number) => {
    if (winnerId === currentDealerId) {
      return { newDealerId: currentDealerId, newConsecutiveWins: currentConsecutiveWins + 1 };
    } else {
      const currentDealerIndex = users.findIndex(u => u.id === currentDealerId);
      const nextDealerIndex = (currentDealerIndex + 1) % users.length;
      return { newDealerId: users[nextDealerIndex].id, newConsecutiveWins: 1 };
    }
  };


  const updateLaCounts = (winnerId: number, loserIds: number[], currentLaCounts: LaCounts, currentWinnerId: number | null) => {
    let newLaCounts: LaCounts;

    if (winnerId === currentWinnerId) {
      // Same winner continues: only keep their own la counts, reset other players' counts
      newLaCounts = {};
      if (currentLaCounts[winnerId]) {
        newLaCounts[winnerId] = { ...currentLaCounts[winnerId] };
      }
    } else {
      // New winner: reset all counts
      newLaCounts = {};
    }

    if (!newLaCounts[winnerId]) {
      newLaCounts[winnerId] = {};
    }

    loserIds.forEach(loserId => {
      newLaCounts[winnerId][loserId] = (newLaCounts[winnerId]?.[loserId] || 0) + 1;
    });

    return newLaCounts;
  };


  const executeWinAction = (
    mainUserId: number,
    value: number,
    targetUserId?: number
  ) => {
    // Capture the state BEFORE any changes for the history log.
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
        users: JSON.parse(JSON.stringify(users)),
        laCounts: JSON.parse(JSON.stringify(laCounts)),
        currentWinnerId,
        dealerId,
        consecutiveWins,
    };

    // Check if any OTHER users (not the current winner) have active winValues that need to be reset
    // This handles the 一炮多響 case where multiple users might have won in the same round
    const usersWithActiveWinValues = users.filter(
      u => u.id !== mainUserId && Object.values(u.winValues).some(score => score > 0)
    );
    const hasOtherUsersWithScores = usersWithActiveWinValues.length > 0;
    
    // isNewWinner is true if there are any other users with scores that need to be reset
    const isNewWinner = hasOtherUsersWithScores;
    const currentWinner = users.find(u => u.id === mainUserId);
    if (isNewWinner && popOnNewWinner) {
        // Aggregate all previous winners so the dialog can show every reset in chip mode
        const winnersToReset = usersWithActiveWinValues
          .filter(previousWinner => Object.values(previousWinner.winValues).some(score => score > 0))
          .map(previousWinner => ({
            previousWinnerName: previousWinner.name,
            previousWinnerId: previousWinner.id,
            scores: previousWinner.winValues,
          }));

        if (winnersToReset.length > 0) {
          setScoresToReset({
            currentWinnerName: currentWinner?.name || '',
            currentWinnerId: mainUserId,
            winners: winnersToReset,
          });
          setIsResetScoresDialogOpen(true);
        }
    }
    
    let finalUsers: UserData[];
    let actionDescription: string;
    let scoreChanges: ScoreChange[];
    let newLaCounts: LaCounts;

    if (targetUserId) {
        // "食胡" case
        const winner = users.find(u => u.id === mainUserId);
        const loser = users.find(u => u.id === targetUserId);
        actionDescription = `${winner?.name} 食胡 ${loser?.name} ${value}番`;

        let currentScore = value;
        const dealerBonus = 2 * consecutiveWins - 1;

        if (mainUserId === dealerId) {
            currentScore += dealerBonus;
        } else if (targetUserId === dealerId) {
            currentScore += dealerBonus;
        }

        let finalValue = currentScore;

        // Check if this winner had a previous score against this loser (consecutive win bonus)
        const previousScore = winner?.winValues[targetUserId] || 0;
        if (previousScore > 0) {
            const bonus = Math.round(previousScore * 0.5);
            finalValue = previousScore + bonus + currentScore;
        }

        // Check if the loser had a previous score against the winner (reverse la bonus)
        if (isNewWinner) {
            const loserUser = users.find(u => u.id === targetUserId);
            const previousScoreOnWinner = loserUser?.winValues[mainUserId] || 0;
            if (previousScoreOnWinner > 0) {
                finalValue = Math.floor(previousScoreOnWinner / 2) + currentScore;
            }
        }

        const changeAmount = finalValue - (users.find(u => u.id === mainUserId)?.winValues[targetUserId] || 0);
        scoreChanges = [
            { userId: mainUserId, change: changeAmount },
            { userId: targetUserId, change: -changeAmount },
        ];
        
        newLaCounts = updateLaCounts(mainUserId, [targetUserId], laCounts, currentWinnerId);

        finalUsers = users.map(user => {
            if (isNewWinner && user.id !== mainUserId) {
                return { ...user, winValues: {} };
            }
            return user;
        }).map(user => {
            if (user.id === mainUserId) {
                const newWinValues = isNewWinner ? {} : { ...user.winValues };
                newWinValues[targetUserId] = finalValue;

                if (isNewWinner) {
                    Object.keys(newWinValues).forEach(key => {
                        if (parseInt(key) !== targetUserId) {
                            newWinValues[parseInt(key)] = 0;
                        }
                    });
                }
                return { ...user, winValues: newWinValues };
            }
            if (user.id !== mainUserId) {
                const newWinValues = { ...user.winValues };
                if (newWinValues[mainUserId]) {
                    newWinValues[mainUserId] = 0;
                }
                return { ...user, winValues: newWinValues };
            }
            return user;
        });

    } else {
        // "自摸" case
        const winner = users.find(u => u.id === mainUserId);
        actionDescription = `${winner?.name} 自摸 ${value}番`;
        const opponentIds = users.filter(u => u.id !== mainUserId).map(u => u.id);

        const isDealerWinning = mainUserId === dealerId;
        const dealerBonus = 2 * consecutiveWins - 1;

        const scoresToAdd: { [opponentId: number]: number } = {};
        let winnerTotalChange = 0;
        const currentScoreChanges: ScoreChange[] = [];

        opponentIds.forEach(opponentId => {
            let currentScore = value;
            if (isDealerWinning) {
                currentScore += dealerBonus;
            } else if (opponentId === dealerId) {
                currentScore += dealerBonus;
            }

            let finalValue = currentScore;

            // Check if this winner had a previous score against this opponent (consecutive win bonus)
            const previousScore = winner?.winValues[opponentId] || 0;
            if (previousScore > 0) {
                const bonus = Math.round(previousScore * 0.5);
                finalValue = previousScore + bonus + currentScore;
            } else if (isNewWinner) {
                // Check if this opponent had a previous score against the winner (reverse la bonus)
                const opponentUser = users.find(u => u.id === opponentId);
                const previousScoreOnWinner = opponentUser?.winValues[mainUserId] || 0;
                if (previousScoreOnWinner > 0) {
                    finalValue = Math.floor(previousScoreOnWinner / 2) + currentScore;
                }
            }
            
            const change = finalValue - (winner?.winValues[opponentId] || 0);
            scoresToAdd[opponentId] = finalValue;
            winnerTotalChange += change;
            currentScoreChanges.push({ userId: opponentId, change: -change });
        });
        currentScoreChanges.push({ userId: mainUserId, change: winnerTotalChange });
        scoreChanges = currentScoreChanges;

        newLaCounts = updateLaCounts(mainUserId, opponentIds, laCounts, currentWinnerId);
        
        finalUsers = users.map(user => {
            if (isNewWinner && user.id !== mainUserId) {
                return { ...user, winValues: {} };
            }
            return user;
        }).map(user => {
            if (user.id === mainUserId) {
                const newWinValues = isNewWinner ? {} : { ...user.winValues };
                Object.entries(scoresToAdd).forEach(([opponentId, score]) => {
                    newWinValues[parseInt(opponentId)] = score;
                });
                return { ...user, winValues: newWinValues };
            }
            if (user.id !== mainUserId) {
                const newWinValues = { ...user.winValues };
                if (newWinValues[mainUserId]) {
                    newWinValues[mainUserId] = 0;
                }
                return { ...user, winValues: newWinValues };
            }
            return user;
        });
    }

    const { newDealerId, newConsecutiveWins } = handleWin(mainUserId, dealerId, consecutiveWins);
    
    setUsers(finalUsers);
    setLaCounts(newLaCounts);
    setCurrentWinnerId(mainUserId);
    setDealerId(newDealerId);
    setConsecutiveWins(newConsecutiveWins);
    
    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);
    
    saveGameData({
      users: finalUsers,
      history: newHistory,
      dealerId: newDealerId,
      consecutiveWins: newConsecutiveWins,
      currentWinnerId: mainUserId,
      laCounts: newLaCounts,
    });


    setIsWinActionDialogOpen(false);
  };

  const handleSaveWinAction = (mainUserId: number, value: number, targetUserId?: number) => {
    executeWinAction(mainUserId, value, targetUserId);
  };

  const handleExecuteMultiHitAction = (loserUserId: number, winnerIds: number[], winnerValues: Record<number, number>) => {
    if (winnerIds.length < 2 || winnerIds.length > 3) return;

    // Capture the state BEFORE any changes for the history log.
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };

    const loser = users.find(u => u.id === loserUserId);
    if (!loser) return;

    const firstWinnerId = winnerIds[0];

    // Check if any of the current winners had previous winValues (for la bonus)
    // Also check if there are OTHER users with scores that need to be reset
    const usersWithActiveWinValues = users.filter(
      u => !winnerIds.includes(u.id) && Object.values(u.winValues).some(score => score > 0)
    );
    const hasOtherUsersWithScores = usersWithActiveWinValues.length > 0;

    // Show reset dialog for chip mode if there are other users with scores to reset
    if (hasOtherUsersWithScores && popOnNewWinner) {
      const winnersToReset = usersWithActiveWinValues
        .filter(previousWinner => Object.values(previousWinner.winValues).some(score => score > 0))
        .map(previousWinner => ({
          previousWinnerName: previousWinner.name,
          previousWinnerId: previousWinner.id,
          scores: previousWinner.winValues,
        }));

      if (winnersToReset.length > 0) {
        const winnerNames = winnerIds.map(id => users.find(u => u.id === id)?.name).join(' & ');
        setScoresToReset({
          currentWinnerName: winnerNames,
          currentWinnerId: firstWinnerId,
          winners: winnersToReset,
        });
        setIsResetScoresDialogOpen(true);
      }
    }

    // When a new winner appears (someone not in the multi-hit), reset all winValues for consistency
    const resetWinValues = hasOtherUsersWithScores;
    const finalUsers: UserData[] = users.map(user => ({
      ...user,
      winValues: resetWinValues ? {} : { ...user.winValues },
    }));

    // Build la counts: keep counts if any winner was already winning, else reset
    const baseLaCounts = winnerIds.some(id => id === currentWinnerId) ? { ...laCounts } : {};
    const newLaCounts: LaCounts = { ...baseLaCounts };

    const scoreChanges: ScoreChange[] = [];

    winnerIds.forEach(winnerId => {
      const winner = users.find(u => u.id === winnerId);
      const finalWinner = finalUsers.find(u => u.id === winnerId);
      if (!winner || !finalWinner) return;

      const baseValue = winnerValues[winnerId];
      if (!baseValue || baseValue <= 0) return;

      let currentScore = baseValue;
      const dealerBonusValue = 2 * consecutiveWins - 1;

      if (winnerId === dealerId) {
        currentScore += dealerBonusValue;
      } else if (loserUserId === dealerId) {
        currentScore += dealerBonusValue;
      }

      let finalValue = currentScore;

      // Check if THIS specific winner had a previous score against the loser (consecutive la bonus)
      const previousScore = winner.winValues[loserUserId] || 0;
      if (previousScore > 0) {
        const bonus = Math.round(previousScore * 0.5);
        finalValue = previousScore + bonus + currentScore;
      } else if (hasOtherUsersWithScores) {
        // Check if the loser had a previous score against THIS winner (reverse la/踢 bonus)
        const previousScoreOnWinner = loser.winValues[winnerId] || 0;
        if (previousScoreOnWinner > 0) {
          finalValue = Math.floor(previousScoreOnWinner / 2) + currentScore;
        }
      }

      const originalWinner = users.find(u => u.id === winnerId);
      const previousValue = originalWinner?.winValues[loserUserId] || 0;
      finalWinner.winValues[loserUserId] = finalValue;

      scoreChanges.push({ userId: winnerId, change: finalValue - previousValue });

      newLaCounts[winnerId] = newLaCounts[winnerId] ? { ...newLaCounts[winnerId] } : {};
      newLaCounts[winnerId][loserUserId] = (newLaCounts[winnerId][loserUserId] || 0) + 1;
    });

    // Loser's total negative change
    const totalLoserChange = scoreChanges.reduce((sum, change) => sum + change.change, 0);
    scoreChanges.push({ userId: loserUserId, change: -totalLoserChange });

    const { newDealerId, newConsecutiveWins } = handleWin(firstWinnerId, dealerId, consecutiveWins);

    const actionDescription = `一炮多響: ${loser.name} 被 ${winnerIds.map(id => users.find(u => u.id === id)?.name).join(', ')} 食胡`;

    setUsers(finalUsers);
    setLaCounts(newLaCounts);
    setCurrentWinnerId(firstWinnerId);
    setDealerId(newDealerId);
    setConsecutiveWins(newConsecutiveWins);

    const newHistory = saveStateToHistory(actionDescription, scoreChanges, currentStateForHistory);

    saveGameData({
      users: finalUsers,
      history: newHistory,
      dealerId: newDealerId,
      consecutiveWins: newConsecutiveWins,
      currentWinnerId: firstWinnerId,
      laCounts: newLaCounts,
    });

    setIsMultiHitDialogOpen(false);
  };

  const handleSaveUserNames = (updatedUsers: { id: number; name: string }[]) => {
    const newUsers = users.map((user) => {
      const updatedUser = updatedUsers.find((u) => u.id === user.id);
      return updatedUser ? { ...user, name: updatedUser.name } : user;
    });
    setUsers(newUsers);
    setIsRenameDialogOpen(false);
    saveGameData({ users: newUsers });
  };

  const handleSaveSeatChange = (newUsers: UserData[]) => {
    setUsers(newUsers);
    setIsSeatChangeDialogOpen(false);
    saveGameData({ users: newUsers });
  };

  const handleReset = () => {
    const newUsers = users.map(user => ({...user, winValues: {}}));
    const newHistory: GameState[] = [];
    const newDealerId = users[0]?.id || 1;
    const newConsecutiveWins = 1;
    const newCurrentWinnerId = null;
    const newLaCounts = {};

    setUsers(newUsers);
    setLaCounts(newLaCounts);
    setCurrentWinnerId(newCurrentWinnerId);
    setHistory(newHistory);
    setDealerId(newDealerId);
    setConsecutiveWins(newConsecutiveWins);

    saveGameData({
        users: newUsers,
        history: newHistory,
        dealerId: newDealerId,
        consecutiveWins: newConsecutiveWins,
        currentWinnerId: newCurrentWinnerId,
        laCounts: newLaCounts,
    });
  };

  const handleRestore = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      setUsers(lastState.users);
      setLaCounts(lastState.laCounts);
      setCurrentWinnerId(lastState.currentWinnerId);
      setDealerId(lastState.dealerId);
      setConsecutiveWins(lastState.consecutiveWins);
      setHistory(newHistory);

      saveGameData({
          users: lastState.users,
          history: newHistory,
          dealerId: lastState.dealerId,
          consecutiveWins: lastState.consecutiveWins,
          currentWinnerId: lastState.currentWinnerId,
          laCounts: lastState.laCounts,
      });

    }
  };


  const handleSurrender = (loserId: number) => {
    if (!currentWinnerId) return;
  
    const winner = users.find(u => u.id === currentWinnerId);
    const loser = users.find(u => u.id === loserId);
  
    if (!winner || !loser) return;
  
    const scoreToReset = winner.winValues[loserId] || 0;
    if (scoreToReset === 0) return;
  
    // Capture the state BEFORE any changes for the history log.
    const currentStateForHistory: Omit<GameState, 'action' | 'scoreChanges'> = {
      users: JSON.parse(JSON.stringify(users)),
      laCounts: JSON.parse(JSON.stringify(laCounts)),
      currentWinnerId,
      dealerId,
      consecutiveWins,
    };
  
    const newLaCounts = { ...laCounts };
    if (newLaCounts[currentWinnerId]) {
      newLaCounts[currentWinnerId][loserId] = 0;
    }
    setLaCounts(newLaCounts);
  
    const newUsers = users.map(user => {
      if (user.id === currentWinnerId) {
        const newWinValues = { ...user.winValues };
        newWinValues[loserId] = 0;
        return { ...user, winValues: newWinValues };
      }
      return user;
    });
    setUsers(newUsers);
  
    const actionDescription = `${loser.name} 投降 to ${winner.name}`;
    const newHistory = saveStateToHistory(actionDescription, [], currentStateForHistory);
  
    saveGameData({
      users: newUsers,
      history: newHistory,
      laCounts: newLaCounts,
    });
  
  };

  const totalScores = useMemo(() => {
    const scores: { [key: number]: number } = {};
    users.forEach(u => scores[u.id] = 0);

    history.forEach(state => {
      state.scoreChanges.forEach(change => {
        if (scores[change.userId] !== undefined) {
          scores[change.userId] += change.change;
        }
      });
    });

    return scores;
  }, [history, users]);

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => {
        const isDealer = user.id === dealerId;
        return (
          <TableRow key={user.id} className={cn(isDealer && "bg-primary/10")}>
            <TableCell className="font-semibold text-foreground/90 align-top p-2">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleSetDealer(user.id)} className={cn("flex items-center justify-center font-bold text-sm w-auto px-1 h-6 rounded-md hover:bg-primary/20 whitespace-nowrap", isDealer ? "bg-yellow-400 text-yellow-800" : "bg-gray-200 text-gray-500")}>
                      {isDealer && consecutiveWins > 1 ? `連${consecutiveWins-1}` : ''}莊
                    </button>
                    {isDealer && (
                      <button onClick={handleManualConsecutiveWin} className="flex items-center justify-center font-bold text-sm w-auto px-2 h-6 rounded-md bg-blue-200 text-blue-800 hover:bg-blue-300 whitespace-nowrap">
                        連莊
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Users className="h-4 w-4 text-primary"/>
                    {user.name}
                  </div>
                </div>
                <div className="flex items-stretch gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenWinActionDialog(user)}>
                     食胡
                  </Button>
                </div>
                <div className="font-bold text-lg mt-1">
                    Total: {totalScores[user.id]?.toLocaleString() ?? 0}
                </div>
              </div>
            </TableCell>
            {users.map(opponent => (
                <TableCell key={opponent.id} className="font-semibold text-center text-green-600 text-base transition-all duration-300 p-2">
                    {(user.winValues[opponent.id] || 0).toLocaleString()}
                </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  ), [users, totalScores, dealerId, consecutiveWins, currentWinnerId, laCounts]);

  const tableOpponentHeaders = useMemo(() => {
    return (
        users.map(user => {
            const laCount = currentWinnerId != null && laCounts[currentWinnerId]?.[user.id];
            const canSurrender = laCount >= 3;
            return (
              <TableHead key={user.id} className="text-center w-[120px] p-2">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div>{user.name}</div>
                    {laCount > 0 && (
                        <div className="text-red-500 font-bold">拉{laCount}</div>
                    )}
                    {canSurrender && (
                      <Button variant="destructive" size="sm" className="h-6 px-2" onClick={() => handleSurrender(user.id)}>
                        投降
                      </Button>
                    )}
                  </div>
              </TableHead>
            )
        })
    );
  }, [users, laCounts, currentWinnerId]);

  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-7xl">
        <Tabs value={currentView} onValueChange={(val) => setCurrentView(val as 'game' | 'analytics')} className="w-full">
          <div className="mb-4 flex flex-col gap-4">
            {/* Tab Navigation */}
            <TabsList className="w-full grid w-full grid-cols-2">
              <TabsTrigger value="game" className="font-bold">
                <Users className="mr-2 h-4 w-4" />
                Game Board
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-bold">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <header className="flex items-center justify-between gap-2 rounded-lg border bg-card/60 p-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">常用動作</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>玩家</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> 改名
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSeatChangeDialogOpen(true)}>
                    <Shuffle className="mr-2 h-4 w-4" /> 換位
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>紀錄</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleRestore} disabled={history.length === 0}>
                    <HistoryIcon className="mr-2 h-4 w-4" /> 還原
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" /> 重置
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsHistoryDialogOpen(true)} disabled={history.length === 0}>
                    <List className="mr-2 h-4 w-4" /> 歷史記錄
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPayoutDialogOpen(true)} disabled={history.length === 0}>
                    <DollarSign className="mr-2 h-4 w-4" /> 找數
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>進階</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenSpecialActionDialog()}>
                    <Zap className="mr-2 h-4 w-4" /> 特別賞罰
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>設定</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setPopOnNewWinner(p => !p);
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" /> 籌碼模式
                      </span>
                      <Switch
                        checked={popOnNewWinner}
                        onCheckedChange={() => setPopOnNewWinner(p => !p)}
                        aria-label="切換籌碼模式"
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
          </div>

          {/* Game Board Tab */}
          <TabsContent value="game" className="space-y-4">
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px] p-2">玩家</TableHead>
                        <TableHead colSpan={users.length} className="text-center w-[120px] p-2">番數</TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="p-2"></TableHead>
                        {tableOpponentHeaders}
                      </TableRow>
                    </TableHeader>
                    {memoizedTableBody}
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <ScoreAnalyticsDashboard
              users={users}
              history={history}
              totalScores={totalScores}
              laCounts={laCounts}
              currentWinnerId={currentWinnerId}
            />
          </TabsContent>
        </Tabs>
      </div>

      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        users={users}
        onSave={handleSaveUserNames}
       />
      <SeatChangeDialog
        isOpen={isSeatChangeDialogOpen}
        onClose={() => setIsSeatChangeDialogOpen(false)}
        users={users}
        onSave={handleSaveSeatChange}
      />
      {currentUserForWinAction && (
        <WinActionDialog
          isOpen={isWinActionDialogOpen}
          onClose={() => setIsWinActionDialogOpen(false)}
          mainUser={currentUserForWinAction}
          users={users}
          currentWinnerId={currentWinnerId}
          dealerId={dealerId}
          consecutiveWins={consecutiveWins}
          onSave={handleSaveWinAction}
          onLaunchMultiHit={handleLaunchMultiHitFromWinFlow}
        />
       )}
      <SpecialActionDialog
        isOpen={isSpecialActionDialogOpen}
        onClose={() => setIsSpecialActionDialogOpen(false)}
        mainUser={currentUserForSpecialAction}
        users={users}
        onSave={handleExecuteSpecialAction}
        onSaveZhaHu={handleExecuteZhaHuAction}
      />
      <MultiHitDialog
        isOpen={isMultiHitDialogOpen}
        onClose={() => setIsMultiHitDialogOpen(false)}
        initialLoserId={multiHitInitialLoserId}
        users={users}
        dealerId={dealerId}
        consecutiveWins={consecutiveWins}
        currentWinnerId={currentWinnerId}
        onSave={handleExecuteMultiHitAction}
      />
       <HistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        history={history}
        users={users}
      />
      {scoresToReset && (
        <ResetScoresDialog
            isOpen={isResetScoresDialogOpen}
            onClose={() => setIsResetScoresDialogOpen(false)}
            scoresToReset={scoresToReset}
            users={users}
        />
      )}
       <PayoutDialog
          isOpen={isPayoutDialogOpen}
          onClose={() => setIsPayoutDialogOpen(false)}
          users={users}
          totalScores={totalScores}
       />
    </main>
  );
}
