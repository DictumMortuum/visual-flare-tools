import { top100, normalizeTiers } from '../lib/tierlist';

const ROOT = import.meta.env.VITE_APP_ENDPOINT;

export async function fetchTopGames() {
  const response = await fetch(`${ROOT}/boardgames/top`, { method: 'POST' });
  if (!response.ok) throw new Error(`Top 100: HTTP ${response.status}`);
  return top100(await response.json());
}

export async function fetchTierlist(email) {
  const response = await fetch(`${ROOT}/rest/tierlists?user_identifier=${encodeURIComponent(email)}`);
  if (response.status === 404) return null;
  const body = await response.json();
  // Compatibility with the old deployment: only this specific missing-record error is empty.
  if (response.status === 500 && body?.errors?.error === 'record not found') return null;
  if (!response.ok) throw new Error(`Tier list: HTTP ${response.status}`);
  const record = Array.isArray(body) ? body.find(row => row.user_identifier === email) : body;
  if (!record) return null;
  if (record.user_identifier !== email) throw new Error('Το API επέστρεψε tier list άλλου χρήστη');
  return { ...record, tiers: normalizeTiers(record.tiers) };
}

export async function saveTierlist(email, name, tiers) {
  if (!email) throw new Error('Απαιτείται σύνδεση');
  const response = await fetch(`${ROOT}/rest/tierlists`, {
    method: 'POST',
    // Match existing extapi requests without requiring a custom-header preflight.
    body: JSON.stringify({ user_identifier: email, name: name.trim() || 'BGG Top 100', tiers: normalizeTiers(tiers) }),
  });
  if (!response.ok) throw new Error(`Αποθήκευση: HTTP ${response.status}`);
  return response.json();
}