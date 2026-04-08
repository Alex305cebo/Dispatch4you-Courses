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

// Реальные фото с randomuser.me — мужские (M) и женские (W)
const BOTS = [
  { first:'Кирилл',last:'Астахов',xp:847,streak:19,lessons:7,modules:5,cases:21,cards:33,quiz:143,correct:118,photo:'https://randomuser.me/api/portraits/men/32.jpg' },
  { first:'Полина',last:'Дроздова',xp:791,streak:16,lessons:7,modules:5,cases:19,cards:29,quiz:127,correct:101,photo:'https://randomuser.me/api/portraits/women/44.jpg' },
  { first:'Тимур',last:'Галимов',xp:723,streak:13,lessons:6,modules:4,cases:17,cards:26,quiz:113,correct:89,photo:'https://randomuser.me/api/portraits/men/75.jpg' },
  { first:'Вероника',last:'Чернышёва',xp:664,streak:11,lessons:6,modules:4,cases:14,cards:21,quiz:98,correct:79,photo:'https://randomuser.me/api/portraits/women/68.jpg' },
  { first:'Руслан',last:'Ермолаев',xp:581,streak:9,lessons:5,modules:4,cases:13,cards:19,quiz:87,correct:68,photo:'https://randomuser.me/api/portraits/men/11.jpg' },
  { first:'Диана',last:'Сафронова',xp:517,streak:8,lessons:5,modules:3,cases:11,cards:16,quiz:76,correct:61,photo:'https://randomuser.me/api/portraits/women/22.jpg' },
  { first:'Глеб',last:'Шестаков',xp:463,streak:7,lessons:4,modules:3,cases:9,cards:14,quiz:67,correct:52,photo:'https://randomuser.me/api/portraits/men/45.jpg' },
  { first:'Алина',last:'Корнеева',xp:394,streak:6,lessons:4,modules:3,cases:8,cards:11,quiz:58,correct:44,photo:'https://randomuser.me/api/portraits/women/85.jpg' },
  { first:'Данил',last:'Ситников',xp:341,streak:5,lessons:3,modules:2,cases:7,cards:9,quiz:49,correct:37,photo:'https://randomuser.me/api/portraits/men/52.jpg' },
  { first:'Яна',last:'Логинова',xp:287,streak:4,lessons:3,modules:2,cases:6,cards:8,quiz:42,correct:33,photo:'https://randomuser.me/api/portraits/women/33.jpg' },
  { first:'Тимофей',last:'Бочкарёв',xp:234,streak:4,lessons:2,modules:1,cases:5,cards:6,quiz:36,correct:27,photo:'https://randomuser.me/api/portraits/men/67.jpg' },
  { first:'Карина',last:'Мухина',xp:178,streak:3,lessons:2,modules:1,cases:4,cards:5,quiz:29,correct:22,photo:'https://randomuser.me/api/portraits/women/91.jpg' },
  { first:'Роман',last:'Третьяков',xp:129,streak:2,lessons:1,modules:1,cases:3,cards:3,quiz:21,correct:16,photo:'https://randomuser.me/api/portraits/men/23.jpg' },
  { first:'Милана',last:'Рябова',xp:83,streak:1,lessons:1,modules:0,cases:1,cards:2,quiz:14,correct:11,photo:'https://randomuser.me/api/portraits/women/57.jpg' },
  { first:'Арсений',last:'Кулагин',xp:47,streak:1,lessons:1,modules:0,cases:1,cards:1,quiz:9,correct:6,photo:'https://randomuser.me/api/portraits/men/88.jpg' },
  { first:'Ева',last:'Щербакова',xp:18,streak:0,lessons:0,modules:0,cases:0,cards:0,quiz:4,correct:3,photo:'https://randomuser.me/api/portraits/women/12.jpg' },
  { first:'Derek',last:'Calloway',xp:812,streak:17,lessons:7,modules:5,cases:18,cards:31,quiz:136,correct:109,photo:'https://randomuser.me/api/portraits/men/36.jpg' },
  { first:'Megan',last:'Ashford',xp:639,streak:10,lessons:5,modules:4,cases:14,cards:20,quiz:94,correct:74,photo:'https://randomuser.me/api/portraits/women/47.jpg' },
  { first:'Travis',last:'Holbrook',xp:486,streak:7,lessons:4,modules:3,cases:10,cards:15,quiz:71,correct:56,photo:'https://randomuser.me/api/portraits/men/19.jpg' },
  { first:'Brianna',last:'Kessler',xp:357,streak:5,lessons:3,modules:2,cases:7,cards:10,quiz:53,correct:41,photo:'https://randomuser.me/api/portraits/women/63.jpg' },
  { first:'Marcus',last:'Delgado',xp:263,streak:4,lessons:3,modules:2,cases:5,cards:7,quiz:39,correct:29,photo:'https://randomuser.me/api/portraits/men/71.jpg' },
  { first:'Haley',last:'Prescott',xp:156,streak:2,lessons:2,modules:1,cases:3,cards:4,quiz:26,correct:19,photo:'https://randomuser.me/api/portraits/women/76.jpg' },
  { first:'Colton',last:'Vega',xp:91,streak:1,lessons:1,modules:0,cases:2,cards:2,quiz:16,correct:12,photo:'https://randomuser.me/api/portraits/men/94.jpg' },
  { first:'Sienna',last:'Whitmore',xp:38,streak:1,lessons:0,modules:0,cases:0,cards:1,quiz:7,correct:5,photo:'https://randomuser.me/api/portraits/women/8.jpg' },
  { first:'Jaden',last:'Okafor',xp:11,streak:0,lessons:0,modules:0,cases:0,cards:0,quiz:2,correct:1,photo:'https://randomuser.me/api/portraits/men/58.jpg' },
];

