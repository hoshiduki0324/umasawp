// 他のユーザーのマイページモーダル
// メンバー別・全体タブで名前をタップすると開く
import { GOODS_LIST } from "../constants";

export default function OtherUserPage({ viewingUser, usersData, allData, onClose }) {
  const prof = usersData[viewingUser.uid]?.profile;

  const chipStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10,
    padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#00000099", zIndex: 200,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "24px 16px", overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20,
          padding: "28px 24px", maxWidth: 480, width: "100%", marginTop: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>{viewingUser.name}</div>
          <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 22 }} onClick={onClose}>x</button>
        </div>

        {prof?.xLink && (
          <div style={{ background: "var(--bg5)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <a href={prof.xLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text2)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              X: {prof.xLink.replace("https://x.com/", "@").replace("https://twitter.com/", "@")}
            </a>
          </div>
        )}

        {GOODS_LIST.map((g) => {
          const gd = allData[g.key] || {};
          const theirW = Object.values(gd.wishes || {}).find((e) => e.uid === viewingUser.uid);
          const theirH = Object.values(gd.haves || {}).find((e) => e.uid === viewingUser.uid);
          if (!theirW && !theirH) return null;
          return (
            <div key={g.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8, paddingLeft: 4, borderLeft: "3px solid var(--text)" }}>
                {g.label}
              </div>
              {theirW && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>欲しい</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(theirW.items || {}).map(([item, cnt]) => (
                      <div key={item} style={chipStyle}>
                        <span style={{ fontSize: 12, color: "var(--text)" }}>{item}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{cnt}個</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {theirH && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 6 }}>所持</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(theirH.items || {}).map(([item, cnt]) => (
                      <div key={item} style={chipStyle}>
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

        <button style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text4)", borderRadius: 12, padding: "12px 0", fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
