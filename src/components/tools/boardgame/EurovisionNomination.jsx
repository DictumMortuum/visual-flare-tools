import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Search, Plus, GripVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const SortableGameItem = ({ game, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {game.square200 ? (
        <img
          src={game.square200}
          alt={game.name}
          className="w-12 h-12 rounded-md object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
          <Trophy className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium">{game.name}</p>
        <p className="text-xs text-muted-foreground">
          BGG ID: {game.id}
          {game.year !== 0 && ` • ${game.year}`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const EurovisionNomination = () => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [rankings, setRankings] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: []
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event, category) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setRankings((prev) => {
        const items = prev[category];
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return {
          ...prev,
          [category]: arrayMove(items, oldIndex, newIndex)
        };
      });
    }
  };

  const handleGameSelect = (game) => {
    if (!currentCategory) return;

    setRankings(prev => ({
      ...prev,
      [currentCategory]: [...prev[currentCategory], game]
    }));

    toast({
      title: "Game added!",
      description: `${game.name} has been added to your ranking.`,
    });
  };

  const handleRemoveGame = (category, gameId) => {
    setRankings(prev => ({
      ...prev,
      [category]: prev[category].filter(game => game.id !== gameId)
    }));
  };

  const handleSubmit = () => {
    const filledRankings = Object.entries(rankings)
      .filter(([_, value]) => value.length > 0)
      .map(([key, value]) => {
        const categoryNames = {
          partyGame: 'Party Game',
          midWeight: 'Mid Weight',
          heavyWeight: 'Heavy Weight'
        };
        return `${categoryNames[key]}: ${value.map((g, i) => `${i + 1}. ${g.name}`).join(', ')}`;
      });

    if (filledRankings.length === 0) {
      toast({
        title: "No rankings",
        description: "Please rank at least one category.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Vote submitted!",
      description: `You voted in ${filledRankings.length} ${filledRankings.length === 1 ? 'category' : 'categories'}.`,
    });

    // TODO: Send rankings to backend
    console.log('Rankings:', rankings);
  };

  const handleReset = () => {
    setRankings({
      partyGame: [],
      midWeight: [],
      heavyWeight: []
    });
  };

  const openAddGameDialog = (category) => {
    setCurrentCategory(category);
    setShowDialog(true);
  };

  const categories = [
    { key: 'partyGame', title: 'Party Game', description: 'Light, fun game perfect for parties and social gatherings' },
    { key: 'midWeight', title: 'Mid Weight', description: 'Medium complexity game with strategic depth' },
    { key: 'heavyWeight', title: 'Heavy Weight', description: 'Complex, strategic game for experienced players' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
          <Trophy className="h-4 w-4" />
          Eurovision Boardgame Competition
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Rank Your Favorites</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Drag and drop games to rank them in each category. Save your rankings to vote!
        </p>
      </div>

      {/* Category Lists */}
      <div className="grid gap-8 md:grid-cols-3">
        {categories.map(({ key, title, description }) => (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, key)}
              >
                <SortableContext
                  items={rankings[key].map(g => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {rankings[key].length === 0 ? (
                      <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg text-muted-foreground">
                        <p className="text-sm">No games ranked yet</p>
                      </div>
                    ) : (
                      rankings[key].map((game) => (
                        <SortableGameItem
                          key={game.id}
                          game={game}
                          onRemove={() => handleRemoveGame(key, game.id)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => openAddGameDialog(key)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Section */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={handleReset} size="lg">
          Clear All
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Submit Vote
        </Button>
      </div>

      {/* Add Game Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Game to Ranking</DialogTitle>
            <DialogDescription>
              Search and select a game to add to your ranking
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SearchGames 
              onSelectGame={(game) => {
                handleGameSelect(game);
                setShowDialog(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EurovisionNomination;
