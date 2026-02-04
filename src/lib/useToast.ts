import { create } from "zustand";

let id = 0;
export const useToast = create((set) => ({
  toasts: [], // {id, msg}
  push: (msg, ms = 1800) => {
    const tid = ++id;
    set((s) => ({ toasts: [...s.toasts, { id: tid, msg }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== tid) })),
      ms,
    );
  },
  remove: (tid) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== tid) })),
}));
