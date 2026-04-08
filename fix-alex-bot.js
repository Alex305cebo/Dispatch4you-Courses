const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } = require('firebase/firestore');
const app = initializeApp({
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
});
const db = getFirestore(app);

async function run(){
  // Удаляю бота Alex Ce
  const snap = await getDocs(collection(db,'users'));
  for(const d of snap.docs){
    const data = d.data();
    if(d.id.startsWith('bot_nick_alex.ce')){
      await deleteDoc(doc(db,'users',d.id));
      console.log('🗑️  Удалён бот Alex Ce:', d.id);
    }
  }

  // Создаю замену — Rick Owens
  function rnd(d){const x=new Date();x.setDate(x.getDate()-Math.floor(Math.random()*d));x.setHours(Math.floor(Math.random()*24),Math.floor(Math.random()*60));return x}
  function xpH(xp){const h=[];let c=0;const n=Math.min(20,Math.max(3,Math.floor(xp/50)));for(let i=0;i<n;i++){c+=Math.max(1,Math.floor(xp/n)+Math.floor(Math.random()*20)-10);const d=new Date();d.setDate(d.getDate()-(n-i)*2);h.push({date:d.toISOString(),xp:Math.min(c,xp)})}return h}
  function lvl(xp){const t=[0,50,150,300,500,800,1200,1800,2500];let l=1;for(let i=t.length-1;i>=0;i--)if(xp>=t[i]){l=i+1;break}return Math.min(l,10)}

  const b={first:'Rick',last:'Owens',xp:762,streak:14,lessons:6,modules:4,cases:16,cards:27,quiz:119,correct:94};
  const uid='bot_nick_rick.owens_0';
  const r=lvl(b.xp);
  const ca=rnd(90);const la=rnd(7);
  const photo='https://ui-avatars.com/api/?name=R&background=6366f1&color=fff&size=128&bold=true&format=png';

  await setDoc(doc(db,'users',uid),{
    firstName:b.first,lastName:b.last,displayName:b.first+' '+b.last,
    email:'rick.owens@testbot.dispatch4you.com',photoURL:photo,xp:b.xp,role:r,accessRole:'registered',
    status:'active',loginStreak:b.streak,maxStreak:b.streak+3,
    lastActivity:la.toISOString(),createdAt:ca.toISOString(),isBot:true,
    stats:{completedLessons:Array.from({length:b.lessons},(_,j)=>'lesson_'+(j+1)),completedModules:Array.from({length:b.modules},(_,j)=>'module_'+(j+1)),lessonsRead:b.lessons,moduleComplete:b.modules,knownCards:b.cards,readCases:b.cases,totalAnswers:b.quiz,correctAnswers:b.correct},
    trainerStats:{totalAnswers:Math.floor(b.quiz*.3),correctAnswers:Math.floor(b.correct*.3),known:Array.from({length:b.cards},(_,j)=>'card_'+(j+1)),readCases:Array.from({length:b.cases},(_,j)=>'case_'+(j+1))},
    xpHistory:xpH(b.xp),tariff:'premium',phone:'',adminNotes:'🤖 Тестовый бот (никнейм)'
  });
  console.log('✅ Создан Rick Owens (762 XP) вместо Alex Ce');
  process.exit(0);
}
run().catch(e=>{console.error('❌',e);process.exit(1)});
