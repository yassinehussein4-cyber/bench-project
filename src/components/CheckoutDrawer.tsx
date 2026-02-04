import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "../lib/useCart";
import { useToast } from "../lib/useToast";

type CheckoutDrawerProps = {
  readonly onClose: () => void;
  readonly onPlaced?: () => void;
};

type CartItem = { id: string; title: string; price: number; qty: number };

export default function CheckoutDrawer({
  onClose,
  onPlaced,
}: CheckoutDrawerProps) {
  const { items, clear } = useCart() as {
    items: CartItem[];
    clear: () => void;
  };
  const push = useToast((s: any) => s.push) as (msg: string) => void;

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: { name: "", email: "", address: "", promo: "" },
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
    push("Order placed!");
    clear();
    onPlaced?.();
    onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close drawer"
        className="panel-backdrop-drawer"
        onClick={onClose}
      />

      <aside className="panel-drawer">
        <div className="drawer__header">
          <h3 className="card__title">Checkout</h3>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="card card__body">
          <div className="font-semibold mb-2">Order summary</div>

          {items.length === 0 ? (
            <div className="card__price">Your cart is empty.</div>
          ) : (
            <>
              {items.map((i: CartItem) => (
                <div key={i.id} className="flex justify-between mb-1.5">
                  <span>
                    {i.title} × {i.qty}
                  </span>
                  <span>€{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}

              <hr className="hr-border" />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping ? `€${shipping.toFixed(2)}` : "Free"}</span>
              </div>

              {promoOff > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promo (SAVE10)</span>
                  <span>−€{promoOff.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-3"
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
              className="input-bordered"
            />
            {errors.name && (
              <p className="text-error text-sm">{errors.name.message}</p>
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
              className="input-bordered"
            />
            {errors.email && (
              <p className="text-error text-sm">{errors.email.message}</p>
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
              className="input-bordered"
            />
            {errors.address && (
              <p className="text-error text-sm">{errors.address.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Promo code (SAVE10)"
              {...register("promo")}
              className="promo-input"
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
            <p className="text-error text-sm-lg">
              Please fill in all required fields.
            </p>
          )}

          <button
            type="submit"
            className="btn btn--secondary"
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Placing..." : "Place order"}
          </button>
        </form>
      </aside>
    </>
  );
}
