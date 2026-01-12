'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Target, Zap, Award, History } from 'lucide-react';
import type { UserData, LaCounts } from './types';

interface ScoreChange {
  userId: number;
  change: number;
}

interface GameState {
  users: UserData[];
  laCounts: LaCounts;
  currentWinnerId: number | null;
  dealerId: number;
  consecutiveWins: number;
  action: string;
  scoreChanges: ScoreChange[];
}

interface ScoreAnalyticsDashboardProps {
  users: UserData[];
  history: GameState[];
  totalScores: { [key: number]: number };
  laCounts: LaCounts;
  currentWinnerId: number | null;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function ScoreAnalyticsDashboard({
  users,
  history,
  totalScores,
  laCounts,
  currentWinnerId,
}: ScoreAnalyticsDashboardProps) {
  // Calculate cumulative scores over time for the line chart
  const scoreHistory = useMemo(() => {
    const cumulativeScores: { [key: number]: number } = {};
    users.forEach(u => cumulativeScores[u.id] = 0);

    return history.map((state, index) => {
      const dataPoint: any = { round: index + 1 };
      state.scoreChanges.forEach(change => {
        cumulativeScores[change.userId] += change.change;
        const user = users.find(u => u.id === change.userId);
        if (user) {
          dataPoint[user.name] = cumulativeScores[change.userId];
        }
      });
      return dataPoint;
    });
  }, [history, users]);

  // Calculate win distribution
  const winDistribution = useMemo(() => {
    const wins: { [key: number]: number } = {};
    users.forEach(u => wins[u.id] = 0);

    history.forEach(state => {
      state.scoreChanges.forEach(change => {
        if (change.change > 0) {
          wins[change.userId]++;
        }
      });
    });

    return users.map(user => ({
      name: user.name,
      wins: wins[user.id],
    })).filter(d => d.wins > 0);
  }, [history, users]);

  // Calculate player statistics
  const playerStats = useMemo(() => {
    const stats: {
      [key: number]: {
        name: string;
        totalWins: number;
        totalScore: number;
        avgScore: number;
        maxRound: number;
        minRound: number;
        consistency: number;
        winPercentage: number;
        rounds: number[];
      };
    } = {};

    users.forEach(u => {
      stats[u.id] = {
        name: u.name,
        totalWins: 0,
        totalScore: totalScores[u.id] || 0,
        avgScore: 0,
        maxRound: 0,
        minRound: 0,
        consistency: 0,
        winPercentage: 0,
        rounds: [],
      };
    });

    let totalRounds = 0;
    let userRoundCount: { [key: number]: number } = {};
    users.forEach(u => userRoundCount[u.id] = 0);

    history.forEach(state => {
      totalRounds++;
      state.scoreChanges.forEach(change => {
        stats[change.userId].rounds.push(change.change);
        userRoundCount[change.userId]++;
        if (change.change > 0) {
          stats[change.userId].totalWins++;
        }
      });
    });

    Object.entries(stats).forEach(([userId, stat]) => {
      const id = parseInt(userId);
      if (stat.rounds.length > 0) {
        stat.avgScore = Math.round(stat.totalScore / stat.rounds.length);
        stat.maxRound = Math.max(...stat.rounds);
        stat.minRound = Math.min(...stat.rounds);
        stat.winPercentage = Math.round((stat.totalWins / totalRounds) * 100);
        
        // Calculate consistency (lower std dev = more consistent)
        const mean = stat.avgScore;
        const variance = stat.rounds.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / stat.rounds.length;
        stat.consistency = Math.round(Math.sqrt(variance));
      }
    });

    return stats;
  }, [users, history, totalScores]);

  // Rank players by total score
  const rankedPlayers = useMemo(() => {
    return users
      .map(u => ({
        id: u.id,
        name: u.name,
        score: totalScores[u.id] || 0,
        stats: playerStats[u.id],
      }))
      .sort((a, b) => b.score - a.score);
  }, [users, totalScores, playerStats]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return winDistribution.map((d, idx) => ({
      ...d,
      value: d.wins,
    }));
  }, [winDistribution]);