const TR={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
function tl(s){return s.toLowerCase().split('').map(c=>TR[c]||c).join('')}
function rnd(d){const x=new Date();x.setDate(x.getDate()-Math.floor(Math.random()*d));x.setHours(Math.floor(Math.random()*24),Math.floor(Math.random()*60));return x}
function xpH(xp){const h=[];let c=0;const n=Math.min(20,Math.max(3,Math.floor(xp/50)));for(let i=0;i<n;i++){c+=Math.max(1,Math.floor(xp/n)+Math.floor(Math.random()*20)-10);const d=new Date();d.setDate(d.getDate()-(n-i)*2);h.push({date:d.toISOString(),xp:Math.min(c,xp)})}return h}
function lvl(xp){const t=[0,50,150,300,500,800,1200,1800,2500];let l=1;for(let i=t.length-1;i>=0;i--)if(xp>=t[i]){l=i+1;break}return Math.min(l,10)}

// Фото берутся из b.photo (randomuser.me)

async function run(){
  console.log('🗑️  Удаляю старых ботов...');
  const snap=await getDocs(collection(db,'users'));
  let del=0;
  for(const d of snap.docs){if(d.data().isBot||d.id.startsWith('bot_')){await deleteDoc(doc(db,'users',d.id));del++}}
  console.log(`  Удалено ${del}.\n🚀 Создаю 25 новых...\n`);

  for(let i=0;i<BOTS.length;i++){
    const b=BOTS[i];const en=tl(b.first)+'.'+tl(b.last);const uid='bot_'+en+'_'+i;
    const email=en+'@testbot.dispatch4you.com';const r=lvl(b.xp);
    const ca=rnd(90);const la=b.xp>20?rnd(b.streak>0?7:45):rnd(60);
    const photo = b.photo;
    await setDoc(doc(db,'users',uid),{
      firstName:b.first,lastName:b.last,displayName:b.first+' '+b.last,
      email,photoURL:photo,xp:b.xp,role:r,accessRole:'registered',
      status:b.xp>100?'active':b.xp>20?'pending':'inactive',
      loginStreak:b.streak,maxStreak:b.streak+Math.floor(Math.random()*5),
      lastActivity:la.toISOString(),createdAt:ca.toISOString(),isBot:true,
      stats:{completedLessons:Array.from({length:b.lessons},(_,j)=>'lesson_'+(j+1)),completedModules:Array.from({length:b.modules},(_,j)=>'module_'+(j+1)),lessonsRead:b.lessons,moduleComplete:b.modules,knownCards:b.cards,readCases:b.cases,totalAnswers:b.quiz,correctAnswers:b.correct},
      trainerStats:{totalAnswers:Math.floor(b.quiz*.3),correctAnswers:Math.floor(b.correct*.3),known:Array.from({length:b.cards},(_,j)=>'card_'+(j+1)),readCases:Array.from({length:b.cases},(_,j)=>'case_'+(j+1))},
      xpHistory:xpH(b.xp),tariff:b.xp>500?'premium':'free',phone:'',adminNotes:'🤖 Тестовый бот'
    });
    console.log(`  ✅ ${i+1}/25 — ${b.first} ${b.last} (${b.xp} XP, ур.${r})`);
  }
  console.log('\n🎉 Готово!');
  process.exit(0);
}
run().catch(e=>{console.error('❌',e);process.exit(1)});
