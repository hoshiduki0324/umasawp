// 全体タブ
import { useState, useEffect } from "react";
import { GOODS_LIST, GROUPS } from "../constants";

const PAGE_SIZE = 10;

export default function AllView({ allData, authUser, onViewUser }) {
  const [search, setSearch]           = useState("");
  const [sortByCount, setSortByCount] = useState(false);
  const [subTab, setSubTab]           = useState("wishes"); // "wishes" | "haves"
  const [group, setGroup]             = useState("全体");
  const [page, setPage]               = useState(0);

  useEffect(() => { setPage(0); }, [search, subTab, group]);

  // グッズごとのキャラ→グループ対応表
  const charGroupMap = {};
  GOODS_LIST.forEach((g) => {
    if (!g.hasGroups) return;
    const chars = allData[g.key]?.chars ? Object.values(allData[g.key].chars) : [];
    charGroupMap[g.key] = {};
    chars.forEach((c) => {
      const obj = typeof c === "string" ? { name: c, group: null } : c;
      charGroupMap[g.key][obj.name] = obj.group;
    });
  });

  const users = (() => {
    const userMap = {};
    GOODS_LIST.forEach((g) => {
      const entries = allData[g.key]?.[subTab] ? Object.values(allData[g.key][subTab]) : [];
      entries.forEach((e) => {
        if (!e.displayName) return;
        const uid = e.uid || e.displayName;
        if (!userMap[uid]) userMap[uid] = { name: e.displayName, uid: e.uid, goods: {} };

        const allItems = Object.entries(e.items || {});
        const filtered = g.hasGroups && group !== "全体"
          ? allItems.filter(([item]) => charGroupMap[g.key]?.[item] === group)
          : allItems;

        if (filtered.length > 0) {
          userMap[uid].goods[g.key] = { label: g.label, items: filtered.map(([item, cnt]) => ({ item, cnt })) };
        }
      });
    });
    return Object.values(userMap)
      .filter((u) => !search || u.name.includes(search))
      .filter((u) => Object.keys(u.goods).length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  })();

  const sortItems = (items) =>
    sortByCount ? [...items].sort((a, b) => b.cnt - a.cnt) : items;

  const chipStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 10,
    padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
  };

  const subTabStyle = (active) => ({
    flex: 1, padding: "12px 0", border: "none", background: "none",
    color: active ? "var(--text)" : "var(--text-muted)", fontSize: 14, fontWeight: active ? 900 : 600,
    cursor: "pointer", borderBottom: `2px solid ${active ? "var(--text)" : "transparent"}`,
    transition: "all .15s", fontFamily: "inherit",
  });

  const groupTabStyle = (active) => ({
    flex: 1, padding: "8px 0", border: "none", background: "none",
    color: active ? "var(--text)" : "var(--text4)", fontSize: 12, fontWeight: active ? 700 : 500,
    cursor: "pointer", borderBottom: `2px solid ${active ? "var(--text3)" : "transparent"}`,
    transition: "all .15s", fontFamily: "inherit",
  });

  return (
    <div>
      {/* 欲しい / 所持 サブタブ */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
        <button style={subTabStyle(subTab === "wishes")} onClick={() => { setSubTab("wishes"); setGroup("全体"); }}>
          🥕 欲しい
        </button>
        <button style={subTabStyle(subTab === "haves")} onClick={() => { setSubTab("haves"); setGroup("全体"); }}>
          💎 所持
        </button>
      </div>

      {/* A/B/C グループフィルタ */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 14, background: "var(--bg4)" }}>
        {GROUPS.map((g) => (
          <button key={g} style={groupTabStyle(group === g)} onClick={() => setGroup(g)}>
            {g === "全体" ? "全体" : `${g}グループ`}
          </button>
        ))}
      </div>

      {/* 検索 + ソート */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit", minHeight: 48 }}
          placeholder="名前で検索…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          style={{ background: sortByCount ? "var(--btn-accent)" : "var(--bg3)", color: sortByCount ? "var(--btn-accent-text)" : "var(--text)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, minHeight: 48 }}
          onClick={() => setSortByCount((v) => !v)}
        >
          {sortByCount ? "個数順" : "登録順"}
        </button>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 24px", fontSize: 14 }}>
          まだ誰も登録していません
        </div>
      )}

      {users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((u) => (
        <div key={u.uid || u.name} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 10, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ cursor: u.uid === authUser?.uid ? "default" : "pointer", textDecoration: u.uid === authUser?.uid ? "none" : "underline", textDecorationColor: "var(--border3)" }}
              onClick={() => u.uid !== authUser?.uid && onViewUser({ uid: u.uid, name: u.name })}
            >
              {u.name}
            </span>
            {u.uid === authUser?.uid && (
              <span style={{ fontSize: 11, background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border3)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>自分</span>
            )}
          </div>

          {Object.entries(u.goods).map(([gKey, { label, items }]) => (
            <div key={gKey} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.08em", marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sortItems(items).map(({ item, cnt }) => (
                  <div key={item} style={chipStyle}>
                    <span style={{ fontSize: 12, color: "var(--text)" }}>{item}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{cnt}個</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {users.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 0 4px" }}>
          <button
            style={{ background: page === 0 ? "var(--bg3)" : "var(--btn-accent)", color: page === 0 ? "var(--text-muted)" : "var(--btn-accent-text)", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: page === 0 ? "default" : "pointer", fontFamily: "inherit" }}
            onClick={() => setPage((p) => p - 1)} disabled={page === 0}
          >前へ</button>
          <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 60, textAlign: "center" }}>
            {page + 1} / {Math.ceil(users.length / PAGE_SIZE)}
          </span>
          <button
            style={{ background: page === Math.ceil(users.length / PAGE_SIZE) - 1 ? "var(--bg3)" : "var(--btn-accent)", color: page === Math.ceil(users.length / PAGE_SIZE) - 1 ? "var(--text-muted)" : "var(--btn-accent-text)", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: page === Math.ceil(users.length / PAGE_SIZE) - 1 ? "default" : "pointer", fontFamily: "inherit" }}
            onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(users.length / PAGE_SIZE) - 1}
          >次へ</button>
        </div>
      )}
    </div>
  );
}
