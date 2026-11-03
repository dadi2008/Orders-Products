import { NavLink, useNavigate } from "react-router-dom";
import { Gear } from "react-bootstrap-icons";
import { navigationItems } from "common/constants/navigation";
import { useTranslation } from "common/i18n";
import { useAppSelector } from "hooks/use-app-store";

export function Navigation() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.ui.currentUser);
  const { t } = useTranslation();
  return (
    <aside className="navigation">
      <div className="navigation__profile">
        <div className="navigation__avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Аватар" />
          ) : (
            (user?.name
              .split(" ")
              .map((item) => item[0])
              .join("")
              .slice(0, 2) ?? "АМ")
          )}
        </div>
        <button aria-label={t("settings")} onClick={() => navigate("/settings")}>
          <Gear size={14} />
        </button>
      </div>
      <nav className="navigation__links">
        {navigationItems.map(({ href, labelKey, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `navigation__link ${isActive ? "navigation__link--active" : ""}`
            }
          >
            <Icon size={15} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
