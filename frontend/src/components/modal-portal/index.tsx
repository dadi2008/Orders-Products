import { createPortal } from "react-dom";
import type { ModalPortalProps } from "common/interfaces/components";

export function ModalPortal({ children }: ModalPortalProps) {
  return createPortal(children, document.body);
}
