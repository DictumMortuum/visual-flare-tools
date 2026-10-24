import React, { useState, useContext } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Trash2, Plus, Loader2, Repeat, ExternalLink, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'sonner';
import { UserContext } from '@/context';

const API = `${import.meta.env.VITE_APP_ENDPOINT}/rest/trades`;
const CONDITIONS = ["Σφραγισμένο", "Άριστη", "Καλή", "Μέτρια"];

const GamePicker = ({ selected, onSelect }) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const term = useDebounce(input, 600);

  const { data = [], isFetching } = useQuery({
    queryKey: ["boardgames_search_trade", term],
    queryFn: async () => {
      const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/boardgames?filter={"name@simplelike":"${term}"}&range=[0,9]`);
      return rs.json();
    },
    enabled: term.length > 1,
  });

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Αναζήτησε παιχνίδι..."
        value={input}
        onChange={(e) => { setInput(e.target.value); setOpen(true); onSelect(null); }}
        className="pl-9"
      />
      {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      {open && !selected && Array.isArray(data) && data.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-72 overflow-y-auto">
          {data.map(game => (
            <button
              type="button"
              key={game.id}
              className="w-full text-left p-2 hover:bg-muted border-b last:border-0 flex items-center gap-3"
              onClick={() => { onSelect(game); setInput(game.name); setOpen(false); }}
            >
              {game.square200
                ? <img src={game.square200} alt={game.name} className="w-10 h-10 rounded object-cover" />
                : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4" /></div>}
              <div>
                <div className="font-medium text-sm">{game.name}</div>
                {game.year ? <div className="text-xs text-muted-foreground">{game.year}</div> : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TradeCard = ({ trade, mine, onDelete, deleting }) => (
  <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
    <div className="flex gap-3 p-3">
      {trade.image
        ? <img src={trade.image} alt={trade.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
        : <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0"><Package className="h-6 w-6 text-muted-foreground" /></div>}
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-tight">{trade.name}</div>
        {trade.year ? <div className="text-xs text-muted-foreground">{trade.year}</div> : null}
        {trade.condition && <Badge variant="secondary" className="mt-2">{trade.condition}</Badge>}
      </div>
    </div>
    {trade.notes && <p className="px-3 pb-2 text-sm text-muted-foreground">{trade.notes}</p>}
    <div className="mt-auto flex items-center justify-between gap-2 border-t px-3 py-2 text-xs">
      <span className="truncate text-muted-foreground">{trade.user_id}</span>
      <div className="flex items-center gap-1">
        {trade.boardgame_id && (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={`https://boardgamegeek.com/boardgame/${trade.boardgame_id}`} target="_blank" rel="noreferrer" aria-label="BGG">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        {mine && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(trade.id)} disabled={deleting} aria-label="Διαγραφή">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  </Card>
);

const GameTrade = () => {
  const { state: { user } } = useContext(UserContext);
  const email = user?.email;
  const qc = useQueryClient();
  const [game, setGame] = useState(null);
  const [condition, setCondition] = useState(CONDITIONS[1]);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("");
  const [pickerKey, setPickerKey] = useState(0);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const rs = await fetch(`${API}?range=[0,999]`);
      if (!rs.ok) throw new Error("fetch failed");
      return rs.json();
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const rs = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardgame_id: game.id,
          name: game.name,
          image: game.square200 || "",
          year: game.year || null,
          user_id: email,
          condition,
          notes,
        }),
      });
      if (!rs.ok) throw new Error("save failed");
      return rs.json();
    },
    onSuccess: () => {
      toast.success("Το παιχνίδι προστέθηκε!");
      setGame(null); setNotes(""); setPickerKey(k => k + 1);
      qc.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: () => toast.error("Δεν ήταν δυνατή η αποθήκευση"),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      const rs = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!rs.ok) throw new Error("delete failed");
    },
    onSuccess: () => { toast.success("Αφαιρέθηκε"); qc.invalidateQueries({ queryKey: ["trades"] }); },
    onError: () => toast.error("Δεν ήταν δυνατή η διαγραφή"),
  });

  const list = Array.isArray(trades) ? trades : [];
  const mine = list.filter(t => t.user_id === email);
  const q = filter.toLowerCase();
  const all = list.filter(t => !q || t.name?.toLowerCase().includes(q) || t.user_id?.toLowerCase().includes(q));

  const grid = (items, empty) => items.length === 0
    ? <div className="text-center py-12 text-muted-foreground"><Repeat className="mx-auto h-8 w-8 mb-2 opacity-50" />{empty}</div>
    : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(t => <TradeCard key={t.id} trade={t} mine={t.user_id === email} onDelete={remove.mutate} deleting={remove.isPending} />)}
      </div>;

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Φέρνω για ανταλλαγή</h2>
          <GamePicker key={pickerKey} selected={game} onSelect={setGame} />
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(c => (
              <Button key={c} type="button" size="sm" variant={condition === c ? "default" : "outline"} onClick={() => setCondition(c)}>{c}</Button>
            ))}
          </div>
          <Input placeholder="Σημειώσεις (γλώσσα, τι ψάχνεις σε αντάλλαγμα...)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button onClick={() => add.mutate()} disabled={!game || !email || add.isPending} className="w-full sm:w-auto">
            {add.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Προσθήκη
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Όλα ({list.length})</TabsTrigger>
            <TabsTrigger value="mine">Τα δικά μου ({mine.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Φίλτρο ανά παιχνίδι ή email..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" />
            </div>
            {grid(all, "Δεν έχουν δηλωθεί ακόμα παιχνίδια.")}
          </TabsContent>
          <TabsContent value="mine">{grid(mine, "Δεν έχεις δηλώσει κάποιο παιχνίδι.")}</TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GameTrade;
