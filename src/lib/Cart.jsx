import { create } from "zustand";

export const useCart = create((set) => ({
  // 🛒 State: the list of cart items
  items: [], // each item: { id, title, price, qty, imageUrl, category }

  

  // ➕ Add product to cart (or increase qty if it exists)
  add: (product, qty = 1) => {
    set((state) => {
      // 1️⃣ Check if the product already exists in cart
      const existingItem = state.items.find((i) => i.id === product.id);

      if (existingItem) {
        // 2️⃣ If it exists, update its qty
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }

      // 3️⃣ If it doesn't exist, add it as new
      return { items: [...state.items, { ...product, qty }] };
    });
  },

  // 🔼 Increase quantity by 1
  inc: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      ),
    }));
  },

  // 🔽 Decrease quantity by 1 (but never below 1)
  dec: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      ),
    }));
  },

  // ✏ Set a specific quantity
  setQty: (id, qty) => {
    set((state) => {
      // prevent NaN or zero/negative
      const safeQty = Math.max(1, Number.isFinite(qty) ? qty : 1);

      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty: safeQty } : i
        ),
      };
    });
  },

  // ❌ Remove a product completely
  remove: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  // 🧹 Clear the whole cart
  clear: () => {
    set({ items: [] });
  },


}));
