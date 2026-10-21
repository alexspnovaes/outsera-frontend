import { useCallback, useEffect, useState } from 'react';

export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/** Cada efeito cancela a requisição anterior e ignora respostas que já perderam validade. */
export function useResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  enabled = true,
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setData(null);
    setError(null);
    setLoading(enabled);
    if (enabled) {
      loader(controller.signal)
        .then((result) => {
          if (active) setData(result);
        })
        .catch((reason: unknown) => {
          if (active && !controller.signal.aborted) {
            setError(
              reason instanceof Error ? reason.message : 'Não foi possível carregar os dados.',
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
      controller.abort();
    };
  }, [loader, enabled, attempt]);

  return { data, loading, error, retry };
}
