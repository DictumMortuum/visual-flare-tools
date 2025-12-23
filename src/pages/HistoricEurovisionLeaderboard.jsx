import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Sparkles, Star, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import data_2025 from './2025.json';

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

// Floating particles component for highlighted cards
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-yellow-400"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: '100%',
          opacity: 0,
          scale: 0 
        }}
        animate={{ 
          y: '-20%',
          opacity: [0, 1, 0],
          scale: [0, 1, 0.5],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// Shimmer effect for highlighted cards
const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
    animate={{
      x: ['-200%', '200%'],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatDelay: 1,
      ease: 'easeInOut',
    }}
  />
);

const LeaderboardCard = ({ game, rank, totalPoints, isHighlighted, hasHighlightedEmail }) => {
  const styles = getRankStyles(rank);
  const IconComponent = styles.icon;
  const isGreyedOut = hasHighlightedEmail && !isHighlighted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: isGreyedOut ? 0.2 : 1, 
        scale: isHighlighted ? 1 : (isGreyedOut ? 0.95 : 1), 
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      style={{
        filter: isGreyedOut ? 'grayscale(100%) brightness(0.4)' : 'none',
      }}
      className={`
        relative overflow-hidden rounded-lg border 
        ${isHighlighted 
          ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] z-20' 
          : isGreyedOut 
            ? 'border-border/20' 
            : `${styles.border} ${styles.glow}`
        }
        ${isHighlighted ? 'bg-gradient-to-br from-yellow-900/60 via-amber-900/50 to-orange-900/60' : 'bg-card/80'} 
        backdrop-blur-sm
        ${isHighlighted ? 'ring-2 ring-yellow-400/60' : ''}
      `}
    >
      {/* Highlight effects */}
      {isHighlighted && (
        <>
          <FloatingParticles />
          <ShimmerEffect />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-orange-500/30"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-40 blur-2xl"
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      {/* Background gradient overlay for top 3 - HIDDEN during highlight mode */}
      {rank <= 3 && !hasHighlightedEmail && (
        <div className={`absolute inset-0 ${styles.bg} opacity-10`} />
      )}
      
      <div className="relative flex items-center gap-3 p-3">
        {/* Rank Badge - no gold/silver/bronze styling during highlight mode unless highlighted */}
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-lg font-bold text-sm
          ${isHighlighted 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
            : hasHighlightedEmail 
              ? 'bg-muted text-foreground' 
              : rank <= 3 
                ? `${styles.bg} text-white` 
                : 'bg-muted text-foreground'
          }
          shadow-lg flex-shrink-0
        `}>
          {IconComponent && !isHighlighted && !hasHighlightedEmail ? (
            <IconComponent className="w-4 h-4 text-white" />
          ) : (
            <span className={isHighlighted ? 'text-base font-black' : ''}>{rank}</span>
          )}
        </div>

        {/* Game Image */}
        <div className="relative flex-shrink-0">
          <motion.img
            src={game.flag || '/placeholder.svg'}
            alt={game.name || 'Game'}
            className={`w-10 h-10 object-cover rounded-md shadow-md border ${isHighlighted ? 'border-yellow-400/50' : 'border-border'}`}
            animate={isHighlighted ? { 
              scale: [1, 1.08, 1],
              boxShadow: ['0 0 0 rgba(250,204,21,0)', '0 0 30px rgba(250,204,21,0.6)', '0 0 0 rgba(250,204,21,0)']
            } : {}}
            transition={{ duration: 1.5, repeat: isHighlighted ? Infinity : 0 }}
          />
          {/* Hide rank badge overlay during highlight mode */}
          {rank <= 3 && !hasHighlightedEmail && (
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${styles.bg} flex items-center justify-center shadow-md`}>
              <span className="text-[8px] font-bold text-white">{rank}</span>
            </div>
          )}
          {isHighlighted && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)]" />
            </motion.div>
          )}
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold truncate ${isHighlighted ? 'text-white text-sm drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-xs text-foreground'}`}>
            {game.name || 'Unknown Game'}
          </h4>
          <div className={`text-xs truncate ${isHighlighted ? 'text-white bg-yellow-500/40 px-1 py-0.5 rounded inline-block' : 'text-muted-foreground'}`}>
            {game.email.map(d => {
              const e = d.split("@");
              return e[0];
            }).join(", ")}
          </div>
        </div>

        {/* Points */}
        <div className={`
          flex flex-col items-center justify-center px-2 py-1 rounded-md
          ${isHighlighted 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
            : hasHighlightedEmail 
              ? 'bg-muted text-foreground' 
              : rank <= 3 
                ? `${styles.bg} text-white` 
                : 'bg-primary/10 text-primary'
          }
          flex-shrink-0
        `}>
          <span className={`font-black ${isHighlighted ? 'text-lg' : 'text-base'}`}>{totalPoints}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-80">pts</span>
        </div>
      </div>
    </motion.div>
  );
};

// Winner Card for Winners Mode
const WinnerCard = ({ game, rank }) => {
  const styles = getRankStyles(rank);
  const IconComponent = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        delay: rank * 0.3 
      }}
      className="relative w-full max-w-[280px]"
    >
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full ${
              i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-amber-500' : 'bg-orange-400'
            }`}
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ 
              x: Math.cos(i * 30 * Math.PI / 180) * (80 + Math.random() * 40),
              y: Math.sin(i * 30 * Math.PI / 180) * (80 + Math.random() * 40),
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1 + rank * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <motion.div
        className={`
          relative p-5 rounded-2xl border-4 ${styles.border} ${styles.bg}
          shadow-2xl overflow-hidden h-[280px] flex flex-col
        `}
        animate={{
          boxShadow: [
            '0 0 30px rgba(250,204,21,0.3)',
            '0 0 60px rgba(250,204,21,0.5)',
            '0 0 30px rgba(250,204,21,0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ShimmerEffect />
        
        {/* Crown/Medal for rank */}
        <motion.div 
          className="absolute -top-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {IconComponent && (
            <IconComponent className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          )}
        </motion.div>

        <div className="text-center pt-4 flex-1 flex flex-col justify-center">
          <motion.img
            src={game.flag || '/placeholder.svg'}
            alt={game.name || 'Game'}
            className="w-24 h-24 object-cover rounded-xl mx-auto shadow-2xl border-4 border-white/50"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.h3 
            className="text-base font-black text-white mt-3 drop-shadow-lg line-clamp-2 px-2"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {game.name}
          </motion.h3>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="w-4 h-4 text-white" />
            <span className="text-2xl font-black text-white">{game.votes}</span>
            <span className="text-xs text-white/80">pts</span>
          </div>
          
          <div className="text-white/70 text-xs mt-1 truncate px-2">
            {game.email?.map(d => d.split("@")[0]).join(", ")}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CategoryColumn = ({ title, games, icon: Icon, highlightedEmail, isWinnersMode }) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Category Header */}
      <motion.div 
        className="flex items-center justify-center gap-2 mb-2 pb-2 border-b border-primary/30 flex-shrink-0"
        animate={isWinnersMode ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={`p-1.5 rounded-md ${isWinnersMode ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-primary/20'}`}>
          <Icon className={`w-4 h-4 ${isWinnersMode ? 'text-white' : 'text-primary'}`} />
        </div>
        <h2 className={`text-base font-bold tracking-tight ${isWinnersMode ? 'text-yellow-400' : ''}`}>{title}</h2>
        {isWinnersMode && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <PartyPopper className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Games List */}
      <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
        {isWinnersMode ? (
          // Winners Mode: Show top 3 as large celebration cards
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {games.slice(0, 3).map((game, index) => (
              <WinnerCard
                key={game.boardgame_id}
                game={game}
                rank={index + 1}
                categoryTitle={title}
              />
            ))}
          </div>
        ) : (
          // Normal/Highlight Mode
          <AnimatePresence mode="popLayout">
            {games.map((game, index) => {
              const isHighlighted = highlightedEmail && game.email?.includes(highlightedEmail);
              return (
                <LeaderboardCard
                  key={game.boardgame_id}
                  game={game}
                  rank={index + 1}
                  totalPoints={game.votes}
                  isHighlighted={isHighlighted}
                  isWinnersMode={false}
                  hasHighlightedEmail={!!highlightedEmail}
                />
              );
            })}
          </AnimatePresence>
        )}
        
        {games.length === 0 && !isWinnersMode && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No votes yet
          </div>
        )}
      </div>
    </div>
  );
};

