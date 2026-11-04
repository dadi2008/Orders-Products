import { useEffect } from "react";
import { io } from "socket.io-client";
import type { AppShellProps } from "common/interfaces/components";
import { socketUrl } from "common/constants/environment";
import { Navigation } from "components/navigation";
import { TopMenu } from "components/top-menu";
import { useDesktopScale } from "hooks/use-desktop-scale";
import { useAppDispatch } from "hooks/use-app-store";
import {
  setActiveSessions,
  setCurrentUser,
  setServerTime,
} from "store/slices/ui.slice";
import { inventoryApi } from "lib/api";
import { getBrowserSessionId } from "lib/browser-session";

export function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();

  useDesktopScale();

  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const socket = io(`${socketUrl}/presence`, {
      transports: ["websocket"],
      auth: {
        accessToken: inventoryApi.getAccessToken(),
        browserSessionId: getBrowserSessionId(),
      },
    });
    socket.on("presence", ({ activeSessions: count }) =>
      dispatch(setActiveSessions(count)),
    );
    socket.on("server-time", ({ timestamp }: { timestamp: unknown }) => {
      if (typeof timestamp === "number" && Number.isFinite(timestamp))
        dispatch(setServerTime(timestamp));
    });
    return () => {
      socket.close();
    };
  }, [dispatch]);

  useEffect(() => {
    void inventoryApi
      .getCurrentUser()
      .then((user) => dispatch(setCurrentUser(user)))
      .catch(() => undefined);
  }, [dispatch]);

  return (
    <div className="app-shell">
      <TopMenu />
      <Navigation />
      <main className="app-content">{children}</main>
    </div>
  );
}
