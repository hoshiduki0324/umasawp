// 管理者パネル
// アイテム管理・ユーザー管理・統計・CSVエクスポートができる
// 管理者UIDのユーザーのみ表示される
import { useState } from "react";
import { GOODS_LIST } from "../constants";
import { dbSet, dbRemove, dbUpdate } from "../firebase";
import DraggableList from "./DraggableList";

export default function AdminPanel({
  goodsKey, currentGoods, allChars, hasGroups,
  wishEntries, haveEntries, allData,
  showConfirm, showToast,
}) {
  const [adminSub, setAdminSub]         = useState("chars");
  const [newChar, setNewChar]           = useState("");
  const [newCharGroup, setNewCharGroup] = useState("A");
  const [editCharName, setEditCharName] = useState(null);
  const [editCharVal, setEditCharVal]   = useState("");

  // ===== アイテム管理 =====

  // アイテムを追加する
  const addChar = () => {
    const v = newChar.trim();
    if (!v) return;
    if (allChars.some((c) => c.name === v)) { showToast("すでに登録済みです"); return; }
    const grp  = hasGroups ? newCharGroup : null;
    const next = [...allChars, { name: v, group: grp }];
    dbSet(`${goodsKey}/chars`, next.reduce((a, c, i) => ({ ...a, [i]: c }), {}));
    setNewChar("");
    showToast(`「${v}」を追加しました`);
  };

  // アイテムを削除する
  const removeChar = (name) => {
    showConfirm(`「${name}」を削除しますか？`, () => {
      const next = allChars.filter((c) => c.name !== name);
      dbSet(`${goodsKey}/chars`, next.length ? next.reduce((a, c, i) => ({ ...a, [i]: c }), {}) : null);
      showToast(`「${name}」を削除しました`);
    });
  };

  // ドラッグ&ドロップで並び替え
  const reorderChars = (newList) => {
    dbSet(`${goodsKey}/chars`, newList.reduce((a, c, i) => ({ ...a, [i]: c }), {}));
  };

  // アイテム名を変更する（全ユーザーのデータも一括更新）
  const saveEditChar = () => {
    const newName = editCharVal.trim();
    if (!newName || newName === editCharName) { setEditCharName(null); return; }
    if (allChars.some((c) => c.name === newName)) { showToast("同じ名前がすでに存在します"); return; }

    // charsリストを更新
    const next = allChars.map((c) => (c.name === editCharName ? { ...c, name: newName } : c));
    dbSet(`${goodsKey}/chars`, next.reduce((a, c, i) => ({ ...a, [i]: c }), {}));

    // 全ユーザーのwishes/havesのアイテム名も一括更新
    ["wishes", "haves"].forEach((type) => {
      const gData = allData[goodsKey] || {};
      const ents  = gData[type] ? Object.entries(gData[type]) : [];
      ents.forEach(([k, e]) => {
        if (!e.items || !e.items[editCharName]) return;
        const cnt    = e.items[editCharName];
        const updates = {};
        updates[`${goodsKey}/${type}/${k}/items/${editCharName}`] = null;
        updates[`${goodsKey}/${type}/${k}/items/${newName}`]      = cnt;
        dbUpdate("/", updates);
      });
    });

    setEditCharName(null);
    showToast(`「${editCharName}」→「${newName}」に変更しました`);
  };

  // アイテム行を描画する（ドラッグ可能）
  const renderCharRow = (ch, i) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fff", borderRadius: 10, marginBottom: 8, border: "1px solid #e0e0e0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <span style={{ color: "#aaa", fontSize: 14 }}>☰</span>
        {editCharName === ch.name ? (
          <input
            style={{ flex: 1, background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, outline: "none", fontFamily: "inherit" }}
            value={editCharVal}
            onChange={(e) => setEditCharVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveEditChar(); if (e.key === "Escape") setEditCharName(null); }}
            autoFocus
          />
        ) : (
          <span style={{ fontSize: 14, fontWeight: 600 }}>{i + 1}. {ch.name}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {editCharName === ch.name ? (
          <>
            <button style={{ background: "none", border: "1px solid #111", color: "#111", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={saveEditChar}>保存</button>
            <button style={{ background: "none", border: "1px solid #e0e0e0", color: "#888", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setEditCharName(null)}>×</button>
          </>
        ) : (
          <>
            <button style={{ background: "none", border: "1px solid #e0e0e0", color: "#888", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setEditCharName(ch.name); setEditCharVal(ch.name); }}>変更</button>
            <button style={{ background: "none", border: "1px solid #ccc", color: "#cc0000", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => removeChar(ch.name)}>削除</button>
          </>
        )}
      </div>
    </div>
  );

  // ===== 統計 =====
  const renderStats = () => {
    const totalUsers = new Set();
    let totalWishes = 0, totalHaves = 0;
    const rankMap = {};

    GOODS_LIST.forEach((g) => {
      const d = allData[g.key] || {};
      rankMap[g.label] = {};
      Object.values(d.wishes || {}).forEach((e) => {
        if (e.uid) totalUsers.add(e.uid);
        totalWishes++;
        Object.keys(e.items || {}).forEach((item) => {
          if (!rankMap[g.label][item]) rankMap[g.label][item] = 0;
          rankMap[g.label][item]++;
        });
      });
      Object.values(d.haves || {}).forEach((e) => {
        if (e.uid) totalUsers.add(e.uid);
        totalHaves++;
      });
    });

    return (
      <div>
        {/* サマリーカード */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "登録ユーザー数", value: `${totalUsers.size}人` },
            { label: "欲しい登録数",   value: `${totalWishes}件` },
            { label: "所持登録数",     value: `${totalHaves}件` },
            { label: "総登録件数",     value: `${totalWishes + totalHaves}件` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f5f5f5", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#111" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* グッズ別人気ランキング */}
        {GOODS_LIST.map((g) => {
          const ranking = Object.entries(rankMap[g.label] || {})
            .sort((a, b) => b[1] - a[1]).slice(0, 10);
          if (ranking.length === 0) return null;
          const max = ranking[0][1];
          return (
            <div key={g.key} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 10, paddingLeft: 4, borderLeft: "3px solid #111" }}>
                {g.label} 人気ランキング
              </div>
              {ranking.map(([item, count], i) => (
                <div key={item} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? "#111" : "#888", width: 20 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13 }}>{item}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{count}人</span>
                  </div>
                  {/* 棒グラフ */}
                  <div style={{ height: 4, background: "#e0e0e0", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: i === 0 ? "#111" : i === 1 ? "#555" : "#888", borderRadius: 2, width: `${(count / max) * 100}%`, transition: "width .5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // ===== CSVエクスポート =====
  const downloadCSV = (filename, rows) => {
    const bom = "\uFEFF";
    const csv = bom + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const renderExport = () => {
    const exportData = (type, label) => {
      const rows = [["ユーザー名", "グッズ", "アイテム名", "個数"]];
      GOODS_LIST.forEach((g) => {
        const d = allData[g.key] || {};
        Object.values(d[type] || {}).forEach((e) => {
          Object.entries(e.items || {}).forEach(([item, cnt]) => {
            rows.push([e.displayName || "不明", g.label, item, cnt]);
          });
        });
      });
      downloadCSV(`umaswap_${label}.csv`, rows);
    };

    const exportAll = () => {
      const rows = [["ユーザー名", "グッズ", "種別", "アイテム名", "個数"]];
      GOODS_LIST.forEach((g) => {
        const d = allData[g.key] || {};
        Object.values(d.wishes || {}).forEach((e) => {
          Object.entries(e.items || {}).forEach(([item, cnt]) => rows.push([e.displayName || "不明", g.label, "欲しい", item, cnt]));
        });
        Object.values(d.haves || {}).forEach((e) => {
          Object.entries(e.items || {}).forEach(([item, cnt]) => rows.push([e.displayName || "不明", g.label, "所持", item, cnt]));
        });
      });
      downloadCSV("umaswap_全データ.csv", rows);
    };

    return (
      <div>
        <div style={{ fontSize: 13, color: "#888", background: "#f5f5f5", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
          CSVファイルとしてダウンロードできます（Excel等で開けます）
        </div>
        {[
          { label: "🥕 欲しいリスト", desc: "全ユーザーの欲しいリストをCSV出力", fn: () => exportData("wishes", "欲しいリスト") },
          { label: "💎 所持リスト",   desc: "全ユーザーの所持リストをCSV出力",   fn: () => exportData("haves",  "所持リスト") },
          { label: "📋 全データ",     desc: "欲しい・所持をまとめてCSV出力",     fn: exportAll },
        ].map(({ label, desc, fn }) => (
          <div key={label} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 12, padding: "16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
            </div>
            <button style={{ background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 12 }} onClick={fn}>
              DL
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 16, padding: "20px 16px" }}>
      {/* サブタブ */}
      <div style={{ display: "flex", marginBottom: 16, border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
        {[["chars", "🎫 アイテム"], ["users", "👥 ユーザー"], ["stats", "📊 統計"], ["export", "📥 出力"]].map(([key, label]) => (
          <button key={key}
            style={{ flex: 1, padding: "12px 0", border: "none", background: adminSub === key ? "#e8e8e8" : "none", color: adminSub === key ? "#111" : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setAdminSub(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* アイテム管理 */}
      {adminSub === "chars" && (
        <>
          <div style={{ fontSize: 13, color: "#888", background: "#f0f0f0", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            「{currentGoods?.label}」のアイテムを管理します
          </div>

          {/* 追加フォーム */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {hasGroups && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <select
                  style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 28px 12px 12px", color: "#111", fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none", appearance: "none" }}
                  value={newCharGroup} onChange={(e) => setNewCharGroup(e.target.value)}
                >
                  {["A", "B", "C"].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 10, pointerEvents: "none" }}>▼</span>
              </div>
            )}
            <input
              style={{ flex: 1, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 14px", color: "#111", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              placeholder="例: ダイヤモンドアイ"
              value={newChar}
              onChange={(e) => setNewChar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChar()}
            />
            <button
              style={{ background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, minHeight: 48 }}
              onClick={addChar}
            >
              追加
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
            登録済み（{allChars.length}種）― ドラッグで並び替え
          </div>

          {allChars.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: "24px 0", fontSize: 14 }}>まだ登録されていません</div>}

          {/* グループ別またはフラットにアイテムを表示 */}
          {hasGroups ? (
            ["A", "B", "C"].map((grp) => {
              const grpChars = allChars.filter((c) => c.group === grp);
              if (grpChars.length === 0) return null;
              return (
                <div key={grp}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 16, marginBottom: 8 }}>
                    {grp}グループ（{grpChars.length}種）
                  </div>
                  <DraggableList
                    items={grpChars}
                    onReorder={(nl) => { const others = allChars.filter((c) => c.group !== grp); reorderChars([...others, ...nl]); }}
                    renderItem={renderCharRow}
                  />
                </div>
              );
            })
          ) : (
            <DraggableList items={allChars} onReorder={reorderChars} renderItem={renderCharRow} />
          )}
        </>
      )}

      {/* ユーザー管理 */}
      {adminSub === "users" && (
        <>
          <div style={{ fontSize: 13, color: "#888", background: "#f0f0f0", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            「{currentGoods?.label}」の登録を管理します
          </div>
          {["wishes", "haves"].map((type) => {
            const ents = type === "wishes" ? wishEntries : haveEntries;
            if (ents.length === 0) return null;
            return (
              <div key={type} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginTop: 16, marginBottom: 10 }}>
                  {type === "wishes" ? "🥕 欲しいリスト" : "💎 所持リスト"}（{ents.length}人）
                </div>
                {ents.map((entry) => (
                  <div key={entry._key} style={{ padding: "10px 12px", background: "#fff", borderRadius: 10, marginBottom: 8, border: "1px solid #e0e0e0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.displayName || "不明"}</div>
                      <button
                        style={{ background: "none", border: "1px solid #ccc", color: "#cc0000", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => showConfirm("この登録を削除しますか？", () => { dbRemove(`${goodsKey}/${type}/${entry._key}`); showToast("削除しました"); })}
                      >
                        削除
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(entry.items || {}).map(([ch, cnt]) => (
                        <div key={ch} style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 8, padding: "3px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11 }}>{ch}</span>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{cnt}個</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {wishEntries.length === 0 && haveEntries.length === 0 && (
            <div style={{ textAlign: "center", color: "#888", padding: "24px 0", fontSize: 14 }}>登録ユーザーはいません</div>
          )}
        </>
      )}

      {/* 統計 */}
      {adminSub === "stats" && renderStats()}

      {/* エクスポート */}
      {adminSub === "export" && renderExport()}
    </div>
  );
}