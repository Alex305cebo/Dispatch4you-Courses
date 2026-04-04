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

async function run() {
  const snap = await getDocs(collection(db, 'users'));
  let count = 0;
  for (const d of snap.docs) {
    if (d.data().isBot) {
      await deleteDoc(doc(db, 'users', d.id));
      count++;
      console.log(`  🗑️ ${count} — ${d.data().displayName}`);
    }
  }
  console.log(`\n✅ Удалено ${count} ботов`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
