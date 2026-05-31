// アイテム別タブ
// 各アイテムを欲しい人・所持している人の一覧を表示する
import { useState } from "react";

export default function ItemStats({ allChars, wishEntries, haveEntries, group, hasGroups }) {
  const [search, setSearch] = useState("");

  // アイテム別に欲しい/所持の人数を集計する
  const makeStats = (entries) => {
    const stats = {};
    entries.forEach((e) => {
      Object.entries(e.items || {}).forEach(([name, cnt]) => {
        // グループフィルタ
        if (hasGroups && group !== "全体") {
          const ch = allChars.find((c) => c.name === name);
          if (!ch || ch.group !== group) return;
        }
        if (!stats[name]) stats[name] = [];
        stats[name].push({ name: e.displayName || "不明", count: cnt });
      });
    });
    return stats;
  };

  const wStats = makeStats(wishEntries);
  const hStats = makeStats(haveEntries);

  // 欲しい人数が多い順に並び替え
  const allKeys = [...new Set([...Object.keys(wStats), ...Object.keys(hStats)])]
    .filter((ch) => !search || ch.includes(search))
    .sort((a, b) => {
      const wa = wStats[a]?.reduce((s, u) => s + u.count, 0) || 0;
      const wb = wStats[b]?.reduce((s, u) => s + u.count, 0) || 0;
      return wb - wa;
    });

  const rowStyle = (bg) => ({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 12px", background: bg, borderRadius: 10, marginBottom: 6,
  });

  return (
    <div>
      {/* 絞り込み検索 */}
      <input
        style={{
          width: "100%", background: "#f8f8f8", border: "1px solid #e0e0e0",
          borderRadius: 12, padding: "12px 16px", color: "#111",
          fontSize: 15, outline: "none", fontFamily: "inherit",
          marginBottom: 14, boxSizing: "border-box",
        }}
        placeholder="絞り込み…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {allKeys.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", padding: "48px 24px", fontSize: 14 }}>
          まだ誰も登録していません
        </div>
      )}

      {/* アイテム別カード */}
      {allKeys.map((ch) => (
        <div key={ch} style={{ background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{ch}</div>

          {/* 欲しい人一覧 */}
          {wStats[ch] && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 6 }}>🥕 欲しい</div>
              {wStats[ch].map((u, i) => (
                <div key={i} style={rowStyle("#f0f0f0")}>
                  <span style={{ fontSize: 14 }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{u.count}個</span>
                </div>
              ))}
            </div>
          )}

          {/* 所持している人一覧 */}
          {hStats[ch] && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6 }}>💎 所持</div>
              {hStats[ch].map((u, i) => (
                <div key={i} style={rowStyle("#e8e8e8")}>
                  <span style={{ fontSize: 14 }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>{u.count}個</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}