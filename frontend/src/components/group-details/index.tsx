import { PlusLg, Trash3, X } from "react-bootstrap-icons";
import { productStatusLabelKeys } from "common/constants/products";
import type { GroupDetailsProps } from "common/interfaces/components";
import { ProductImage } from "components/product-image";
import { useTranslation } from "common/i18n";

export function GroupDetails({
  order,
  onClose,
  onAddProduct,
  onDelete,
  onDeleteProduct,
}: GroupDetailsProps) {
  const { t } = useTranslation();
  return (
    <aside className="group-details">
      <button
        className="group-details__close"
        onClick={onClose}
        aria-label={t("close")}
      >
        <X />
      </button>
      <h2 title={order.title}>{order.title}</h2>
      <button className="group-details__add" onClick={onAddProduct}>
        <PlusLg />
        {t("addProduct")}
      </button>
      <div className="group-details__products">
        {order.products.length ? (
          order.products.map((product) => (
            <div className="group-product" key={product.id}>
              <i />
              <ProductImage small src={product.photoUrl} />
              <div>
                <strong title={product.title}>{product.title}</strong>
                <span>{product.serialNumber}</span>
              </div>
              <em>{t(productStatusLabelKeys[product.status])}</em>
              <button
                className="icon-button"
                onClick={() => onDeleteProduct(product)}
                aria-label={`${t("delete")} ${product.title}`}
              >
                <Trash3 />
              </button>
            </div>
          ))
        ) : (
          <p className="group-details__empty">
            {t("noProductsInGroup")}
          </p>
        )}
      </div>
      <button className="group-details__delete" onClick={onDelete}>
        <Trash3 />
        {t("deleteArrival")}
      </button>
    </aside>
  );
}
