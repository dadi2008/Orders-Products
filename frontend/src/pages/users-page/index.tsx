import { useEffect, useState } from "react";
import type { User, UsersPage } from "common/types/inventory";
import { inventoryApi } from "lib/api";
import { useTranslation } from "common/i18n";

export default function UsersPage() {
  const { t, locale } = useTranslation();
  const [data, setData] = useState<UsersPage | null>(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    void inventoryApi.getUsers(page).then(setData);
  }, [page]);
  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;
  return (
    <section className="page users-page">
      <div className="page__heading">
        <h1>
          {t("users")} <span>/ {data?.total ?? 0}</span>
        </h1>
      </div>
      {!data ? (
        <div className="page__state">{t("loadingUsers")}</div>
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
