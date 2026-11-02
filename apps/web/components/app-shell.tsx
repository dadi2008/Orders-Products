"use client";

import { useEffect, useState } from "react";
import { Clock, Search, ShieldCheck } from "react-bootstrap-icons";
import { io } from "socket.io-client";
import { Navigation } from "./navigation";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { setActiveSessions } from "../lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const activeSessions = useAppSelector((state) => state.ui.activeSessions);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3003", { transports: ["websocket"] });
    socket.on("presence", ({ activeSessions: count }) => dispatch(setActiveSessions(count)));
    return () => { window.clearInterval(timer); socket.close(); };
  }, [dispatch]);

  return (
    <div className="app-shell">
      <header className="top-menu">
        <div className="top-menu__brand"><span className="top-menu__logo"><ShieldCheck size={23} /></span><span>INVENTORY</span></div>
        <div className="top-menu__search"><Search size={15} /><input aria-label="Пошук" placeholder="Пошук" /></div>
        <div className="top-menu__time">
          <span>{new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(now)}</span>
          <strong>{new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "short", year: "numeric" }).format(now)}</strong>
          <span className="top-menu__presence"><span>{activeSessions}</span><Clock size={14} />{new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now)}</span>
        </div>
      </header>
      <Navigation />
      <main className="app-content">{children}</main>
    </div>
  );
}
