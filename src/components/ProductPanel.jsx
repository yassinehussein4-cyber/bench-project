import { useEffect, useRef, useState } from "react";
import { useCart } from "../lib/Cart";
import { useToast } from "../lib/toast";

export default function ProductPanel({ product, onClose }) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const [qty, setQty] = useState(1);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!product) return;

    setQty(1);

    closeRef.current?.focus?.();

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;

  const clamp = (n) => Math.max(1, Math.floor(Number.isFinite(n) ? n : 1));
  const hasImage = Boolean(product.imageUrl);
  const subtotal = (product.price * qty).toFixed(2);

  const addToCart = () => {
    add(product, qty);
    push(`Added ${qty} × ${product.title} (€${subtotal})`);
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Product ${product.title}`}
      >
        <button
          ref={closeRef}
          className="modal-card__close btn"
          onClick={onClose}
          aria-label="Close product dialog"
        >
          ✕
        </button>

        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="modal-card__img"
          />
        ) : (
          <div
            className="modal-card__img"
            style={{
              display: "grid",
              placeItems: "center",
              background: "#f3f4f6",
              color: "#6b7280",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            No image
          </div>
        )}

        <h3 className="card__title" style={{ marginTop: 10 }}>
          {product.title}
        </h3>
        <div className="card__price">€{product.price}</div>

        <div className="modal-card__qty">
          <button
            className="btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(clamp(parseInt(e.target.value, 10)))}
            onBlur={(e) => setQty(clamp(parseInt(e.target.value, 10)))}
            className="modal-card__input"
            inputMode="numeric"
          />
          <button
            className="btn"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div style={{ fontWeight: 600, marginTop: 6 }}>
          Subtotal: €{subtotal}
        </div>

        <button
          className="btn btn--primary"
          style={{ marginTop: 10 }}
          onClick={addToCart}
        >
          Add {qty} to cart
        </button>
      </div>
    </>
  );
}
