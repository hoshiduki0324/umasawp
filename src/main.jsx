import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// グローバルスタイル
const style = document.createElement("style");
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { background: #fff; overscroll-behavior: none; }
  button:disabled { opacity: .4; cursor: not-allowed; }
  select { appearance: none; -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  input[type=number]::-webkit-inner-spin-button { display: none; }
  input[type=number]::-webkit-outer-spin-button { display: none; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #f5f5f5; }
  ::-webkit-scrollbar-thumb { background: #888; border-radius: 2px; }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);