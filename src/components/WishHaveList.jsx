// 欲しい・所持タブの共通コンポーネント
import { useState, useEffect } from "react";

const PAGE_SIZE = 10;
import { dbSet, dbRemove } from "../firebase";

export default function WishHaveList({
  mode, allChars, hasGroups, group,
  wishEntries, haveEntries,
  authUser, myProfile, goodsKey,
  allData, showConfirm, showToast,
  onViewUser,
}) {
  const [search, setSearch]           = useState("");
  const [formOpen, setFormOpen]       = useState(false);
  const [formSel, setFormSel]         = useState({});
  const [charSearch, setCharSearch]   = useState("");
  const [sortByCount, setSortByCount] = useState(false);
  const [page, setPage]               = useState(0);

  useEffect(() => { setPage(0); }, [search, group]);

  const isWish  = mode === "wish";
  const type    = isWish ? "wishes" : "haves";
  const entries = isWish ? wishEntries : haveEntries;
  const myEntry = entries.find((e) => e.uid === authUser?.uid);

  const handleCount = (name, d) => setFormSel((prev) => {
    const n = Math.max(0, (prev[name] || 0) + d);
    if (n === 0) { const c = { ...prev }; delete c[name]; return c; }
    return { ...prev, [name]: n };
  });

  const handleCountInput = (name, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return;
    setFormSel((prev) => {
      if (n === 0) { const c = { ...prev }; delete c[name]; return c; }
      return { ...prev, [name]: n };
    });
  };

  const openForm = () => {
    setFormSel(myEntry ? { ...myEntry.items } : {});
    setCharSearch("");
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (Object.keys(formSel).length === 0) { showToast("アイテムを1つ以上選んでください"); return; }
    const key = myEntry ? myEntry._key : `u_${authUser.uid}`;
    dbSet(`${goodsKey}/${type}/${key}`, {
      uid: authUser.uid,
      displayName: myProfile?.displayName || "不明",
      items: formSel,
      updatedAt: Date.now(),
    });
    setFormOpen(false);
    showToast(isWish ? "🥕 欲しいリストを更新しました！" : "💎 所持リストを更新しました！");
  };

  const handleDelete = () => {
    showConfirm("リストを削除しますか？", () => {
      dbRemove(`${goodsKey}/${type}/${myEntry._key}`);
      showToast("削除しました");
    });
  };

  const filtered = entries.filter((e) => {
    if (search && !e.displayName?.includes(search)) return false;
    if (hasGroups && group !== "全体") {
      return Object.keys(e.items || {}).some((name) => {
        const ch = allChars.find((c) => c.name === name);
        return ch && ch.group === group;
      });
    }
    return true;
  });

  // 個数順または登録順でソート
  const getSortedItems = (entry) => {
    if (!entry) return [];
    const items = Object.entries(entry.items || {});
    return sortByCount ? items.sort((a, b) => b[1] - a[1]) : items;
  };

  const renderGrid = (chars) => chars.map((ch) => {
    const cnt = formSel[ch.name] || 0;
    return (
      <div key={ch.name} style={{
        background: cnt > 0 ? "#e8e8e8" : "#fff",
        border: `1px solid ${cnt > 0 ? "#111" : "#e0e0e0"}`,
        borderRadius: 12, padding: "12px",
        transition: "border-color .2s, background .2s",
      }}>
        <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.3, color: "#111" }}>{ch.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{ background: "#e0e0e0", border: "none", color: "#111", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, fontFamily: "inherit", flexShrink: 0 }}
            onClick={() => handleCount(ch.name, -1)} disabled={cnt === 0}>－</button>
          <input
            style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 16, color: "#111", background: "none", border: "none", outline: "none", fontFamily: "inherit" }}
            type="number" min="0" value={cnt === 0 ? "" : cnt}
            onChange={(e) => handleCountInput(ch.name, e.target.value === "" ? "0" : e.target.value)}
          />
          <button
            style={{ background: "#e0e0e0", border: "none", color: "#111", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, fontFamily: "inherit", flexShrink: 0 }}
            onClick={() => handleCount(ch.name, +1)}>＋</button>
        </div>
      </div>
    );
  });

  return (
    <div>
      {formOpen ? (
        <div style={{ background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 16, padding: "20px 16px", marginBottom: 12 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#111", textAlign: "left" }}>
            {isWish ? "🥕 欲しいリストを登録" : "💎 所持リストを登録"}
          </h2>
          <input
            style={{ width: "100%", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, color: "#111" }}
            placeholder="絞り込み…"
            value={charSearch}
            onChange={(e) => setCharSearch(e.target.value)}
          />
          {hasGroups ? (
            ["A", "B", "C"].map((grp) => {
              const grpChars = allChars.filter((c) => c.group === grp && (!charSearch || c.name.includes(charSearch)));
              if (grpChars.length === 0) return null;
              return (
                <div key={grp}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 14, marginBottom: 8, textAlign: "left" }}>{grp}グループ</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 320, overflowY: "auto", marginBottom: 8 }}>
                    {renderGrid(grpChars)}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 320, overflowY: "auto", marginBottom: 8 }}>
              {renderGrid(allChars.filter((c) => !charSearch || c.name.includes(charSearch)))}
            </div>
          )}
          <div style={{ marginTop: 12, minHeight: 40, display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0" }}>
            {Object.keys(formSel).length === 0
              ? <span style={{ color: "#888", fontSize: 13 }}>まだ選んでいません</span>
              : Object.entries(formSel).map(([ch, n]) => (
                <span key={ch} style={{ background: "#e8e8e8", border: "1px solid #ccc", borderRadius: 8, padding: "4px 12px", fontSize: 13, color: "#111" }}>
                  {ch} × {n}
                </span>
              ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ flex: 1, background: "#f0f0f0", border: "1px solid #e0e0e0", color: "#666", borderRadius: 12, padding: "14px 0", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => setFormOpen(false)}>キャンセル</button>
            <button style={{ flex: 2, background: "#111", border: "none", color: "#fff", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              onClick={handleSubmit}>登録する</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 16px", color: "#111", fontSize: 15, outline: "none", fontFamily: "inherit", minHeight: 48 }}
              placeholder="名前で検索…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* 並び替えボタン */}
            <button
              style={{ background: sortByCount ? "#111" : "#f0f0f0", color: sortByCount ? "#fff" : "#111", border: "1px solid #e0e0e0", borderRadius: 12, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, minHeight: 48 }}
              onClick={() => setSortByCount((v) => !v)}
            >
              {sortByCount ? "個数順" : "登録順"}
            </button>
            <button
              style={{ background: myEntry ? "#f0f0f0" : "#111", color: myEntry ? "#111" : "#fff", border: `1px solid ${myEntry ? "#e0e0e0" : "transparent"}`, borderRadius: 12, padding: "0 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, minHeight: 48 }}
              onClick={openForm} disabled={allChars.length === 0}
            >
              {myEntry ? "✏️ 編集" : "＋ 登録"}
            </button>
          </div>

          {myEntry && (
            <div style={{ background: "rgba(0,119,51,0.08)", border: "1px solid rgba(0,119,51,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#007733" }}>✅ 登録済み（{Object.keys(myEntry.items || {}).length}種類）</div>
              <button style={{ background: "none", border: "1px solid #ccc", color: "#cc0000", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                onClick={handleDelete}>削除</button>
            </div>
          )}

          {allChars.length === 0 && <div style={{ textAlign: "left", color: "#888", padding: "48px 0", fontSize: 14 }}>⚙ 管理タブでアイテムを先に登録してください</div>}
          {allChars.length > 0 && filtered.length === 0 && <div style={{ textAlign: "left", color: "#888", padding: "48px 0", fontSize: 14 }}>まだ誰も登録していません</div>}

          {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((entry) => {
            const isMe = entry.uid === authUser?.uid;
            const visible = hasGroups && group !== "全体"
              ? Object.entries(entry.items || {})
                  .filter(([name]) => {
                    const ch = allChars.find((c) => c.name === name);
                    return ch && ch.group === group;
                  })
                  .sort((a, b) => sortByCount ? b[1] - a[1] : 0)
              : getSortedItems(entry);

            return (
              <div key={entry._key} style={{ background: "#f8f8f8", border: `1px solid ${isMe ? "rgba(0,119,51,0.3)" : "#e0e0e0"}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{ fontSize: 16, fontWeight: 700, color: "#111", cursor: isMe ? "default" : "pointer", textDecoration: isMe ? "none" : "underline", textDecorationColor: "#ccc" }}
                      onClick={() => !isMe && onViewUser({ uid: entry.uid, name: entry.displayName })}
                    >
                      {entry.displayName || "不明"}
                    </div>
                    {isMe && <span style={{ fontSize: 11, background: "#eee", color: "#333", border: "1px solid #ccc", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>自分</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
                  {visible.map(([ch, cnt]) => (
                    <div key={ch} style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 10, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "#111" }}>{ch}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{cnt}個</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length > PAGE_SIZE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 0 4px" }}>
              <button
                style={{ background: page === 0 ? "#f0f0f0" : "#111", color: page === 0 ? "#aaa" : "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: page === 0 ? "default" : "pointer", fontFamily: "inherit" }}
                onClick={() => setPage((p) => p - 1)} disabled={page === 0}
              >前へ</button>
              <span style={{ fontSize: 13, color: "#888", minWidth: 60, textAlign: "center" }}>
                {page + 1} / {Math.ceil(filtered.length / PAGE_SIZE)}
              </span>
              <button
                style={{ background: page === Math.ceil(filtered.length / PAGE_SIZE) - 1 ? "#f0f0f0" : "#111", color: page === Math.ceil(filtered.length / PAGE_SIZE) - 1 ? "#aaa" : "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: page === Math.ceil(filtered.length / PAGE_SIZE) - 1 ? "default" : "pointer", fontFamily: "inherit" }}
                onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(filtered.length / PAGE_SIZE) - 1}
              >次へ</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}