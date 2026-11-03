import { useEffect, useMemo, useState } from "react";
import { PlusLg } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import type { Order } from "common/types/inventory";
import { ConfirmModal } from "components/confirm-modal";
import { OrderCard } from "components/order-card";
import { OrderForm } from "components/order-form";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import { inventoryApi } from "lib/api";
import { matchesSearch } from "lib/search";
import { setOrderFormOpen } from "store/slices/ui.slice";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOrderFormOpen = useAppSelector((state) => state.ui.isOrderFormOpen);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesSearch(searchQuery, [order.title])),
    [orders, searchQuery],
  );
  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      try {
        const items = await inventoryApi.getOrders();
        if (isActive) {
          setOrders(items);
          setLoadError(false);
        }
      } catch {
        if (isActive) setLoadError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const removeOrder = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inventoryApi.deleteOrder(deleting.id);
      setOrders((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const createOrder = async (title: string, description: string) => {
    const created = await inventoryApi.createOrder(
      title,
      description || undefined,
    );
    setOrders((items) => [created, ...items]);
  };

  return (
    <section className="page orders-page">
      <div className="page__heading">
        <button
          className="round-button"
          onClick={() => dispatch(setOrderFormOpen(true))}
          aria-label="Добавить приход"
        >
          <PlusLg />
        </button>
        <h1>
          Приходы <span>/ {filteredOrders.length}</span>
        </h1>
      </div>
      {loading ? (
        <div className="page__state">Загрузка приходов...</div>
      ) : loadError ? (
        <div className="page__state" role="alert">
          Не удалось загрузить приходы. Обновите страницу.
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selected={false}
              onSelect={() => navigate(`/groups?orderId=${String(order.id)}`)}
              onDelete={() => setDeleting(order)}
            />
          ))}
          {!filteredOrders.length && (
            <div className="page__state">Приходы не найдены.</div>
          )}
        </div>
      )}
      {deleting && (
        <ConfirmModal
          confirmationTitle="Вы уверены, что хотите удалить этот приход?"
          itemTitle={deleting.products[0]?.title ?? deleting.title}
          itemSubtitle={deleting.products[0]?.serialNumber ?? "Пустой приход"}
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={removeOrder}
        />
      )}
      {isOrderFormOpen && (
        <OrderForm
          onClose={() => dispatch(setOrderFormOpen(false))}
          onSubmit={createOrder}
        />
      )}
    </section>
  );
}
