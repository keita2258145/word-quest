import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyCfzOxAABVVTNzf9MzYN4Ci2BjFF-aSBBc",
  authDomain: "word-quest-ac801.firebaseapp.com",
  projectId: "word-quest-ac801",
  storageBucket: "word-quest-ac801.appspot.com",
  messagingSenderId: "425983043183",
  appId: "1:425983043183:web:8f73dbbe335a7bb52f8f9a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= SAFE LOAD ================= */

let questions = [];

try {
  questions = JSON.parse(sessionStorage.getItem("pendingQuestions")) || [];
} catch (err) {
  questions = [];
}

if (!questions.length) {
  alert("ไม่พบคำถาม");
  location.href = "quest-admin-multiple.html";
}

/* ================= ELEMENTS ================= */

const form = document.getElementById("configForm");
const messageBox = document.getElementById("messageBox");
const submitBtn = form.querySelector('button[type="submit"]');

/* ================= ERROR ================= */

function showError(msg) {
  messageBox.textContent = msg;
}

/* ================= SUBMIT ================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const title = document.getElementById("titleInput").value.trim();

  const questTimeMinutes =
    Number(document.getElementById("timeInput").value);

  const pointsPerQuestion =
    Number(document.getElementById("pointsInput").value);

  const attempts =
    Number(document.getElementById("attemptsInput").value);

  const activeUntil =
    document.getElementById("activeUntilInput").value;

  /* ================= VALIDATION ================= */

  if (!title) return showError("กรุณากรอกชื่อเควส");

  if (!questions.length) return showError("ไม่พบคำถาม");

  if (questTimeMinutes <= 0) return showError("เวลาไม่ถูกต้อง");

  if (pointsPerQuestion <= 0) return showError("คะแนนไม่ถูกต้อง");

  if (attempts <= 0) return showError("จำนวนครั้งไม่ถูกต้อง");

  if (!activeUntil) return showError("กรุณาเลือกวันหมดอายุ");

  if (new Date(activeUntil) <= new Date()) {
    return showError("วันที่หมดอายุต้องมากกว่าปัจจุบัน");
  }

  /* ================= LOADING ================= */

  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังบันทึก...";

  try {

    await addDoc(collection(db, "quests"), {

      title,
      mode: "multiple",
      questions,
      totalQuestions: questions.length,

      questTimeMinutes,
      pointsPerQuestion,
      attempts,
      activeUntil,

      active: true,
      createdAt: serverTimestamp()
    });

    /* ================= CLEAN UP (IMPORTANT FIX) ================= */

    sessionStorage.removeItem("pendingQuestions");
    localStorage.removeItem("questDraft");

    messageBox.textContent = "🎉 สร้างเควสสำเร็จ";

    setTimeout(() => {

      // 🔥 FIX: กลับไปหน้าเริ่มสร้างเควสจริง
      location.href = "quest-admin.html";

    }, 1000);

  } catch (err) {

    console.error(err);

    messageBox.textContent = "❌ สร้างเควสไม่สำเร็จ";

    submitBtn.disabled = false;
    submitBtn.textContent = "บันทึกเควส";
  }
});