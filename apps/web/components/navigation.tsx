"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxSeam, Boxes, Gear, People, Receipt } from "react-bootstrap-icons";

const items = [
  { href: "/orders", label: "Приходи", icon: Receipt },
  { href: "/groups", label: "Групи", icon: Boxes },
  { href: "/products", label: "Продукти", icon: BoxSeam },
  { href: "/users", label: "Користувачі", icon: People },
  { href: "/settings", label: "Налаштування", icon: Gear }
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <aside className="navigation">
      <div className="navigation__profile"><div className="navigation__avatar">АМ</div><button aria-label="Налаштування"><Gear size={14} /></button></div>
      <nav className="navigation__links">
        {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`navigation__link ${pathname === href ? "navigation__link--active" : ""}`}><Icon size={15} /><span>{label}</span></Link>)}
      </nav>
    </aside>
  );
}
