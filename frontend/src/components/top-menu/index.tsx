import { Clock, People, Search } from "react-bootstrap-icons";
import { useTranslation } from "common/i18n";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import { setSearchQuery } from "store/slices/ui.slice";

export function TopMenu() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const activeSessions = useAppSelector((state) => state.ui.activeSessions);
  const serverTime = useAppSelector((state) => state.ui.serverTime);
  const now = serverTime === null ? null : new Date(serverTime);
  const { language, locale, setLanguage, t } = useTranslation();

  return (
    <header className="top-menu">
      <div className="top-menu__brand">
        <span className="top-menu__logo" aria-hidden="true">
          <img src="/inventory-logo.png" alt="" />
        </span>
        <span>INVENTORY</span>
      </div>
      <div className="top-menu__search">
        <Search size={15} aria-hidden="true" />
        <input
          aria-label={t("search")}
          placeholder={t("search")}
          value={searchQuery}
          onChange={(event) => dispatch(setSearchQuery(event.target.value))}
        />
      </div>
      <label className="top-menu__language">
        <span className="sr-only">{t("language")}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
          aria-label={t("language")}
        >
          <option value="ru">RU</option>
          <option value="uk">UA</option>
          <option value="en">EN</option>
        </select>
      </label>
      <div className="top-menu__time">
        <span>
          {now
            ? new Intl.DateTimeFormat(locale, { weekday: "long" }).format(now)
            : "—"}
        </span>
        <strong>
          {now
            ? new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(now)
            : "—"}
        </strong>
        <span className="top-menu__clock">
          <Clock size={14} />
          {now
            ? new Intl.DateTimeFormat(locale, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(now)
            : "—"}
        </span>
        <span
          className="top-menu__presence"
          title={t("activeSessions")}
          aria-label={t("activeSessions")}
        >
          <People size={14} />
          <b>{activeSessions}</b>
        </span>
      </div>
    </header>
  );
}
