import { create } from "zustand";

export const useCart = create((set) => ({
  items: [], 
  // Add product to cart (or increase qty if it exists)
  add: (product, qty = 1) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === product.id);

      if (existingItem) {
        // If it exists, update its qty
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i,
          ),
        };
      }

      // If it doesn't exist, add it as new
      return { items: [...state.items, { ...product, qty }] };
    });
  },

  inc: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i,
      ),
    }));
  },

  dec: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i,
      ),
    }));
  },

  setQty: (id, qty) => {
    set((state) => {
      const safeQty = Math.max(1, Number.isFinite(qty) ? qty : 1);

      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty: safeQty } : i,
        ),
      };
    });
  },

  remove: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  clear: () => {
    set({ items: [] });
  },
}));
