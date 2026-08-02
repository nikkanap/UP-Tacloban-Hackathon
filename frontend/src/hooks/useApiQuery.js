import { useCallback, useEffect, useRef, useState } from "react";

// Runs an API call on mount and exposes {data, loading, error, refresh}.
//
// `fetcher` receives an AbortSignal and must be stable — wrap it in useCallback
// at the call site, or pass a module-level function.
export function useApiQuery(fetcher, { initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);

  const run = useCallback(async () => {
    // A refresh while a request is in flight supersedes it.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(controller.signal);
      if (controller.signal.aborted) return;
      setData(result);
    } catch (caught) {
      if (controller.signal.aborted || caught.name === "AbortError") return;
      setError(caught);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    run();
    return () => controllerRef.current?.abort();
  }, [run]);

  return { data, loading, error, refresh: run };
}

export default useApiQuery;
