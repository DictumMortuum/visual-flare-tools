
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UserPlus, ChevronRight, RotateCw, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TurnTracker = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", color: "#3B82F6" },
    { id: 2, name: "Player 2", color: "#EF4444" },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState("");
  
  const playerColors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
  ];
  
  const addPlayer = () => {
    if (players.length >= 8) {
      toast({
        title: "Maximum players reached",
        description: "You can have up to 8 players",
      });
      return;
    }
    
    if (!newPlayerName.trim()) {
      toast({
        title: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }
    
    const nextColor = playerColors[players.length % playerColors.length];
    const newPlayer = {
      id: Date.now(),
      name: newPlayerName.trim(),
      color: nextColor,
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
  };
  
  const removePlayer = (id) => {
    if (players.length <= 1) {
      toast({
        title: "Cannot remove player",
        description: "You need at least one player",
        variant: "destructive",
      });
      return;
    }
    
    const newPlayers = players.filter(player => player.id !== id);
    setPlayers(newPlayers);
    
    // Adjust currentPlayerIndex if necessary
    if (currentPlayerIndex >= newPlayers.length) {
      setCurrentPlayerIndex(0);
    }
  };
  
  const nextTurn = () => {
    if (players.length === 0) return;
    
    const newIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(newIndex);
    
    // Increment round when we loop back to the first player
    if (newIndex === 0) {
      setRound(round + 1);
    }
  };
  
  const resetGame = () => {
    setCurrentPlayerIndex(0);
    setRound(1);
    toast({
      title: "Game reset",
      description: "Round and turn counter have been reset",
    });
  };
  
  const currentPlayer = players[currentPlayerIndex] || { name: "No players", color: "#888" };
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/40 rounded-lg p-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">Round</div>
        <div className="text-4xl font-bold mb-6">{round}</div>
        
        <div className="text-sm text-muted-foreground mb-2">Current Turn</div>
        <div 
          className="text-3xl font-bold mb-4" 
          style={{ color: currentPlayer.color }}
        >
          {currentPlayer.name}
        </div>
        
        <Button size="lg" onClick={nextTurn} className="w-full sm:w-auto">
          <ChevronRight className="mr-2 h-4 w-4" />
          Next Turn
        </Button>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Players</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {players.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                index === currentPlayerIndex ? 'bg-background border-primary' : 'bg-muted/40'
              }`}
              style={{ borderLeft: `4px solid ${player.color}` }}
            >
              <span>{player.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full hover:bg-muted"
                onClick={() => removePlayer(player.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Add player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
            />
          </div>
          <Button variant="outline" onClick={addPlayer}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Button variant="outline" onClick={resetGame}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TurnTracker;
