"use client";

import { FormEvent, useState } from "react";
import { X } from "react-bootstrap-icons";

type OrderFormProps = { onClose: () => void; onSubmit: (title: string, description: string) => Promise<void> };

export function OrderForm({ onClose, onSubmit }: OrderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3) { setError("Назва має містити щонайменше 3 символи"); return; }
    setBusy(true);
    try { await onSubmit(title.trim(), description.trim()); onClose(); } catch { setError("Не вдалося створити прихід. Спробуйте ще раз."); } finally { setBusy(false); }
  };

  return <div className="modal-overlay"><form className="form-modal" onSubmit={submit}><button type="button" className="confirm-modal__close" onClick={onClose} aria-label="Закрити"><X /></button><h2>Новий прихід</h2><label>Назва приходу<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} autoFocus /></label><label>Опис<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} /></label>{error && <p className="form-modal__error">{error}</p>}<div className="form-modal__actions"><button type="button" className="button button--plain" onClick={onClose}>Скасувати</button><button className="button button--primary" disabled={busy}>{busy ? "Збереження..." : "Створити"}</button></div></form></div>;
}
