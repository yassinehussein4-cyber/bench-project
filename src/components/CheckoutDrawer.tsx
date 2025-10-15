import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "../lib/Cart";
import { useToast } from "../lib/toast";

type CheckoutDrawerProps = {
  onClose: () => void;
  onPlaced?: () => void;
};

export default function CheckoutDrawer({ onClose, onPlaced }: CheckoutDrawerProps) {
  const { items, clear } = useCart();
  const push = useToast((s) => s.push);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isSubmitted }, setValue, reset } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange", defaultValues: { name: "", email: "", address: "", promo: "" },
  });

  const subtotal = useMemo(
    () => items.reduce((t, i) => t + i.price * i.qty, 0),
    [items]
  );
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 5;

  const promoCode = (watch("promo") || "").trim().toUpperCase();
  const promoOff = promoCode === "SAVE10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - promoOff);
  const onSubmit = async () => {
    push(`Order placed!`);
    reset();
    clear();
    onPlaced?.();
    onClose();
  };

  return (
    <>
      <div
        className="panel-backdrop"
        style={{position: "fixed",inset: 0,background: "rgba(0,0,0,.4)",zIndex: 60}}
        onClick={onClose}
      />
      <aside
        className="panel"
        style={{position: "fixed",top: 0,right: 0,height: "100%",width: "100%",maxWidth: 420,zIndex: 70}}
      >
        <div
          style={{display: "flex",justifyContent: "space-between",alignItems: "center",}}
        >
          <h3 className="card__title">Checkout</h3>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Order summary</div>
          {items.length === 0 ? (
            <div className="card__price">Your cart is empty.</div>
          ) : (
            <>
              {items.map((i) => (
                <div
                  key={i.id}
                  style={{display: "flex",justifyContent: "space-between",marginBottom: 6}}
                >
                  <span>
                    {i.title} × {i.qty}
                  </span>
                  <span>€{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border)",
                  margin: "8px 0",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Shipping</span>
                <span>{shipping ? `€${shipping.toFixed(2)}` : "Free"}</span>
              </div>
              {promoOff > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#059669",
                  }}
                >
                  <span>Promo (SAVE10)</span>
                  <span>−€{promoOff.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{display: "flex",justifyContent: "space-between",fontWeight: 700,marginTop: 8}}
              >
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
          noValidate
        >
          <div>
            <input
              placeholder="Full name*"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
              style={{padding: 10,border: "1px solid var(--border)",borderRadius: 10,width: "100%",
              }}
            />
            {errors.name && (
              <p style={{ color: "#dc2626", fontSize: 12 }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <input
              placeholder="Email*"
              inputMode="email"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              style={{padding: 10,border: "1px solid var(--border)",borderRadius: 10,width: "100%",}}
            />
            {errors.email && (
              <p style={{ color: "#dc2626", fontSize: 12 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Shipping address*"
              rows={3}
              aria-invalid={!!errors.address}
              {...register("address", {
                required: "Address is required",
                minLength: { value: 6, message: "Add more address details" },
              })}
              style={{padding: 10,border: "1px solid var(--border)",borderRadius: 10,width: "100%",
              }}
            />
            {errors.address && (
              <p style={{ color: "#dc2626", fontSize: 12 }}>
                {errors.address.message}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Promo code (SAVE10)"
              {...register("promo")}
              style={{flex: 1,padding: 10,border: "1px solid var(--border)",borderRadius: 10}}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                const v = (promoCode || "").trim().toUpperCase();
                push(v === "SAVE10" ? "Promo applied" : "Invalid promo");
                setValue("promo", v, { shouldDirty: true });
              }}
            >
              Apply
            </button>
          </div>

          {isSubmitted && Object.keys(errors).length > 0 && (
            <p style={{ color: "#dc2626", fontSize: 13 }}>
              Please fill in all required fields.
            </p>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Placing..." : "Place order"}
          </button>
        </form>
      </aside>
    </>
  );
}
