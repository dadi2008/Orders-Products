import { PlusLg, Trash3, X } from "react-bootstrap-icons";
import { productStatusLabels } from "common/constants/products";
import type { OrderDetailsProps } from "common/interfaces/components";
import { ProductImage } from "components/product-image";
import { useTranslation } from "common/i18n";

export function OrderDetails({
  order,
  onClose,
  onAddProduct,
  onDelete,
  onDeleteProduct,
}: OrderDetailsProps) {
  const { t } = useTranslation();
  return (
    <aside className="order-details">
      <button
        className="order-details__close"
        onClick={onClose}
        aria-label={t("close")}
      >
        <X />
      </button>
      <h2>{order.title}</h2>
      <button className="order-details__add" onClick={onAddProduct}>
        <PlusLg />
        {t("addProduct")}
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
              <em>{productStatusLabels[product.status]}</em>
              <button
                className="icon-button"
                onClick={() => onDeleteProduct(product)}
                aria-label={t("deleteProduct")}
              >
                <Trash3 />
              </button>
            </div>
          ))
        ) : (
          <p className="order-details__empty">
            {t("noProductsInArrival")}
          </p>
        )}
      </div>
      <button className="order-details__delete" onClick={onDelete}>
        <Trash3 />
        {t("deleteArrival")}
      </button>
    </aside>
  );
}
