"use client";

import { Trash3, X } from "react-bootstrap-icons";
import { Order } from "../lib/types";
import { ProductImage } from "./product-image";

type ConfirmModalProps = { order: Order; busy: boolean; onClose: () => void; onConfirm: () => void };

export function ConfirmModal({ order, busy, onClose, onConfirm }: ConfirmModalProps) {
  const product = order.products[0];
  return (
    <div className="modal-overlay" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-order-title">
        <button className="confirm-modal__close" onClick={onClose} aria-label="Закрити"><X /></button>
        <div className="confirm-modal__content"><h2 id="delete-order-title">Ви впевнені, що хочете видалити цей прихід?</h2>
          <div className="confirm-modal__product"><i /><ProductImage small /><div><strong>{product?.title ?? order.title}</strong><span>{product?.serialNumber ?? "Порожній прихід"}</span></div></div>
        </div>
        <footer className="confirm-modal__actions"><button className="button button--ghost" onClick={onClose} disabled={busy}>Скасувати</button><button className="button button--danger" onClick={onConfirm} disabled={busy}><Trash3 size={14} />{busy ? "Видалення..." : "Видалити"}</button></footer>
      </section>
    </div>
  );
}
