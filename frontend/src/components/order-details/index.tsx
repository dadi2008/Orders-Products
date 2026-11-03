import { PlusLg, Trash3, X } from "react-bootstrap-icons";
import { productStatusLabels } from "common/constants/products";
import type { OrderDetailsProps } from "common/interfaces/components";
import { ProductImage } from "components/product-image";

export function OrderDetails({
  order,
  onClose,
  onDelete,
  onDeleteProduct,
}: OrderDetailsProps) {
  return (
    <aside className="order-details">
      <button
        className="order-details__close"
        onClick={onClose}
        aria-label="Закрыть детали"
      >
        <X />
      </button>
      <h2>{order.title}</h2>
      <button className="order-details__add">
        <PlusLg />
        Добавить продукт
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
                aria-label="Удалить продукт"
              >
                <Trash3 />
              </button>
            </div>
          ))
        ) : (
          <p className="order-details__empty">
            В этом приходе еще нет продуктов.
          </p>
        )}
      </div>
      <button className="order-details__delete" onClick={onDelete}>
        <Trash3 />
        Удалить приход
      </button>
    </aside>
  );
}
