import { useQuery } from '@tanstack/react-query';

const CACHE_KEY = 'config-cache';

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || undefined; } catch { return undefined; }
};

const fetchConfig = async () => {
  const rs = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/rest/configurations`);
  if (!rs.ok) throw new Error('Failed to fetch config');
  const data = await rs.json();
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  return data;
};

// Cached config renders instantly; one shared background request refreshes it.
const useConfig = (enabled, cfg) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    initialData: readCache,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const col = (Array.isArray(data) ? data : []).filter(d => d.config === cfg);

  return {
    data,
    isLoading,
    value: col.length === 0 ? false : col[0].value,
    txt: col.length === 0 ? "" : col[0].txt,
  };
};

export default useConfig;
