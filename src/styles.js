// 全体で使うスタイル定数
import { C } from "./constants";

export const S = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",
  },
  // ヘッダー（黒背景）
  header: {
    position: "relative",
    zIndex: 1,
    background: "#111111",
    padding: "16px 16px 12px",
  },
  headerInner: {
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  // カード
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "16px",
    marginBottom: 12,
  },
  // 検索ボックス
  searchBox: {
    flex: 1,
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 16px",
    color: C.text,
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    minHeight: 48,
  },
  // テキスト入力欄
  input: {
    width: "100%",
    background: "#f5f5f5",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 16px",
    color: C.text,
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  // アクセントボタン（黒）
  btnSubmit: {
    flex: 2,
    background: "#111",
    border: "none",
    color: "#fff",
    borderRadius: 12,
    padding: "14px 0",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // キャンセルボタン
  btnCancel: {
    flex: 1,
    background: "#f0f0f0",
    border: `1px solid ${C.border}`,
    color: "#666",
    borderRadius: 12,
    padding: "14px 0",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // 小さいボタン
  btnSm: {
    background: "none",
    border: `1px solid ${C.border}`,
    color: C.muted,
    borderRadius: 8,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // 削除ボタン
  btnDanger: {
    border: "1px solid #ccc",
    color: C.danger,
  },
  // アイテムチップ（欲しい/所持の表示）
  wishChip: {
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "6px 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  wishName: { fontSize: 13, color: C.text },
  wishCnt: { fontSize: 13, fontWeight: 700, color: C.text },
  // キャラ選択グリッド
  charGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    maxHeight: 320,
    overflowY: "auto",
    padding: "4px 2px",
    marginBottom: 8,
  },
  charCell: {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px",
    transition: "border-color .2s, background .2s",
  },
  charCellOn: {
    background: "#e8e8e8",
    borderColor: "#111",
    boxShadow: "0 0 8px rgba(0,0,0,0.15)",
  },
  charCellName: { fontSize: 13, marginBottom: 10, lineHeight: 1.3, color: C.text },
  // カウンターコントロール
  ctrls: { display: "flex", alignItems: "center", gap: 8 },
  cBtn: {
    background: "#e0e0e0",
    border: "none",
    color: C.text,
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16,
    fontFamily: "inherit",
    flexShrink: 0,
  },
  cInput: {
    flex: 1,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 16,
    color: C.text,
    background: "none",
    border: "none",
    outline: "none",
    width: 0,
    minWidth: 0,
    fontFamily: "inherit",
  },
  // 空メッセージ
  empty: {
    textAlign: "center",
    color: C.muted,
    padding: "48px 24px",
    fontSize: 14,
    lineHeight: 1.8,
  },
  // フォームカード
  formCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "20px 16px",
  },
};