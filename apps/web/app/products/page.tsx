"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, PlusLg, Trash3 } from "react-bootstrap-icons";
import { ProductImage } from "../../components/product-image";
import { inventoryApi } from "../../lib/api";
import { formatDate, formatLongDate, formatMoney, statusLabel } from "../../lib/format";
import { sum } from "../../lib/wasm";
import { Product } from "../../lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try { setProducts(await inventoryApi.getProducts(type || undefined)); } finally { setLoading(false); }
  }, [type]);

  useEffect(() => { inventoryApi.getTypes().then(setTypes).catch(() => setTypes([])); }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { sum(products.flatMap((product) => product.prices.filter((price) => price.currency === "USD").map((price) => Number(price.value)))).then(setTotal); }, [products]);

  const productCount = useMemo(() => products.length, [products]);
  return <section className="page products-page"><div className="page__heading"><h1>Продукти <span>/ {productCount}</span></h1><label className="filter">Тип:<span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Усі типи</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown /></span></label><div className="products-page__total">Сума: {formatMoney(total, "USD")}</div></div>{loading ? <div className="page__state">Завантаження продуктів...</div> : <div className="products-table">{products.map((product) => <ProductRow key={product.id} product={product} />)}{!products.length && <div className="page__state">Продуктів цього типу не знайдено.</div>}</div>}</section>;
}

function ProductRow({ product }: { product: Product }) {
  return <article className="product-row"><i className={`product-row__status product-row__status--${product.status.toLowerCase()}`} /><ProductImage small /><div className="product-row__description"><strong>{product.title}</strong><span>{product.serialNumber}</span></div><span className={`product-row__availability product-row__availability--${product.status.toLowerCase()}`}>{statusLabel[product.status]}</span><div className="product-row__guarantee"><small>з {formatDate(product.guaranteeStart)}</small><strong>по {formatLongDate(product.guaranteeEnd)}</strong></div><span className="product-row__condition">{product.condition === "NEW" ? "новий" : "б/в"}</span><div className="product-row__prices">{product.prices.map((price) => <span key={price.currency}>{formatMoney(price.value, price.currency)}</span>)}</div><a className="product-row__order" href={`/orders#${product.order.id}`}>{product.order.title}</a><div className="product-row__date"><small>{formatDate(product.receivedAt, false)}</small><strong>{formatDate(product.receivedAt)}</strong></div><button className="icon-button" aria-label={`Видалити ${product.title}`}><Trash3 /></button></article>;
}
