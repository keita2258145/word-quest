
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "word-quest-ac801"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questAdminList =
document.getElementById(
"questAdminList"
);

const q = query(
  collection(db,"quests"),
  orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{

  questAdminList.innerHTML="";

  if(snapshot.empty){

    questAdminList.innerHTML=
    "<p>ยังไม่มีเควส</p>";

    return;
  }

  snapshot.forEach((docSnap)=>{

    const quest =
    docSnap.data();

    const card =
    document.createElement("div");

    card.className =
    "admin-quest-card";

    card.innerHTML = `

      <h3>
      ${quest.title}
      </h3>

      <p>
      📝 ${quest.questions?.length || 0} ข้อ
      </p>

      <p>
      ⏳ ${quest.questTimeMinutes}
      นาที
      </p>

      <div class="admin-actions">

        <button
        class="delete-btn">

        🗑️ ลบ

        </button>

      </div>

    `;

    card
    .querySelector(".delete-btn")
    .onclick = async ()=>{

      const ok =
      confirm(
      "ลบเควสนี้?"
      );

      if(!ok) return;

      await deleteDoc(
        doc(
          db,
          "quests",
          docSnap.id
        )
      );
    };

    questAdminList
    .appendChild(card);

  });

});