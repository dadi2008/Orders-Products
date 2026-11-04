import { BarChartLine, BoxSeam, Boxes, Gear, People, Receipt } from "react-bootstrap-icons";

export const navigationItems = [
  { href: "/orders", labelKey: "arrivals", icon: Receipt },
  { href: "/groups", labelKey: "groups", icon: Boxes },
  { href: "/products", labelKey: "products", icon: BoxSeam },
  { href: "/analytics", labelKey: "analytics", icon: BarChartLine },
  { href: "/warehouses", labelKey: "warehouses", icon: Boxes },
  { href: "/users", labelKey: "users", icon: People },
  { href: "/settings", labelKey: "settings", icon: Gear },
] as const;
