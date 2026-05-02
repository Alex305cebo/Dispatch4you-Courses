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
  let updated = 0;
  const bots = [];
  snap.forEach(d => { if (d.data().isBot) bots.push({ id: d.id, ...d.data() }); });
  
  console.log(`Найдено ${bots.length} ботов. Распределяю активность по 30 дням...\n`);
  
  for (let i = 0; i < bots.length; i++) {
    const bot = bots[i];
    // Distribute across last 30 days - higher XP bots more recent
    const daysAgo = Math.floor((i / bots.length) * 28) + Math.floor(Math.random() * 3);
    const la = new Date();
    la.setDate(la.getDate() - daysAgo);
    la.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
    
    // Created 30-90 days ago
    const ca = new Date();
    ca.setDate(ca.getDate() - 30 - Math.floor(Math.random() * 60));
    
    // XP history spread across last 30 days
    const xp = bot.xp || 0;
    const hist = [];
    const steps = Math.min(15, Math.max(3, Math.floor(xp / 40)));
    let cumXP = 0;
    for (let j = 0; j < steps; j++) {
      const dayOffset = Math.floor((j / steps) * 28);
      const d = new Date();
      d.setDate(d.getDate() - (28 - dayOffset));
      cumXP += Math.max(1, Math.floor(xp / steps) + Math.floor(Math.random() * 20) - 10);
      hist.push({ date: d.toISOString(), xp: Math.min(cumXP, xp), ts: d.toISOString() });
    }
    
    await updateDoc(doc(db, 'users', bot.id), {
      lastActivity: la.toISOString(),
      createdAt: ca.toISOString(),
      xpHistory: hist
    });
    
    console.log(`  ✅ ${bot.firstName} ${bot.lastName} — активность ${daysAgo}д назад`);
    updated++;
  }
  
  console.log(`\n🎉 Обновлено ${updated} ботов`);
  process.exit(0);
}
run().catch(e => { console.error('❌', e); process.exit(1); });
