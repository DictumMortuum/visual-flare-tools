import React, { useState, useContext, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Clock, Hash, Sparkles, Gamepad2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserContext } from '@/context';
import { aggregateBGStats, mergeSubmissions } from '@/lib/bgstats';

const API = `${import.meta.env.VITE_APP_ENDPOINT}/rest/community_stats`;
const YEAR = new Date().getFullYear();
const MONTHS = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιούν", "Ιούλ", "Αύγ", "Σεπ", "Οκτ", "Νοέ", "Δεκ"];

const hours = (m) => `${Math.round(m / 60).toLocaleString()} ώρες`;

const Kpi = ({ icon, label, value }) => (
  <Card><CardContent className="p-4 flex items-center gap-3">
    <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
    <div><div className="text-xs text-muted-foreground">{label}</div><div className="text-xl font-bold">{value}</div></div>
  </CardContent></Card>
);

const StatsView = ({ stats, community }) => {
  const timeline = MONTHS.map((m, i) => ({ name: m, plays: stats.timeline[String(i + 1).padStart(2, "0")] || 0 }));
  const counts = ["1", "2", "3", "4", "5+"].map((k) => ({ name: `${k}p`, plays: stats.player_counts[k] || 0 }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {community && <Kpi icon={<Users className="h-4 w-4" />} label="Συμμετέχοντες" value={stats.contributors} />}
        <Kpi icon={<Hash className="h-4 w-4" />} label="Παρτίδες" value={stats.total_plays.toLocaleString()} />
        <Kpi icon={<Gamepad2 className="h-4 w-4" />} label="Διαφορετικά παιχνίδια" value={stats.unique_games} />
        <Kpi icon={<Sparkles className="h-4 w-4" />} label={community ? "Νέα παιχνίδια (σύνολο)" : "Νέα παιχνίδια"} value={stats.new_games} />
        <Kpi icon={<Clock className="h-4 w-4" />} label="Χρόνος παιχνιδιού" value={hours(stats.total_duration_min)} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Δραστηριότητα ανά μήνα</CardTitle></CardHeader>
          <CardContent className="h-64"><ResponsiveContainer><BarChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
            <Bar dataKey="plays" name="Παρτίδες" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Αριθμός παικτών</CardTitle></CardHeader>
          <CardContent className="h-64"><ResponsiveContainer><BarChart data={counts}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
            <Bar dataKey="plays" name="Παρτίδες" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Τι παίχτηκε</CardTitle></CardHeader>
        <CardContent><div className="divide-y">
          {stats.games.slice(0, 30).map((g, i) => (
            <div key={(g.bgg_id || g.name) + i} className="flex items-center justify-between py-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground w-6 text-right text-sm">{i + 1}</span>
                <span className="truncate">{g.name}</span>
                {!community && g.is_new && <Badge variant="secondary">Νέο</Badge>}
                {community && g.new_for > 0 && <Badge variant="secondary">νέο για {g.new_for}</Badge>}
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {g.plays} παρτίδες{community ? ` · ${g.players} παίκτες` : ""}{g.duration_min ? ` · ${hours(g.duration_min)}` : ""}
              </div>
            </div>
          ))}
          {stats.games.length === 0 && <p className="text-muted-foreground text-sm py-4">Δεν υπάρχουν παρτίδες για το {YEAR}.</p>}
        </div></CardContent></Card>
    </div>
  );
};

const BGStatsPool = () => {
  const { state: { user } } = useContext(UserContext);
  const email = user?.email;
  const fileRef = useRef(null);
  const [mine, setMine] = useState(null);
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["community_stats", YEAR],
    queryFn: async () => {
      const r = await fetch(API);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const all = await r.json();
      return (all || []).filter((x) => Number(x.year) === YEAR);
    },
  });

  const upload = useMutation({
    mutationFn: async (stats) => {
      const r = await fetch(API, {
        method: "POST",
        body: JSON.stringify({
          ...stats, user_identifier: email,
          timeline: stats.timeline, player_counts: stats.player_counts, games: stats.games,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    },
    onSuccess: () => { toast.success("Τα στατιστικά σου προστέθηκαν στο pool!"); qc.invalidateQueries({ queryKey: ["community_stats"] }); },
    onError: (e) => toast.error(`Αποτυχία αποστολής: ${e.message}`),
  });

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setMine(aggregateBGStats(JSON.parse(await f.text()), YEAR));
    } catch {
      toast.error("Το αρχείο δεν είναι έγκυρο BGStats export");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Ανέβασε το BGStats export σου</h3>
            <p className="text-sm text-muted-foreground">Μετράμε μόνο τις παρτίδες του {YEAR}. Στέλνονται μόνο σύνολα, όχι συμπαίκτες ή σκορ.</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Επιλογή αρχείου</Button>
            {mine && (
              <Button disabled={!email || upload.isPending} onClick={() => upload.mutate(mine)}>
                {upload.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Αποστολή στο pool
              </Button>
            )}
          </div>
        </CardContent>
        {mine && !email && <p className="px-6 pb-4 text-sm text-destructive">Συνδέσου για να στείλεις τα στατιστικά σου.</p>}
      </Card>

      <Tabs defaultValue={mine ? "mine" : "pool"} key={mine ? "m" : "p"}>
        <TabsList>
          <TabsTrigger value="pool">Κοινότητα {YEAR}</TabsTrigger>
          <TabsTrigger value="mine" disabled={!mine}>Τα δικά μου</TabsTrigger>
        </TabsList>
        <TabsContent value="pool">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : <StatsView stats={mergeSubmissions(rows)} community />}
        </TabsContent>
        <TabsContent value="mine">{mine && <StatsView stats={mine} />}</TabsContent>
      </Tabs>
    </div>
  );
};

export default BGStatsPool;
