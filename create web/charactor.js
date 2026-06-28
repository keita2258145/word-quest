import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABzNwq0Z4oLuNHId-fjUOVQXH7e7A-cU",
  authDomain: "word-quest-ac801.firebaseapp.com",
  projectId: "word-quest-ac801",
  storageBucket: "word-quest-ac801.firebasestorage.app",
  messagingSenderId: "425983043183",
  appId: "1:425983043183:web:8f73dbbe335a7bb52f8f9a"
};

// init firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createCharacter() {

  const characterName =
    document.getElementById("characterName").value.trim();

  if (!characterName) {
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerText = "กรุณาตั้งชื่อตัวละคร";
    return;
  }

  const playerName = localStorage.getItem("playerName");
  const playerGrade = localStorage.getItem("playerGrade");

  const q = query(
    collection(db, "users"),
    where("name", "==", playerName),
    where("grade", "==", playerGrade)
  );

  const result = await getDocs(q);

  if (result.empty) {
    alert("ไม่พบข้อมูลผู้เล่น");
    return;
  }

  const userDoc = result.docs[0];

  await updateDoc(
    doc(db, "users", userDoc.id),
    {
      characterName: characterName
    }
  );

  localStorage.setItem("characterName", characterName);

  window.location.href = "game.html";
}

// สำคัญมาก (แก้ปุ่ม onclick ไม่ทำงาน)
window.createCharacter = createCharacter;