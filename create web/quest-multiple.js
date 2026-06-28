
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  getDocs
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

const questId =
new URLSearchParams(
  location.search
).get("id");

const state = {
  quest: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  timer: null,
  secondsLeft: 0
};

const gameContent =
document.getElementById("gameContent");

const scoreText =
document.getElementById("score");

const timerText =
document.getElementById("globalTimer");

loadQuest();

async function loadQuest(){

  if(!questId){

    alert("ไม่พบ Quest");

    location.href = "quest.html";

    return;
  }

  const snap =
  await getDoc(
    doc(db,"quests",questId)
  );

  if(!snap.exists()){

    alert("ไม่พบ Quest");

    location.href="quest.html";

    return;
  }

  state.quest = snap.data();
  const playKey = `quest_attempt_${questId}`;

const played =
Number(
  localStorage.getItem(playKey) || 0
);

if (
  played >= state.quest.attempts
){

  alert(
    "คุณใช้สิทธิ์เล่นครบแล้ว"
  );

  location.href =
    "quest.html";

  return;
}
  const now = new Date();
const expireDate = new Date(state.quest.activeUntil);

if (expireDate < now) {

  alert("เควสนี้หมดเวลาแล้ว");

  location.href = "quest.html";

  return;
}

  state.questions =
  state.quest.questions || [];

  state.secondsLeft =
  (state.quest.questTimeMinutes || 10)
  * 60;

  startGlobalTimer();

  renderQuestion();
}

function startGlobalTimer(){

  updateTimer();

  state.timer =
  setInterval(()=>{

    state.secondsLeft--;

    updateTimer();

    if(state.secondsLeft <= 0){

      clearInterval(state.timer);

      finishQuest(
        "⏰ หมดเวลาแล้ว"
      );
    }

  },1000);
}

function updateTimer(){

  const min =
  Math.floor(
    state.secondsLeft / 60
  );

  const sec =
  state.secondsLeft % 60;

  timerText.textContent =
  `⏳ ${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function renderQuestion(){

  if(
    state.currentIndex >=
    state.questions.length
  ){

    finishQuest("🎉 จบเควส");
    return;
  }

  const q =
  state.questions[
    state.currentIndex
  ];
 

  gameContent.innerHTML = `

  <div class="question-box">

    <h3>
      ข้อ ${state.currentIndex+1}
    </h3>

    <h2>${q.question}</h2>

    <div class="option-list">

      ${q.options.map((option,index)=>`

      <button
      class="option-btn"
      data-index="${index+1}">

      ${option}

      </button>

      `).join("")}

    </div>

  </div>

  `;

  document
  .querySelectorAll(".option-btn")
  .forEach(btn=>{

    btn.addEventListener(
      "click",
      ()=>{

        const answer =
        Number(
          btn.dataset.index
        );

        const correct =
        answer === q.correct;

        showFeedback(
          correct,
          q.explanation
        );
      }
    );
  });
}

function showFeedback(
  correct,
  explanation
){

  if(correct){

    state.score +=
    Number(
      state.quest
      .pointsPerQuestion || 10
    );
  }

  scoreText.textContent =
  state.score;

  gameContent.innerHTML = `

  <div class="
  result-box
  ${correct
    ? "success"
    : "failure"}">

    <h3>

    ${correct
      ? "✅ ถูกต้อง"
      : "❌ ไม่ถูก"}

    </h3>

    <p>${explanation}</p>

  </div>

  `;

  setTimeout(()=>{

    state.currentIndex++;

    renderQuestion();

  },1500);
}

async function finishQuest(title){
   const playerName =
localStorage.getItem("playerName") || "ไม่ระบุชื่อ";

await addDoc(
  collection(db, "scores"),
  {
    questId,
    playerName,
    playerGrade: localStorage.getItem("playerGrade") || "-",
    score: state.score,
    totalQuestions: state.questions.length,
    playedAt: new Date()
  }
);
const userId = localStorage.getItem("userId");

if (userId) {

  await updateDoc(
    doc(db, "users", userId),
    {
      score: increment(state.score)
    }
  );

}
const userQuery = query(
  collection(db, "users"),
  where("name", "==", playerName)
);

const userSnap = await getDocs(userQuery);

if (!userSnap.empty) {

  const userRef = userSnap.docs[0].ref;

  await updateDoc(userRef, {
    score: increment(state.score)
  });

}

  clearInterval(state.timer);

  gameContent.innerHTML = `

  <div class="result-box success">

    <h2>${title}</h2>

    <p>

    คะแนนรวม

    </p>

    <h1>

    ${state.score}

    </h1>

    <button
    class="mode-btn"
    onclick="location.href='quest.html'">

    กลับหน้าเควส

    </button>

  </div>

  `;
}
