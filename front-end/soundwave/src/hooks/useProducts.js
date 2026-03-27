import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/services/productsService';
import { getUserById } from '../api/services/authService';

export function useProducts(_category, _search, page = 1) {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ page });
      const items = res?.items ?? [];

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
      setTotal(res?.total ?? 0);
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return { data, total, loading, error, refresh: load };
}
