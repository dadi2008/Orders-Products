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
