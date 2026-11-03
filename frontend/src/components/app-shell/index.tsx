import { useEffect, useState } from "react";
import { Clock, Search } from "react-bootstrap-icons";
import { io } from "socket.io-client";
import type { AppShellProps } from "common/interfaces/components";
import { socketUrl } from "common/constants/environment";
import { Navigation } from "components/navigation";
import { useDesktopScale } from "hooks/use-desktop-scale";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import {
  setActiveSessions,
  setCurrentUser,
  setSearchQuery,
} from "store/slices/ui.slice";
import { inventoryApi } from "lib/api";

export function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [now, setNow] = useState(new Date());

  useDesktopScale();

  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("presence", ({ activeSessions: count }) =>
      dispatch(setActiveSessions(count)),
    );
    return () => {
      window.clearInterval(timer);
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
      <header className="top-menu">
        <div className="top-menu__brand">
          <span className="top-menu__logo" aria-hidden="true">
            <img src="/inventory-logo.png" alt="" />
          </span>
          <span>INVENTORY</span>
        </div>
        <div className="top-menu__search">
          <Search size={15} />
          <input
            aria-label="Поиск"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(event) => dispatch(setSearchQuery(event.target.value))}
          />
        </div>
        <div className="top-menu__time">
          <span>
            {new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(now)}
          </span>
          <strong>
            {new Intl.DateTimeFormat("ru-RU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(now)}
          </strong>
          <span className="top-menu__presence">
            <Clock size={14} />
            {new Intl.DateTimeFormat("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(now)}
          </span>
        </div>
      </header>
      <Navigation />
      <main className="app-content">{children}</main>
    </div>
  );
}
