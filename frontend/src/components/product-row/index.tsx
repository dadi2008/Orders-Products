import { Trash3 } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { productStatusLabels } from "common/constants/products";
import type { ProductRowProps } from "common/interfaces/components";
import { ProductImage } from "components/product-image";
import { formatDate, formatLongDate, formatMoney } from "lib/format";

export function ProductRow({ product, onDelete }: ProductRowProps) {
  return (
    <article className="product-row">
      <i
        className={`product-row__status product-row__status--${product.status.toLowerCase()}`}
      />
      <ProductImage small src={product.photoUrl} />
      <div className="product-row__description">
        <strong>{product.title}</strong>
        <span>{product.serialNumber}</span>
      </div>
      <span
        className={`product-row__availability product-row__availability--${product.status.toLowerCase()}`}
      >
        {productStatusLabels[product.status]}
      </span>
      <div className="product-row__guarantee">
        <small>с {formatDate(product.guaranteeStart)}</small>
        <strong>по {formatLongDate(product.guaranteeEnd)}</strong>
      </div>
      <span className="product-row__condition">
        {product.condition === "NEW" ? "новый" : "б/у"}
      </span>
      <div className="product-row__prices">
        {product.prices.map((price) => (
          <span key={price.currency}>
            {formatMoney(price.value, price.currency)}
          </span>
        ))}
      </div>
      <Link
        className="product-row__order"
        to={`/groups?orderId=${String(product.order.id)}`}
      >
        {product.order.title}
      </Link>
      <div className="product-row__date">
        <small>{formatDate(product.receivedAt, false)}</small>
        <strong>{formatDate(product.receivedAt)}</strong>
      </div>
      <button
        className="icon-button"
        onClick={onDelete}
        aria-label={`Удалить ${product.title}`}
      >
        <Trash3 />
      </button>
    </article>
  );
}
