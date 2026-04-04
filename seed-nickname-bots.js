const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const app = initializeApp({
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
});
const db = getFirestore(app);

const BOTS = [
  { first:'Rick',last:'Owens',xp:762,streak:14,lessons:6,modules:4,cases:16,cards:27,quiz:119,correct:94,bg:'6366f1' },
  { first:'Mike',last:'Goodman',xp:614,streak:11,lessons:5,modules:4,cases:13,cards:21,quiz:91,correct:72,bg:'ec4899' },
  { first:'Sam',last:'Torres',xp:538,streak:8,lessons:5,modules:3,cases:11,cards:17,quiz:79,correct:63,bg:'10b981' },
  { first:'Jay',last:'Knox',xp:451,streak:7,lessons:4,modules:3,cases:9,cards:13,quiz:66,correct:51,bg:'f59e0b' },
  { first:'Niko',last:'Blaze',xp:373,streak:6,lessons:3,modules:2,cases:8,cards:11,quiz:54,correct:42,bg:'8b5cf6' },
  { first:'Tina',last:'Marsh',xp:294,streak:5,lessons:3,modules:2,cases:6,cards:9,quiz:43,correct:34,bg:'ef4444' },
  { first:'Leo',last:'Grant',xp:217,streak:4,lessons:2,modules:1,cases:5,cards:7,quiz:34,correct:26,bg:'0ea5e9' },
  { first:'Kira',last:'Stone',xp:143,streak:3,lessons:2,modules:1,cases:3,cards:4,quiz:23,correct:17,bg:'d946ef' },
  { first:'Dan',last:'Wolf',xp:67,streak:1,lessons:1,modules:0,cases:1,cards:2,quiz:12,correct:8,bg:'f97316' },
  { first:'Zoe',last:'Park',xp:23,streak:1,lessons:0,modules:0,cases:0,cards:1,quiz:5,correct:3,bg:'14b8a6' },
];

function rnd(d){const x=new Date();x.setDate(x.getDate()-Math.floor(Math.random()*d));x.setHours(Math.floor(Math.random()*24),Math.floor(Math.random()*60));return x}
function xpH(xp){const h=[];let c=0;const n=Math.min(20,Math.max(3,Math.floor(xp/50)));for(let i=0;i<n;i++){c+=Math.max(1,Math.floor(xp/n)+Math.floor(Math.random()*20)-10);const d=new Date();d.setDate(d.getDate()-(n-i)*2);h.push({date:d.toISOString(),xp:Math.min(c,xp)})}return h}
function lvl(xp){const t=[0,50,150,300,500,800,1200,1800,2500];let l=1;for(let i=t.length-1;i>=0;i--)if(xp>=t[i]){l=i+1;break}return Math.min(l,10)}

async function run(){
  console.log('🚀 Создаю 10 ботов с никнеймами...\n');
  for(let i=0;i<BOTS.length;i++){
    const b=BOTS[i];
    const nick=(b.first+'.'+b.last).toLowerCase();
    const uid='bot_nick_'+nick+'_'+i;
    const email=nick+'@testbot.dispatch4you.com';
    const r=lvl(b.xp);
    const ca=rnd(90);
    const la=b.xp>20?rnd(b.streak>0?7:45):rnd(60);
    const photo=`https://ui-avatars.com/api/?name=${b.first[0]}&background=${b.bg}&color=fff&size=128&bold=true&format=png`;
    await setDoc(doc(db,'users',uid),{
      firstName:b.first,lastName:b.last,displayName:b.first+' '+b.last,
      email,photoURL:photo,xp:b.xp,role:r,accessRole:'registered',
      status:b.xp>100?'active':b.xp>20?'pending':'inactive',
      loginStreak:b.streak,maxStreak:b.streak+Math.floor(Math.random()*5),
      lastActivity:la.toISOString(),createdAt:ca.toISOString(),isBot:true,
      stats:{completedLessons:Array.from({length:b.lessons},(_,j)=>'lesson_'+(j+1)),completedModules:Array.from({length:b.modules},(_,j)=>'module_'+(j+1)),lessonsRead:b.lessons,moduleComplete:b.modules,knownCards:b.cards,readCases:b.cases,totalAnswers:b.quiz,correctAnswers:b.correct},
      trainerStats:{totalAnswers:Math.floor(b.quiz*.3),correctAnswers:Math.floor(b.correct*.3),known:Array.from({length:b.cards},(_,j)=>'card_'+(j+1)),readCases:Array.from({length:b.cases},(_,j)=>'case_'+(j+1))},
      xpHistory:xpH(b.xp),tariff:b.xp>500?'premium':'free',phone:'',adminNotes:'🤖 Тестовый бот (никнейм)'
    });
    console.log(`  ✅ ${i+1}/10 — ${b.first} ${b.last} (${b.xp} XP, ур.${r}) [${b.first[0]}]`);
  }
  console.log('\n🎉 Готово! 10 ботов с никнеймами добавлены.');
  process.exit(0);
}
run().catch(e=>{console.error('❌',e);process.exit(1)});
