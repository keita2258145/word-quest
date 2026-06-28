import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABzNwq0Z4oLuNHId-fjUOVTQXH7e7A-cU",
  authDomain: "word-quest-ac801.firebaseapp.com",
  projectId: "word-quest-ac801",
  storageBucket: "word-quest-ac801.appspot.com",
  messagingSenderId: "425983043183",
  appId: "1:425983043183:web:8f73dbbe335a7bb52f8f9a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rankList = document.getElementById("rankList");

// =========================
// MUSIC START
// =========================
const bgm = document.getElementById("bgm");

window.addEventListener("click", () => {

  const bgm = document.getElementById("bgm");

  if (!bgm) {
    console.log("❌ ไม่เจอ audio element");
    return;
  }

  bgm.volume = 0.3;

  const playPromise = bgm.play();

  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.log("❌ เล่นเพลงไม่ได้:", err);
    });
  }

}, { once: true });

// =========================
// REALTIME RANK
// =========================
const q = query(collection(db, "users"), orderBy("score", "desc"));

onSnapshot(q, (snapshot) => {

  rankList.innerHTML = "";

  let index = 0;

  snapshot.forEach(doc => {

    index++;

    const data = doc.data();

    const div = document.createElement("div");
    div.classList.add("rank-item");

    if(index === 1) div.classList.add("top1");
    if(index === 2) div.classList.add("top2");
    if(index === 3) div.classList.add("top3");

    div.innerHTML = `
      <div class="rank-content">
        <div class="rank-number">${index}</div>
        <div class="rank-text">
          <div class="name">${data.characterName}</div>
          <div class="rank-tag">${index === 1 ? "Champion" : index === 2 ? "Runner-up" : index === 3 ? "Third place" : "Player"}</div>
        </div>
      </div>
      <div class="score">⭐ ${data.score || 0}</div>
    `;

    rankList.appendChild(div);
  });

});