import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/services/productsService';
import { getUserById } from '../api/services/authService';

const PAGE_SIZE = 9;

export function useProducts(search, page = 1, refreshKey = 0) {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res   = await getProducts({ page });
      let items   = res?.items ?? [];

      // ── Поиск по заголовку/тегам ────────────────────────
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(p =>
          (p.title ?? '').toLowerCase().includes(q) ||
          (p.tagNames ?? []).some(t => t.toLowerCase().includes(q))
        );
      }

      // ── Подтягиваем имена авторов ───────────────────────
      const uniqueIds = [...new Set(items.map(p => p.authorId).filter(Boolean))];
      const userMap   = {};
      await Promise.allSettled(
        uniqueIds.map(id =>
          getUserById(id)
            .then(u => { userMap[id] = { username: u?.username ?? String(id), avatar_url: u?.avatar_url ?? '' }; })
            .catch(() => { userMap[id] = { username: String(id), avatar_url: '' }; })
        )
      );

      setData(items.map(p => ({
        ...p,
        creator:          p.authorId ? (userMap[p.authorId]?.username ?? p.creator ?? String(p.authorId)) : (p.creator ?? ''),
        creatorAvatarUrl: p.authorId ? (userMap[p.authorId]?.avatar_url ?? '') : '',
      })));
      setTotal(res?.total ?? 0);
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
   }, [page, search, refreshKey]);

  useEffect(() => { load(); }, [load]);

  return { data, total, loading, error, refresh: load };
}
