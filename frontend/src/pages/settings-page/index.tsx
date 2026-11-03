import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import { toMediaUpload } from "lib/media";
import { inventoryApi } from "lib/api";
import { setCurrentUser } from "store/slices/ui.slice";
import { useTranslation } from "common/i18n";
import { useAuth } from "common/auth";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "components/page-skeleton";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.ui.currentUser);
  const [name, setName] = useState(current?.name ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(!current);
  useEffect(() => {
    if (current) return;
    void inventoryApi
      .getCurrentUser()
      .then((user) => {
        dispatch(setCurrentUser(user));
        setName(user?.name ?? "");
      })
      .catch(() => setStatus("Не вдалося завантажити налаштування"))
      .finally(() => setLoading(false));
  }, [current, dispatch]);
  if (loading) return <PageSkeleton variant="settings" />;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const user = await inventoryApi.updateCurrentUser({
        name: name.trim(),
        avatar: avatar ? await toMediaUpload(avatar) : undefined,
      });
      dispatch(setCurrentUser(user));
      setAvatar(null);
      setStatus("Настройки сохранены");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить настройки",
      );
    }
  };
  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };
  return (
    <section className="page settings-page">
      <div className="page__heading">
        <h1>{t("settings")}</h1>
      </div>
      <form className="settings-form" onSubmit={save}>
        <div className="settings-avatar">
          {current?.avatarUrl ? (
            <img src={current.avatarUrl} alt={t("settings")} />
          ) : (
            <span>
              {(name || "АМ")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
        </div>
        <label>
          {t("name")}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label>
          {t("avatar")}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
          />
        </label>
        {status && <p>{status}</p>}
        <button className="button button--primary">{t("save")}</button>
        <button type="button" className="button button--plain" onClick={logout}>
          {t("signOut")}
        </button>
      </form>
    </section>
  );
}
