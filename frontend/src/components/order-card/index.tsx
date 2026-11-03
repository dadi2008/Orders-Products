import { ChevronRight, ListUl, Trash3 } from "react-bootstrap-icons";
import type { OrderCardProps } from "common/interfaces/components";
import { formatDate, formatMoney } from "lib/format";
import { useTranslation } from "common/i18n";

export function OrderCard({
  order,
  selected,
  onSelect,
  onDelete,
}: OrderCardProps) {
  const { t, locale } = useTranslation();
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
        <small>{t("productsCount")}</small>
      </div>
      <div className="order-card__date">
        <small>{formatDate(order.createdAt, false, locale)}</small>
        <strong>{formatDate(order.createdAt, true, locale)}</strong>
      </div>
      <div className="order-card__money">
        {Object.entries(order.totals).map(([currency, value]) => (
          <span key={currency}>{formatMoney(value, currency, locale)}</span>
        ))}
      </div>
      <button
        className="icon-button order-card__delete"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        aria-label={`${t("delete")} ${order.title}`}
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
