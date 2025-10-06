export default function OrderPlacedModal({ onClose }) {
  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        style={{
          position:"fixed", inset:0, display:"grid", placeItems:"center", zIndex:80
        }}
      >
        <div style={{
          width:360, background:"#fff", border:"1px solid #e5e7eb",
          borderRadius:14, padding:20, textAlign:"center", boxShadow:"0 10px 30px rgba(0,0,0,.15)"
        }}>
          <div style={{ fontSize:18, fontWeight:700 }}>Order placed 🎉</div>
          <p style={{ color:"#6b7280", marginTop:6 }}>
            You'll get a confirmation email shortly.
          </p>
          <button className="btn btn--primary" style={{ marginTop:12 }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
