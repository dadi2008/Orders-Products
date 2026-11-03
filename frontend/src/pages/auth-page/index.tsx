import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "common/auth";
import { useTranslation } from "common/i18n";
import { inventoryApi } from "lib/api";

export default function AuthPage() {
  const { user, authenticate } = useAuth();
  const { language, setLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("user1@inventory.local");
  const [password, setPassword] = useState("Inventory123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate replace to="/orders" />;
  const destination = (location.state as { from?: string } | null)?.from ?? "/orders";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = registration
        ? await inventoryApi.register(name, email, password)
        : await inventoryApi.login(email, password);
      authenticate(session.user);
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <img src="/inventory-logo.png" alt="Inventory" />
        <select
          className="auth-card__language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
          aria-label="Language"
        >
          <option value="ru">Русский</option>
          <option value="uk">Українська</option>
          <option value="en">English</option>
        </select>
        <h1>{registration ? "Create account" : "Welcome back"}</h1>
        {registration && (
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        </label>
        {error && <p className="auth-card__error" role="alert">{error}</p>}
        <button className="button button--primary" disabled={busy}>
          {busy ? "…" : registration ? "Register" : "Sign in"}
        </button>
        <button type="button" className="auth-card__switch" onClick={() => setRegistration((value) => !value)}>
          {registration ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}
