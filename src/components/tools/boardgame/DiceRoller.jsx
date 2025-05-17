
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices, Plus, Minus
} from "lucide-react";
import backendApi from "@/api/backendService";
import { useToast } from "@/hooks/use-toast";

const DiceRoller = () => {
  const [diceCount, setDiceCount] = useState(2);
  const [diceSides, setDiceSides] = useState(6);
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [rolling, setRolling] = useState(false);
  const { toast } = useToast();

  // Common dice presets
  const dicePresets = [
    { sides: 4, label: "d4" },
    { sides: 6, label: "d6" },
    { sides: 8, label: "d8" },
    { sides: 10, label: "d10" },
    { sides: 12, label: "d12" },
    { sides: 20, label: "d20" },
    { sides: 100, label: "d100" },
  ];

  const handleRoll = async () => {
    if (diceCount <= 0 || diceSides <= 0) {
      toast({
        title: "Invalid dice configuration",
        description: "Number of dice and sides must be positive numbers",
        variant: "destructive"
      });
      return;
    }

    setRolling(true);
    const notation = `${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;

    try {
      // Try to use the backend service if available
      const response = await backendApi.diceRoller.rollDice(notation);
      setResults(response.results);
      setTotal(response.total);
    } catch (error) {
      console.log("Using local dice calculation due to backend error:", error);
      
      // Fallback to local calculation
      const rolls = Array(diceCount).fill(0).map(() => 
        Math.floor(Math.random() * diceSides) + 1
      );
      
      const rollTotal = rolls.reduce((sum, value) => sum + value, 0) + modifier;
      
      setResults(rolls);
      setTotal(rollTotal);
    } finally {
      setRolling(false);
    }
  };

  const getDiceIcon = (value, size = "h-10 w-10") => {
    const icons = {
      1: <Dice1 className={size} />,
      2: <Dice2 className={size} />,
      3: <Dice3 className={size} />,
      4: <Dice4 className={size} />,
      5: <Dice5 className={size} />,
      6: <Dice6 className={size} />
    };

    return icons[value] || <span className={`inline-flex items-center justify-center font-bold ${size}`}>{value}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <Label htmlFor="dice-count">Number of Dice</Label>
            <div className="flex items-center mt-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                disabled={diceCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="dice-count"
                type="number"
                value={diceCount}
                onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
                min="1"
                className="w-16 mx-2 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDiceCount(diceCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="dice-sides">Number of Sides</Label>
            <div className="flex items-center mt-1.5">
              <Input
                id="dice-sides"
                type="number"
                value={diceSides}
                onChange={(e) => setDiceSides(parseInt(e.target.value) || 2)}
                min="2"
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {dicePresets.map((preset) => (
                <Button
                  key={preset.sides}
                  variant={diceSides === preset.sides ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDiceSides(preset.sides)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="modifier">Modifier</Label>
            <div className="flex items-center mt-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setModifier(modifier - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="modifier"
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-16 mx-2 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setModifier(modifier + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleRoll} 
            className="w-full mt-4" 
            disabled={rolling}
            size="lg"
          >
            {rolling ? (
              <>Rolling...</>
            ) : (
              <>
                <Dices className="mr-2 h-5 w-5" />
                Roll {diceCount}d{diceSides}{modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
              </>
            )}
          </Button>
        </div>

        <div className="bg-muted/40 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Results</h3>
          
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Dices className="h-12 w-12 mb-2 opacity-50" />
              <p>Click Roll to begin</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-6 justify-center">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-lg p-2 shadow-sm border"
                  >
                    {diceSides <= 6 ? getDiceIcon(result) : (
                      <div className="h-10 w-10 flex items-center justify-center font-bold text-xl">
                        {result}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-muted-foreground mb-1 text-sm">Total</div>
                <div className="text-3xl font-bold">{total}</div>
                {modifier !== 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    ({results.reduce((a, b) => a + b, 0)} {modifier > 0 ? "+" : ""}{modifier})
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;
