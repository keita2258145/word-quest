console.log("script.js loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
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

console.log("Firebase Connected!");

async function signup() {

  const name = document.getElementById("name").value;
  const grade = document.getElementById("grade").value;
  const errorText = document.getElementById("error");

  // ตรวจสอบว่ากรอกชื่อหรือยัง
  if (!name.trim()) {
    errorText.innerText = "กรุณากรอกชื่อ";
    errorText.style.display = "block";
    return;
  }

  errorText.style.display = "none";

  await addDoc(
    collection(db, "users"),
    {
      name,
      grade,
      score: 0,
      coins: 0
    }
  );

  const btn = document.getElementById("signupBtn");

  btn.innerText = "✓ ยืนยันแล้ว";
  btn.classList.add("success-btn");
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

async function login() {

  const name = document.getElementById("name").value;
  const grade = document.getElementById("grade").value;
  

  const q = query(
    collection(db, "users"),
    where("name", "==", name),
    where("grade", "==", grade)
  );

  const result = await getDocs(q);

  const errorText = document.getElementById("error");
  if (!name) {
  errorText.innerText = "กรุณากรอกชื่อ";
  errorText.style.display = "block";
  return;
}
  const signupBtn = document.getElementById("signupBtn");

  if (result.empty) {

  if(errorText){
    errorText.innerText = "ไม่พบชื่อนี้ในข้อมูล";
    errorText.style.display = "block";
  }

  if(signupBtn){
    signupBtn.classList.add("blink");
  }

  return;
  } else {
const userDoc = result.docs[0];
localStorage.setItem("userId", userDoc.id);

    await updateDoc(
      doc(db, "users", userDoc.id),
      {
        loginCount: increment(1)
      }
    );
    // ✅ เจอผู้ใช้
    localStorage.setItem("playerName", name);
    localStorage.setItem("playerGrade", grade);

    window.location.href = "charactor3.html";
  }
}
window.signup = signup;
window.login = login;