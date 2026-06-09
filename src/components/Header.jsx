// ヘッダーコンポーネント
import { useState } from "react";
import { GOODS_LIST } from "../constants";
import { dbSet, signOutUser } from "../firebase";

export default function Header({
  authUser, myProfile, allData, goodsKey,
  notifs, onSwitchGoods, onOpenMyPage, onToggleNotifs,
  darkMode, onToggleDark,
}) {
  const [editingName, setEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState("");

  const saveName = () => {
    const v = editNameVal.trim();
    if (v) dbSet(`users/${authUser.uid}/profile`, { ...myProfile, displayName: v });
    setEditingName(false);
  };

  const getEntry = (type) => {
    if (goodsKey === "all") return null;
    const gd = allData[goodsKey] || {};
    return Object.values(gd[type] || {}).find((e) => e.uid === authUser?.uid) || null;
  };
  const myWishEntry = getEntry("wishes");
  const myHaveEntry = getEntry("haves");

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "var(--header-bg)", padding: "12px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* 上段: ロゴ・ユーザー情報 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {/* ロゴ */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--header-fg)", opacity: 0.6, marginBottom: 4, textTransform: "uppercase" }}>
              7TH EVENT THE STAGE
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--header-fg)" }}>Uma</span>
              <span style={{ color: "var(--header-fg)", opacity: 0.8 }}>Swap</span>
              <span style={{ fontSize: 18 }}>✨</span>
            </h1>
          </div>

          {/* 右側のボタン群 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* 通知ベル */}
              {notifs.length > 0 && (
                <button
                  style={{ position: "relative", background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 2 }}
                  onClick={onToggleNotifs}
                >
                  🔔
                  <span style={{ position: "absolute", top: -2, right: -4, background: "#cc0000", color: "#fff", borderRadius: 99, fontSize: 9, padding: "1px 4px", fontWeight: 700 }}>
                    {notifs.length}
                  </span>
                </button>
              )}

              {/* 表示名 */}
              <div style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "var(--header-fg)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {myProfile?.displayName || "設定中"}
              </div>

              {/* 名前変更ボタン */}
              <button
                style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", color: "var(--header-fg)", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                onClick={() => { setEditNameVal(myProfile?.displayName || ""); setEditingName(true); }}
              >
                名前変更
              </button>

              {/* マイページボタン */}
              <button
                style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", color: "var(--header-fg)", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                onClick={onOpenMyPage}
              >
                マイページ
              </button>
            </div>

            {/* ダークモード切り替え + ログアウト */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", color: "var(--header-fg)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}
                onClick={onToggleDark}
                title={darkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
              >
                {darkMode ? "ライト" : "ダーク"}
              </button>
              <button
                style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", color: "var(--header-fg)", opacity: 0.7, borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                onClick={signOutUser}
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* 名前編集フォーム */}
        {editingName && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input
              style={{ flex: 1, background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", borderRadius: 10, padding: "8px 12px", color: "var(--header-fg)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              value={editNameVal}
              onChange={(e) => setEditNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
            />
            <button style={{ background: "var(--header-fg)", border: "none", color: "var(--header-bg)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={saveName}>保存</button>
            <button style={{ background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", color: "var(--header-fg)", borderRadius: 8, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setEditingName(false)}>×</button>
          </div>
        )}

        {/* グッズ選択ドロップダウン */}
        <div style={{ position: "relative" }}>
          <select
            style={{ width: "100%", background: "var(--header-btn-bg)", border: "1px solid var(--header-btn-border)", borderRadius: 10, padding: "10px 36px 10px 14px", color: "var(--header-fg)", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", outline: "none", appearance: "none" }}
            value={goodsKey}
            onChange={(e) => onSwitchGoods(e.target.value)}
          >
            <option value="all" style={{ background: "var(--header-bg)", color: "var(--header-fg)" }}>全体</option>
            {GOODS_LIST.map((g) => (
              <option key={g.key} value={g.key} style={{ background: "var(--header-bg)", color: "var(--header-fg)" }}>{g.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--header-fg)", fontSize: 11, pointerEvents: "none" }}>▼</span>
        </div>
      </div>
    </header>
  );
}
