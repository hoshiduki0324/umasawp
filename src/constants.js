// アプリ全体で使う定数

// 管理者のGoogle UID（この人だけ管理タブが見える）
export const ADMIN_UID = "LGCMijNsMRX9AWDHCYHikNKXGI52";

// グッズの種類一覧
// hasGroups: A/B/Cグループ分けがあるかどうか
export const GOODS_LIST = [
  { key: "towel",   label: "ミニタオル",         hasGroups: false },
  { key: "corotta", label: "コロッタ",           hasGroups: true  },
  { key: "coaster", label: "アクリルコースター", hasGroups: true  },
  { key: "straw",   label: "ストローマーカー",   hasGroups: true  },
  { key: "shoes",   label: "勝負靴キーホルダー", hasGroups: false },
];

// グループの選択肢
export const GROUPS = ["全体", "A", "B", "C"];

// カラーテーマ
export const C = {
  bg: "#ffffff",
  card: "#f8f8f8",
  border: "#e0e0e0",
  border2: "#cccccc",
  accent: "#111111",
  accent2: "#333333",
  accent3: "#555555",
  text: "#111111",
  text2: "#333333",
  muted: "#888888",
  active: "#eeeeee",
  danger: "#cc0000",
  green: "#007733",
};