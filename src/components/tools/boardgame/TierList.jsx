import React, { useContext, useEffect, useRef, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { Save, Download, Loader2, Search, Check, X, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserContext } from '@/context';
import { TIERS, emptyTiers, moveGame, normalizeTiers } from '@/lib/tierlist';
import { fetchTopGames, fetchTierlist, saveTierlist } from '@/api/tierlistService';

const LABELS = ['Outstanding', 'Excellent', 'Very good', 'Good', 'OK', 'Mediocre', 'Not so good', 'Bad', 'Very bad', 'Awful'];
const COLORS = ['tier-color-10', 'tier-color-9', 'tier-color-8', 'tier-color-7', 'tier-color-6', 'tier-color-5', 'tier-color-4', 'tier-color-3', 'tier-color-2', 'tier-color-1'];

function Cover({ game }) {
  const [failed, setFailed] = useState(false);
  return game.url && !failed ? <img src={game.url} alt={game.name} title={game.name} className="h-full w-full object-contain" onError={() => setFailed(true)} />
    : <span className="flex h-full flex-col items-center justify-center gap-1 p-1 text-[10px] leading-tight"><ImageOff className="h-4 w-4" />{game.name}</span>;
}

function GameTile({ game, onSelect, selected }) {
  const drag = useDraggable({ id: `game-${game.id}`, data: { game } });
  const drop = useDroppable({ id: `before-${game.id}`, data: { beforeId: game.id } });
  return <div ref={drop.setNodeRef} className={`tier-game ${drop.isOver ? 'ring-2 ring-ring' : ''}`}>
    <Button ref={drag.setNodeRef} {...drag.attributes} {...drag.listeners} variant="ghost"
      aria-label={`Κατάταξη ${game.name}`} title={`#${game.rank || '—'} · ${game.name}`}
      onClick={() => onSelect(game)} className={`relative h-full w-full rounded-none p-1 bg-card ${selected ? 'ring-2 ring-ring' : ''} ${drag.isDragging ? 'opacity-30' : ''}`}>
      <Cover game={game} />
      <span className="absolute bottom-0 left-0 bg-background/90 px-1 text-[10px] text-foreground">#{game.rank || '—'}</span>
    </Button>
  </div>;
}

function TierRow({ tier, games, selected, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}`, data: { tier } });
  return <div className="grid grid-cols-[84px_1fr] sm:grid-cols-[126px_1fr] border-b last:border-b-0 min-h-[88px]">
    <div className={`tier-label ${COLORS[10 - tier]} flex flex-col items-center justify-center gap-1 px-2 py-3 text-center`}>
      <span className="text-2xl font-bold leading-none">{tier}</span>
      <span className="text-[11px] sm:text-xs font-semibold leading-tight">{LABELS[10 - tier]}</span>
    </div>
    <div ref={setNodeRef} className={`flex flex-wrap content-start gap-1.5 min-w-0 p-2 ${isOver ? 'bg-accent ring-2 ring-inset ring-ring' : 'bg-muted/40'}`}>
      {games.map(game => <GameTile key={game.id} game={game} selected={selected?.id === game.id} onSelect={onSelect} />)}
    </div>
  </div>;
}

function TierBoard({ email }) {
  const draftKey = `bgg-tierlist-draft:${email || 'guest'}`;
  const [tiers, setTiers] = useState(emptyTiers);
  const [name, setName] = useState('BGG Top 100');
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');
  const exportRef = useRef(null);
  const revision = useRef(0);
  const gamesQuery = useQuery({ queryKey: ['bgg-top100'], queryFn: fetchTopGames, staleTime: 300000 });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 5 } }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setReady(false); setLoadError('');
      let draft;
      try { draft = JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { /* Ignore invalid drafts. */ }
      try {
        const saved = email ? await fetchTierlist(email) : null;
        if (cancelled) return;
        const source = draft || saved;
        setTiers(normalizeTiers(source?.tiers)); setName(source?.name || 'BGG Top 100');
        setDirty(Boolean(draft)); setReady(true);
      } catch (error) {
        if (cancelled) return;
        if (draft) { setTiers(normalizeTiers(draft.tiers)); setName(draft.name || 'BGG Top 100'); setDirty(true); }
        setLoadError(error.message); setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [email, draftKey]);

  useEffect(() => {
    if (!ready || !dirty) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ name, tiers })); } catch { /* Saving to extapi remains available. */ }
  }, [name, tiers, ready, dirty, draftKey]);

  const allGames = gamesQuery.data || [];
  const byId = new Map(allGames.map(game => [game.id, game]));
  const lookup = id => byId.get(id) || { id, name: `BGG #${id} (εκτός Top 100)` };
  const ranked = new Set(Object.values(tiers).flat());
  const pool = allGames.filter(game => !ranked.has(game.id) && game.name.toLowerCase().includes(search.toLowerCase()));
  const poolDrop = useDroppable({ id: 'pool', data: { tier: 'pool' } });

  function place(id, target, beforeId) {
    setTiers(previous => moveGame(previous, id, target, beforeId));
    setDirty(true); revision.current += 1; setSelected(null);
  }

  async function save() {
    if (!email || loadError) return;
    const currentRevision = revision.current;
    setSaving(true);
    try {
      await saveTierlist(email, name, tiers);
      // Read back through the API before reporting persistence.
      const saved = await fetchTierlist(email);
      if (!saved || JSON.stringify(saved.tiers) !== JSON.stringify(normalizeTiers(tiers))) throw new Error('Δεν επιβεβαιώθηκε η αποθήκευση από το API');
      if (revision.current === currentRevision) { setDirty(false); localStorage.removeItem(draftKey); }
      toast.success('Το tier list αποθηκεύτηκε!');
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  }

  async function exportPng() {
    if (!exportRef.current) return;
    setExporting(true);
    let clone;
    try {
      // BGG displays covers cross-origin but blocks fetching their pixels for canvas export.
      // Export readable titles rather than silently omitting restricted cover art.
      clone = exportRef.current.cloneNode(true);
      clone.style.width = `${exportRef.current.clientWidth}px`;
      clone.style.position = 'fixed'; clone.style.left = '-10000px';
      clone.querySelectorAll('img').forEach(image => {
        const title = document.createElement('span');
        title.className = 'flex h-full items-center justify-center p-1 text-[10px] leading-tight whitespace-normal break-words';
        title.textContent = image.alt;
        image.replaceWith(title);
      });
      document.body.appendChild(clone);
      const dataUrl = await toPng(clone, { pixelRatio: 2, skipFonts: true });
      const link = document.createElement('a'); link.download = 'bgg-top100-tierlist.png'; link.href = dataUrl; link.click();
    } catch { toast.error('Η εξαγωγή δεν ολοκληρώθηκε. Δοκίμασε ξανά.'); }
    finally { clone?.remove(); setExporting(false); }
  }

  if (gamesQuery.isLoading || !ready) return <div className="flex justify-center py-16"><Loader2 aria-label="Φόρτωση tier list" className="h-6 w-6 animate-spin" /></div>;
  if (gamesQuery.isError) return <div role="alert" className="space-y-3"><p className="text-destructive">Δεν φορτώθηκαν τα Top 100 παιχνίδια.</p><Button variant="outline" onClick={() => gamesQuery.refetch()}>Επανάληψη</Button></div>;

  return <DndContext sensors={sensors} onDragStart={({ active: item }) => setActive(item.data.current?.game)} onDragCancel={() => setActive(null)} onDragEnd={({ active: item, over }) => {
    setActive(null);
    const id = item.data.current?.game?.id;
    if (!id || !over) return;
    const beforeId = over.data.current?.beforeId;
    if (beforeId === id) return;
    const target = beforeId ? TIERS.find(t => tiers[t].includes(beforeId)) ?? 'pool' : over.data.current?.tier;
    if (target !== undefined) place(id, target, beforeId);
  }}>
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b pb-4">
        <div className="space-y-2 min-w-0"><Input aria-label="Όνομα tier list" value={name} maxLength={120} onChange={e => { setName(e.target.value); setDirty(true); revision.current += 1; }} className="max-w-sm font-semibold" />
          <p className="text-xs text-muted-foreground">{allGames.filter(g => ranked.has(g.id)).length} / {allGames.length} καταταγμένα · {dirty ? 'Μη αποθηκευμένες αλλαγές' : email ? 'Συγχρονισμένο' : 'Προσωρινό tier list'}</p></div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportPng} disabled={exporting} title="Λήψη PNG" aria-label="Λήψη PNG">{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</Button>
          <Button onClick={save} disabled={!email || saving || !dirty || Boolean(loadError)}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : dirty ? <Save className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}Αποθήκευση</Button>
        </div>
      </div>
      {!email && <p className="text-sm text-muted-foreground">Συνδέσου για αποθήκευση στο προφίλ σου.</p>}
      {loadError && <div role="alert" className="text-sm text-destructive">Δεν φορτώθηκε το αποθηκευμένο tier list: {loadError}. Η αποθήκευση απενεργοποιήθηκε για να προστατευτούν τα δεδομένα σου. <Button variant="link" onClick={() => window.location.reload()}>Επανάληψη</Button></div>}
      {selected && <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 border rounded-md bg-popover p-3 shadow-sm">
        <span className="text-sm font-medium flex-1 min-w-0 break-words">{selected.name}</span>
        <Select value="" onValueChange={value => place(selected.id, value)}><SelectTrigger className="w-44" aria-label="Επιλογή βαθμίδας"><SelectValue placeholder="Επιλογή βαθμίδας" /></SelectTrigger><SelectContent>{TIERS.map(t => <SelectItem key={t} value={String(t)}>{t} · {LABELS[10 - t]}</SelectItem>)}<SelectItem value="pool">Χωρίς κατάταξη</SelectItem></SelectContent></Select>
        <Button variant="ghost" size="icon" aria-label="Κλείσιμο επιλογής" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
      </div>}
      <div ref={exportRef} className="bg-background">
        <h2 className="font-semibold text-lg pb-3 break-words">{name || 'BGG Top 100'}</h2>
        <div className="border rounded-md overflow-hidden">{TIERS.map(tier => <TierRow key={tier} tier={tier} games={tiers[tier].map(lookup)} selected={selected} onSelect={setSelected} />)}</div>
      </div>
      <section className="space-y-3" aria-labelledby="unranked-title">
        <div className="flex flex-wrap gap-3 justify-between items-center"><h2 id="unranked-title" className="font-semibold">Χωρίς κατάταξη <span className="text-muted-foreground">({allGames.filter(g => !ranked.has(g.id)).length})</span></h2>
          <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} aria-label="Αναζήτηση παιχνιδιών" placeholder="Αναζήτηση παιχνιδιού…" className="pl-9" /></div></div>
        <div ref={poolDrop.setNodeRef} className={`flex flex-wrap gap-2 min-h-24 border rounded-md p-3 ${poolDrop.isOver ? 'bg-accent ring-2 ring-ring' : 'bg-muted/40'}`}>
          {pool.map(game => <GameTile key={game.id} game={game} selected={selected?.id === game.id} onSelect={setSelected} />)}
          {!pool.length && <p className="text-sm text-muted-foreground p-3">{search ? 'Δεν βρέθηκαν παιχνίδια.' : 'Όλα τα παιχνίδια έχουν καταταχθεί.'}</p>}
        </div>
      </section>
    </div>
    <DragOverlay>{active ? <div className="tier-game bg-card border rounded shadow-sm"><Cover game={active} /></div> : null}</DragOverlay>
  </DndContext>;
}

export default function TierList() {
  const { state: { user } } = useContext(UserContext);
  return <TierBoard key={user?.email || 'guest'} email={user?.email} />;
}