import { useState, useCallback } from 'react';

const KEY = 'sw_clicks';

const read = () => {
  const raw = Number(localStorage.getItem(KEY));
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
};

export function useClicks() {
  const [count, setCount] = useState(read);

  const persist = (v) => {
    localStorage.setItem(KEY, String(v));
    return v;
  };

  const add = useCallback((n = 1) => {
    setCount(c => persist(c + n));
  }, []);

  const spend = useCallback((n) => {
    const current = read();
    if (current < n) return false;
    setCount(persist(current - n));
    return true;
  }, []);

  const reset = useCallback(() => setCount(persist(0)), []);

  return { count, add, spend, reset };
}
