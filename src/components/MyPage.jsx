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
      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "28px 24px", maxWidth: 480, width: "100%", marginTop: 20 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>マイページ</div>
          <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 22 }} onClick={onClose}>×</button>
        </div>

        {/* プロフィール */}
        <div style={{ background: "var(--bg5)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>プロフィール</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>{myProfile?.displayName || "未設定"}</div>
          {xLinkEdit ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", color: "var(--text)" }}
                placeholder="https://x.com/yourname"
                value={xLinkVal}
                onChange={(e) => setXLinkVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveXLink(); if (e.key === "Escape") setXLinkEdit(false); }}
              />
              <button style={{ background: "var(--btn-accent)", border: "none", color: "var(--btn-accent-text)", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={saveXLink}>保存</button>
              <button style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text4)", borderRadius: 10, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setXLinkEdit(false)}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {myProfile?.xLink ? (
                <a href={myProfile.xLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text2)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  X: {myProfile.xLink.replace("https://x.com/", "@").replace("https://twitter.com/", "@")}
                </a>
              ) : (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Xリンク未設定</span>
              )}
              <button style={{ background: "none", border: "1px solid var(--border2)", color: "var(--text-muted)", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => { setXLinkVal(myProfile?.xLink || ""); setXLinkEdit(true); }}>
                {myProfile?.xLink ? "変更" : "設定する"}
              </button>
            </div>
          )}
        </div>

        {/* 並び替えボタン */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            style={{ background: sortByCount ? "var(--btn-accent)" : "var(--bg3)", color: sortByCount ? "var(--btn-accent-text)" : "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
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
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8, paddingLeft: 4, borderLeft: "3px solid var(--text)" }}>
                {g.label}
              </div>
              {myW && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>🥕 欲しい</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sortItems(Object.entries(myW.items || {})).map(([item, cnt]) => (
                      <div key={item} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text)" }}>{item}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{cnt}個</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {myH && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 6 }}>💎 所持</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sortItems(Object.entries(myH.items || {})).map(([item, cnt]) => (
                      <div key={item} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text)" }}>{item}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>{cnt}個</span>
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
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0", fontSize: 14 }}>まだ何も登録していません</div>
        )}

        <button style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text4)", borderRadius: 12, padding: "12px 0", fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
