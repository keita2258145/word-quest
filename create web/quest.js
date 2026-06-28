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

const questList = document.getElementById("questList");

const q = query(
  collection(db, "quests"),
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {

  console.log("จำนวนเควส =", snapshot.size);

  questList.innerHTML = "";

  if (snapshot.empty) {
    questList.innerHTML = `
      <div class="quest-card">
        <h3>ยังไม่มีเควส</h3>
        <p>สร้างเควสแรกได้จากหน้าแอดมิน</p>
      </div>
    `;
    return;
  }

  let hasQuest = false;

  snapshot.forEach((docSnap) => {

    const quest = docSnap.data();

    console.log("Quest:", quest);

    // ต้องเปิดใช้งาน
    if (quest.active === false) return;

    // เช็กวันหมดอายุ
    if (quest.activeUntil) {
      const expire = new Date(quest.activeUntil);

      if (!isNaN(expire.getTime()) && expire < new Date()) {
        return;
      }
    }

    hasQuest = true;

    const card = document.createElement("div");
    card.className = "quest-card";

    card.innerHTML = `
      <h3>${quest.title || "Quest"}</h3>

      <p>📝 ${quest.questions?.length || 0} ข้อ</p>

      <p>⏳ ${quest.questTimeMinutes || 0} นาที</p>

      <p>🎯 ${quest.pointsPerQuestion || 0} แต้ม/ข้อ</p>

      <p id="expire-${docSnap.id}" class="quest-expire"></p>

      <button class="mode-btn play-btn">
        เล่นเควส
      </button>
    `;

    card.querySelector(".play-btn").onclick = () => {
      location.href = `quest-multiple.html?id=${docSnap.id}`;
    };

    questList.appendChild(card);

    if (quest.activeUntil) {
      startCountdown(docSnap.id, quest.activeUntil);
    }

  });

  if (!hasQuest) {
    questList.innerHTML = `
      <div class="quest-card">
        <h3>ไม่มีเควสที่เปิดให้เล่น</h3>
      </div>
    `;
  }

});

function startCountdown(id, endDate) {

  const target = new Date(endDate);

  function update() {

    const el = document.getElementById(`expire-${id}`);

    if (!el) return;

    const diff = target - new Date();

    if (diff <= 0) {
      el.textContent = "⛔ หมดเวลาแล้ว";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    el.textContent =
      `⏰ เหลือ ${days} วัน ${hours} ชม ${mins} นาที`;
  }

  update();
  setInterval(update, 1000);

}