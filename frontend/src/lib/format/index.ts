export const formatDate = (value: string, withYear = true) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(value));

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatMoney = (value: number | string, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
