import { useState, useMemo, useEffect } from "react";
import { useCart } from "../lib/Cart";
import { useToast } from "../lib/toast";

export default function CheckoutDrawer({ onClose, onPlaced  }) {
  const { items, clear } = useCart();
  const push = useToast((s) => s.push);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [form, setForm] = useState({ name:"", email:"", address:"", promo:"" });
  const subtotal = useMemo(() => items.reduce((t,i)=>t+i.price*i.qty,0), [items]);
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 5;
  const promoOff = form.promo.trim().toUpperCase() === "SAVE10" ? subtotal * 0.10 : 0;
  const total = Math.max(0, subtotal + shipping - promoOff);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) {
      push("Please fill all required fields");
      return;
    }
    push(`Order placed! Total €${total.toFixed(2)}`);
    clear();
    onPlaced?.();
    onClose();
  };

  // z-index so backdrop is clickable and drawer is on top
  return (
    <>
      <div
        className="panel-backdrop"
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:60 }}
        onClick={onClose}
      />
      <aside
        className="panel"
        style={{ position:"fixed", top:0, right:0, height:"100%", width:"100%", maxWidth:420, zIndex:70 }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 className="card__title">Checkout</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="card" style={{ padding:12, marginTop:12 }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Order summary</div>
          {items.length === 0 ? (
            <div className="card__price">Your cart is empty.</div>
          ) : (
            <>
              {items.map(i => (
                <div key={i.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span>{i.title} × {i.qty}</span>
                  <span>€{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ border:"none", borderTop:"1px solid var(--border)", margin:"8px 0" }}/>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span>Subtotal</span><span>€{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span>Shipping</span><span>{shipping ? `€${shipping.toFixed(2)}` : "Free"}</span>
              </div>
              {promoOff > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", color:"#059669" }}>
                  <span>Promo (SAVE10)</span><span>−€{promoOff.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, marginTop:8 }}>
                <span>Total</span><span>€{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={onSubmit} style={{ display:"grid", gap:10, marginTop:12 }}>
          <input name="name" placeholder="Full name*" value={form.name} onChange={onChange}
                 style={{ padding:10, border:"1px solid var(--border)", borderRadius:10 }} />
          <input name="email" placeholder="Email*" value={form.email} onChange={onChange}
                 style={{ padding:10, border:"1px solid var(--border)", borderRadius:10 }} />
          <textarea name="address" placeholder="Shipping address*" rows={3} value={form.address} onChange={onChange}
                 style={{ padding:10, border:"1px solid var(--border)", borderRadius:10 }} />
          <div style={{ display:"flex", gap:8 }}>
            <input name="promo" placeholder="Promo code (SAVE10)" value={form.promo} onChange={onChange}
                   style={{ flex:1, padding:10, border:"1px solid var(--border)", borderRadius:10 }} />
            <button type="button" className="btn" onClick={()=>push("Promo applied if valid")}>Apply</button>
          </div>
          <button type="submit" className="btn btn--primary" onClick={onPlaced} disabled={items.length===0}>
            Place order
          </button>
        </form>
      </aside>
    </>
  );
}
