import { useState, useEffect } from 'react';
import { getStats } from '../api/stats';

export function useStats() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setData).finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
