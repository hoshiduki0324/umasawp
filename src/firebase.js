// Firebase設定・初期化
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, update } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATTMa4HoXLopRYqhFobao_CXo58OAmjho",
  authDomain: "towel-trade.firebaseapp.com",
  databaseURL: "https://towel-trade-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "towel-trade",
  storageBucket: "towel-trade.firebasestorage.app",
  messagingSenderId: "640028076310",
  appId: "1:640028076310:web:bc2f76d5223af13b0ac837",
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// データベース・認証のインスタンスを取得
export const db = getDatabase(app);
export const auth = getAuth(app);

// Googleログインプロバイダ（毎回アカウント選択画面を表示）
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// 認証関連の関数をエクスポート
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// データベース操作のショートカット関数
export const dbRef = (path) => ref(db, path);
export const dbSet = (path, val) => set(ref(db, path), val);
export const dbRemove = (path) => remove(ref(db, path));
export const dbUpdate = (path, val) => update(ref(db, path), val);
export { onValue };