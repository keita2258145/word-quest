window.dailyLogin = async function(){

  const player = localStorage.getItem("characterName");

  const q = query(collection(db,"users"),
    where("characterName","==",player));

  const snap = await getDocs(q);

  const user = snap.docs[0];
  const data = user.data();

  const today = new Date().toDateString();

  if(data.lastLogin === today){
    alert("รับไปแล้ววันนี้");
    return;
  }

  await updateDoc(doc(db,"users",user.id),{
    coins: increment(20),
    score: increment(10),
    lastLogin: today
  });

  alert("รับรางวัลรายวันแล้ว 🎁");
}