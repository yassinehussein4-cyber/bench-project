import { useEffect } from "react";
import { useCart } from "../lib/Cart";

export default function CartView({ onClose, onCheckout }) {
  const { items, inc, dec, setQty, remove, clear } = useCart();
  const total = items.reduce((t, i) => t + i.price * i.qty, 0);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  console.log("[CartView] mounted. items:", items.length);

  return (
    <>
      <div className="panel-backdrop" onClick={() => { console.log("[CartView] backdrop -> close"); onClose(); }} />

      <aside className="panel">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 className="card__title">Your cart</h3>
          <button className="btn" onClick={() => { console.log("[CartView] button -> close"); onClose(); }}>
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ marginTop: 12 }}>Your cart is empty.</p>
        ) : (
          <>
            <div style={{ display:"grid", gap:12, marginTop:12 }}>
              {items.map((i) => (
                <div key={i.id} className="card" style={{ display:"flex", gap:12, padding:12 }}>
                  <img src={i.imageUrl} alt={i.title} style={{ width:72, height:72, objectFit:"cover", borderRadius:12 }} />
                  <div style={{ flex:1 }}>
                    <div className="card__title">{i.title}</div>
                    <div className="card__price">€{i.price} each</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                      <button className="btn" onClick={() => dec(i.id)}>−</button>
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) => setQty(i.id, Math.max(1, parseInt(e.target.value || "1", 10)))}
                        style={{ width:70, padding:8, borderRadius:10, border:"1px solid var(--border)" }}
                      />
                      <button className="btn" onClick={() => inc(i.id)}>+</button>
                      <button className="btn" onClick={() => remove(i.id)} style={{ marginLeft:"auto" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ alignSelf:"center", fontWeight:600 }}>
                    €{(i.price * i.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16 }}>
              <div className="card__title">Total: €{total.toFixed(2)}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn" onClick={clear}>Clear</button>
                <button className="btn btn--primary" onClick={() => { console.log("[CartView] checkout -> open"); onCheckout(); }}>
                  Proceed to checkout
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
