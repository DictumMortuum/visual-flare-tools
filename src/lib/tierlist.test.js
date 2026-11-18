import test from 'node:test';
import assert from 'node:assert/strict';
import { top100, emptyTiers, moveGame, normalizeTiers, TIERS } from './tierlist.js';

test('Only the current BGG ranks 1–100 are offered, once per game', () => {
  const options = Array.from({ length: 116 }, (_, i) => ({ id: i + 1, rank: i + 1 }));
  options.push({ id: 1, rank: 1 });
  const games = top100({ options });
  assert.equal(games.length, 100);
  assert.equal(games[0].id, 1);
  assert.equal(games[99].rank, 100);
});
test('The BGG rating scale has exactly ten tiers from 10 down to 1', () => {
  assert.deepEqual(TIERS, [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
});
test('Moving between tiers assigns a game only once and preserves insertion order', () => {
  let tiers = moveGame(emptyTiers(), 224517, 10);
  tiers = moveGame(tiers, 161936, 9);
  tiers = moveGame(tiers, 224517, 9, 161936);
  assert.deepEqual(tiers[10], []);
  assert.deepEqual(tiers[9], [224517, 161936]);
  assert.deepEqual(moveGame(tiers, 224517, 'pool')[9], [161936]);
});
test('Saved tier IDs are normalized and cannot appear in multiple tiers', () => {
  const tiers = normalizeTiers(JSON.stringify({ '10': ['224517', 224517], '9': [224517, 161936] }));
  assert.deepEqual(tiers[10], [224517]);
  assert.deepEqual(tiers[9], [161936]);
});