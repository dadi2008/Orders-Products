import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "ru" | "uk" | "en";

const messages = {
  ru: {
    arrivals: "Приходы",
    groups: "Группы",
    products: "Продукты",
    users: "Пользователи",
    settings: "Настройки",
    analytics: "Аналитика",
    search: "Поиск",
    addArrival: "Добавить приход",
    addProduct: "Добавить продукт",
    productsCount: "Продуктов",
    loadingOrders: "Загрузка приходов...",
    loadingGroups: "Загрузка групп...",
    loadingProducts: "Загрузка продуктов...",
    ordersNotFound: "Приходы не найдены.",
    groupsNotFound: "Группы не найдены.",
    close: "Закрыть",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отменить",
    type: "Тип",
    name: "Имя",
    avatar: "Аватар",
    email: "Эл. почта",
    date: "Дата",
    language: "Язык",
    chartTitle: "Стоимость продуктов по типам",
    mapTitle: "Карта складов",
    mapDescription: "Расположение главного склада в Киеве.",
    allTypes: "Все типы",
    total: "Сумма",
    loadingUsers: "Загрузка пользователей...",
    noProducts: "Продукты не найдены.",
    failedLoad: "Не удалось загрузить данные. Обновите страницу.",
    deleteProduct: "Удалить продукт",
    deleteArrival: "Удалить приход",
    confirmDeleteArrival: "Вы уверены, что хотите удалить этот приход?",
    deleting: "Удаление...",
    emptyArrival: "Пустой приход",
    noProductsInArrival: "В этом приходе еще нет продуктов.",
    noProductsInGroup: "В этой группе пока нет продуктов.",
    back: "Назад",
    next: "Вперед",
    signOut: "Выйти",
  },
  uk: {
    arrivals: "Приходи",
    groups: "Групи",
    products: "Продукти",
    users: "Користувачі",
    settings: "Налаштування",
    analytics: "Аналітика",
    search: "Пошук",
    addArrival: "Додати прихід",
    addProduct: "Додати продукт",
    productsCount: "Продуктів",
    loadingOrders: "Завантаження приходів...",
    loadingGroups: "Завантаження груп...",
    loadingProducts: "Завантаження продуктів...",
    ordersNotFound: "Приходів не знайдено.",
    groupsNotFound: "Груп не знайдено.",
    close: "Закрити",
    delete: "Видалити",
    save: "Зберегти",
    cancel: "Скасувати",
    type: "Тип",
    name: "Ім’я",
    avatar: "Аватар",
    email: "Ел. пошта",
    date: "Дата",
    language: "Мова",
    chartTitle: "Вартість продуктів за типом",
    mapTitle: "Мапа складів",
    mapDescription: "Розташування головного складу в Києві.",
    allTypes: "Усі типи",
    total: "Сума",
    loadingUsers: "Завантаження користувачів...",
    noProducts: "Продуктів не знайдено.",
    failedLoad: "Не вдалося завантажити дані. Оновіть сторінку.",
    deleteProduct: "Видалити продукт",
    deleteArrival: "Видалити прихід",
    confirmDeleteArrival: "Ви впевнені, що хочете видалити цей прихід?",
    deleting: "Видалення...",
    emptyArrival: "Порожній прихід",
    noProductsInArrival: "У цьому приході ще немає продуктів.",
    noProductsInGroup: "У цій групі ще немає продуктів.",
    back: "Назад",
    next: "Далі",
    signOut: "Вийти",
  },
  en: {
    arrivals: "Arrivals",
    groups: "Groups",
    products: "Products",
    users: "Users",
    settings: "Settings",
    analytics: "Analytics",
    search: "Search",
    addArrival: "Add arrival",
    addProduct: "Add product",
    productsCount: "Products",
    loadingOrders: "Loading arrivals...",
    loadingGroups: "Loading groups...",
    loadingProducts: "Loading products...",
    ordersNotFound: "No arrivals found.",
    groupsNotFound: "No groups found.",
    close: "Close",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    type: "Type",
    name: "Name",
    avatar: "Avatar",
    email: "Email",
    date: "Date",
    language: "Language",
    chartTitle: "Product value by type",
    mapTitle: "Warehouse map",
    mapDescription: "Main warehouse location in Kyiv.",
    allTypes: "All types",
    total: "Total",
    loadingUsers: "Loading users...",
    noProducts: "No products found.",
    failedLoad: "Unable to load data. Refresh the page.",
    deleteProduct: "Delete product",
    deleteArrival: "Delete arrival",
    confirmDeleteArrival: "Are you sure you want to delete this arrival?",
    deleting: "Deleting...",
    emptyArrival: "Empty arrival",
    noProductsInArrival: "There are no products in this arrival yet.",
    noProductsInGroup: "There are no products in this group yet.",
    back: "Back",
    next: "Next",
    signOut: "Sign out",
  },
} as const;

export type TranslationKey = keyof (typeof messages)["ru"];

type I18nContextValue = {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const defaultValue: I18nContextValue = {
  language: "ru",
  locale: "ru-RU",
  setLanguage: () => undefined,
  t: (key) => messages.ru[key],
};

const I18nContext = createContext<I18nContextValue>(defaultValue);

const localeByLanguage: Record<Language, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem("inventory-language");
    return saved === "uk" || saved === "en" || saved === "ru" ? saved : "ru";
  });

  useEffect(() => {
    window.localStorage.setItem("inventory-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: localeByLanguage[language],
      setLanguage,
      t: (key) => messages[language][key],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