  return (
    <div className="w-full space-y-6">
      {/* Leaderboard Cards - Enhanced for Competitive Players */}
      <div>
        <h2 className="text-2xl font-black mb-4 tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          LEADERBOARD
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankedPlayers.map((player, index) => (
            <Card key={player.id} className="border-l-4 relative overflow-hidden hover:shadow-lg transition-shadow" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-foreground/5 to-transparent rounded-bl-lg"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm" style={{ backgroundColor: COLORS[index % COLORS.length], color: '#fff' }}>
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black">{player.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-black text-primary">{player.score.toLocaleString()}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Score</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                  <div>
                    <div className="font-black text-lg text-foreground">{player.stats.totalWins}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">Wins</div>
                  </div>
                  <div>
                    <div className="font-black text-lg text-foreground">{player.stats.winPercentage}%</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">Win %</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Score Trend Chart */}
      {scoreHistory.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl font-black uppercase tracking-tight">Score Trajectory</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Track cumulative performance across all rounds</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
                <XAxis 
                  dataKey="round" 
                  label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }}
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <YAxis 
                  label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Tooltip 
                  formatter={(value) => value?.toLocaleString()} 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontWeight: 'bold' }} />
                {users.map((user, idx) => (
                  <Line
                    key={user.id}
                    type="monotone"
                    dataKey={user.name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={3}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Win Distribution & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Distribution Chart */}
        {pieData.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-xl font-black uppercase tracking-tight">Win Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} wins`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Average Score by Player */}
        {winDistribution.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-green-500" />
                <CardTitle className="text-xl font-black uppercase tracking-tight">Avg Score/Round</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={users.map(u => ({
                  name: u.name,
                  avg: playerStats[u.id]?.avgScore || 0,
                }))} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
                  <XAxis dataKey="name" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <YAxis style={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Tooltip formatter={(value) => value?.toLocaleString()} labelStyle={{ fontWeight: 'bold' }} />
                  <Bar dataKey="avg" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Player Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-xl font-black uppercase tracking-tight">Performance Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rankedPlayers.map((player) => {
              const stats = player.stats;
              return (
                <div key={player.id} className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-card to-muted/30 hover:shadow-md transition-shadow">
                  <h3 className="font-black text-base uppercase">{player.name}</h3>
                  <div className="space-y-2 text-sm divide-y">
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground font-bold">Total:</span>
                      <span className="font-black text-primary">{stats.totalScore}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground font-bold">Avg:</span>
                      <span className="font-black">{stats.avgScore}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground font-bold">Best:</span>
                      <span className="font-black text-green-600">↑{stats.maxRound}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground font-bold">Worst:</span>
                      <span className="font-black text-red-600">↓{stats.minRound}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground font-bold">Consistency:</span>
                      <span className="font-black text-blue-600">{stats.consistency}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground font-bold">Rounds:</span>
                      <span className="font-black">{stats.rounds.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Games Timeline */}
      {history.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-xl font-black uppercase tracking-tight">Recent Games</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{history.length} round{history.length !== 1 ? 's' : ''} played</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.slice().reverse().map((game, index) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary hover:shadow-md transition-shadow">
                  <div className="text-sm font-black text-muted-foreground min-w-fit bg-primary/10 px-3 py-1 rounded">
                    Round {history.length - index}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-black text-foreground">{game.action}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {game.scoreChanges.map((change) => {
                        const user = users.find(u => u.id === change.userId);
                        const sign = change.change >= 0 ? '+' : '';
                        const color = change.change >= 0 ? 'text-green-600' : 'text-red-600';
                        return (
                          <div key={change.userId} className={`${color} font-black`}>
                            {user?.name}: {sign}{change.change}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
