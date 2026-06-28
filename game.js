import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// =====================
// FIREBASE
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyCfzOxAABVVTNzf9MzYN4Ci2BjFF-aSBBc",
  authDomain: "word-quest-ac801.firebaseapp.com",
  projectId: "word-quest-ac801",
  storageBucket: "word-quest-ac801.firebasestorage.app",
  messagingSenderId: "425983043183",
  appId: "1:425983043183:web:8f73dbbe335a7bb52f8f9a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", () => {

  // =====================
  // PLAYER NAME
  // =====================
  const playerName =
    localStorage.getItem("characterName") ||
    localStorage.getItem("playerName") ||
    "Player";

  const top = document.getElementById("charNameTop");
  const main = document.getElementById("charNameMain");

  if (top) top.innerText = playerName;
  if (main) main.innerText = playerName;

  // =====================
  // LOAD SCORE FROM FIREBASE
  // =====================
  const userId = localStorage.getItem("userId");

  if (userId) {

    const userRef = doc(db, "users", userId);

    onSnapshot(userRef, (snap) => {

      if (!snap.exists()) return;

      const data = snap.data();

      document.getElementById("score").innerText = data.score ?? 0;
      document.getElementById("coins").innerText = data.coins ?? 0;

    });

  }

  // =====================
  // BACKGROUND WORDS
  // =====================
  const words = [
    "apple - แอปเปิ้ล",
    "book - หนังสือ",
    "school - โรงเรียน",
    "learn - เรียนรู้",
    "quest - ภารกิจ",
    "grammar - ไวยากรณ์",
    "vocabulary - คำศัพท์"
  ];

  function createWord() {
    const el = document.createElement("div");
    el.classList.add("word");

    el.innerText = words[Math.floor(Math.random() * words.length)];
    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = (12 + Math.random() * 10) + "px";

    const bg = document.getElementById("bgWords");
    if (bg) bg.appendChild(el);

    setTimeout(() => el.remove(), 20000);
  }

  setInterval(createWord, 800);

  // =====================
  // CLICK SOUND
  // =====================
  const clickSound = new Audio("assets/click.mp3");
  clickSound.volume = 0.5;

  function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", playClick);
  });

  // =====================
  // BACKGROUND MUSIC
  // =====================
  const bgm = new Audio("assets/bgm.mp3/the_mountain-inspiring-focus-137045.mp3");
  bgm.loop = true;
  bgm.volume = 0.3;

  window.addEventListener("click", async () => {
    try {
      await bgm.play();
    } catch (error) {
      console.log("เล่นเพลงไม่ได้", error);
    }
  }, { once: true });

});

// =====================
// NAVIGATION
// =====================
window.openRank = () => location.href = "rank.html";
window.openQuest = () => location.href = "quest.html";
window.openVocab = () => location.href = "vocab.html";
window.openShop = () => location.href = "shop.html";
window.dailyLogin = () => location.href = "daily.html";