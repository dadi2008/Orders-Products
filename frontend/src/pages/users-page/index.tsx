import { useEffect, useState } from "react";
import type { User, UsersPage } from "common/types/inventory";
import { inventoryApi } from "lib/api";

export default function UsersPage() {
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
          Пользователи <span>/ {data?.total ?? 0}</span>
        </h1>
      </div>
      {!data ? (
        <div className="page__state">Загрузка пользователей...</div>
      ) : (
        <>
          <div className="users-table">
            <div className="users-table__head">
              <span>Пользователь</span>
              <span>Email</span>
              <span>Дата создания</span>
            </div>
            {data.items.map((user: User) => (
              <div className="users-table__row" key={user.id}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>
                  {new Intl.DateTimeFormat("ru-RU").format(
                    new Date(user.createdAt),
                  )}
                </span>
              </div>
            ))}
          </div>
          <nav className="pagination" aria-label="Пагинация">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Назад
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
              Вперед
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
