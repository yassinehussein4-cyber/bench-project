// src/components/ProductGrid.jsx
import Add from "../assets/Add.svg";
import { useCart } from "../lib/Cart";

export default function ProductGrid({ products = [], onSelectProduct }) {
  const addToCart = useCart((s) => s.add);

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      {products.map((p) => (
        <article
          key={p.id}
          onClick={() => onSelectProduct?.(p)}
          tabIndex={0}
          role="button"
          style={{
            textAlign: "left",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 8,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.title}
              style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 160,
                display: "grid",
                placeItems: "center",
                background: "#f3f4f6",
                color: "#6b7280",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
              }}
            >
              No image
            </div>
          )}

          <div style={{ marginTop: 8, fontWeight: 600 }}>{p.title}</div>
          {/* show category name if present */}
          {p.categoryTitle && (
            <div style={{ color: "#6b7280", fontSize: 12 }}>{p.categoryTitle}</div>
          )}
          <div style={{ color: "#6b7280" }}>€{p.price}</div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(p, 1);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
              padding: "6px 10px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
              cursor: "pointer",
              fontWeight: 500,
            }}
            aria-label={`Add ${p.title} to cart`}
          >
            <span>Add to cart</span>
            <img src={Add} alt="" style={{ width: 16, height: 16 }} />
          </button>
        </article>
      ))}

      {products.length === 0 && (
        <div style={{ color: "crimson", fontWeight: 600 }}>No products in this category.</div>
      )}
    </div>
  );
}
