import { useQuery } from '@tanstack/react-query';

const fetchConfig = async () => {
  const rs = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/rest/configurations`);
  return rs.json();
}

const useConfig = (enabled, cfg) => {
  const { data, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => fetchConfig(),
    initialData: [],
    enabled,
  });

  const col = data.filter(d => d.config === cfg);

  return {
    data,
    isLoading,
    value: col.length === 0 ? false : col[0].value,
  };
}

export default useConfig;