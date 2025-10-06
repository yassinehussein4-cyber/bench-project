import { useToast } from "../lib/toast";

export default function Toasts() {
  const { toasts, remove } = useToast();
  return (
    <div style={{ position:"fixed", top:16, right:16, display:"grid", gap:8, zIndex:60 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{
            background:"#111827", color:"#fff", padding:"10px 14px",
            borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,.18)", cursor:"pointer"
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
