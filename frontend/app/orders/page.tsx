"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, ListUl, PlusLg, Trash3, X } from "react-bootstrap-icons";
import { ConfirmModal } from "components/confirm-modal";
import { OrderForm } from "components/order-form";
import { ProductImage } from "components/product-image";
import { inventoryApi } from "lib/api";
import { formatDate, formatMoney } from "lib/format";
import { useAppDispatch, useAppSelector } from "lib/hooks";
import { selectOrder, setOrderFormOpen } from "lib/store";
import { Order } from "lib/types";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const selectedOrderId = useAppSelector((state) => state.ui.selectedOrderId);
  const isOrderFormOpen = useAppSelector((state) => state.ui.isOrderFormOpen);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await inventoryApi.getOrders());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const removeOrder = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inventoryApi.deleteOrder(deleting.id);
      setOrders((items) => items.filter((item) => item.id !== deleting.id));
      if (selectedOrderId === deleting.id) dispatch(selectOrder(null));
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
          aria-label="Додати прихід"
        >
          <PlusLg />
        </button>
        <h1>
          Приходи <span>/ {orders.length}</span>
        </h1>
      </div>
      {loading ? (
        <div className="page__state">Завантаження приходів...</div>
      ) : (
        <div
          className={`orders-layout ${selectedOrder ? "orders-layout--details" : ""}`}
        >
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={order.id === selectedOrderId}
                onSelect={() => dispatch(selectOrder(order.id))}
                onDelete={() => setDeleting(order)}
              />
            ))}
          </div>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => dispatch(selectOrder(null))}
              onDelete={() => setDeleting(selectedOrder)}
            />
          )}
        </div>
      )}
      {deleting && (
        <ConfirmModal
          order={deleting}
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

function OrderCard({
  order,
  selected,
  onSelect,
  onDelete,
}: {
  order: Order;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`order-card ${selected ? "order-card--selected" : ""}`}
      onClick={onSelect}
    >
      <button className="order-card__title">{order.title}</button>
      <div className="order-card__count">
        <span>
          <ListUl />
        </span>
        <strong>{order.productCount}</strong>
        <small>Продуктів</small>
      </div>
      <div className="order-card__date">
        <small>{formatDate(order.createdAt, false)}</small>
        <strong>{formatDate(order.createdAt)}</strong>
      </div>
      <div className="order-card__money">
        {Object.entries(order.totals).map(([currency, value]) => (
          <span key={currency}>{formatMoney(value, currency)}</span>
        ))}
      </div>
      <button
        className="icon-button order-card__delete"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        aria-label={`Видалити ${order.title}`}
      >
        <Trash3 />
      </button>
      {selected && (
        <span className="order-card__arrow">
          <ChevronRight />
        </span>
      )}
    </article>
  );
}

function OrderDetails({
  order,
  onClose,
  onDelete,
}: {
  order: Order;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <aside className="order-details">
      <button
        className="order-details__close"
        onClick={onClose}
        aria-label="Закрити деталі"
      >
        <X />
      </button>
      <h2>{order.title}</h2>
      <button className="order-details__add">
        <PlusLg />
        Додати продукт
      </button>
      <div className="order-details__products">
        {order.products.length ? (
          order.products.map((product) => (
            <div className="order-product" key={product.id}>
              <i />
              <ProductImage small />
              <div>
                <strong>{product.title}</strong>
                <span>{product.serialNumber}</span>
              </div>
              <em>{product.status === "AVAILABLE" ? "Вільний" : "У роботі"}</em>
              <button className="icon-button" aria-label="Видалити продукт">
                <Trash3 />
              </button>
            </div>
          ))
        ) : (
          <p className="order-details__empty">
            У цьому приході ще немає продуктів.
          </p>
        )}
      </div>
      <button className="order-details__delete" onClick={onDelete}>
        <Trash3 />
        Видалити прихід
      </button>
    </aside>
  );
}
