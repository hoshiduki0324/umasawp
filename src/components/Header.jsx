// ヘッダーコンポーネント
import { useState } from "react";
import { GOODS_LIST } from "../constants";
import { dbSet, signOutUser } from "../firebase";

export default function Header({
  authUser, myProfile, allData, goodsKey,
  notifs, onSwitchGoods, onOpenMyPage, onToggleNotifs,
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
    <header style={{ position: "relative", zIndex: 1, background: "#111", padding: "12px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* 上段: ロゴ・ユーザー情報 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {/* ロゴ */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#aaa", marginBottom: 4, textTransform: "uppercase" }}>
              7TH EVENT THE STAGE
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#fff" }}>Uma</span>
              <span style={{ color: "#ddd" }}>Swap</span>
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
              <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#fff", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {myProfile?.displayName || "設定中"}
              </div>

              {/* 名前変更ボタン */}
              <button
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                onClick={() => { setEditNameVal(myProfile?.displayName || ""); setEditingName(true); }}
              >
                名前変更
              </button>

              {/* マイページボタン */}
              <button
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                onClick={onOpenMyPage}
              >
                マイページ
              </button>
            </div>

            {/* ログアウト */}
            <button
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
              onClick={signOutUser}
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* 名前編集フォーム */}
        {editingName && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input
              style={{ flex: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              value={editNameVal}
              onChange={(e) => setEditNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
            />
            <button style={{ background: "#fff", border: "none", color: "#111", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={saveName}>保存</button>
            <button style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setEditingName(false)}>×</button>
          </div>
        )}

        {/* 登録ステータスバッジ */}
        {goodsKey !== "all" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[
              { type: "wishes", entry: myWishEntry, label: "🥕 欲しい" },
              { type: "haves",  entry: myHaveEntry, label: "💎 所持" },
            ].map(({ type, entry, label }) => (
              <div key={type} style={{
                flex: 1,
                background: entry ? "rgba(0,119,51,0.15)" : "rgba(255,255,255,0.1)",
                border: `1px solid ${entry ? "rgba(0,119,51,0.4)" : "rgba(255,255,255,0.2)"}`,
                borderRadius: 10, padding: "6px 10px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: entry ? "#4caf82" : "rgba(255,255,255,0.6)" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                    {entry ? `${Object.keys(entry.items || {}).length}種類` : "未登録"}
                  </div>
                </div>
                <div style={{ fontSize: 14 }}>{entry ? "✅" : "➕"}</div>
              </div>
            ))}
          </div>
        )}

        {/* グッズ選択ドロップダウン */}
        <div style={{ position: "relative" }}>
          <select
            style={{ width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "10px 36px 10px 14px", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", outline: "none", appearance: "none" }}
            value={goodsKey}
            onChange={(e) => onSwitchGoods(e.target.value)}
          >
            <option value="all" style={{ background: "#111", color: "#fff" }}>全体</option>
            {GOODS_LIST.map((g) => (
              <option key={g.key} value={g.key} style={{ background: "#111", color: "#fff" }}>{g.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#fff", fontSize: 11, pointerEvents: "none" }}>▼</span>
        </div>
      </div>
    </header>
  );
}