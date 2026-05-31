// マッチング通知パネル
// 自分が欲しいものを誰かが持っている、または
// 自分が持っているものを誰かが欲しがっているときに表示される
export default function NotifPanel({ notifs, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, right: 0,
      width: Math.min(320, window.innerWidth - 16),
      maxHeight: "65vh", overflowY: "auto",
      background: "#fff", border: "1px solid #e0e0e0",
      borderRadius: "0 0 0 20px", zIndex: 150,
      padding: 20, boxShadow: "0 8px 32px #00000033",
    }}>
      {/* ヘッダー */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16,
        fontWeight: 700, fontSize: 15, color: "#111",
      }}>
        <span>🔔 マッチング通知</span>
        <button style={{
          background: "none", border: "none",
          color: "#888", cursor: "pointer", fontSize: 20,
        }} onClick={onClose}>×</button>
      </div>

      {/* 通知一覧 */}
      {notifs.length === 0 ? (
        <div style={{ color: "#888", fontSize: 14, padding: "12px 0" }}>
          マッチングなし
        </div>
      ) : (
        notifs.map((n, i) => (
          <div key={i} style={{
            fontSize: 13, color: "#111",
            padding: "10px 0", borderBottom: "1px solid #eee", lineHeight: 1.6,
          }}>
            {/* 欲しい/所持のバッジ */}
            <span style={{
              fontSize: 11,
              background: n.type === "want" ? "#f0fff0" : "#f0f0ff",
              color: n.type === "want" ? "#007733" : "#333",
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