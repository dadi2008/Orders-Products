import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "common/types/inventory";
import { inventoryApi } from "lib/api";

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  authenticate: (user: User) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  user: null,
  authenticate: () => undefined,
  signOut: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void inventoryApi.restoreSession().then((session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
  }, []);

  useEffect(
    () =>
      inventoryApi.subscribeToSessionChanges((session) => {
        setUser(session?.user ?? null);
      }),
    [],
  );

  useEffect(() => {
    if (!user) return undefined;

    const expiresAt = inventoryApi.getAccessTokenExpiry();
    if (!expiresAt) return undefined;

    // Renew before the 15-minute access token expires, so long-lived websocket
    // connections always have a valid token available for a reconnect.
    const delay = Math.max(0, expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(() => {
      void inventoryApi.restoreSession().then((session) => {
        setUser(session?.user ?? null);
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      authenticate: setUser,
      signOut: async () => {
        await inventoryApi.logout();
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
