// Client-side aggregation of a BGStats export for a single year.
// Only aggregated counts leave the browser (no dates, opponents or scores).
export const aggregateBGStats = (data, year = new Date().getFullYear()) => {
  const prefix = String(year);
  const games = new Map((data.games || []).map((g) => [g.id, g]));
  const plays = (data.plays || []).filter((p) => !p.ignored && p.playDate);

  const firstPlay = new Map();
  [...plays].sort((a, b) => a.playDate.localeCompare(b.playDate)).forEach((p) => {
    if (!firstPlay.has(p.gameRefId)) firstPlay.set(p.gameRefId, p.playDate);
  });

  const yearPlays = plays.filter((p) => p.playDate.startsWith(prefix));
  const timeline = {};
  for (let m = 1; m <= 12; m++) timeline[String(m).padStart(2, "0")] = 0;
  const player_counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5+": 0 };
  const perGame = new Map();
  let total_duration_min = 0;

  yearPlays.forEach((p) => {
    const dur = Number(p.durationMin) || 0;
    total_duration_min += dur;
    timeline[p.playDate.slice(5, 7)] += 1;
    const n = (p.playerScores || []).length;
    if (n > 0) player_counts[n >= 5 ? "5+" : String(n)] += 1;
    const g = games.get(p.gameRefId) || {};
    const cur = perGame.get(p.gameRefId) || {
      bgg_id: g.bggId || null,
      name: g.name || "Unknown",
      plays: 0,
      duration_min: 0,
      is_new: (firstPlay.get(p.gameRefId) || "").startsWith(prefix),
    };
    cur.plays += 1;
    cur.duration_min += dur;
    perGame.set(p.gameRefId, cur);
  });

  const gameList = [...perGame.values()].sort((a, b) => b.plays - a.plays);
  return {
    bgg_username: data.userInfo?.bggUsername || null,
    year,
    total_plays: yearPlays.length,
    total_duration_min,
    unique_games: gameList.length,
    new_games: gameList.filter((g) => g.is_new).length,
    player_counts,
    timeline,
    games: gameList,
  };
};

const parse = (v) => (typeof v === "string" ? JSON.parse(v || "null") : v);

// Merge many submissions into one community pool.
export const mergeSubmissions = (rows = []) => {
  const pool = {
    contributors: rows.length, total_plays: 0, total_duration_min: 0, new_games: 0,
    timeline: {}, player_counts: {}, games: [],
  };
  const games = new Map();
  rows.forEach((r) => {
    pool.total_plays += r.total_plays || 0;
    pool.total_duration_min += r.total_duration_min || 0;
    pool.new_games += r.new_games || 0;
    Object.entries(parse(r.timeline) || {}).forEach(([k, v]) => (pool.timeline[k] = (pool.timeline[k] || 0) + v));
    Object.entries(parse(r.player_counts) || {}).forEach(([k, v]) => (pool.player_counts[k] = (pool.player_counts[k] || 0) + v));
    (parse(r.games) || []).forEach((g) => {
      const key = g.bgg_id || g.name;
      const cur = games.get(key) || { bgg_id: g.bgg_id, name: g.name, plays: 0, duration_min: 0, players: 0, new_for: 0, boardgame: null };
      if (!cur.boardgame && g.boardgame) cur.boardgame = g.boardgame;
      cur.plays += g.plays; cur.duration_min += g.duration_min; cur.players += 1;
      if (g.is_new) cur.new_for += 1;
      games.set(key, cur);
    });
  });
  pool.games = [...games.values()].sort((a, b) => b.plays - a.plays);
  pool.unique_games = pool.games.length;
  return pool;
};

// Breakdowns based on boardgame metadata (weighted by plays). Games without metadata are skipped.
const topN = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, plays]) => ({ name, plays }));

// BGG weight (1–5); returns null when missing.
export const gameWeight = (b) => {
  const w = Number(b?.bgg_weight ?? b?.avg_weight ?? b?.bgg_complexity ?? b?.weight);
  return w > 0 ? w : null;
};

