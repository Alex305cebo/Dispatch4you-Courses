/**
 * XP & Gamification System v3.0 — DispatcherPro
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
    authDomain: "dispatch4you-80e0f.firebaseapp.com",
    projectId: "dispatch4you-80e0f",
    storageBucket: "dispatch4you-80e0f.appspot.com",
    messagingSenderId: "349235354473",
    appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const db  = getFirestore(app);
const auth = getAuth(app);

export const XP_ACTIONS = {
    QUIZ_CORRECT:       { xp: 10,  label: '✅ Правильный ответ',       key: 'quizCorrect' },
    QUIZ_CORRECT_FAST:  { xp: 5,   label: '⚡ Быстрый ответ! +бонус',  key: 'quizFast' },
    QUIZ_PERFECT:       { xp: 20,  label: '💯 Идеальный квиз!',        key: 'quizPerfect' },
    QUIZ_COMPLETE:      { xp: 20,  label: '�� Квиз завершён',          key: 'quizComplete' },
    MODULE_COMPLETE:    { xp: 50,  label: '🎓 Модуль завершён',        key: 'moduleComplete' },
    MODULE_MARATHON:    { xp: 30,  label: '🏃 Марафон — 3 модуля!',    key: 'moduleMarathon' },
    SECTOR_COMPLETE:    { xp: 15,  label: '📖 Сектор прочитан',        key: 'sectorComplete' },
    AUDIO_LISTENED:     { xp: 5,   label: '🎧 Аудио прослушано',       key: 'audioListened' },
    TEST_PASSED:        { xp: 30,  label: '✍️ Тест пройден',            key: 'testPassed' },
    SIMULATOR_DONE:     { xp: 25,  label: '🎯 Симулятор завершён',     key: 'simulatorDone' },
    DAILY_LOGIN:        { xp: 5,   label: '🌅 Ежедневный вход',        key: 'dailyLogin' },
    CASE_STUDY_READ:    { xp: 8,   label: '💼 Кейс изучен',            key: 'caseStudyRead' },
    STREAK_BONUS:       { xp: 15,  label: '🔥 Бонус серии дней',       key: 'streakBonus' },
    STREAK_7:           { xp: 50,  label: '🔥 Неделя подряд!',         key: 'streak7' },
    STREAK_30:          { xp: 200, label: '🌟 Месяц подряд!',          key: 'streak30' },
    GLOSSARY_VIEWED:    { xp: 3,   label: '📘 Глоссарий открыт',       key: 'glossaryViewed' },
    LOADBOARD_USED:     { xp: 5,   label: '🔍 Load Board изучен',      key: 'loadboardUsed' },
    BROKER_STUDIED:     { xp: 5,   label: '🤝 Брокеры изучены',        key: 'brokerStudied' },
    NEGOTIATION_READ:   { xp: 5,   label: '💬 Переговоры изучены',     key: 'negotiationRead' },
    FINANCE_READ:       { xp: 5,   label: '💰 Финансы изучены',        key: 'financeRead' },
    CAREER_READ:        { xp: 5,   label: '�� Карьера изучена',        key: 'careerRead' },
    AI_BROKER_USED:     { xp: 10,  label: '🤖 AI Брокер использован',  key: 'aiBrokerUsed' },
    PROFILE_COMPLETE:   { xp: 20,  label: '👤 Профиль заполнен',       key: 'profileComplete' },
    FIRST_QUIZ_WRONG:   { xp: 2,   label: '💪 Не сдаёмся!',           key: 'firstQuizWrong' },
    DAILY_TASK_DONE:    { xp: 25,  label: '📋 Дневное задание!',       key: 'dailyTaskDone' },
    SECRET_FOUND:       { xp: 30,  label: '🔮 Секретная ачивка!',      key: 'secretFound' },
    WEEKLY_XP_BONUS:    { xp: 100, label: '🏆 Топ недели!',            key: 'weeklyBonus' },
};

export const LEVELS = [
    { level: 1,  minXP: 0,    label: '🌱 Новичок',       perk: 'Базовый доступ к курсам' },
    { level: 2,  minXP: 50,   label: '📖 Стажёр',        perk: 'Доступ к глоссарию и кейсам' },
    { level: 3,  minXP: 150,  label: '🎓 Студент',       perk: 'AI Брокер в полном режиме' },
    { level: 4,  minXP: 300,  label: '🚛 Диспетчер Jr',  perk: 'Продвинутые кейсы разблокированы' },
    { level: 5,  minXP: 500,  label: '📋 Диспетчер',     perk: 'Скидка 10% на подписку + бонус-контент' },
    { level: 6,  minXP: 800,  label: '⭐ Диспетчер Sr',  perk: 'Приоритетная поддержка' },
    { level: 7,  minXP: 1200, label: '🏆 Эксперт',       perk: 'Сертификат с подписью + значок на профиле' },
    { level: 8,  minXP: 1800, label: '💎 Наставник',     perk: 'Доступ к закрытому чату наставников' },
    { level: 9,  minXP: 2500, label: '🔥 Модератор',     perk: 'Модерация форума + особый статус' },
    { level: 10, minXP: 9999, label: '👑 Администратор', perk: 'Полный доступ' },
];

export function getLevelByXP(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) { if (xp >= lvl.minXP) current = lvl; else break; }
    return current;
}

export function getNextLevel(xp) {
    for (const lvl of LEVELS) { if (xp < lvl.minXP) return lvl; }
    return null;
}

export const SECRET_ACHIEVEMENTS = [
    { id: 'night_owl',    icon: '🦉', name: 'Ночная сова',    desc: 'Вход после 23:00',              check: ()        => { const h = new Date().getHours(); return h >= 23 || h < 4; } },
    { id: 'early_bird',   icon: '🐦', name: 'Ранняя пташка',  desc: 'Вход до 7:00 утра',             check: ()        => new Date().getHours() < 7 },
    { id: 'speedrunner',  icon: '⚡', name: 'Спидраннер',     desc: '3 модуля за один день',         check: (s)       => (s.modulesToday || 0) >= 3 },
    { id: 'perfectionist',icon: '💯', name: 'Перфекционист',  desc: '5 идеальных квизов подряд',     check: (s)       => (s.quizPerfect || 0) >= 5 },
    { id: 'comeback',     icon: '🔄', name: 'Возвращение',    desc: 'Вернулся после 7 дней',         check: (s, data) => { if (!data.lastActivity) return false; const ts = data.lastActivity.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity); return (Date.now() - ts.getTime()) / 86400000 >= 7; } },
    { id: 'ai_master',    icon: '🤖', name: 'AI Мастер',      desc: 'AI Брокер использован 10 раз',  check: (s)       => (s.aiBrokerUsed || 0) >= 10 },
    { id: 'quiz_100',     icon: '🧠', name: 'Сотня!',         desc: '100 правильных ответов',        check: (s)       => (s.quizCorrect || 0) >= 100 },
    { id: 'sim_10',       icon: '🕹️', name: 'Про-геймер',     desc: 'Симулятор пройден 10 раз',      check: (s)       => (s.simulatorDone || 0) >= 10 },
];

const TASK_POOL = [
    { id: 'q5',   icon: '✅', title: 'Ответить правильно на 5 вопросов',  xp: 25, key: 'quizCorrect',   target: 5  },
    { id: 'a2',   icon: '🎧', title: 'Прослушать 2 аудио',                xp: 15, key: 'audioListened', target: 2  },
    { id: 's1',   icon: '🎯', title: 'Открыть симулятор',                 xp: 10, key: 'simulatorDone', target: 1  },
    { id: 'c1',   icon: '💼', title: 'Изучить 1 кейс',                    xp: 15, key: 'caseStudyRead',  target: 1  },
    { id: 'm1',   icon: '🎓', title: 'Завершить 1 модуль',                xp: 50, key: 'moduleComplete', target: 1  },
    { id: 'g1',   icon: '��', title: 'Открыть глоссарий',                 xp: 10, key: 'glossaryViewed', target: 1  },
    { id: 'q10',  icon: '🧠', title: 'Ответить правильно на 10 вопросов', xp: 40, key: 'quizCorrect',   target: 10 },
    { id: 'ai1',  icon: '🤖', title: 'Поговорить с AI Брокером',          xp: 15, key: 'aiBrokerUsed',  target: 1  },
    { id: 't1',   icon: '✍️', title: 'Пройти тест',                       xp: 30, key: 'testPassed',    target: 1  },
    { id: 'sec2', icon: '📖', title: 'Прочитать 2 сектора',               xp: 20, key: 'sectorComplete', target: 2  },
];

export function getDailyTasks() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const indices = [];
    let s = seed;
    while (indices.length < 3) {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        const idx = Math.abs(s) % TASK_POOL.length;
        if (!indices.includes(idx)) indices.push(idx);
    }
    return indices.map(i => ({ ...TASK_POOL[i] }));
}

function getWeekKey() {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + '_w' + week;
}

function ensureToastStyles() {
    if (document.getElementById('xp-toast-style')) return;
    const s = document.createElement('style');
    s.id = 'xp-toast-style';
    s.textContent = '@keyframes xpSlideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes xpSlideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}@keyframes achievePop{0%{transform:scale(0.5) translateX(120%);opacity:0}60%{transform:scale(1.08) translateX(0);opacity:1}100%{transform:scale(1) translateX(0);opacity:1}}';
    document.head.appendChild(s);
}

let _toastOffset = 0;
function showToast(html, border, duration, anim) {
    ensureToastStyles();
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;right:24px;z-index:9999;border-radius:16px;padding:14px 18px;display:flex;align-items:center;gap:12px;min-width:230px;box-shadow:0 8px 32px rgba(0,0,0,0.4);' + border + 'animation:' + anim + ';bottom:' + (24 + _toastOffset) + 'px;';
    t.innerHTML = html;
    _toastOffset += 80;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'xpSlideOut 0.4s ease forwards';
        setTimeout(() => { t.remove(); _toastOffset = Math.max(0, _toastOffset - 80); }, 400);
    }, duration);
}

export function showXPToast(xp, label, levelUp) {
    showToast(
        '<div style="font-size:28px">' + (levelUp ? '🎉' : '⚡') + '</div><div><div style="color:#f1f5f9;font-weight:700;font-size:14px">+' + xp + ' XP</div><div style="color:#94a3b8;font-size:12px">' + label + '</div>' + (levelUp ? '<div style="color:#818cf8;font-size:12px;font-weight:700;margin-top:2px">🆙 ' + levelUp.label + '!</div><div style="color:#6ee7b7;font-size:11px;margin-top:1px">🎁 ' + levelUp.perk + '</div>' : '') + '</div>',
        'background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid rgba(99,102,241,0.4);',
        levelUp ? 5000 : 3000, 'xpSlideIn 0.4s ease'
    );
}

function showSecretToast(ach) {
    showToast(
        '<div style="font-size:36px;line-height:1">' + ach.icon + '</div><div><div style="color:#fbbf24;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px">🔮 Секретная ачивка!</div><div style="color:#f1f5f9;font-weight:700;font-size:14px">' + ach.name + '</div><div style="color:#94a3b8;font-size:12px">' + ach.desc + '</div><div style="color:#a5b4fc;font-size:11px;margin-top:3px">+' + XP_ACTIONS.SECRET_FOUND.xp + ' XP</div></div>',
        'background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid rgba(139,92,246,0.6);',
        5000, 'achievePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards'
    );
}

function showTaskToast(task) {
    showToast(
        '<div style="font-size:32px;line-height:1">📋</div><div><div style="color:#6ee7b7;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px">✅ Задание выполнено!</div><div style="color:#f1f5f9;font-weight:700;font-size:13px">' + task.title + '</div><div style="color:#6ee7b7;font-size:12px;margin-top:2px">+' + task.xp + ' XP</div></div>',
        'background:linear-gradient(135deg,#064e3b,#0f172a);border:1px solid rgba(16,185,129,0.5);',
        4000, 'xpSlideIn 0.4s ease'
    );
}

function checkDailyTaskProgress(actionKey, stats) {
    const tasks = getDailyTasks();
    const todayKey = 'daily_done_' + new Date().toDateString();
    const done = JSON.parse(localStorage.getItem(todayKey) || '[]');
    tasks.forEach(task => {
        if (done.includes(task.id)) return;
        if (task.key !== actionKey) return;
        const current = (stats[task.key] || 0) + 1;
        if (current >= task.target) {
            done.push(task.id);
            localStorage.setItem(todayKey, JSON.stringify(done));
            setTimeout(() => showTaskToast(task), 800);
            awardXP('DAILY_TASK_DONE', { taskId: task.id });
        }
    });
}

export async function checkSecretAchievements(stats, data) {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unlocked = data.secretAchievements || [];
    for (const ach of SECRET_ACHIEVEMENTS) {
        if (unlocked.includes(ach.id)) continue;
        try {
            if (ach.check(stats, data)) {
                await updateDoc(userRef, { secretAchievements: arrayUnion(ach.id), xp: increment(XP_ACTIONS.SECRET_FOUND.xp), 'stats.secretFound': increment(1) });
                showSecretToast(ach);
                await new Promise(r => setTimeout(r, 1500));
            }
        } catch(e) { console.error('secret ach error', e); }
    }
}

export async function awardXP(action, meta) {
    meta = meta || {};
    const user = auth.currentUser;
    if (!user) return null;
    const actionData = XP_ACTIONS[action];
    if (!actionData) return null;
    const uid = user.uid;
    const userRef = doc(db, 'users', uid);
    try {
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const currentXP = data.xp || 0;
        const newXP = currentXP + actionData.xp;
        const oldLevel = getLevelByXP(currentXP);
        const newLevel = getLevelByXP(newXP);
        const leveledUp = newLevel.level > oldLevel.level && newLevel.level < 10;
        const weekKey = getWeekKey();
        const updateData = {
            xp: increment(actionData.xp),
            ['stats.' + actionData.key]: increment(1),
            ['weeklyXP.' + weekKey]: increment(actionData.xp),
            lastActivity: serverTimestamp(),
            xpHistory: arrayUnion({ action, xp: actionData.xp, label: actionData.label, ts: new Date().toISOString(), ...meta })
        };
        if (leveledUp && data.role !== 10) updateData.role = newLevel.level;
        await updateDoc(userRef, updateData);
        const xpData = { totalXP: newXP, level: newLevel.level, levelLabel: newLevel.label, lastUpdated: new Date().toISOString() };
        localStorage.setItem('xp_data', JSON.stringify(xpData));
        document.dispatchEvent(new CustomEvent('xpUpdated', { detail: xpData }));
        showXPToast(actionData.xp, actionData.label, leveledUp ? newLevel : null);
        checkDailyTaskProgress(actionData.key, data.stats || {});
        return { xp: actionData.xp, newTotal: newXP, leveledUp, newLevel };
    } catch(e) { console.error('XP award error:', e); return null; }
}

export async function checkDailyLogin() {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const today = new Date().toDateString();
        if (!data.lastDailyLogin || data.lastDailyLogin !== today) {
            const streak = (data.loginStreak || 0) + 1;
            await updateDoc(userRef, { lastDailyLogin: today, loginStreak: streak });
            await awardXP('DAILY_LOGIN');
            if (streak === 7)  await awardXP('STREAK_7');
            if (streak === 30) await awardXP('STREAK_30');
            if (streak % 7 === 0 && streak > 7) await awardXP('STREAK_BONUS');
            await checkSecretAchievements(data.stats || {}, data);
        }
    } catch(e) { console.error('Daily login error:', e); }
}

onAuthStateChanged(auth, (user) => { if (user) checkDailyLogin(); });

export async function awardXPDelta(delta, label) {
    const user = auth.currentUser;
    if (!user || delta === 0) return;
    const userRef = doc(db, 'users', user.uid);
    try {
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const currentXP = data.xp || 0;
        const newXP = Math.max(0, currentXP + delta);
        const actualDelta = newXP - currentXP;
        if (actualDelta === 0) return;
        const oldLevel = getLevelByXP(currentXP);
        const newLevel = getLevelByXP(newXP);
        const leveledUp = newLevel.level > oldLevel.level && newLevel.level < 10;
        const weekKey = getWeekKey();
        await updateDoc(userRef, {
            xp: increment(actualDelta),
            ['weeklyXP.' + weekKey]: increment(actualDelta),
            lastActivity: serverTimestamp(),
            xpHistory: arrayUnion({ action: 'DELTA', xp: actualDelta, label, ts: new Date().toISOString() })
        });
        const xpData = { totalXP: newXP, level: newLevel.level, levelLabel: newLevel.label, lastUpdated: new Date().toISOString() };
        localStorage.setItem('xp_data', JSON.stringify(xpData));
        document.dispatchEvent(new CustomEvent('xpUpdated', { detail: xpData }));
        const isPos = actualDelta > 0;
        const icon = isPos ? 'lightning' : 'broken_heart';
        const color = isPos ? '#4ade80' : '#f87171';
        const border = isPos ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
        const bg = isPos ? '#052e16,#0f172a' : '#450a0a,#0f172a';
        const sign = isPos ? '+' : '';
        const emoji = isPos ? '\u26A1' : '\uD83D\uDC94';
        showToast(
            '<div style="font-size:22px">' + emoji + '</div><div><div style="color:' + color + ';font-weight:800;font-size:14px">' + sign + actualDelta + ' XP</div><div style="color:#94a3b8;font-size:11px">' + label + '</div></div>',
            'border:1px solid ' + border + ';background:linear-gradient(135deg,' + bg + ');',
            2000, 'xpSlideIn 0.4s ease'
        );
        if (leveledUp) showXPToast(actualDelta, label, newLevel);
    } catch(e) { console.error('awardXPDelta error:', e); }
}
