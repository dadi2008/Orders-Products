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
import { useAuth } from "common/auth";

export function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const { ready, user } = useAuth();

  useDesktopScale();

  useEffect(() => {
    if (!ready || !user) return undefined;

    const browserSessionId = getBrowserSessionId();
    const socket = io(`${socketUrl}/presence`, {
      transports: ["websocket"],
      // Socket.IO evaluates this callback for every handshake, including
      // automatic reconnects after a transient network or server failure.
      auth: (callback) =>
        callback({
          accessToken: inventoryApi.getAccessToken(),
          browserSessionId,
        }),
    });
    socket.on("presence", ({ activeSessions: count }) =>
      dispatch(setActiveSessions(count)),
    );
    socket.on("server-time", ({ timestamp }: { timestamp: unknown }) => {
      if (typeof timestamp === "number" && Number.isFinite(timestamp))
        dispatch(setServerTime(timestamp));
    });
    socket.on("connect_error", () => {
      // A reconnect can happen after the previous access token expired. Refresh
      // once and let Socket.IO retry the handshake with the new token.
      void inventoryApi.restoreSession().then((session) => {
        if (session && socket.disconnected) socket.connect();
      });
    });
    const unsubscribe = inventoryApi.subscribeToSessionChanges((session) => {
      if (!session) {
        socket.disconnect();
        dispatch(setActiveSessions(0));
        dispatch(setServerTime(null));
        return;
      }
      if (socket.disconnected) socket.connect();
    });
    return () => {
      unsubscribe();
      socket.close();
    };
  }, [dispatch, ready, user?.id]);

  useEffect(() => {
    if (!ready || !user) return;
    void inventoryApi
      .getCurrentUser()
      .then((user) => dispatch(setCurrentUser(user)))
      .catch(() => undefined);
  }, [dispatch, ready, user?.id]);

  return (
    <div className="app-shell">
      <TopMenu />
      <Navigation />
      <main className="app-content">{children}</main>
    </div>
  );
}
