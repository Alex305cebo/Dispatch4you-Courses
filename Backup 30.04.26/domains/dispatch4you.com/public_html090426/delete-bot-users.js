/**
 * delete-bot-users.js
 * Удаляет всех ботов из Firestore (isBot: true)
 * Запуск: node delete-bot-users.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
});

const db = getFirestore(app);

async function deleteBots() {
  const snap = await getDocs(collection(db, "users"));
  const bots = [];
  snap.forEach(d => { if (d.data().isBot === true) bots.push(d.id); });

  console.log(`Найдено ботов: ${bots.length}`);
  if (bots.length === 0) { console.log("Ничего удалять не нужно."); return; }

  for (const id of bots) {
    await deleteDoc(doc(db, "users", id));
    console.log(`Удалён: ${id}`);
  }
  console.log("✅ Все боты удалены.");
}

deleteBots().catch(console.error);
