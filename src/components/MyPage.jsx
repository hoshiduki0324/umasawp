// 自分のマイページモーダル
import { useState } from "react";
import { GOODS_LIST } from "../constants";
import { dbSet } from "../firebase";

export default function MyPage({ authUser, myProfile, allData, onClose }) {
  const [xLinkEdit, setXLinkEdit]     = useState(false);
  const [xLinkVal, setXLinkVal]       = useState(myProfile?.xLink || "");
  const [sortByCount, setSortByCount] = useState(false);

  const saveXLink = () => {
    dbSet(`users/${authUser.uid}/profile`, { ...myProfile, xLink: xLinkVal });
    setXLinkEdit(false);
  };

  const sortItems = (items) =>
    sortByCount ? [...items].sort((a, b) => b[1] - a[1]) : items;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 20, padding: "28px 24px", maxWidth: 480, width: "100%", marginTop: 20 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>マイページ</div>
          <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 22 }} onClick={onClose}>×</button>
        </div>

        {/* プロフィール */}
        <div style={{ background: "#f5f5f5", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 700 }}>プロフィール</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#111" }}>{myProfile?.displayName || "未設定"}</div>
          {xLinkEdit ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1, background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", color: "#111" }}
                placeholder="https://x.com/yourname"
                value={xLinkVal}
                onChange={(e) => setXLinkVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveXLink(); if (e.key === "Escape") setXLinkEdit(false); }}
              />
              <button style={{ background: "#111", border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={saveXLink}>保存</button>
              <button style={{ background: "#f0f0f0", border: "1px solid #ddd", color: "#666", borderRadius: 10, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setXLinkEdit(false)}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {myProfile?.xLink ? (
                <a href={myProfile.xLink} target="_blank" rel="noopener noreferrer" style={{ color: "#333", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  X: {myProfile.xLink.replace("https://x.com/", "@").replace("https://twitter.com/", "@")}
                </a>
              ) : (
                <span style={{ fontSize: 13, color: "#888" }}>Xリンク未設定</span>
              )}
              <button style={{ background: "none", border: "1px solid #ddd", color: "#888", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => { setXLinkVal(myProfile?.xLink || ""); setXLinkEdit(true); }}>
                {myProfile?.xLink ? "変更" : "設定する"}
              </button>
            </div>
          )}
        </div>

        {/* 並び替えボタン */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            style={{ background: sortByCount ? "#111" : "#f0f0f0", color: sortByCount ? "#fff" : "#111", border: "1px solid #e0e0e0", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setSortByCount((v) => !v)}
          >
            {sortByCount ? "個数順" : "登録順"}
          </button>
        </div>

        {/* 全グッズの欲しい/所持まとめ */}
        {GOODS_LIST.map((g) => {
          const gd = allData[g.key] || {};
          const myW = Object.values(gd.wishes || {}).find((e) => e.uid === authUser?.uid);
          const myH = Object.values(gd.haves  || {}).find((e) => e.uid === authUser?.uid);
          if (!myW && !myH) return null;
          return (
            <div key={g.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 8, paddingLeft: 4, borderLeft: "3px solid #111" }}>
                {g.label}
              </div>
              {myW && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 6 }}>🥕 欲しい</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sortItems(Object.entries(myW.items || {})).map(([item, cnt]) => (
                      <div key={item} style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "#111" }}>{item}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{cnt}個</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {myH && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6 }}>💎 所持</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sortItems(Object.entries(myH.items || {})).map(([item, cnt]) => (
                      <div key={item} style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "#111" }}>{item}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{cnt}個</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {GOODS_LIST.every((g) => {
          const gd = allData[g.key] || {};
          return !Object.values(gd.wishes || {}).find((e) => e.uid === authUser?.uid)
              && !Object.values(gd.haves  || {}).find((e) => e.uid === authUser?.uid);
        }) && (
          <div style={{ textAlign: "center", color: "#888", padding: "24px 0", fontSize: 14 }}>まだ何も登録していません</div>
        )}

        <button style={{ width: "100%", background: "#f0f0f0", border: "1px solid #e0e0e0", color: "#666", borderRadius: 12, padding: "12px 0", fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}