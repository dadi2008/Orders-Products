import { ChevronRight, ListUl, Trash3 } from "react-bootstrap-icons";
import type { OrderCardProps } from "common/interfaces/components";
import { formatDate, formatMoney } from "lib/format";

export function OrderCard({
  order,
  selected,
  onSelect,
  onDelete,
}: OrderCardProps) {
  return (
    <article
      className={`order-card ${selected ? "order-card--selected" : ""}`}
      onClick={onSelect}
    >
      <button className="order-card__title" title={order.title}>
        {order.title}
      </button>
      <div className="order-card__count">
        <span>
          <ListUl />
        </span>
        <strong>{order.productCount}</strong>
        <small>Продуктов</small>
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
        aria-label={`Удалить ${order.title}`}
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
