
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer as TimerIcon, Pause, Play, SkipForward, RotateCcw, Users } from "lucide-react";

const Timer = () => {
  const [playerCount, setPlayerCount] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  
  const intervalRef = useRef(null);

  // Initialize players when game starts
  const startGame = () => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      totalTime: 0,
      turns: 0,
      isActive: i === 0
    }));
    setPlayers(newPlayers);
    setGameStarted(true);
    setCurrentPlayer(0);
    setCurrentTime(0);
    setCurrentRound(1);
    setIsRunning(true);
    setIsPaused(false);
  };

  // Reset everything
  const resetGame = () => {
    setGameStarted(false);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPlayer(0);
    setCurrentTime(0);
    setCurrentRound(1);
    setPlayers([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Toggle pause/resume
  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    setIsRunning(!newPausedState);
  };

  // Switch to specific player (for clickable player boxes)
  const switchToPlayer = (playerId) => {
    if (isPaused || playerId === currentPlayer) return;
    
    // Add current time to current player's total and increment their turns
    setPlayers(prev => prev.map(player => {
      if (player.id === currentPlayer) {
        return { 
          ...player, 
          totalTime: player.totalTime + currentTime, 
          turns: player.turns + 1,
          isActive: false 
        };
      } else if (player.id === playerId) {
        return { ...player, isActive: true };
      } else {
        return { ...player, isActive: false };
      }
    }));
    
    setCurrentPlayer(playerId);
    setCurrentTime(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  // Move to next player (sequential)
  const nextPlayer = () => {
    const nextPlayerId = (currentPlayer + 1) % playerCount;
    
    // Add current time to current player's total and increment their turns
    setPlayers(prev => prev.map(player => {
      if (player.id === currentPlayer) {
        return { 
          ...player, 
          totalTime: player.totalTime + currentTime, 
          turns: player.turns + 1,
          isActive: false 
        };
      } else if (player.id === nextPlayerId) {
        return { ...player, isActive: true };
      } else {
        return { ...player, isActive: false };
      }
    }));
    
    // Check if we completed a round (back to player 0)
    if (nextPlayerId === 0 && currentPlayer === playerCount - 1) {
      setCurrentRound(prev => prev + 1);
    }
    
    setCurrentPlayer(nextPlayerId);
    setCurrentTime(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
            <TimerIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Multi-Player Timer</h2>
          <p className="text-muted-foreground">
            Track thinking time for each player like a chess clock
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Setup Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="players">Number of Players</Label>
              <Input
                id="players"
                type="number"
                min="2"
                max="8"
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                className="text-center"
              />
              <p className="text-sm text-muted-foreground">
                Choose between 2-8 players
              </p>
            </div>

            <Button onClick={startGame} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="text-center">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Round {currentRound}
        </Badge>
      </div>

      {/* Current Player Display */}
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {players[currentPlayer]?.name}
          </CardTitle>
          <p className="text-muted-foreground">Current Player</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Large Timer Display */}
          <div className="text-6xl font-mono font-bold text-primary">
            {formatTime(currentTime)}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={togglePause}
              disabled={!isRunning && !isPaused}
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </Button>

            <Button 
              size="lg"
              onClick={nextPlayer}
              disabled={isPaused}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <SkipForward className="h-5 w-5 mr-2" />
              Next Player
            </Button>

            <Button 
              variant="destructive" 
              size="lg"
              onClick={resetGame}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          {isPaused && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              PAUSED
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Player Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any player to switch to them
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Card 
                key={player.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  player.isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                } ${isPaused ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => switchToPlayer(player.id)}
              >
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">{player.name}</h3>
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(player.totalTime + (player.isActive ? currentTime : 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.turns} turn{player.turns !== 1 ? 's' : ''}
                    </div>
                    {player.isActive && (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timer;
