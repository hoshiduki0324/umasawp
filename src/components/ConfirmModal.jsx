// 削除確認モーダル
// 削除ボタンを押したときに「本当に削除しますか？」と確認するダイアログ
export default function ConfirmModal({ message, onOk, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#fff", border: "1px solid #e0e0e0", borderRadius: 20,
        padding: "28px 24px", maxWidth: 320, width: "100%",
      }}>
        <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 24, color: "#111" }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              flex: 1, background: "#f0f0f0", border: "1px solid #e0e0e0",
              color: "#666", borderRadius: 12, padding: "12px 0",
              fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            }}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            style={{
              flex: 1, background: "#cc0000", border: "none",
              color: "#fff", borderRadius: 12, padding: "12px 0",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
            onClick={onOk}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}