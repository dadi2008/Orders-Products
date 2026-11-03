import { ChevronRight, ListUl } from "react-bootstrap-icons";
import type { GroupCardProps } from "common/interfaces/components";
import { formatDate } from "lib/format";

export function GroupCard({ order, selected, onSelect }: GroupCardProps) {
  return (
    <article
      className={`group-card ${selected ? "group-card--selected" : ""}`}
      onClick={onSelect}
    >
      <button className="group-card__title" title={order.title}>
        {order.title}
      </button>
      <div className="group-card__count">
        <span>
          <ListUl />
        </span>
        <strong>{order.productCount}</strong>
        <small>Продуктов</small>
      </div>
      <div className="group-card__date">
        <small>{formatDate(order.createdAt, false)}</small>
        <strong>{formatDate(order.createdAt)}</strong>
      </div>
      {selected && (
        <span className="group-card__arrow">
          <ChevronRight />
        </span>
      )}
    </article>
  );
}
