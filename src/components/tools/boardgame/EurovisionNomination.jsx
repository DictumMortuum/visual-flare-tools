import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';

const SearchGames = ({ onSelectGame, selectedGame }) => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 1000);

  const fetchBoardgames = async (name) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/boardgames?filter={"name@simplelike":"${name}"}&range=[0,9]`);
    setShowResults(true);
    return rs.json();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["boardgames_search", debouncedSearchTerm],
    queryFn: () => fetchBoardgames(debouncedSearchTerm),
    initialData: [],
    enabled: !!debouncedSearchTerm,
  });

  const selectGame = (game) => {
    onSelectGame(game);
    setShowResults(false);
    setInput(game.name);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search for a board game..."
        value={input}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setInput(e.target.value);
        }}
        className="pl-9"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {showResults && data.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {data.map(game => (
            <div
              key={game.id}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-0 flex items-center gap-3"
              onClick={() => selectGame(game)}
            >
              {game.square200 !== "" && <img
                src={game.square200}
                alt={game.name}
                className="w-12 h-12 rounded-md object-cover"
              />}
              <div className="flex-1">
                <div className="font-medium">{game.name}</div>
                <div className="text-xs text-muted-foreground flex gap-4 mt-1">
                  <span>BGG ID: {game.id}</span>
                  {game.year !== 0 && <span>{game.year}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EurovisionNomination = () => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [nominations, setNominations] = useState({
    partyGame: null,
    midWeight: null,
    heavyWeight: null,
    best2025: null
  });

  const handleGameSelect = (category, game) => {
    setNominations(prev => ({
      ...prev,
      [category]: game
    }));
  };

  const handleSubmit = () => {
    const filledNominations = Object.entries(nominations)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => {
        const categoryNames = {
          partyGame: 'Party Game',
          midWeight: 'Mid Weight',
          heavyWeight: 'Heavy Weight',
          best2025: 'Best 2025 Game'
        };
        return `${categoryNames[key]}: ${value.name}`;
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
    setShowDialog(false);
  };

  const handleReset = () => {
    setNominations({
      partyGame: null,
      midWeight: null,
      heavyWeight: null,
      best2025: null
    });
  };

  const categories = [
    { key: 'partyGame', title: 'Party Game', description: 'Light, fun game perfect for parties and social gatherings' },
    { key: 'midWeight', title: 'Mid Weight', description: 'Medium complexity game with strategic depth' },
    { key: 'heavyWeight', title: 'Heavy Weight', description: 'Complex, strategic game for experienced players' },
    { key: 'best2025', title: 'Best 2025 Game', description: 'The best game released in 2025' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
          <Trophy className="h-4 w-4" />
          Eurovision Boardgame Competition
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Nominate Your Favorites</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Submit your nominations for the Eurovision Boardgame Competition
        </p>
      </div>

      {/* Selected Nominations Display */}
      {Object.values(nominations).some(n => n !== null) && (
        <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Nominations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(({ key, title }) => {
              const game = nominations[key];
              return game ? (
                <div key={key} className="text-center space-y-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted shadow-lg">
                    {game.square200 ? (
                      <img
                        src={game.square200}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Trophy className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="font-medium text-sm truncate">{game.name}</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Nominate Button */}
      <div className="flex justify-center">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              {Object.values(nominations).some(n => n !== null) ? 'Edit Nominations' : 'Add Nominations'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Your Nominations</DialogTitle>
              <DialogDescription>
                Select your favorite games for each category (all categories are optional)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {categories.map(({ key, title, description }) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SearchGames 
                      onSelectGame={(game) => handleGameSelect(key, game)}
                      selectedGame={nominations[key]}
                    />
                    {nominations[key] && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {nominations[key].square200 ? (
                          <img
                            src={nominations[key].square200}
                            alt={nominations[key].name}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{nominations[key].name}</p>
                          <p className="text-xs text-muted-foreground">
                            BGG ID: {nominations[key].id}
                            {nominations[key].year !== 0 && ` • ${nominations[key].year}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGameSelect(key, null)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                Clear All
              </Button>
              <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                Submit Nominations
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EurovisionNomination;
