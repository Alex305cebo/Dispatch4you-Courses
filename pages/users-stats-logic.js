// Pure business logic extracted from pages/users-stats.html for testing

const LEVELS = [
  {level:1,minXP:0,label:'🔰 Стажёр'},{level:2,minXP:50,label:'📡 Оператор'},
  {level:3,minXP:150,label:'🗺️ Навигатор'},{level:4,minXP:300,label:'🚛 Дальнобой'},
  {level:5,minXP:500,label:'📋 Диспетчер'},{level:6,minXP:800,label:'⚡ Координатор'},
  {level:7,minXP:1200,label:'🎯 Логист'},{level:8,minXP:1800,label:'💎 Наставник'},
  {level:9,minXP:2500,label:'🦅 Ветеран'},{level:10,minXP:9999,label:'👑 Администратор'}
];

function getLevelByXP(xp) { let c=LEVELS[0]; for(const l of LEVELS){if(xp>=l.minXP)c=l;else break;} return c; }
function getNextLevel(xp) { for(const l of LEVELS){if(xp<l.minXP)return l;} return null; }

function calcOverviewStats(users, now = Date.now()) {
  const d7 = 7 * 864e5, d30 = 30 * 864e5;
  const totalUsers = users.length;
  const activeUsers7d = users.filter(u => u.lastActivity && (now - u.lastActivity.getTime()) < d7).length;
  const activeUsers30d = users.filter(u => u.lastActivity && (now - u.lastActivity.getTime()) < d30).length;
  const avgXP = users.length ? Math.round(users.reduce((s, u) => s + u.xp, 0) / users.length) : 0;
  const avgCourseProgress = users.length ? Math.round(users.reduce((s, u) => s + (u.courseProgress / 15 * 100), 0) / users.length) : 0;
  const avgStreak = users.length ? parseFloat((users.reduce((s, u) => s + u.loginStreak, 0) / users.length).toFixed(1)) : 0;
  return { totalUsers, activeUsers7d, activeUsers30d, avgXP, avgCourseProgress, avgStreak };
}

function processUser(id, data) {
  const xp = data.xp || 0;
  const stats = data.stats || {};
  const ts = data.trainerStats || {};
  const lvl = getLevelByXP(xp);
  const next = getNextLevel(xp);
  const totalAns = (stats.totalAnswers || 0) + (ts.totalAnswers || 0);
  const correctAns = (stats.correctAnswers || 0) + (ts.correctAnswers || 0);
  const knownCards = (ts.known || []).length || (stats.knownCards || 0);
  const readCases = (ts.readCases || []).length || (stats.readCases || 0);
  let la = null;
  try { la = data.lastActivity instanceof Date ? data.lastActivity : data.lastActivity ? new Date(data.lastActivity) : null; } catch(e) {}
  let ca = null;
  try { ca = data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : null; } catch(e) {}
  return {
    id,
    name: data.displayName || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.email || id),
    email: data.email || '',
    photoURL: data.photoURL || null,
    xp, role: data.role || 1, level: lvl, nextLevel: next,
    courseProgress: stats.completedLessons?.length || stats.lessonsRead || 0,
    moduleProgress: stats.completedModules?.length || stats.moduleComplete || 0,
    caseProgress: readCases,
    cardProgress: knownCards,
    accuracy: totalAns > 0 ? Math.round(correctAns / totalAns * 100) : 0,
    totalAnswers: totalAns,
    loginStreak: data.loginStreak || 0,
    maxStreak: data.maxStreak || data.loginStreak || 0,
    lastActivity: la, createdAt: ca,
    xpHistory: data.xpHistory || []
  };
}

function filterUsers(users, searchQuery, levelFilter, activityFilter, now = Date.now()) {
  return users.filter(u => {
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (levelFilter && u.level.level !== +levelFilter) return false;
    if (activityFilter === '7d' && (!u.lastActivity || now - u.lastActivity.getTime() > 7 * 864e5)) return false;
    if (activityFilter === '30d' && (!u.lastActivity || now - u.lastActivity.getTime() > 30 * 864e5)) return false;
    if (activityFilter === 'inactive' && u.lastActivity && now - u.lastActivity.getTime() < 30 * 864e5) return false;
    return true;
  });
}

function sortUsers(users, criterion) {
  return [...users].sort((a, b) => {
    if (criterion === 'xp-desc') return b.xp - a.xp;
    if (criterion === 'xp-asc') return a.xp - b.xp;
    if (criterion === 'activity') return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0);
    if (criterion === 'streak') return b.loginStreak - a.loginStreak;
    if (criterion === 'registered') return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    // progress
    const pa = (a.courseProgress/15 + a.moduleProgress/12 + a.caseProgress/50 + a.cardProgress/80) / 4;
    const pb = (b.courseProgress/15 + b.moduleProgress/12 + b.caseProgress/50 + b.cardProgress/80) / 4;
    return pb - pa;
  });
}

function getLeaderboard(users, criterion) {
  return [...users].sort((a, b) => {
    if (criterion === 'xp') return b.xp - a.xp;
    if (criterion === 'streak') return b.loginStreak - a.loginStreak;
    const pa = (a.courseProgress/15 + a.moduleProgress/12 + a.caseProgress/50 + a.cardProgress/80) / 4 * 100;
    const pb = (b.courseProgress/15 + b.moduleProgress/12 + b.caseProgress/50 + b.cardProgress/80) / 4 * 100;
    return pb - pa;
  }).slice(0, 10);
}

function prepareActivityChartData(users, period, now = new Date()) {
  const labels = []; const data = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
    labels.push(ds);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 864e5;
    data.push(users.filter(u => u.lastActivity && u.lastActivity.getTime() >= dayStart && u.lastActivity.getTime() < dayEnd).length);
  }
  return { labels, data };
}

function prepareXPChartData(xpHistory) {
  const sorted = [...xpHistory].sort((a, b) => new Date(a.ts) - new Date(b.ts));
  let cum = 0; const labels = []; const data = [];
  sorted.forEach(h => {
    cum += h.xp;
    labels.push(new Date(h.ts).toLocaleDateString('ru', { day: 'numeric', month: 'short' }));
    data.push(cum);
  });
  return { labels, data };
}

function generateCSV(filteredUsers) {
  const fmtD = d => d ? d.toLocaleDateString('ru') : '';
  const hdr = 'Имя,Email,Уровень,XP,Курс %,Модули %,Кейсы %,Карточки %,Streak,Точность %,Последняя активность,Регистрация';
  const rows = filteredUsers.map(u => [
    `"${u.name}"`, `"${u.email}"`, `"${u.level.label}"`, u.xp,
    Math.round(u.courseProgress / 15 * 100), Math.round(u.moduleProgress / 12 * 100),
    Math.round(u.caseProgress / 50 * 100), Math.round(u.cardProgress / 80 * 100),
    u.loginStreak, u.accuracy, fmtD(u.lastActivity), fmtD(u.createdAt)
  ].join(','));
  return '\uFEFF' + hdr + '\n' + rows.join('\n');
}

function generateCSVFilename(date = new Date()) {
  const d = date.toISOString().slice(0, 10);
  return `users-stats-${d}.csv`;
}

module.exports = {
  LEVELS, getLevelByXP, getNextLevel,
  calcOverviewStats, processUser,
  filterUsers, sortUsers, getLeaderboard,
  prepareActivityChartData, prepareXPChartData,
  generateCSV, generateCSVFilename
};
