const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const app = initializeApp({
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
});
const db = getFirestore(app);

async function cleanup() {
  const snap = await getDocs(collection(db, 'users'));
  let del = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const email = data.email || '';
    // Удаляем старых английских ботов (email содержит @testbot.dispatch4you.com и id начинается с bot_..._ с timestamp)
    if (email.includes('@testbot.dispatch4you.com') && d.id.includes('_1')) {
      // Проверяем что это старый бот с timestamp в ID (длинный ID)
      if (d.id.length > 30) {
        console.log(`  🗑️ ${data.displayName || email} — ${d.id}`);
        await deleteDoc(doc(db, 'users', d.id));
        del++;
      }
    }
  }
  console.log(`\nУдалено ${del} старых ботов`);
  process.exit(0);
}
cleanup().catch(e => { console.error(e); process.exit(1); });
