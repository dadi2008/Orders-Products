import { Trash3 } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import {
  productConditionLabelKeys,
  productStatusLabelKeys,
} from "common/constants/products";
import type { ProductRowProps } from "common/interfaces/components";
import { ProductImage } from "components/product-image";
import { useTranslation } from "common/i18n";
import { formatDate, formatLongDate, formatMoney } from "lib/format";

export function ProductRow({ product, onDelete }: ProductRowProps) {
  const { t, locale } = useTranslation();
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
        {t(productStatusLabelKeys[product.status])}
      </span>
      <div className="product-row__guarantee">
        <small>{t("guaranteeFrom")} {formatDate(product.guaranteeStart, true, locale)}</small>
        <strong>{t("guaranteeUntil")} {formatLongDate(product.guaranteeEnd, locale)}</strong>
      </div>
      <span className="product-row__condition">
        {t(productConditionLabelKeys[product.condition])}
      </span>
      <div className="product-row__prices">
        {product.prices.map((price) => (
          <span key={price.currency}>
            {formatMoney(price.value, price.currency, locale)}
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
        <small>{formatDate(product.receivedAt, false, locale)}</small>
        <strong>{formatDate(product.receivedAt, true, locale)}</strong>
      </div>
      <button
        className="icon-button"
        onClick={onDelete}
        aria-label={`${t("delete")} ${product.title}`}
      >
        <Trash3 />
      </button>
    </article>
  );
}
