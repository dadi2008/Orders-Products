import { BoxSeam, Boxes, Gear, People, Receipt } from "react-bootstrap-icons";

export const navigationItems = [
  { href: "/orders", label: "Приходы", icon: Receipt },
  { href: "/groups", label: "Группы", icon: Boxes },
  { href: "/products", label: "Продукты", icon: BoxSeam },
  { href: "/users", label: "Пользователи", icon: People },
  { href: "/settings", label: "Настройки", icon: Gear },
] as const;
