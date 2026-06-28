import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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

const state = {
  mode: null,
  currentIndex: 0,
  score: 0,
  timer: null,
  timeLeft: 0,
  questions: [],
  currentGame: null,

  questTimeLeft: 0,
  questTimer: null

};

function init() {
  state.mode = document.body.dataset.mode || "multiple";
  state.questions = [];
  state.currentGame = null;
  state.currentIndex = 0;
  state.score = 0;
  document.getElementById("score").textContent = state.score;
  loadGameFromFirebase();
}

function showEmptyState() {
  const gameContent = document.getElementById("gameContent");
  gameContent.innerHTML = `
    <div class="result-box">
      <h3>ยังไม่มีเกมในประเภทนี้</h3>
      <p>กรุณาสร้างเกมจากหน้าแอดมินก่อนเพื่อเริ่มเล่น</p>
    </div>
  `;
}
function startQuestTimer() {

  clearInterval(state.questTimer);

  state.questTimer = setInterval(() => {

    state.questTimeLeft--;

    const timerText = document.getElementById("globalTimer");

    if (timerText) {

      const min = Math.floor(state.questTimeLeft / 60);
      const sec = state.questTimeLeft % 60;

      timerText.textContent =
        `⏳ ${min}:${String(sec).padStart(2,"0")}`;
    }

    if (state.questTimeLeft <= 0) {

      clearInterval(state.questTimer);

      document.getElementById("gameContent").innerHTML = `
        <div class="result-box">
          <h3>หมดเวลาแล้ว</h3>
          <p>คะแนนรวม ${state.score} คะแนน</p>
        </div>
      `;
    }

  }, 1000);
}
async function loadGameFromFirebase() 
{
  try {
    const q = query(
      collection(db, "quests"),
      where("mode", "==", state.mode),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      showEmptyState();
      return;
    }

    const activeDoc = snapshot.docs[0];
    const data = activeDoc.data();
    state.currentGame = data;
    state.questTimeLeft =
  (Number(data.questTimeMinutes) || 10) * 60;

    const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
    state.questions = rawQuestions.map((item) => ({
      question: item.question || "",
      options: Array.isArray(item.options) ? item.options : [],
      answer: item.correct ?? item.answer ?? 0,
      explanation: item.explanation || ""
    }));

    if (!state.questions.length) {
      showEmptyState();
      return;
    }

startQuestTimer();
    renderQuestion();
  } catch (error) {
    console.error(error);
    showEmptyState();
  }
}

function renderQuestion() {
  clearInterval(state.timer);
  const gameContent = document.getElementById("gameContent");

  if (!state.questions.length || state.currentIndex >= state.questions.length) {
    gameContent.innerHTML = `
      <div class="result-box">
        <h3>จบเกมแล้ว</h3>
        <p>คุณได้คะแนนรวม <strong>${state.score}</strong> คะแนน</p>
      </div>
    `;
    return;
  }

  const item = state.questions[state.currentIndex];

  if (state.mode === "multiple" || state.mode === "speed") {
    gameContent.innerHTML = `
      <div class="question-box">
        <h3>${item.question}</h3>
        <div class="option-list">
          ${item.options.map((option, index) => `<button class="option-btn" type="button" data-index="${index}">${option}</button>`).join("")}
        </div>
      </div>
    `;

    gameContent.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const correct = index === item.answer;
        clearInterval(state.timer);
        showFeedback(correct, correct ? "ถูกต้อง!" : "ผิดครับ", item.explanation);
      });
    });
    return;
  }

  gameContent.innerHTML = `
    <div class="question-box">
      <h3>${item.question}</h3>
      <input id="fillInput" class="answer-input" type="text" placeholder="พิมพ์คำตอบ" />
      <button id="checkFillBtn" class="mode-btn" type="button">ตรวจคำตอบ</button>
      <p class="hint-text">คำตอบเป็นคำเดียว</p>
    </div>
  `;

  document.getElementById("checkFillBtn").addEventListener("click", () => {
    const value = document.getElementById("fillInput").value.trim().toLowerCase();
    const correct = value === item.answer.toLowerCase();
    showFeedback(correct, correct ? "ถูกต้อง!" : "ยังไม่ถูก", item.explanation);
  });
}

function showFeedback(correct, title, message) {
  const gameContent = document.getElementById("gameContent");
  gameContent.innerHTML = `
    <div class="result-box ${correct ? "success" : "failure"}">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="feedback-score">คะแนนปัจจุบัน: ${state.score}</div>
    </div>
  `;

  if (correct) {
    state.score += 1;
  }
  document.getElementById("score").textContent = state.score;

  setTimeout(() => {
    state.currentIndex += 1;
    renderQuestion();
  }, 1200);
}

init();
