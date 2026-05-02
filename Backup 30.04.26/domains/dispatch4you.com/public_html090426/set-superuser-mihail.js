const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const app = (getApps().length ? getApps()[0] : initializeApp({
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
}));
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'users'));
  for (const d of snap.docs) {
    const data = d.data();
    if ((data.email || '').toLowerCase() === 'mihail.ce89@gmail.com') {
      await updateDoc(doc(db, 'users', d.id), { accessRole: 'superuser' });
      console.log(`✅ ${data.firstName || ''} ${data.lastName || ''} (${data.email}) — superuser`);
      process.exit(0);
    }
  }
  console.log('❌ Не найден');
  process.exit(0);
}
run().catch(e => { console.error('❌', e); process.exit(1); });
