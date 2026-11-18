export const TIERS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const emptyTiers = () => Object.fromEntries(TIERS.map(t => [t, []]));

export function top100(response) {
  const rows = Array.isArray(response) ? response : response?.options;
  if (!Array.isArray(rows)) throw new Error('Μη έγκυρη λίστα παιχνιδιών');
  const seen = new Set();
  return rows.filter(g => Number(g.rank) >= 1 && Number(g.rank) <= 100)
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .filter(g => {
      const id = Number(g.id);
      if (!Number.isInteger(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 100).map(g => ({ ...g, id: Number(g.id) }));
}

export function normalizeTiers(value) {
  let source = value;
  if (typeof source === 'string') {
    try { source = JSON.parse(source); } catch { source = {}; }
  }
  const seen = new Set();
  return Object.fromEntries(TIERS.map(t => [t, (Array.isArray(source?.[t]) ? source[t] : [])
    .map(Number).filter(id => {
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) return false;
      seen.add(id);
      return true;
    })]));
}

export function moveGame(tiers, id, destination, beforeId) {
  const next = normalizeTiers(tiers);
  for (const t of TIERS) next[t] = next[t].filter(gameId => gameId !== id);
  if (TIERS.includes(Number(destination))) {
    const list = next[destination];
    const index = list.indexOf(beforeId);
    list.splice(index < 0 ? list.length : index, 0, id);
  }
  return next;
}