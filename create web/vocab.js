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

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  window.history.back();
});

const q = query(collection(db, "vocab"), orderBy("createdAt", "desc"));

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, target) {
  if (!text || !target) return text;
  const escapedTarget = escapeRegExp(target);
  return text.replace(new RegExp(escapedTarget, "gi"), "<span class='highlight-word'>$&</span>");
}

onSnapshot(q, (snapshot) => {
  const container = document.getElementById("vocabContent");
  if (!container) return;

  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<div class='empty-state'>ยังไม่มีคำศัพท์ในระบบ</div>";
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "vocab-card";

    const wordText = data.word || "-";
    const typeText = data.type || "-";
    const exampleText = data.note || "";
    const meaningText = data.meaning || "-";
    const sentenceMeaningText = data.sentenceMeaning || "";
    const highlightedExample = highlightText(exampleText, wordText);
    const highlightedSentenceMeaning = highlightText(sentenceMeaningText, meaningText);

    card.innerHTML = `
      <div class="word-title"><strong>${wordText}</strong> <span class="word-type">(${typeText})</span></div>
      ${exampleText ? `<div class="example-box">${highlightedExample}</div>` : ""}
      ${sentenceMeaningText ? `<div class="sentence-translation-box">${highlightedSentenceMeaning}</div>` : ""}
    `;

    container.appendChild(card);
  });
});