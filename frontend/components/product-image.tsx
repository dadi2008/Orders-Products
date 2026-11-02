import { Display } from "react-bootstrap-icons";

export function ProductImage({ small = false }: { small?: boolean }) {
  return <span className={`product-image ${small ? "product-image--small" : ""}`}><Display size={small ? 18 : 24} /></span>;
}
