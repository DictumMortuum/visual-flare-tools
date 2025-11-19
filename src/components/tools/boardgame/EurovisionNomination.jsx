import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EurovisionNomination = () => {
  const { toast } = useToast();
  const [nominations, setNominations] = useState({
    partyGame: '',
    midWeight: '',
    heavyWeight: ''
  });

  const handleInputChange = (category, value) => {
    setNominations(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const filledNominations = Object.entries(nominations)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => {
        const categoryNames = {
          partyGame: 'Party Game',
          midWeight: 'Mid Weight',
          heavyWeight: 'Heavy Weight'
        };
        return `${categoryNames[key]}: ${value}`;
      });

    if (filledNominations.length === 0) {
      toast({
        title: "No nominations",
        description: "Please nominate at least one game.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Nominations submitted!",
      description: `You nominated: ${filledNominations.join(', ')}`,
    });

    // TODO: Send nominations to backend
    console.log('Nominations:', nominations);
  };

  const handleReset = () => {
    setNominations({
      partyGame: '',
      midWeight: '',
      heavyWeight: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Eurovision Boardgame Competition</h2>
          <p className="text-muted-foreground">Nominate your favorite games in each category (optional)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Party Game</CardTitle>
            <CardDescription>
              Nominate a light, fun game perfect for parties and social gatherings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="partyGame">Game Name</Label>
              <Input
                id="partyGame"
                placeholder="e.g., Codenames, Dixit, Wavelength"
                value={nominations.partyGame}
                onChange={(e) => handleInputChange('partyGame', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mid Weight</CardTitle>
            <CardDescription>
              Nominate a medium complexity game with strategic depth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="midWeight">Game Name</Label>
              <Input
                id="midWeight"
                placeholder="e.g., Ticket to Ride, Carcassonne, Splendor"
                value={nominations.midWeight}
                onChange={(e) => handleInputChange('midWeight', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heavy Weight</CardTitle>
            <CardDescription>
              Nominate a complex, strategic game for experienced players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="heavyWeight">Game Name</Label>
              <Input
                id="heavyWeight"
                placeholder="e.g., Gloomhaven, Brass: Birmingham, Twilight Imperium"
                value={nominations.heavyWeight}
                onChange={(e) => handleInputChange('heavyWeight', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            Submit Nominations
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EurovisionNomination;
