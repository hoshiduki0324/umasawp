// ヘッダーコンポーネント
// ロゴ・ログインユーザー情報・通知ベル・グッズ選択ドロップダウン・登録ステータスバッジを表示
import { useState } from "react";
import { GOODS_LIST } from "../constants";
import { dbSet, signOutUser } from "../firebase";

export default function Header({
  authUser, myProfile, allData, goodsKey,
  notifs, onSwitchGoods, onOpenMyPage, onToggleNotifs,
}) {
  const [editingName, setEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState("");

  // 表示名を保存する
  const saveName = () => {
    const v = editNameVal.trim();
    if (v) dbSet(`users/${authUser.uid}/profile`, { ...myProfile, displayName: v });
    setEditingName(false);
  };

  // 現在のグッズの欲しい/所持登録状況を取得
  const getEntry = (type) => {
    if (goodsKey === "all") return null;
    const gd = allData[goodsKey] || {};
    return Object.values(gd[type] || {}).find((e) => e.uid === authUser?.uid) || null;
  };
  const myWishEntry = getEntry("wishes");
  const myHaveEntry = getEntry("haves");

  return (
    <header style={{ position: "relative", zIndex: 1, background: "#111", padding: "16px 16px 12px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* 上段: ロゴ・ユーザー情報 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#aaa", marginBottom: 6, textTransform: "uppercase" }}>
              7TH EVENT THE STAGE · WORLD TOUR
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, lineHeight: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#fff" }}>Uma</span>
              <span style={{ color: "#ddd" }}>Swap</span>
              <span style={{ fontSize: 20 }}>✨</span>
            </h1>
          </div>

          {/* ユーザー情報エリア */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* 通知ベル（マッチングがあるときだけ表示） */}
              {notifs.length > 0 && (
                <button
                  style={{ position: "relative", background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 }}
                  onClick={onToggleNotifs}
                >
                  🔔
                  <span style={{
                    position: "absolute", top: -2, right: -4,
                    background: "#cc0000", color: "#fff", borderRadius: 99,
                    fontSize: 9, padding: "1px 5px", fontWeight: 700,
                  }}>
                    {notifs.length}
                  </span>
                </button>
              )}

              {/* 表示名（タップで編集） */}
              <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "#fff" }}>
                {myProfile?.displayName || "設定中"}
              </div>

              {/* 名前変更ボタン */}
              <button
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => { setEditNameVal(myProfile?.displayName || ""); setEditingName(true); }}
              >
                名前変更
              </button>

              {/* マイページボタン */}
              <button
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                onClick={onOpenMyPage}
              >
                マイページ
              </button>
            </div>

            {/* ログアウトボタン */}
            <button
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
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
            <button style={{ background: "#fff", border: "none", color: "#111", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={saveName}>保存</button>
            <button style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setEditingName(false)}>×</button>
          </div>
        )}

        {/* 登録ステータスバッジ（グッズ選択時のみ表示） */}
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
                borderRadius: 12, padding: "8px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: entry ? "#4caf82" : "rgba(255,255,255,0.6)" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                    {entry ? `${Object.keys(entry.items || {}).length}種類登録済み` : "未登録"}
                  </div>
                </div>
                <div style={{ fontSize: 18 }}>{entry ? "✅" : "➕"}</div>
              </div>
            ))}
          </div>
        )}

        {/* グッズ選択ドロップダウン */}
        <div style={{ position: "relative" }}>
          <select
            style={{
              width: "100%", background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12,
              padding: "12px 40px 12px 16px", color: "#fff",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", outline: "none", appearance: "none",
            }}
            value={goodsKey}
            onChange={(e) => onSwitchGoods(e.target.value)}
          >
            <option value="all" style={{ background: "#111", color: "#fff" }}>全体</option>
            {GOODS_LIST.map((g) => (
              <option key={g.key} value={g.key} style={{ background: "#111", color: "#fff" }}>{g.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#fff", fontSize: 12, pointerEvents: "none" }}>▼</span>
        </div>
      </div>
    </header>
  );
}