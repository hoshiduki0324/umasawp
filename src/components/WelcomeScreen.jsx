// ログイン前に表示されるウェルカム画面
// サイトの説明とGoogleログインボタンを表示する
export default function WelcomeScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#111111",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Noto Sans JP',sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        {/* タイトル */}
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4, display: "flex", gap: 4, justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 900 }}>Uma</span>
          <span style={{ color: "#ddd" }}>Swap</span>
        </h1>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 40, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          7th EVENT THE STAGE · グッズ交換管理
        </p>

        {/* 機能説明カード */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {[
            { icon: "🥕", title: "欲しいリストを登録", desc: "欲しいグッズ・キャラを登録しよう" },
            { icon: "💎", title: "所持リストを登録",   desc: "手元にあるグッズを登録しよう" },
            { icon: "🔔", title: "マッチング通知",     desc: "交換相手が見つかると自動で通知！" },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderLeft: "3px solid #fff",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16, textAlign: "left",
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ログインボタン */}
        <button
          style={{
            width: "100%", background: "#fff", border: "none",
            color: "#111", borderRadius: 16, padding: "16px 0",
            fontSize: 17, fontWeight: 900, cursor: "pointer",
            fontFamily: "inherit", boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onClick={onLogin}
        >
          Googleアカウントでログイン
        </button>
        <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
          ログインして交換相手を見つけよう！
        </p>
      </div>
    </div>
  );
}
