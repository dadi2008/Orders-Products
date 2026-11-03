import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import { toMediaUpload } from "lib/media";
import { inventoryApi } from "lib/api";
import { setCurrentUser } from "store/slices/ui.slice";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.ui.currentUser);
  const [name, setName] = useState(current?.name ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!current)
      void inventoryApi.getCurrentUser().then((user) => {
        dispatch(setCurrentUser(user));
        setName(user?.name ?? "");
      });
  }, [current, dispatch]);
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
  return (
    <section className="page settings-page">
      <div className="page__heading">
        <h1>Настройки</h1>
      </div>
      <form className="settings-form" onSubmit={save}>
        <div className="settings-avatar">
          {current?.avatarUrl ? (
            <img src={current.avatarUrl} alt="Аватар" />
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
          Имя
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label>
          Аватар
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
          />
        </label>
        {status && <p>{status}</p>}
        <button className="button button--primary">Сохранить</button>
      </form>
    </section>
  );
}
