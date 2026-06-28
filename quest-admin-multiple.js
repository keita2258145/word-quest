import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore
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

/* ================= CLEAN START (IMPORTANT) ================= */

localStorage.removeItem("questDraft");
sessionStorage.removeItem("pendingQuestions");

/* ================= STATE ================= */

const state = {
  count: 0,
  currentIndex: 0,
  questions: []
};

/* ================= ELEMENTS ================= */

const intro = document.getElementById("stepIntro");
const questionStep = document.getElementById("stepQuestion");
const stepLabel = document.getElementById("stepLabel");
const messageBox = document.getElementById("messageBox");
const questionForm = document.getElementById("questionForm");
const countSelect = document.getElementById("countSelect");

const qInput = document.getElementById("questionInput");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");
const correctInput = document.getElementById("correctInput");
const explanationInput = document.getElementById("explanationInput");

/* ================= UI RESET ================= */

function resetUI() {
  intro.classList.remove("hidden");
  questionStep.classList.add("hidden");
  countSelect.value = "";
  stepLabel.textContent = "ข้อ 1 / 0";
}

/* ================= STORAGE ================= */

function saveDraft() {
  localStorage.setItem("questDraft", JSON.stringify(state));
}

function clearDraft() {
  localStorage.removeItem("questDraft");
}

/* ================= LOAD DRAFT ================= */

function loadDraft() {

  const draft = localStorage.getItem("questDraft");
  if (!draft) return;

  try {

    const data = JSON.parse(draft);

    state.count = Number(data.count || 0);
    state.currentIndex = Number(data.currentIndex || 0);
    state.questions = Array.isArray(data.questions)
      ? data.questions
      : [];

    if (state.count > 0) {

      countSelect.value = state.count;

      intro.classList.add("hidden");
      questionStep.classList.remove("hidden");

      updateStepLabel();
      fillFormFromState(state.currentIndex);
    }

  } catch (err) {

    console.warn("questDraft corrupted:", err);
    localStorage.setItem("questDraft_backup", draft);
    localStorage.removeItem("questDraft");
  }
}

/* ================= HELPERS ================= */

function updateStepLabel() {
  stepLabel.textContent = `ข้อ ${state.currentIndex + 1} / ${state.count}`;
}

function showMessage(text) {
  messageBox.textContent = text;
}

function fillFormFromState(index) {

  const q = state.questions[index];

  if (!q) {
    questionForm.reset();
    return;
  }

  qInput.value = q.question || "";

  option1.value = q.options?.[0] || "";
  option2.value = q.options?.[1] || "";
  option3.value = q.options?.[2] || "";
  option4.value = q.options?.[3] || "";

  correctInput.value = q.correct || "";
  explanationInput.value = q.explanation || "";
}

/* ================= SAVE CURRENT ================= */

function saveCurrentQuestion() {

  if (!state.count) return;

  state.questions[state.currentIndex] = {
    question: qInput.value.trim(),
    options: [
      option1.value.trim(),
      option2.value.trim(),
      option3.value.trim(),
      option4.value.trim()
    ],
    correct: Number(correctInput.value),
    explanation: explanationInput.value.trim()
  };

  saveDraft();
}

/* ================= INIT ================= */

resetUI();
loadDraft();

/* ================= COUNT SELECT ================= */

countSelect.addEventListener("change", () => {

  const value = Number(countSelect.value);
  if (!value) return;

  const hasDraft =
    state.questions.length > 0 ||
    localStorage.getItem("questDraft");

  if (state.count > 0 && hasDraft) {

    const ok = confirm(
      "เปลี่ยนจำนวนข้อจะล้างข้อมูลเดิมทั้งหมด ต้องการดำเนินการต่อหรือไม่?"
    );

    if (!ok) {
      countSelect.value = state.count;
      return;
    }
  }

  state.count = value;
  state.currentIndex = 0;
  state.questions = [];

  intro.classList.add("hidden");
  questionStep.classList.remove("hidden");

  updateStepLabel();
  saveDraft();
});

/* ================= AUTOSAVE ================= */

[
  qInput,
  option1,
  option2,
  option3,
  option4,
  correctInput,
  explanationInput
].forEach(input => {

  input.addEventListener("input", () => {

    if (!state.count) return;

    saveCurrentQuestion();
  });

});

/* ================= BACK ================= */

document.getElementById("backStepBtn")
?.addEventListener("click", () => {

  saveCurrentQuestion();

  if (state.currentIndex <= 0) {

    questionStep.classList.add("hidden");
    intro.classList.remove("hidden");

    return;
  }

  state.currentIndex--;

  fillFormFromState(state.currentIndex);

  updateStepLabel();
  saveDraft();
});

/* ================= SUBMIT ================= */

questionForm.addEventListener("submit", (event) => {

  event.preventDefault();

  if (!state.questions.length) {
    showMessage("ยังไม่มีคำถาม");
    return;
  }

  const question = qInput.value.trim();

  const options = [
    option1.value.trim(),
    option2.value.trim(),
    option3.value.trim(),
    option4.value.trim()
  ];

  const correct = Number(correctInput.value);

  if (
    !question ||
    options.some(o => !o) ||
    correct < 1 || correct > 4
  ) {
    showMessage("กรอกข้อมูลให้ครบ");
    return;
  }

  state.questions[state.currentIndex] = {
    question,
    options,
    correct,
    explanation: explanationInput.value.trim()
  };

  saveDraft();

  state.currentIndex++;

  if (state.currentIndex >= state.count) {

    sessionStorage.setItem(
      "pendingQuestions",
      JSON.stringify(state.questions)
    );

    clearDraft();

    window.location.href = "quest-admin-multiple2.html";
    return;
  }

  updateStepLabel();

  if (state.questions[state.currentIndex]) {
    fillFormFromState(state.currentIndex);
  } else {
    questionForm.reset();
  }

  saveDraft();
});