// Presenter Banner Component
const PresenterBanner = ({ email }) => {
  if (!email) return null;
  
  const username = email.split("@")[0];
  
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 p-4 shadow-2xl">
        <motion.div 
          className="flex items-center justify-center gap-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
          <div className="text-center">
            <p className="text-white/80 text-sm uppercase tracking-widest">Now Presenting</p>
            <h1 className="text-3xl font-black text-white drop-shadow-lg">{username}</h1>
          </div>
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </motion.div>
      </div>
      <div className="h-2 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
    </motion.div>
  );
};

// Winners Celebration Overlay
const WinnersCelebration = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
    {/* Confetti */}
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-3 h-3 ${
          ['bg-yellow-400', 'bg-amber-500', 'bg-orange-400', 'bg-red-400', 'bg-pink-400'][i % 5]
        }`}
        style={{
          left: `${Math.random() * 100}%`,
          top: -20,
          borderRadius: Math.random() > 0.5 ? '50%' : '0',
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
        animate={{
          y: ['0vh', '120vh'],
          x: [0, (Math.random() - 0.5) * 200],
          rotate: [0, 720],
          opacity: [1, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear',
        }}
      />
    ))}
    
    {/* Spotlight effect */}
    <motion.div
      className="absolute inset-0 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </div>
);

const EurovisionLeaderboard = () => {
  const data = data_2025;

  const [scores, setScores] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: [],
  });
  const [highlightedEmail] = useState(null);
  const [isWinnersMode] = useState(true);

  const sortFn = (a, b) => {
    const votes = b.votes - a.votes;
    const id = b.boardgame_id - a.boardgame_id;

    if (votes === 0) {
      return id;
    } else {
      return votes;
    }
  };

  useEffect(() => {
    if (data) {
      const sortedData = {
        partyGame: [...(data.partyGame || [])].sort(sortFn),
        midWeight: [...(data.midWeight || [])].sort(sortFn),
        heavyWeight: [...(data.heavyWeight || [])].sort(sortFn),
      };
      setScores(sortedData);
    }
  }, [data]);

  const categories = [
    { key: 'partyGame', title: 'Party Game', icon: Trophy },
    { key: 'midWeight', title: 'Mid Weight', icon: Medal },
    { key: 'heavyWeight', title: 'Heavy Weight', icon: Crown },
  ];

  return (
    <div className={`h-screen w-screen overflow-auto pl-10 pr-10 pt-4 transition-colors duration-1000 ${
      isWinnersMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900' 
        : 'bg-gradient-to-br from-background via-background to-muted/30'
    }`}>
      {/* Winners celebration overlay */}
      <AnimatePresence>
        {isWinnersMode && <WinnersCelebration />}
      </AnimatePresence>

      {/* Presenter banner */}
      <AnimatePresence>
        {highlightedEmail && <PresenterBanner email={highlightedEmail} />}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className={`absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
            isWinnersMode ? 'bg-yellow-500/20' : 'bg-primary/10'
          }`}
          animate={isWinnersMode ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className={`absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
            isWinnersMode ? 'bg-amber-500/20' : 'bg-primary/10'
          }`}
          animate={isWinnersMode ? { scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
            isWinnersMode ? 'bg-orange-500/10' : 'bg-primary/5'
          }`}
          animate={isWinnersMode ? { rotate: [0, 360] } : {}}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className={`relative min-h-full flex flex-col w-full ${highlightedEmail ? 'pt-10' : ''}`}>
        {/* Winners Mode Header */}
        <AnimatePresence>
          {isWinnersMode && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center mb-6"
            >
              <motion.h1 
                className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl"
                animate={{ scale: [1, 1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆 THE WINNERS 🏆
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Three Columns */}
        <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
          {categories.map(({ key, title, icon }) => (
            <CategoryColumn
              key={key}
              title={title}
              games={scores[key] || []}
              icon={icon}
              highlightedEmail={highlightedEmail}
              isWinnersMode={isWinnersMode}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-2 flex-shrink-0">
          <p className={`text-xs ${isWinnersMode ? 'text-yellow-400/60' : 'text-muted-foreground'}`}>
            {isWinnersMode ? 'Congratulations to all winners!' : 'Updates automatically every 5 seconds'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EurovisionLeaderboard;
