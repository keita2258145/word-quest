import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
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
const ADMIN_PASSWORD = "admin2026";

function ensureAdminAccess() {
  const stored = sessionStorage.getItem("adminvocab-auth");
  if (stored === "true") return true;

  const entered = prompt("กรอกรหัสผ่านเพื่อเข้าสู่หน้า Admin", "");
  if (entered === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminvocab-auth", "true");
    return true;
  }

  alert("รหัสผ่านไม่ถูกต้อง");
  window.location.href = "game.html";
  return false;
}

if (!ensureAdminAccess()) {
  throw new Error("Blocked");
}

const form = document.getElementById("addWordForm");
const wordList = document.getElementById("wordList");
const messageBox = document.getElementById("messageBox");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  window.history.back();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const word = document.getElementById("wordInput").value.trim();
  const type = document.getElementById("typeInput").value.trim();
  const meaning = document.getElementById("meaningInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();
  const sentenceMeaning = document.getElementById("sentenceMeaningInput").value.trim();

  if (!word || !type || !meaning) {
    showMessage("กรอกคำศัพท์ ชนิดคำ และคำแปลให้ครบก่อน");
    return;
  }

  try {
    await addDoc(collection(db, "vocab"), {
      word,
      type,
      meaning,
      note,
      sentenceMeaning,
      createdAt: new Date()
    });

    form.reset();
    showMessage("เพิ่มคำศัพท์สำเร็จ");
  } catch (error) {
    console.error(error);
    showMessage("เพิ่มคำศัพท์ไม่สำเร็จ");
  }
});

function showMessage(text) {
  messageBox.textContent = text;
}

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
  wordList.innerHTML = "";

  if (snapshot.empty) {
    wordList.innerHTML = "<div class='empty-state'>ยังไม่มีคำศัพท์ในระบบ</div>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const item = document.createElement("div");
    item.className = "word-item";

    const wordText = data.word || "-";
    const typeText = data.type || "-";
    const exampleText = data.note || "";
    const meaningText = data.meaning || "-";
    const sentenceMeaningText = data.sentenceMeaning || "";
    const highlightedExample = highlightText(exampleText, wordText);
    const highlightedSentenceMeaning = highlightText(sentenceMeaningText, meaningText);

    item.innerHTML = `
      <div class="word-info">
        <div class="word-title"><strong>${wordText}</strong> <span class="word-type">(${typeText})</span></div>
        ${exampleText ? `<div class="example-box">${highlightedExample}</div>` : ""}
        ${sentenceMeaningText ? `<div class="sentence-translation-box">${highlightedSentenceMeaning}</div>` : ""}
      </div>
      <button class="delete-btn" data-id="${docSnap.id}">ลบ</button>
    `;

    wordList.appendChild(item);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      try {
        await deleteDoc(doc(db, "vocab", id));
        showMessage("ลบคำศัพท์สำเร็จ");
      } catch (error) {
        console.error(error);
        showMessage("ลบคำศัพท์ไม่สำเร็จ");
      }
    });
  });
});
