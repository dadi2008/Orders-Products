export const formatDate = (value: string, withYear = true, locale = "ru-RU") =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(value));

export const formatLongDate = (value: string, locale = "ru-RU") =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatMoney = (
  value: number | string,
  currency: string,
  locale = "ru-RU",
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
