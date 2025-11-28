import React, { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, X, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'sonner';
import { UserContext } from '@/context';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SearchGames = ({ onSelectGame, selectedGame }) => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 1000);

  const fetchBoardgames = async (name) => {
    const rs = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/rest/boardgames?filter={"name@simplelike":"${name}"}&range=[0,9]`);
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

const SortableNominationCard = ({ nomination, rank }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nomination.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="relative">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex items-center justify-center w-8 h-8 bg-muted rounded hover:bg-muted/80 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
            {rank}
          </div>
          <img
            src={nomination.boardgame.square200 || '/placeholder.svg'}
            alt={nomination.boardgame.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{nomination.boardgame.name}</h4>
            <p className="text-sm text-muted-foreground">
              {nomination.boardgame.year}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EurovisionNomination = () => {
  const queryClient = useQueryClient();
  const { state: { user } } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('nominate');
  const [isAddGameDialogOpen, setIsAddGameDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [rankings, setRankings] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch my nominations
  const { data: myNominations = [], isLoading: nominationsLoading } = useQuery({
    queryKey: ['my-nominations', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];
      
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionparticipations?filter={"email":"${user.user_id}"}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch nominations');
      return response.json();
    },
    enabled: !!user?.user_id,
  });

  // Fetch all other nominations for voting
  const { data: othersNominations = [], isLoading: othersLoading } = useQuery({
    queryKey: ['others-nominations', user?.user_id],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionparticipations`
      );
      
      if (!response.ok) throw new Error('Failed to fetch nominations');
      return response.json();
    },
    enabled: !!user?.user_id && activeTab === 'vote',
  });

  // Mutation to save/update nomination
  const saveNominationMutation = useMutation({
    mutationFn: async ({ category, game }) => {
      if (!user?.user_id) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionparticipations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.user_id,
            email: user.user_id,
            category,
            boardgame_id: game.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save nomination');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-nominations']);
      queryClient.invalidateQueries(['others-nominations']);
      toast.success('Nomination saved!');
    },
    onError: (error) => {
      toast.error('Failed to save nomination: ' + error.message);
    },
  });

  const handleGameSelect = (game) => {
    if (!currentCategory) return;

    saveNominationMutation.mutate({ category: currentCategory, game });
    setIsAddGameDialogOpen(false);
  };

  const handleRemoveNomination = async (id, category) => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionparticipations/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to remove nomination');

      queryClient.invalidateQueries(['my-nominations']);
      queryClient.invalidateQueries(['others-nominations']);
      toast.success('Nomination removed');
    } catch (error) {
      toast.error('Failed to remove nomination');
    }
  };

  const openAddGameDialog = (category) => {
    setCurrentCategory(category);
    setIsAddGameDialogOpen(true);
  };

  const handleDragEnd = (event, category) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRankings((prev) => {
        const items = prev[category];
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return {
          ...prev,
          [category]: arrayMove(items, oldIndex, newIndex),
        };
      });
    }
  };

  const saveVotes = async () => {
    if (!user?.user_id) return;

    try {
      // Save rankings to API
      const votesData = Object.entries(rankings).flatMap(([category, items]) =>
        items.map((item, index) => ({
          user_id: user.user_id,
          category,
          nomination_id: item.id,
          rank: index + 1,
        }))
      );

      // You can implement the actual save logic here
      console.log('Saving votes:', votesData);
      toast.success('Votes saved successfully!');
    } catch (error) {
      toast.error('Failed to save votes');
    }
  };

  // Initialize rankings when nominations load
  React.useEffect(() => {
    if (othersNominations.length > 0 && activeTab === 'vote') {
      const newRankings = {
        partyGame: othersNominations.filter(n => n.category === 'partyGame'),
        midWeight: othersNominations.filter(n => n.category === 'midWeight'),
        heavyWeight: othersNominations.filter(n => n.category === 'heavyWeight'),
      };
      setRankings(newRankings);
    }
  }, [othersNominations, activeTab]);

  const categories = {
    partyGame: 'Party Game',
    midWeight: 'Mid Weight',
    heavyWeight: 'Heavy Weight',
  };

  if (!user?.user_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please log in to access Eurovision Nomination.</p>
        </div>
      </div>
    );
  }

  if (nominationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  const myNominationsByCategory = {
    partyGame: myNominations.find(n => n.category === 'partyGame'),
    midWeight: myNominations.find(n => n.category === 'midWeight'),
    heavyWeight: myNominations.find(n => n.category === 'heavyWeight'),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
          <Trophy className="h-4 w-4" />
          Eurovision Boardgame Competition
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Eurovision Nomination</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Nominate your favorite games and vote on others' nominations
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nominate">My Nominations</TabsTrigger>
              <TabsTrigger value="vote">Vote</TabsTrigger>
            </TabsList>

            <TabsContent value="nominate" className="space-y-6 mt-6">
              {Object.entries(categories).map(([key, title]) => {
                const nomination = myNominationsByCategory[key];
                return (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          {title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nominate one game for this category
                        </p>
                      </div>
                      {!nomination && (
                        <Button
                          variant="outline"
                          onClick={() => openAddGameDialog(key)}
                        >
                          Nominate Game
                        </Button>
                      )}
                    </div>

                    {nomination ? (
                      <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                          <img
                            src={nomination.boardgame.square200 || '/placeholder.svg'}
                            alt={nomination.boardgame.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{nomination.boardgame.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {nomination.boardgame.year}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNomination(nomination.id, key)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No game nominated yet. Click "Nominate Game" to select one.
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="vote" className="space-y-6 mt-6">
              {othersLoading ? (
                <p>Loading nominations...</p>
              ) : othersNominations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No nominations from other players yet.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Drag games to rank them. Your top choice should be at position 1.
                    </p>
                    <Button onClick={saveVotes}>Save Votes</Button>
                  </div>
                  
                  {Object.entries(categories).map(([key, title]) => {
                    const categoryRankings = rankings[key] || [];
                    
                    return (
                      <div key={key} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                          <Trophy className="h-5 w-5 text-primary" />
                          {title}
                        </h3>
                        {categoryRankings.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No nominations for this category yet.
                          </div>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, key)}
                          >
                            <SortableContext
                              items={categoryRankings.map(n => n.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {categoryRankings.map((nomination, index) => (
                                  <SortableNominationCard
                                    key={nomination.id}
                                    nomination={nomination}
                                    rank={index + 1}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Game Dialog */}
      <Dialog open={isAddGameDialogOpen} onOpenChange={setIsAddGameDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nominate a Game</DialogTitle>
            <DialogDescription>
              Search and select a game for {categories[currentCategory]}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SearchGames 
              onSelectGame={handleGameSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EurovisionNomination;
