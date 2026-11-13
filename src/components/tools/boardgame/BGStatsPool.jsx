import React, { useState, useContext, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, Clock, Hash, Sparkles, Gamepad2, Users, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from "recharts";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserContext } from '@/context';
import { aggregateBGStats, mergeSubmissions, metadataStats } from '@/lib/bgstats';
import backupGuide from '@/assets/bgstats-backup-guide.jpg.asset.json';

const API = `${import.meta.env.VITE_APP_ENDPOINT}/rest/community_stats`;
const YEAR = new Date().getFullYear();
const MONTHS = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιούν", "Ιούλ", "Αύγ", "Σεπ", "Οκτ", "Νοέ", "Δεκ"];

const hours = (m) => `${Math.round(m / 60).toLocaleString()} ώρες`;

const NORD = ["frost-4", "red", "green", "yellow", "purple", "orange", "frost-2", "frost-1", "frost-3"].map((k) => `hsl(var(--nord-${k}))`);
const tip = { contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 } };

const Kpi = ({ icon, label, value, i = 0 }) => (
  <Card className={`bgstats-kpi ${["bgstats-kpi-0", "bgstats-kpi-1", "bgstats-kpi-2", "bgstats-kpi-3", "bgstats-kpi-4", "bgstats-kpi-5"][i]}`}><CardContent className="relative h-full min-h-32 p-4">
    <div className="min-w-0 pr-12"><div className="text-xs font-medium leading-5 break-words">{label}</div></div>
    <div className="text-xl font-bold mt-3 break-words">{value}</div>
    <div className="bgstats-kpi-icon absolute top-4 right-4 flex items-center justify-center h-10 w-10 rounded-md" aria-hidden="true">{icon}</div>
  </CardContent></Card>
);

const ChartCard = ({ title, children, tall }) => (
  <Card className="min-w-0"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
    <CardContent className={tall ? "h-96" : "h-64"}><ResponsiveContainer>{children}</ResponsiveContainer></CardContent></Card>
);

const Bars = ({ data, dataKey = "plays", name = "Παρτίδες", vertical, ...size }) => (
  <BarChart {...size} data={data} layout={vertical ? "vertical" : "horizontal"} margin={vertical ? { left: 20 } : undefined}>
    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
    {vertical ? <><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" fontSize={11} width={140} interval={0} /></>
      : <><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /></>}
    <Tooltip {...tip} cursor={{ fill: "hsl(var(--muted))" }} />
    <Bar dataKey={dataKey} name={name} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
      {data.map((_, i) => <Cell key={i} fill={NORD[i % NORD.length]} />)}
    </Bar>
  </BarChart>
);

const Donut = ({ data, offset = 0, ...size }) => (
  <PieChart {...size}>
    <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
      {data.map((_, i) => <Cell key={i} fill={NORD[(i + offset) % NORD.length]} />)}
    </Pie>
    <Tooltip {...tip} /><Legend />
  </PieChart>
);

