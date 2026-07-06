import { useCallback, useState } from "react";

// "Ben kimim?" — chat ve dürtme için gönderen kimliği. Cihazda saklanır.
const KEY = "wc-identity";

export function useIdentity() {
  const [identity, setIdentityState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  const setIdentity = useCallback((name: string | null) => {
    setIdentityState(name);
    try {
      if (name) localStorage.setItem(KEY, name);
      else localStorage.removeItem(KEY);
    } catch {
      /* yoksay */
    }
  }, []);

  return { identity, setIdentity };
}
