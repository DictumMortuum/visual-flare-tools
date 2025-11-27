import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SupabaseAuth from '@/components/auth/SupabaseAuth';

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('nominate');
  const [isAddGameDialogOpen, setIsAddGameDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch my nominations
  const { data: myNominations = [], isLoading: nominationsLoading } = useQuery({
    queryKey: ['my-nominations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('eurovision_nominations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch all other nominations for voting
  const { data: othersNominations = [], isLoading: othersLoading } = useQuery({
    queryKey: ['others-nominations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eurovision_nominations')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && activeTab === 'vote',
  });

  // Mutation to save/update nomination
  const saveNominationMutation = useMutation({
    mutationFn: async ({ category, game }) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('eurovision_nominations')
        .upsert({
          user_id: authUser.id,
          category,
          game_id: game.id,
          game_name: game.name,
          game_year: game.year,
          game_image: game.square200,
        }, { onConflict: 'user_id,category' });

      if (error) throw error;
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

  const handleRemoveNomination = async (category) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('eurovision_nominations')
      .delete()
      .eq('user_id', authUser.id)
      .eq('category', category);

    if (error) {
      toast.error('Failed to remove nomination');
    } else {
      queryClient.invalidateQueries(['my-nominations']);
      queryClient.invalidateQueries(['others-nominations']);
      toast.success('Nomination removed');
    }
  };

  const openAddGameDialog = (category) => {
    setCurrentCategory(category);
    setIsAddGameDialogOpen(true);
  };

  const categories = {
    partyGame: 'Party Game',
    midWeight: 'Mid Weight',
    heavyWeight: 'Heavy Weight',
  };

  if (authLoading || nominationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <SupabaseAuth />;
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
                            src={nomination.game_image || '/placeholder.svg'}
                            alt={nomination.game_name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{nomination.game_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {nomination.game_year}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNomination(key)}
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
                Object.entries(categories).map(([key, title]) => {
                  const categoryNominations = othersNominations.filter(
                    n => n.category === key
                  );
                  
                  return (
                    <div key={key} className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {title}
                      </h3>
                      {categoryNominations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          No nominations for this category yet.
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {categoryNominations.map((nomination) => (
                            <Card key={nomination.id}>
                              <CardContent className="flex items-center gap-4 p-4">
                                <img
                                  src={nomination.game_image || '/placeholder.svg'}
                                  alt={nomination.game_name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold">{nomination.game_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {nomination.game_year}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
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
