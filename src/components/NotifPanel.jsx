// マッチング通知パネル
// 自分が欲しいものを誰かが持っている、または
// 自分が持っているものを誰かが欲しがっているときに表示される
export default function NotifPanel({ notifs, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, right: 0,
      width: Math.min(320, window.innerWidth - 16),
      maxHeight: "65vh", overflowY: "auto",
      background: "var(--bg)", border: "1px solid var(--border)",
      borderRadius: "0 0 0 20px", zIndex: 150,
      padding: 20, boxShadow: "0 8px 32px #00000033",
    }}>
      {/* ヘッダー */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16,
        fontWeight: 700, fontSize: 15, color: "var(--text)",
      }}>
        <span>🔔 マッチング通知</span>
        <button style={{
          background: "none", border: "none",
          color: "var(--text-muted)", cursor: "pointer", fontSize: 20,
        }} onClick={onClose}>×</button>
      </div>

      {/* 通知一覧 */}
      {notifs.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "12px 0" }}>
          マッチングなし
        </div>
      ) : (
        notifs.map((n, i) => (
          <div key={i} style={{
            fontSize: 13, color: "var(--text)",
            padding: "10px 0", borderBottom: "1px solid var(--border4)", lineHeight: 1.6,
          }}>
            {/* 欲しい/所持のバッジ */}
            <span style={{
              fontSize: 11,
              background: n.type === "want" ? "rgba(0,119,51,0.15)" : "rgba(51,51,204,0.1)",
              color: n.type === "want" ? "#007733" : "var(--text2)",
              borderRadius: 6, padding: "2px 8px",
              marginRight: 8, fontWeight: 700,
            }}>
              {n.type === "want" ? "🥕 欲しい" : "💎 所持"}
            </span>
            {n.msg}
          </div>
        ))
      )}
    </div>
  );
}
