import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/services/productsService';

export function useProducts(category, search) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ category, search });
      setData(res?.items ?? []);
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
