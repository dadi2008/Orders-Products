import { NavLink, useNavigate } from "react-router-dom";
import { Gear } from "react-bootstrap-icons";
import { navigationItems } from "common/constants/navigation";
import { useAppSelector } from "hooks/use-app-store";

export function Navigation() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.ui.currentUser);
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
        <button aria-label="Настройки" onClick={() => navigate("/settings")}>
          <Gear size={14} />
        </button>
      </div>
      <nav className="navigation__links">
        {navigationItems.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `navigation__link ${isActive ? "navigation__link--active" : ""}`
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
