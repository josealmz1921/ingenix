'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyCatalogs, loadPageCatalogs } from './catalogRequest';

export function usePageCatalogs(enabled: boolean) {
  const [catalogs, setCatalogs] = useState(emptyCatalogs);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const lifecycle = useRef({ generation: 0 });

  const load = useCallback(() => {
    const state = lifecycle.current;
    const current = ++state.generation;
    return loadPageCatalogs()
      .then((result) => {
        if (state.generation === current) {
          setCatalogs(result);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (state.generation === current) {
          setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los catálogos.');
        }
      })
      .finally(() => {
        if (state.generation === current) setLoading(false);
      });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    await load();
  }, [load]);

  useEffect(() => {
    const state = lifecycle.current;
    if (enabled) void load();
    return () => {
      state.generation++;
    };
  }, [enabled, load]);

  return { catalogs, loading, error, refresh };
}