// BGG rating (1–10); returns null when missing.
export const gameRating = (b) => {
  const r = Number(b?.bgg_rating ?? b?.bgg_average_rating);
  return r > 0 ? r : null;
};
// Round to one decimal place.
export const round1 = (n) => (Math.round(n * 10) / 10).toFixed(1);

export const metadataStats = (games = []) => {
  const withMeta = games.filter((g) => g.boardgame);
  const decades = {}, mechanics = {}, categories = {};
  const mode = { "Ανταγωνιστικά": 0, "Συνεργατικά": 0 };
  const solo = { "Παίζεται solo": 0, "Μόνο πολυπαικτικά": 0 };
  const length = { "≤30'": 0, "31–60'": 0, "61–120'": 0, "120'+": 0 };
  const support = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6+": 0 };
  const weight = { "Ελαφριά (1–2)": 0, "Μεσαία-ελαφριά (2–3)": 0, "Μεσαία-βαριά (3–4)": 0, "Βαριά (4–5)": 0 };
  const rating = { "< 6.0": 0, "6.0–6.9": 0, "7.0–7.9": 0, "≥ 8.0": 0 };
  let rSum = 0, rPlays = 0;
  let yearSum = 0, yearPlays = 0, wSum = 0, wPlays = 0;
  withMeta.forEach(({ plays, boardgame: b }) => {
    if (b.year > 0) {
      const d = b.year < 1980 ? "<1980" : `${Math.floor(b.year / 10) * 10}s`;
      decades[d] = (decades[d] || 0) + plays;
      yearSum += b.year * plays; yearPlays += plays;
    }
    const r = gameRating(b);
    if (r) {
      rSum += r * plays; rPlays += plays;
      rating[r < 6 ? "< 6.0" : r < 7 ? "6.0–6.9" : r < 8 ? "7.0–7.9" : "≥ 8.0"] += plays;
    }
    const w = gameWeight(b);
    if (w) {
      wSum += w * plays; wPlays += plays;
      weight[w < 2 ? "Ελαφριά (1–2)" : w < 3 ? "Μεσαία-ελαφριά (2–3)" : w < 4 ? "Μεσαία-βαριά (3–4)" : "Βαριά (4–5)"] += plays;
    }
    mode[b.cooperative ? "Συνεργατικά" : "Ανταγωνιστικά"] += plays;
    solo[b.solitaire || b.min_players === 1 ? "Παίζεται solo" : "Μόνο πολυπαικτικά"] += plays;
    const t = b.max_play_time || b.min_play_time;
    if (t) length[t <= 30 ? "≤30'" : t <= 60 ? "31–60'" : t <= 120 ? "61–120'" : "120'+"] += plays;
    if (b.min_players && b.max_players) {
      ["1", "2", "3", "4", "5"].forEach((k) => { if (b.min_players <= +k && b.max_players >= +k) support[k] += 1; });
      if (b.max_players >= 6) support["6+"] += 1;
    }
    (b.mechanics || []).forEach((m) => (mechanics[m] = (mechanics[m] || 0) + plays));
    (b.categories || []).forEach((c) => (categories[c] = (categories[c] || 0) + plays));
  });
  const order = (k) => (k === "<1980" ? 0 : parseInt(k));
  return {
    covered: withMeta.length,
    avgYear: yearPlays ? Math.round(yearSum / yearPlays) : null,
    avgWeight: wPlays ? wSum / wPlays : null,
    avgRating: rPlays ? rSum / rPlays : null,
    rating: Object.entries(rating).map(([name, plays]) => ({ name, plays })),
    weight: Object.entries(weight).map(([name, plays]) => ({ name, plays })),
    decades: Object.entries(decades).sort((a, b) => order(a[0]) - order(b[0])).map(([name, plays]) => ({ name, plays })),
    mode: Object.entries(mode).map(([name, value]) => ({ name, value })),
    solo: Object.entries(solo).map(([name, value]) => ({ name, value })),
    length: Object.entries(length).map(([name, plays]) => ({ name, plays })),
    support: Object.entries(support).map(([name, games]) => ({ name: `${name}p`, games })),
    mechanics: topN(mechanics, 10),
    categories: topN(categories, 10),
  };
};
