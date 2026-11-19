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
// Score for a game at `index` within a tier of `size`: first place = tier, last approaches tier - 1.
export function positionScore(tier, index, size) {
  return Number(tier) - index / Math.max(size, 1);
}

// Combine all users' tier lists: average position-aware score per game, best first.
export function combineTierlists(lists) {
  const totals = new Map();
  for (const list of lists || []) {
    const tiers = normalizeTiers(list?.tiers);
    for (const t of TIERS) tiers[t].forEach((id, index) => {
      const entry = totals.get(id) || { id, sum: 0, votes: 0 };
      entry.sum += positionScore(t, index, tiers[t].length);
      entry.votes += 1;
      totals.set(id, entry);
    });
  }
  return [...totals.values()]
    .map(({ id, sum, votes }) => ({ id, votes, score: sum / votes, tier: Math.min(10, Math.max(1, Math.ceil(sum / votes))) }))
    .sort((a, b) => b.score - a.score || b.votes - a.votes || a.id - b.id);
}
