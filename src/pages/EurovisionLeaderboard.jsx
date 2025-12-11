import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const getEurovisionPoints = (position) => {
  const pointsMap = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  return position <= 10 ? pointsMap[position - 1] : 0;
};

const getRankStyles = (rank) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600',
        border: 'border-yellow-400/50',
        glow: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]',
        icon: Crown,
        iconColor: 'text-yellow-900',
      };
    case 2:
      return {
        bg: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
        border: 'border-slate-300/50',
        glow: 'shadow-[0_0_25px_rgba(148,163,184,0.4)]',
        icon: Medal,
        iconColor: 'text-slate-700',
      };
    case 3:
      return {
        bg: 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800',
        border: 'border-amber-600/50',
        glow: 'shadow-[0_0_20px_rgba(217,119,6,0.4)]',
        icon: Award,
        iconColor: 'text-amber-100',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-primary/20 to-primary/10',
        border: 'border-primary/20',
        glow: '',
        icon: null,
        iconColor: '',
      };
  }
};

const LeaderboardCard = ({ game, rank, totalPoints }) => {
  const styles = getRankStyles(rank);
  const IconComponent = styles.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      className={`
        relative overflow-hidden rounded-xl border-2 ${styles.border} ${styles.glow}
        bg-card/80 backdrop-blur-sm
        ${rank <= 3 ? 'scale-100' : 'scale-95 opacity-90'}
      `}
    >
      {/* Background gradient overlay for top 3 */}
      {rank <= 3 && (
        <div className={`absolute inset-0 ${styles.bg} opacity-10`} />
      )}
      
      <div className="relative flex items-center gap-3 p-3">
        {/* Rank Badge */}
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg
          ${rank <= 3 ? styles.bg : 'bg-muted'} 
          ${rank <= 3 ? 'text-white' : 'text-foreground'}
          shadow-lg flex-shrink-0
        `}>
          {IconComponent ? (
            <IconComponent className={`w-6 h-6 ${rank <= 3 ? 'text-white' : ''}`} />
          ) : (
            rank
          )}
        </div>

        {/* Game Image */}
        <div className="relative flex-shrink-0">
          <img
            src={game.boardgame?.square200 || '/placeholder.svg'}
            alt={game.boardgame?.name || 'Game'}
            className="w-14 h-14 object-cover rounded-lg shadow-md border-2 border-border"
          />
          {rank <= 3 && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${styles.bg} flex items-center justify-center shadow-md`}>
              <span className="text-[10px] font-bold text-white">{rank}</span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold truncate ${rank <= 3 ? 'text-base' : 'text-sm'}`}>
            {game.boardgame?.name || 'Unknown Game'}
          </h4>
          {game.boardgame?.year && (
            <span className="text-xs text-muted-foreground">{game.boardgame.year}</span>
          )}
          <div className="text-xs text-muted-foreground mt-0.5">
            {game.emails?.length || 1} nomination{(game.emails?.length || 1) > 1 ? 's' : ''}
          </div>
        </div>

        {/* Points */}
        <div className={`
          flex flex-col items-center justify-center px-3 py-1.5 rounded-lg
          ${rank <= 3 ? styles.bg : 'bg-primary/10'}
          ${rank <= 3 ? 'text-white' : 'text-primary'}
          flex-shrink-0
        `}>
          <span className="text-xl font-black">{totalPoints}</span>
          <span className="text-[10px] uppercase tracking-wider opacity-80">pts</span>
        </div>
      </div>
    </motion.div>
  );
};

const CategoryColumn = ({ title, games, icon: Icon }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Category Header */}
      <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b-2 border-primary/30">
        <div className="p-2 rounded-lg bg-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>

      {/* Games List */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {games.map((game, index) => (
            <LeaderboardCard
              key={game.boardgame_id}
              game={game}
              rank={index + 1}
              totalPoints={game.totalPoints}
            />
          ))}
        </AnimatePresence>
        
        {games.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No votes yet
          </div>
        )}
      </div>
    </div>
  );
};

const EurovisionLeaderboard = () => {
  const [scores, setScores] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: [],
  });

  // Fetch scores with polling
  const { data, isLoading, error } = useQuery({
    queryKey: ['eurovision-scores'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionscores`
      );
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (data) {
      // Sort by totalPoints descending
      const sortedData = {
        partyGame: [...(data.partyGame || [])].sort((a, b) => b.totalPoints - a.totalPoints),
        midWeight: [...(data.midWeight || [])].sort((a, b) => b.totalPoints - a.totalPoints),
        heavyWeight: [...(data.heavyWeight || [])].sort((a, b) => b.totalPoints - a.totalPoints),
      };
      setScores(sortedData);
    }
  }, [data]);

  const categories = [
    { key: 'partyGame', title: 'Party Game', icon: Trophy },
    { key: 'midWeight', title: 'Mid Weight', icon: Medal },
    { key: 'heavyWeight', title: 'Heavy Weight', icon: Crown },
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-lg text-muted-foreground">Loading scores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Failed to load scores</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 mb-3">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-wide">EUROVISION BOARDGAME</span>
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            LIVE LEADERBOARD
          </h1>
        </div>

        {/* Three Columns */}
        <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
          {categories.map(({ key, title, icon }) => (
            <CategoryColumn
              key={key}
              title={title}
              games={scores[key] || []}
              icon={icon}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            Updates automatically every 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default EurovisionLeaderboard;