const StatsView = ({ stats, community }) => {
  const timeline = MONTHS.map((m, i) => ({ name: m, plays: stats.timeline[String(i + 1).padStart(2, "0")] || 0 }));
  const counts = ["1", "2", "3", "4", "5+"].map((k) => ({ name: `${k}p`, plays: stats.player_counts[k] || 0 }));
  const meta = metadataStats(stats.games);
  const hasMeta = meta.covered > 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {community && <Kpi i={0} icon={<Users className="h-4 w-4" />} label="Συμμετέχοντες" value={stats.contributors} />}
        <Kpi i={1} icon={<Hash className="h-4 w-4" />} label="Παρτίδες" value={stats.total_plays.toLocaleString()} />
        <Kpi i={2} icon={<Gamepad2 className="h-4 w-4" />} label="Διαφορετικά παιχνίδια" value={stats.unique_games} />
        <Kpi i={3} icon={<Sparkles className="h-4 w-4" />} label={community ? "Νέα παιχνίδια (σύνολο)" : "Νέα παιχνίδια"} value={stats.new_games} />
        <Kpi i={4} icon={<Clock className="h-4 w-4" />} label="Χρόνος παιχνιδιού" value={hours(stats.total_duration_min)} />
        {meta.avgYear && <Kpi i={5} icon={<CalendarDays className="h-4 w-4" />} label="Μέσο έτος έκδοσης" value={meta.avgYear} />}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Δραστηριότητα ανά μήνα"><Bars data={timeline} /></ChartCard>
        <ChartCard title="Αριθμός παικτών ανά παρτίδα"><Bars data={counts} /></ChartCard>
      </div>
      {hasMeta && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChartCard title="Συνεργατικά ή ανταγωνιστικά"><Donut data={meta.mode} /></ChartCard>
            <ChartCard title="Παιχνίδια που παίζονται solo"><Donut data={meta.solo} offset={2} /></ChartCard>
            <ChartCard title="Διάρκεια παιχνιδιού (κουτί)"><Bars data={meta.length} /></ChartCard>
            <ChartCard title="Έκδοση ανά δεκαετία"><Bars data={meta.decades} /></ChartCard>
            <ChartCard title="Υποστήριξη αριθμού παικτών"><Bars data={meta.support} dataKey="games" name="Παιχνίδια" /></ChartCard>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard tall title="Κορυφαίοι μηχανισμοί"><Bars data={meta.mechanics} vertical /></ChartCard>
            <ChartCard tall title="Κορυφαίες κατηγορίες"><Bars data={meta.categories} vertical /></ChartCard>
          </div>
          <p className="text-xs text-muted-foreground">Τα στατιστικά έκδοσης, παικτών, διάρκειας και μηχανισμών βασίζονται σε {meta.covered} από {stats.games.length} παιχνίδια με διαθέσιμα στοιχεία, σταθμισμένα με τις παρτίδες.</p>
        </>
      )}
      <Card><CardHeader><CardTitle className="text-base">Τι παίχτηκε</CardTitle></CardHeader>
        <CardContent><div className="divide-y">
          {stats.games.slice(0, 30).map((g, i) => {
            const b = g.boardgame;
            return (
              <div key={(g.bgg_id || g.name) + i} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-muted-foreground w-6 text-right text-sm">{i + 1}</span>
                  {b?.square200 ? <img src={b.square200} alt={g.name} loading="lazy" className="h-10 w-10 rounded object-cover" />
                    : <div className="h-10 w-10 rounded bg-muted" />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="truncate font-medium">{g.name}</span>
                      {!community && g.is_new && <Badge variant="secondary">Νέο</Badge>}
                      {community && g.new_for > 0 && <Badge variant="secondary">νέο για {g.new_for}</Badge>}
                      {b?.cooperative && <Badge variant="outline" style={{ borderColor: NORD[2], color: NORD[2] }}>Co-op</Badge>}
                      {b?.solitaire && <Badge variant="outline" style={{ borderColor: NORD[4], color: NORD[4] }}>Solo</Badge>}
                    </div>
                    {b && <div className="text-xs text-muted-foreground">{[b.year > 0 && b.year, b.min_players && `${b.min_players}–${b.max_players} παίκτες`, b.max_play_time && `${b.min_play_time}–${b.max_play_time}'`].filter(Boolean).join(" · ")}</div>}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground sm:whitespace-nowrap">
                  {g.plays} παρτίδες{community ? ` · ${g.players} παίκτες` : ""}{g.duration_min ? ` · ${hours(g.duration_min)}` : ""}
                </div>
              </div>
            );
          })}
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
  const [fileName, setFileName] = useState("");
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["community_stats", YEAR],
    queryFn: async () => {
      const r = await fetch(`${API}?year=${YEAR}`);
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
      setFileName(f.name);
    } catch {
      toast.error("Το αρχείο δεν είναι έγκυρο BGStats export");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold">Ανέβασε το BGStats export σου</h3>
            <p className="text-sm text-muted-foreground">Μετράμε μόνο τις παρτίδες του {YEAR}. Στέλνονται μόνο σύνολα, όχι συμπαίκτες ή σκορ.</p>
            {fileName && <p className="text-sm mt-2 break-all">Επιλεγμένο αρχείο: {fileName}</p>}
          </div>
          <div className="flex flex-wrap shrink-0 gap-2">
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

      <section aria-labelledby="backup-guide-title" className="grid gap-6 sm:grid-cols-[1fr_220px] border-b pb-6 items-start">
        <div>
          <h3 id="backup-guide-title" className="font-semibold">Πώς παίρνω το αρχείο από το BGStats;</h3>
          <ol className="mt-3 list-decimal pl-5 space-y-3 text-sm leading-6">
            <li>Στο BGStats άνοιξε <strong>Settings → Export, Import and backup</strong>.</li>
            <li>Επίλεξε <strong>Send backup file…</strong> για να στείλεις το αρχείο στη συσκευή σου ή <strong>Export backup file…</strong> για να το αποθηκεύσεις.</li>
            <li>Εδώ πάτησε <strong>Επιλογή αρχείου</strong>, διάλεξε το αρχείο JSON και μετά <strong>Αποστολή στο pool</strong>.</li>
          </ol>
        </div>
        <img src={backupGuide.url} alt="BGStats: Export, import and backup, με επισημασμένες τις επιλογές Export backup file και Send backup file" className="w-full max-w-[280px] sm:max-w-none rounded-md border" />
      </section>

      <section aria-labelledby="community-title" className="space-y-4">
        <h3 id="community-title" className="font-semibold text-lg">Κοινότητα {YEAR}</h3>
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : <StatsView stats={mergeSubmissions(rows)} community />}
      </section>
    </div>
  );
};

export default BGStatsPool;
