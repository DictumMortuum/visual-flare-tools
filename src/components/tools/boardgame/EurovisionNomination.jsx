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
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useConfig from '../../../hooks/useConfig';

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

// Convert position to Eurovision points
const getEurovisionPoints = (position) => {
  const pointsMap = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  return position <= 10 ? pointsMap[position - 1] : 0;
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
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.02 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="touch-none"
      {...attributes}
      {...listeners}
    >
      <Card className="relative overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
        <CardContent className="flex items-center gap-3 p-2 bg-gradient-to-r from-background to-muted/10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-md flex-shrink-0">
            {rank}
          </div>
          <div className="relative group flex-shrink-0">
            <img
              src={nomination.boardgame.square200 || '/placeholder.svg'}
              alt={nomination.boardgame.name}
              className="w-16 h-16 object-cover rounded-lg shadow-md border-2 border-border group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base mb-0.5 truncate">{nomination.boardgame.name}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {nomination.boardgame.year && (
                <span className="px-1.5 py-0.5 bg-muted rounded-full text-xs font-medium">
                  {nomination.boardgame.year}
                </span>
              )}
              {nomination.email && (
                <span className="text-xs text-muted-foreground truncate">
                  by {nomination.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-6 h-6 text-muted-foreground/50 flex-shrink-0">
            <GripVertical className="w-4 h-4" />
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
  const { value: EUROVISION_SHOW_VOTES_LIST } = useConfig(!!user?.user_id, "EUROVISION_SHOW_VOTES_LIST");
  const [rankings, setRankings] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: [],
  });

  console.log(EUROVISION_SHOW_VOTES_LIST);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ("ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0));

  const sensors = useSensors(
    useSensor(isTouchDevice ? TouchSensor : PointerSensor, {
      activationConstraint: isTouchDevice
        ? {
            delay: 200,
            tolerance: 8,
          }
        : {
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

  const { status: myVotesStatus, data: myVotes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['my-votes', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];
      
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionvotes/user/${user.user_id}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch votes');
      return response.json();
    },
    onSuccess: () => {
      setRankings(myVotes.votes)
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

  // Mutation to save/update nomination
  const saveVotesMutation = useMutation({
    mutationFn: async () => {
      if (!user?.user_id) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionvotes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.user_id,
            votes: rankings,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save votes');
    },
    onSuccess: () => {
      // queryClient.invalidateQueries(['my-nominations']);
      // queryClient.invalidateQueries(['others-nominations']);
      toast.success('Nomination saved!');
    },
    onError: (error) => {
      toast.error('Failed to save votes: ' + error.message);
    },
  });

  const handleSaveVotes = () => {
    saveVotesMutation.mutate();
  };

  React.useEffect(() => {
    if (myVotesStatus === 'success' && myVotes.id !== 0) {
      setRankings(myVotes.votes);
    } else if (othersNominations.length > 0 && activeTab === 'vote') {
      const newRankings = {
        partyGame: othersNominations.filter(n => n.category === 'partyGame'),
        midWeight: othersNominations.filter(n => n.category === 'midWeight'),
        heavyWeight: othersNominations.filter(n => n.category === 'heavyWeight'),
      };
      setRankings(newRankings);
    }
  }, [votesLoading, myVotes, othersNominations, activeTab]);

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

  if (nominationsLoading || votesLoading) {
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
              <TabsTrigger value="vote" disabled={!EUROVISION_SHOW_VOTES_LIST}>Vote</TabsTrigger>
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
                    <Button onClick={handleSaveVotes}>Save Votes</Button>
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
                              <div
                                className="space-y-3 touch-none"
                                style={{ touchAction: 'none' }}
                              >
                                {categoryRankings.map((nomination, index) => (
                                  <SortableNominationCard
                                    key={nomination.id}
                                    nomination={nomination}
                                    rank={getEurovisionPoints(index + 1)}
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
