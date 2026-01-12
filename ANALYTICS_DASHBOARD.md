# Score Analytics Dashboard - Feature Overview

## 🎯 Overview
A comprehensive competitive analytics dashboard has been built for tracking mahjong game performance. The dashboard features bold typography, professional visualizations, and auto-calculated statistics designed specifically for competitive players.

## 📊 Key Features

### 1. **Leaderboard Section**
- Real-time ranking display with visual hierarchy
- Player ranking badges with color coding
- Total score prominently displayed (3xl font-black)
- Win count and win percentage metrics
- Hover effects for interactivity

### 2. **Score Trajectory Chart**
- Line chart showing cumulative score progression over all rounds
- Multi-player tracking with distinct colors
- Smooth interpolation between data points
- Interactive tooltips with formatted values
- Clear axis labels with bold typography

### 3. **Win Distribution Analysis**
- Pie chart showing wins per player
- Color-coded segments matching leaderboard
- Shows total win count for each player
- Quick visual comparison of competitive performance

### 4. **Average Score per Round**
- Bar chart displaying average score per player
- Helps identify consistent performers
- Formatted tooltips for exact values
- Rounded corners for modern aesthetic

### 5. **Performance Metrics**
- **Total Score**: Cumulative points across all games
- **Average Score**: Mean score per round (consistency indicator)
- **Best Round**: Highest individual round score (↑ indicator)
- **Worst Round**: Lowest individual round score (↓ indicator)
- **Consistency**: Standard deviation (lower = more consistent)
- **Rounds Played**: Total rounds participated

### 6. **Recent Games Timeline**
- Chronological list of recent games (newest first)
- Round number badges
- Action descriptions (摸, 食胡, etc.)
- Color-coded score changes (green for gains, red for losses)
- Scrollable container for extensive game history

## 🎨 Design Features for Competitive Players

### Typography
- **Bold, High-Contrast**: Uses font-black and uppercase for key metrics
- **Visual Hierarchy**: Larger text for important stats (Total Score: 3xl font-black)
- **Tracking**: Wide letter spacing on labels (uppercase tracking-widest)

### Color Scheme
- **Distinct Player Colors**: 8-color palette for unique identification
- **Semantic Colors**: Green for gains, red for losses
- **Accent Colors**: Blue (score), Yellow (trophy), Purple (metrics), etc.

### Responsive Design
- **Mobile**: Single column grid on small screens
- **Tablet**: 2 column layout on medium screens
- **Desktop**: 4 column layout with full visualizations
- **Scrollable**: Charts and timeline adapt to container

### Cards & Sections
- Shadow effects for depth
- Border colors matching player assignments
- Gradient backgrounds for visual interest
- Hover effects for interactivity

## 🔧 Technical Implementation

### Components Created
1. **ScoreAnalyticsDashboard.tsx** - Main analytics component
   - Calculates all statistics
   - Renders all charts and metrics
   - Manages responsive layouts

2. **Types.ts** - Shared type definitions
   - UserData interface
   - LaCounts interface
   - GameState interface
   - ScoreChange interface

### Integration
- Added new "Analytics" tab to main page alongside "Game Board"
- Tab navigation with icons
- Seamless switching between game view and analytics
- All game data automatically synced to analytics

### Libraries Used
- **Recharts**: For charts (LineChart, BarChart, PieChart)
- **Lucide React**: For icons (Trophy, TrendingUp, Target, Zap, etc.)
- **Radix UI**: For components (Tabs, Card, etc.)
- **Tailwind CSS**: For styling and responsive design

## 📈 Auto-Calculated Stats

All statistics are automatically calculated from game history:

```
- Total Score: Sum of all score changes
- Average Score: Total Score / Rounds Played
- Best/Worst Round: Max/Min individual changes
- Consistency: Standard deviation of rounds
- Win Percentage: (Wins / Total Rounds) × 100
- Win Distribution: Count of positive score changes per player
```

## 🎮 Usage

1. **Game Board Tab**: Traditional score tracking interface
2. **Analytics Tab**: View comprehensive performance statistics
3. **Switch Between Tabs**: Use the tab navigation to compare real-time scores with analytics
4. **Track Over Time**: Analytics update automatically as you log games

## 🏆 Competitive Features

✅ Leaderboard ranking system  
✅ Win percentage tracking  
✅ Consistency scoring (volatility analysis)  
✅ Round-by-round performance graph  
✅ Historical game review  
✅ Visual performance trends  
✅ Multi-player comparison  
✅ Real-time statistics updates  

---

**Design Philosophy**: Clean, bold, data-driven interface optimized for competitive players who value rapid performance assessment and detailed statistics.
