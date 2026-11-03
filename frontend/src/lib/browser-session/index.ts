const browserSessionKey = "inventory-browser-session-id";

export function getBrowserSessionId(): string {
  const current = window.sessionStorage.getItem(browserSessionKey);
  if (current) return current;

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(browserSessionKey, sessionId);
  return sessionId;
}
