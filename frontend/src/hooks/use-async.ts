"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "@/lib/errors";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Runs an async loader on mount, exposing loading/error/data for the UI states. */
export function useAsync<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;

    loader()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({ data: null, error: errorMessage(cause), loading: false });
        }
      });

    return () => {
      active = false;
    };
    // The loader is recreated on every render; `nonce` is the reload trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  const reload = useCallback(() => {
    setState({ data: null, error: null, loading: true });
    setNonce((value) => value + 1);
  }, []);

  return { ...state, reload };
}
