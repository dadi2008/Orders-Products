import { Display } from "react-bootstrap-icons";
import type { ProductImageProps } from "common/interfaces/components";

export function ProductImage({ small = false, src }: ProductImageProps) {
  return (
    <span className={`product-image ${small ? "product-image--small" : ""}`}>
      {src ? (
        <img src={src} alt="Изображение продукта" />
      ) : (
        <Display size={small ? 18 : 24} />
      )}
    </span>
  );
}
