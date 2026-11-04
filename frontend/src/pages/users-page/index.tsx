import { useEffect, useState } from "react";
import type { User, UsersPage } from "common/types/inventory";
import { inventoryApi } from "lib/api";
import { useTranslation } from "common/i18n";
import { PageSkeleton } from "components/page-skeleton";
import { useAppSelector } from "hooks/use-app-store";
import { useDebouncedValue } from "hooks/use-debounced-value";

export default function UsersPage() {
  const { t, locale } = useTranslation();
  const [data, setData] = useState<UsersPage | null>(null);
  const [page, setPage] = useState(1);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  useEffect(() => {
    let isActive = true;
    void inventoryApi
      .getUsers(page, 10, debouncedSearchQuery)
      .then((result) => {
        if (isActive) setData(result);
      });
    return () => {
      isActive = false;
    };
  }, [debouncedSearchQuery, page]);
  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;
  return (
    <section className="page users-page">
      <div className="page__heading">
        <h1>
          {t("users")} <span>/ {data?.total ?? 0}</span>
        </h1>
      </div>
      {!data ? (
        <PageSkeleton variant="users" compact />
      ) : (
        <>
          <div className="users-table">
            <div className="users-table__head">
              <span>{t("users")}</span>
              <span>{t("email")}</span>
              <span>{t("date")}</span>
            </div>
            {data.items.map((user: User) => (
              <div className="users-table__row" key={user.id}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>
                  {new Intl.DateTimeFormat(locale).format(
                    new Date(user.createdAt),
                  )}
                </span>
              </div>
            ))}
          </div>
          <nav className="pagination" aria-label={t("users")}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              {t("back")}
            </button>
            {Array.from({ length: pages }, (_, index) => (
              <button
                className={page === index + 1 ? "pagination__active" : ""}
                key={index}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              {t("next")}
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
