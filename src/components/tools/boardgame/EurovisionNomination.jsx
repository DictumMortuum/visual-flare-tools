import React, { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, X, GripVertical, Plus, RefreshCw, History, Users, PartyPopper, Scale, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'sonner';
import { UserContext } from '@/context';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useConfig from '../../../hooks/useConfig';

const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = 2025;
const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);
const CATEGORY_META = {
  partyGame: { icon: PartyPopper, color: 'var(--nord-yellow)' },
  midWeight: { icon: Scale, color: 'var(--nord-frost-2)' },
  heavyWeight: { icon: Crown, color: 'var(--nord-red)' },
};
const pointColor = (pts) => pts === 12 ? 'var(--nord-yellow)' : pts === 10 ? 'var(--nord-frost-2)' : pts === 8 ? 'var(--nord-orange)' : pts > 0 ? 'var(--nord-frost-4)' : 'var(--muted)';

// Ask extapi to refresh BGG metadata, then read the fresh record back.
const refreshBoardgame = async (game) => {
  try { await fetch(`${import.meta.env.VITE_API_ENDPOINT}/boardgames/info/${game.id}`); } catch (e) { /* ignore */ }
  try {
    const rs = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/rest/boardgames/${game.id}`);
    if (rs.ok) { const fresh = await rs.json(); if (fresh && fresh.id) return fresh; }
  } catch (e) { /* ignore */ }
  return game;
};

const SearchGames = ({ onSelectGame, selectedGame }) => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 1000);

  const fetchBoardgames = async (name) => {
    const rs = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/rest/boardgames?filter={"name@eurovisionlike":"${name}"}&range=[0,9]`);
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
        className="pl-9 h-12 rounded-xl text-base"
        autoFocus
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {showResults && data.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-popover border rounded-xl shadow-xl max-h-80 overflow-y-auto">
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

  // nomination.emails is an array of all nominators
  const emails = nomination.emails || [nomination.email];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="touch-none"
      {...attributes}
      {...listeners}
    >
      <div className="group flex items-center gap-3 p-2 pr-3 rounded-xl border bg-card cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg font-black text-foreground flex-shrink-0" style={{ background: `hsl(${pointColor(rank)})` }}>
          <span className="text-lg leading-none">{rank || '–'}</span>
          <span className="text-[9px] uppercase tracking-wider opacity-70">pts</span>
        </div>
        <img src={nomination.boardgame?.square200 || '/placeholder.svg'} alt={nomination.boardgame?.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{nomination.boardgame?.name}</h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            {nomination.boardgame?.year ? <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{nomination.boardgame.year}</span> : null}
            <span className="truncate">{emails.map(e => e.split('@')[0]).join(', ')}</span>
          </div>
        </div>
        <GripVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
};

const EurovisionNomination = () => {
  const queryClient = useQueryClient();
  const { state: { user } } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('nominate');
  const [isAddGameDialogOpen, setIsAddGameDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [refreshing, setRefreshing] = useState(false);
  const isArchive = year !== CURRENT_YEAR;
  const { value: EUROVISION_SHOW_VOTES_LIST } = useConfig(!!user?.user_id, "EUROVISION_SHOW_VOTES_LIST");
  const [rankings, setRankings] = useState({
    partyGame: [],
    midWeight: [],
    heavyWeight: [],
  });

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

  // One request for the whole year; split into mine/others in memory.
  const { data: allNominations = [], isLoading: nominationsLoading } = useQuery({
    queryKey: ['nominations', year],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionparticipations?range=[0,500]&filter=${encodeURIComponent(JSON.stringify({ year }))}`
      );
      if (!response.ok) throw new Error('Failed to fetch nominations');
      return response.json();
    },
    enabled: !!user?.user_id,
  });
  const myNominations = React.useMemo(() => allNominations.filter(n => n.email === user?.user_id), [allNominations, user?.user_id]);
  const othersNominations = React.useMemo(() => allNominations.filter(n => n.email !== user?.user_id), [allNominations, user?.user_id]);

  const { status: myVotesStatus, data: myVotes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['my-votes', user?.user_id, year],
    queryFn: async () => {
      if (!user?.user_id) return [];
      
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/rest/eurovisionvotes/user/${user.user_id}?year=${year}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch votes');
      return response.json();
    },
    enabled: !!user?.user_id,
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
            year,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save nomination');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      toast.success('Nomination saved!');
    },
    onError: (error) => {
      toast.error('Failed to save nomination: ' + error.message);
    },
  });

  const handleGameSelect = (game) => {
    if (!currentCategory) return;

    setRefreshing(true);
    refreshBoardgame(game)
      .then((fresh) => saveNominationMutation.mutateAsync({ category: currentCategory, game: fresh }))
      .catch(() => {})
      .finally(() => { setRefreshing(false); setIsAddGameDialogOpen(false); });
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

      queryClient.invalidateQueries({ queryKey: ['nominations'] });
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
            year,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save votes');
    },
    onSuccess: () => {
      // queryClient.invalidateQueries(['my-nominations']);
      // queryClient.invalidateQueries(['others-nominations']);
      toast.success('Votes saved!');
    },
    onError: (error) => {
      toast.error('Failed to save votes: ' + error.message);
    },
  });

  const handleSaveVotes = () => {
    saveVotesMutation.mutate();
  };

  // Helper function to merge nominations by boardgame_id
  const mergeNominationsByGame = (nominations) => {
    const merged = {};
    nominations.forEach(n => {
      if (merged[n.boardgame_id]) {
        merged[n.boardgame_id].emails.push(n.email);
      } else {
        merged[n.boardgame_id] = {
          ...n,
          emails: [n.email],
        };
      }
    });
    return Object.values(merged);
  };

  React.useEffect(() => {
    const my_ids = myNominations.map(d => d.boardgame_id);
    const voteList = othersNominations.filter(game => !my_ids.includes(game.boardgame_id));

    if (myVotesStatus === 'success' && myVotes && myVotes.id && myVotes.votes) {
      setRankings(myVotes.votes);
    } else if (voteList.length > 0 && activeTab === 'vote') {
      const newRankings = {
        partyGame: mergeNominationsByGame(voteList.filter(n => n.category === 'partyGame')),
        midWeight: mergeNominationsByGame(voteList.filter(n => n.category === 'midWeight')),
        heavyWeight: mergeNominationsByGame(voteList.filter(n => n.category === 'heavyWeight')),
      };
      setRankings(newRankings);
    }
  }, [votesLoading, myVotes, othersNominations, myNominations, activeTab, year]);

  React.useEffect(() => {
    if (EUROVISION_SHOW_VOTES_LIST || isArchive) {
      setActiveTab(isArchive ? 'nominate' : 'vote')
    } else {
      setActiveTab('nominate')
    }
  }, [EUROVISION_SHOW_VOTES_LIST, isArchive])

  React.useEffect(() => { setRankings({ partyGame: [], midWeight: [], heavyWeight: [] }); }, [year]);

  const categories = {
    partyGame: 'Party Game',
    midWeight: 'Mid Weight',
    heavyWeight: 'Heavy Weight',
  };

  if (!user?.user_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please log in to access Eurovision.</p>
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
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-40" style={{ background: 'hsl(var(--nord-purple))' }} />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: 'hsl(var(--nord-frost-2))' }} />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" /> Boardgame Eurovision
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Eurovision {year}</h1>
            <p className="text-muted-foreground max-w-xl">
              {isArchive ? 'Αρχείο: δες τι πρότεινες και πώς ψήφισες εκείνη τη χρονιά.' : 'Πρότεινε ένα παιχνίδι ανά κατηγορία και βαθμολόγησε τις προτάσεις των άλλων.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Έτος">
            {YEARS.map(y => (
              <button key={y} onClick={() => setYear(y)} aria-pressed={y === year}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${y === year ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}>
                {y !== CURRENT_YEAR && <History className="h-3.5 w-3.5" />}{y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl">
              <TabsTrigger value="nominate" className="rounded-lg">Οι προτάσεις μου</TabsTrigger>
              <TabsTrigger value="vote" className="rounded-lg" disabled={!EUROVISION_SHOW_VOTES_LIST && !isArchive}>{isArchive ? 'Οι ψήφοι μου' : 'Ψηφοφορία'}</TabsTrigger>
            </TabsList>

            <TabsContent value="nominate" className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(categories).map(([key, title]) => {
                const nomination = myNominationsByCategory[key];
                const { icon: Icon, color } = CATEGORY_META[key];
                const alsoBy = nomination ? othersNominations.filter(d => d.boardgame_id === nomination.boardgame_id) : [];
                return (
                  <div key={key} className="relative flex flex-col rounded-2xl border bg-card overflow-hidden">
                    <div className="h-1.5" style={{ background: `hsl(${color})` }} />
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-lg">{title}</h3>
                    </div>
                    {nomination ? (
                      <div className="flex-1 flex flex-col px-4 pb-4 gap-3">
                        <div className="relative">
                          <img src={nomination.boardgame?.square200 || '/placeholder.svg'} alt={nomination.boardgame?.name} className="w-full aspect-square object-cover rounded-xl" />
                          {!isArchive && (
                            <Button variant="secondary" size="icon" aria-label="Αφαίρεση πρότασης" className="absolute top-2 right-2 rounded-full shadow" onClick={() => handleRemoveNomination(nomination.id, key)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold leading-tight">{nomination.boardgame?.name}</h4>
                          {nomination.boardgame?.year ? <p className="text-sm text-muted-foreground">{nomination.boardgame.year}</p> : null}
                        </div>
                        {alsoBy.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>Το πρότειναν επίσης: {alsoBy.map(i => i.email.split('@')[0]).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 px-4 pb-4">
                        {isArchive ? (
                          <div className="flex items-center justify-center aspect-square rounded-xl border-2 border-dashed text-sm text-muted-foreground">Καμία πρόταση</div>
                        ) : (
                          <button onClick={() => openAddGameDialog(key)} className="w-full flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            <Plus className="h-8 w-8" />
                            <span className="font-medium">Πρότεινε παιχνίδι</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </TabsContent>

            <TabsContent value="vote" className="space-y-6 mt-6">
              {nominationsLoading ? (
                <p>Loading nominations...</p>
              ) : othersNominations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No nominations from other players yet.
                </div>
              ) : (
                <>
                  {!isArchive && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/50 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      Σύρε τα παιχνίδια για να τα κατατάξεις. Η πρώτη θέση παίρνει 12 βαθμούς.
                    </p>
                    <Button onClick={handleSaveVotes} disabled={saveVotesMutation.isPending}>Αποθήκευση ψήφων</Button>
                  </div>
                  )}
                  
                  {Object.entries(categories).map(([key, title]) => {
                    const categoryRankings = rankings[key] || [];

                    return (
                      <div key={key} className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 sticky top-0 bg-card py-2 z-10">
                          {React.createElement(CATEGORY_META[key].icon, { className: 'h-5 w-5', style: { color: `hsl(${CATEGORY_META[key].color})` } })}
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
                            onDragEnd={(event) => !isArchive && handleDragEnd(event, key)}
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
            <DialogTitle>Πρότεινε παιχνίδι</DialogTitle>
            <DialogDescription>
              Αναζήτησε και διάλεξε παιχνίδι για {categories[currentCategory]} ({year})
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {refreshing ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" /> Ενημέρωση στοιχείων από το BGG...
              </div>
            ) : (
              <SearchGames onSelectGame={handleGameSelect} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EurovisionNomination;
