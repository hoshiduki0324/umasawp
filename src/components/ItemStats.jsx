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
          width: "100%", background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "12px 16px", color: "var(--text)",
          fontSize: 15, outline: "none", fontFamily: "inherit",
          marginBottom: 14, boxSizing: "border-box",
        }}
        placeholder="絞り込み…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {allKeys.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 24px", fontSize: 14 }}>
          まだ誰も登録していません
        </div>
      )}

      {/* アイテム別カード */}
      {allKeys.map((ch) => (
        <div key={ch} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{ch}</div>

          {/* 欲しい人一覧 */}
          {wStats[ch] && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>🥕 欲しい</div>
              {wStats[ch].map((u, i) => (
                <div key={i} style={rowStyle("var(--bg3)")}>
                  <span style={{ fontSize: 14, color: "var(--text)" }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{u.count}個</span>
                </div>
              ))}
            </div>
          )}

          {/* 所持している人一覧 */}
          {hStats[ch] && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 6 }}>💎 所持</div>
              {hStats[ch].map((u, i) => (
                <div key={i} style={rowStyle("var(--chip-sel)")}>
                  <span style={{ fontSize: 14, color: "var(--text)" }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text3)" }}>{u.count}個</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
