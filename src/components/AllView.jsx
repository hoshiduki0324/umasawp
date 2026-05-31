// 全体タブ
// 全グッズの登録状況をユーザー別にまとめて表示する（閲覧専用）
import { useState } from "react";
import { GOODS_LIST } from "../constants";

export default function AllView({ allData, authUser, onViewUser }) {
  const [search, setSearch] = useState("");

  // 全ユーザーのデータをユーザー別にまとめる
  const allViewByUser = (() => {
    const userMap = {};
    GOODS_LIST.forEach((g) => {
      const data = allData[g.key] || {};
      ["wishes", "haves"].forEach((type) => {
        if (!data[type]) return;
        Object.values(data[type]).forEach((e) => {
          if (!e.displayName) return;
          const key = e.uid || e.displayName;
          if (!userMap[key]) userMap[key] = { name: e.displayName, uid: e.uid, wishes: {}, haves: {} };
          if (!userMap[key][type][g.key]) userMap[key][type][g.key] = [];
          Object.entries(e.items || {}).forEach(([item, cnt]) => {
            userMap[key][type][g.key].push({ item, cnt });
          });
        });
      });
    });
    return Object.values(userMap)
      .filter((u) => !search || u.name.includes(search))
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  })();

  const chipStyle = {
    background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 10,
    padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <div>
      {/* 名前検索 */}
      <input
        style={{
          width: "100%", background: "#f8f8f8", border: "1px solid #e0e0e0",
          borderRadius: 12, padding: "12px 16px", color: "#111",
          fontSize: 15, outline: "none", fontFamily: "inherit", marginBottom: 14,
          boxSizing: "border-box",
        }}
        placeholder="名前で検索…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {allViewByUser.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", padding: "48px 24px", fontSize: 14 }}>
          まだ誰も登録していません
        </div>
      )}

      {/* ユーザー別カード */}
      {allViewByUser.map((u) => (
        <div key={u.name} style={{ background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          {/* ユーザー名（自分以外はタップでマイページ表示） */}
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 10, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ cursor: u.uid === authUser?.uid ? "default" : "pointer", textDecoration: u.uid === authUser?.uid ? "none" : "underline", textDecorationColor: "#ccc" }}
              onClick={() => u.uid !== authUser?.uid && onViewUser({ uid: u.uid, name: u.name })}
            >
              {u.name}
            </span>
            {u.uid === authUser?.uid && (
              <span style={{ fontSize: 11, background: "#eee", color: "#333", border: "1px solid #ccc", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>自分</span>
            )}
          </div>

          {/* 欲しい・所持をグッズ別に表示 */}
          {["wishes", "haves"].map((type) => {
            const goodsList = GOODS_LIST.filter((g) => u[type][g.key] && u[type][g.key].length > 0);
            if (goodsList.length === 0) return null;
            return (
              <div key={type} style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: type === "wishes" ? "#111" : "#555", marginBottom: 8 }}>
                  {type === "wishes" ? "🥕 欲しい" : "💎 所持"}
                </div>
                {goodsList.map((g) => (
                  <div key={g.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#111", letterSpacing: "0.08em", marginBottom: 6 }}>
                      {g.label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {u[type][g.key].map(({ item, cnt }) => (
                        <div key={item} style={chipStyle}>
                          <span style={{ fontSize: 12 }}>{item}</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{cnt}個</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}