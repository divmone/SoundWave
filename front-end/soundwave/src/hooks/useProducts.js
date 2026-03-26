import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/services/productsService';
import { getUserById } from '../api/services/authService';

export function useProducts(category, search) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ category, search });
      const items = res?.items ?? [];

      // Resolve unique authorIds to usernames in parallel
      const uniqueIds = [...new Set(items.map(p => p.authorId).filter(Boolean))];
      const userMap = {};
      await Promise.allSettled(
        uniqueIds.map(id =>
          getUserById(id)
            .then(u => { userMap[id] = u?.username ?? String(id); })
            .catch(() => { userMap[id] = String(id); })
        )
      );

      setData(items.map(p => ({
        ...p,
        creator: p.authorId ? (userMap[p.authorId] ?? p.creator) : p.creator,
      })));
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
