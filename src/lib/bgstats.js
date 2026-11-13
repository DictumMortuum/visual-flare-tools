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
      const cur = games.get(key) || { bgg_id: g.bgg_id, name: g.name, plays: 0, duration_min: 0, players: 0, new_for: 0 };
      cur.plays += g.plays; cur.duration_min += g.duration_min; cur.players += 1;
      if (g.is_new) cur.new_for += 1;
      games.set(key, cur);
    });
  });
  pool.games = [...games.values()].sort((a, b) => b.plays - a.plays);
  pool.unique_games = pool.games.length;
  return pool;
};
