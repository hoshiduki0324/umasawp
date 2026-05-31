// メインアプリコンポーネント
// 認証・データ取得・状態管理を担当し、各コンポーネントを組み合わせる
import { useState, useEffect } from "react";
import { GOODS_LIST, GROUPS, ADMIN_UID } from "./constants";
import { db, dbSet, onValue, dbRef, signInWithGoogle, onAuthChange } from "./firebase";
import WelcomeScreen  from "./components/WelcomeScreen";
import Header         from "./components/Header";
import ConfirmModal   from "./components/ConfirmModal";
import NotifPanel     from "./components/NotifPanel";
import MyPage         from "./components/MyPage";
import OtherUserPage  from "./components/OtherUserPage";
import AllView        from "./components/AllView";
import WishHaveList   from "./components/WishHaveList";
import ItemStats      from "./components/ItemStats";
import AdminPanel     from "./components/AdminPanel";

export default function App() {
  // ===== 認証状態 =====
  const [authUser,  setAuthUser]  = useState(undefined); // undefined=読込中, null=未ログイン
  const [myProfile, setMyProfile] = useState(null);
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [nameInput,     setNameInput]     = useState("");

  // ===== データ =====
  const [allData,   setAllData]   = useState({});  // 全グッズのFirebaseデータ
  const [usersData, setUsersData] = useState({});  // 全ユーザーのプロフィール

  // ===== UI状態 =====
  const [goodsKey,     setGoodsKey]     = useState("all"); // 選択中のグッズ
  const [tab,          setTab]          = useState("list"); // 選択中のタブ
  const [group,        setGroup]        = useState("全体"); // 選択中のグループ
  const [showMyPage,   setShowMyPage]   = useState(false);
  const [viewingUser,  setViewingUser]  = useState(null);  // 閲覧中の他ユーザー
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [notifs,       setNotifs]       = useState([]);
  const [toast,        setToast]        = useState("");
  const [confirm,      setConfirm]      = useState(null);

  // ===== トースト通知 =====
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // ===== 削除確認モーダル =====
  const showConfirm = (msg, onOk) => setConfirm({ message: msg, onOk });
  const hideConfirm = () => setConfirm(null);

  // ===== 認証の監視 =====
  useEffect(() => {
    return onAuthChange((user) => {
      setAuthUser(user);
      if (user) {
        // ログイン済みの場合はプロフィールを購読
        const unsub = onValue(dbRef(`users/${user.uid}/profile`), (snap) => {
          const val = snap.val();
          setMyProfile(val);
          if (!val || !val.displayName) setShowNameSetup(true);
        });
        return unsub;
      } else {
        setMyProfile(null);
      }
    });
  }, []);

  // ===== Firebaseデータの購読 =====
  useEffect(() => {
    // 全グッズのデータを購読
    const unsubs = GOODS_LIST.map((g) =>
      onValue(dbRef(g.key), (snap) => {
        setAllData((prev) => ({ ...prev, [g.key]: snap.val() || {} }));
      })
    );
    // 全ユーザーのプロフィールを購読
    const unsubUsers = onValue(dbRef("users"), (snap) => {
      setUsersData(snap.val() || {});
    });
    return () => { unsubs.forEach((u) => u()); unsubUsers(); };
  }, []);

  // ===== マッチング通知の計算 =====
  useEffect(() => {
    if (!authUser || !myProfile) return;

    // 自分の欲しい・所持アイテムを収集
    const myW = {}, myH = {};
    GOODS_LIST.forEach((g) => {
      const d = allData[g.key] || {};
      Object.values(d.wishes || {}).filter((e) => e.uid === authUser.uid).forEach((e) => {
        Object.keys(e.items || {}).forEach((item) => { myW[`${g.key}::${item}`] = g.label; });
      });
      Object.values(d.haves || {}).filter((e) => e.uid === authUser.uid).forEach((e) => {
        Object.keys(e.items || {}).forEach((item) => { myH[`${g.key}::${item}`] = g.label; });
      });
    });

    // 他ユーザーとのマッチングを検索
    const found = [];
    Object.entries(usersData).forEach(([uid, udata]) => {
      if (uid === authUser.uid) return;
      const name = udata.profile?.displayName || "不明";
      GOODS_LIST.forEach((g) => {
        const d = allData[g.key] || {};
        // 相手が持っていて自分が欲しいもの
        Object.values(d.haves || {}).filter((e) => e.uid === uid).forEach((e) => {
          Object.keys(e.items || {}).forEach((item) => {
            if (myW[`${g.key}::${item}`]) found.push({ type: "want", msg: `${name} が「${item}」(${g.label})を持っています` });
          });
        });
        // 相手が欲しくて自分が持っているもの
        Object.values(d.wishes || {}).filter((e) => e.uid === uid).forEach((e) => {
          Object.keys(e.items || {}).forEach((item) => {
            if (myH[`${g.key}::${item}`]) found.push({ type: "have", msg: `${name} が「${item}」(${g.label})を欲しがっています` });
          });
        });
      });
    });
    setNotifs(found);
  }, [allData, usersData, authUser, myProfile]);

  // ===== グッズ切り替え =====
  const switchGoods = (key) => {
    setGoodsKey(key);
    setTab("list");
    setGroup("全体");
  };

  // ===== 現在のグッズデータ =====
  const currentGoods  = GOODS_LIST.find((g) => g.key === goodsKey);
  const gData         = allData[goodsKey] || {};
  const rawChars      = gData.chars ? Object.values(gData.chars) : [];
  const allChars      = rawChars.map((c) => (typeof c === "string" ? { name: c, group: null } : c));
  const hasGroups     = currentGoods?.hasGroups;
  const wishEntries   = gData.wishes ? Object.entries(gData.wishes).map(([k, v]) => ({ ...v, _key: k })) : [];
  const haveEntries   = gData.haves  ? Object.entries(gData.haves ).map(([k, v]) => ({ ...v, _key: k })) : [];

  // ===== ローディング中 =====
  if (authUser === undefined) return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 16 }}>
      接続中…
    </div>
  );

  // ===== 未ログイン =====
  if (!authUser) return (
    <WelcomeScreen onLogin={() => signInWithGoogle().catch((e) => alert("ログイン失敗: " + e.message))} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif" }}>

      {/* 削除確認モーダル */}
      {confirm && <ConfirmModal message={confirm.message} onOk={() => { confirm.onOk(); hideConfirm(); }} onCancel={hideConfirm} />}

      {/* 初回ログイン時の名前設定モーダル */}
      {showNameSetup && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 20, padding: "32px 24px", maxWidth: 360, width: "100%" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>👋</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>はじめまして！</div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>XのIDまたは名前を入力してください</div>
            <input
              style={{ width: "100%", background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              placeholder="例: @hoshitsuki"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = nameInput.trim();
                  if (v) { dbSet(`users/${authUser.uid}/profile`, { displayName: v, uid: authUser.uid }); setShowNameSetup(false); }
                }
              }}
            />
            <button
              style={{ width: "100%", background: "#111", border: "none", color: "#fff", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}
              onClick={() => {
                const v = nameInput.trim();
                if (v) { dbSet(`users/${authUser.uid}/profile`, { displayName: v, uid: authUser.uid }); setShowNameSetup(false); }
              }}
            >
              設定する
            </button>
          </div>
        </div>
      )}

      {/* マイページモーダル */}
      {showMyPage && (
        <MyPage authUser={authUser} myProfile={myProfile} allData={allData} onClose={() => setShowMyPage(false)} />
      )}

      {/* 他ユーザーのマイページモーダル */}
      {viewingUser && (
        <OtherUserPage viewingUser={viewingUser} usersData={usersData} allData={allData} onClose={() => setViewingUser(null)} />
      )}

      {/* 通知パネル */}
      {showNotifs && (
        <NotifPanel notifs={notifs} onClose={() => setShowNotifs(false)} />
      )}

      {/* ヘッダー */}
      <Header
        authUser={authUser}
        myProfile={myProfile}
        allData={allData}
        goodsKey={goodsKey}
        notifs={notifs}
        onSwitchGoods={switchGoods}
        onOpenMyPage={() => setShowMyPage(true)}
        onToggleNotifs={() => setShowNotifs((v) => !v)}
      />

      {/* タブナビゲーション */}
      {goodsKey !== "all" && (
        <nav style={{ display: "flex", maxWidth: 600, margin: "0 auto", borderBottom: "1px solid #e0e0e0", background: "#fff" }}>
          {[
            ["list", "🥕 欲しい"],
            ["have", "💎 所持"],
            ["char", "アイテム別"],
            ...(authUser?.uid === ADMIN_UID ? [["admin", "⚙ 管理"]] : []),
          ].map(([key, label]) => (
            <button key={key}
              style={{ flex: 1, padding: "12px 0", border: "none", background: "none", color: tab === key ? "#111" : "#888", fontSize: 12, fontWeight: tab === key ? 700 : 600, cursor: "pointer", borderBottom: `2px solid ${tab === key ? "#111" : "transparent"}`, transition: "all .2s", fontFamily: "inherit" }}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* グループタブ */}
      {goodsKey !== "all" && hasGroups && (tab === "list" || tab === "have" || tab === "char") && (
        <div style={{ display: "flex", maxWidth: 600, margin: "0 auto", borderBottom: "1px solid #e0e0e0", background: "#f9f9f9" }}>
          {GROUPS.map((g) => (
            <button key={g}
              style={{ flex: 1, padding: "10px 0", border: "none", background: "none", color: group === g ? "#111" : "#888", fontSize: 12, fontWeight: group === g ? 700 : 600, cursor: "pointer", borderBottom: `2px solid ${group === g ? "#111" : "transparent"}`, transition: "all .2s", fontFamily: "inherit" }}
              onClick={() => setGroup(g)}
            >
              {g === "全体" ? "全体" : `${g}グループ`}
            </button>
          ))}
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 100px" }}>

        {/* 全体タブ */}
        {goodsKey === "all" && (
          <AllView allData={allData} authUser={authUser} onViewUser={setViewingUser} />
        )}

        {/* 欲しいタブ */}
        {goodsKey !== "all" && tab === "list" && (
          <WishHaveList
            mode="wish"
            allChars={allChars} hasGroups={hasGroups} group={group}
            wishEntries={wishEntries} haveEntries={haveEntries}
            authUser={authUser} myProfile={myProfile} goodsKey={goodsKey}
            allData={allData} showConfirm={showConfirm} showToast={showToast}
          />
        )}

        {/* 所持タブ */}
        {goodsKey !== "all" && tab === "have" && (
          <WishHaveList
            mode="have"
            allChars={allChars} hasGroups={hasGroups} group={group}
            wishEntries={wishEntries} haveEntries={haveEntries}
            authUser={authUser} myProfile={myProfile} goodsKey={goodsKey}
            allData={allData} showConfirm={showConfirm} showToast={showToast}
          />
        )}

        {/* アイテム別タブ */}
        {goodsKey !== "all" && tab === "char" && (
          <ItemStats
            allChars={allChars} hasGroups={hasGroups} group={group}
            wishEntries={wishEntries} haveEntries={haveEntries}
          />
        )}

        {/* 管理タブ（管理者のみ） */}
        {goodsKey !== "all" && tab === "admin" && authUser?.uid === ADMIN_UID && (
          <AdminPanel
            goodsKey={goodsKey} currentGoods={currentGoods}
            allChars={allChars} hasGroups={hasGroups}
            wishEntries={wishEntries} haveEntries={haveEntries}
            allData={allData} showConfirm={showConfirm} showToast={showToast}
          />
        )}
      </div>

      {/* トースト通知 */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", padding: "12px 28px", borderRadius: 99, fontWeight: 700, fontSize: 14, zIndex: 100, boxShadow: "0 4px 20px #00000066", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}