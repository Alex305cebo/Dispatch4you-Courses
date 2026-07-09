/**
 * XP & Rating System for DispatcherPro
 * Импортируй на любой странице:
 *   import { awardXP, XP_ACTIONS } from '../xp-system.js';
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
    authDomain: "dispatch4you.com",
    projectId: "dispatch4you-80e0f",
    storageBucket: "dispatch4you-80e0f.appspot.com",
    messagingSenderId: "349235354473",
    appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

// Переиспользуем существующий app если уже инициализирован
const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

// ===== XP за каждое действие =====
export const XP_ACTIONS = {
    QUIZ_CORRECT: { xp: 10, label: '✅ Correct answer', key: 'quizCorrect' },
    QUIZ_COMPLETE: { xp: 20, label: '📝 Quiz complete', key: 'quizComplete' },
    MODULE_COMPLETE: { xp: 50, label: '📚 Module complete', key: 'moduleComplete' },
    SECTOR_COMPLETE: { xp: 15, label: '📖 Section read', key: 'sectorComplete' },
    AUDIO_LISTENED: { xp: 5, label: '🎧 Audio listened', key: 'audioListened' },
    TEST_PASSED: { xp: 30, label: '✍️ Test passed', key: 'testPassed' },
    SIMULATOR_DONE: { xp: 25, label: '🎯 Simulator complete', key: 'simulatorDone' },
    DAILY_LOGIN: { xp: 5, label: '🌅 Daily login', key: 'dailyLogin' },
    CASE_STUDY_READ: { xp: 8, label: '💼 Case study read', key: 'caseStudyRead' },
    STREAK_BONUS: { xp: 15, label: '🔥 Streak bonus', key: 'streakBonus' },
    AI_BROKER_USED: { xp: 10, label: '📞 AI Broker used', key: 'aiBrokerUsed' },
    BROKER_SESSION_COMPLETE: { xp: 50, label: '📞 Broker session complete', key: 'brokerSessionComplete' },
    BROKER_HIGH_SCORE: { xp: 25, label: '⭐ High score (8+)', key: 'brokerHighScore' },
    BROKER_PERFECT_SCORE: { xp: 50, label: '🏆 Perfect score (9+)', key: 'brokerPerfectScore' },
};

// ===== Уровни (совпадают с ROLES в admin.html) =====
export const LEVELS = [
    { level: 1, minXP: 0, label: '🌱 Beginner' },
    { level: 2, minXP: 50, label: '📖 Trainee' },
    { level: 3, minXP: 150, label: '📚 Student' },
    { level: 4, minXP: 300, label: '🚛 Dispatcher Jr' },
    { level: 5, minXP: 500, label: '📋 Dispatcher' },
    { level: 6, minXP: 800, label: '⭐ Dispatcher Sr' },
    { level: 7, minXP: 1200, label: '🏆 Expert' },
    { level: 8, minXP: 1800, label: '💎 Mentor' },
    { level: 9, minXP: 2500, label: '🔥 Moderator' },
    { level: 10, minXP: 9999, label: '👑 Administrator' }, // только вручную
];

export function getLevelByXP(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
        if (xp >= lvl.minXP) current = lvl;
        else break;
    }
    return current;
}

export function getNextLevel(xp) {
    for (const lvl of LEVELS) {
        if (xp < lvl.minXP) return lvl;
    }
    return null;
}

// ===== Основная функция начисления XP =====
export async function awardXP(action, meta = {}) {
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

        // Обновляем Firestore
        const updateData = {
            xp: increment(actionData.xp),
            [`stats.${actionData.key}`]: increment(1),
            lastActivity: serverTimestamp(),
            xpHistory: arrayUnion({
                action,
                xp: actionData.xp,
                label: actionData.label,
                ts: new Date().toISOString(),
                ...meta
            })
        };

        // Автоматически повышаем уровень если не admin (10)
        if (leveledUp && data.role !== 10) {
            updateData.role = newLevel.level;
        }

        await updateDoc(userRef, updateData);

        // Обновляем локальное хранилище для быстрого доступа
        const xpData = {
            totalXP: newXP,
            level: newLevel.level,
            levelLabel: newLevel.label,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('xp_data', JSON.stringify(xpData));

        // Отправляем событие обновления XP
        document.dispatchEvent(new CustomEvent('xpUpdated', { detail: xpData }));

        // Показываем тост с +XP
        showXPToast(actionData.xp, actionData.label, leveledUp ? newLevel : null);

        return { xp: actionData.xp, newTotal: newXP, leveledUp, newLevel };
    } catch (e) {
        console.error('XP award error:', e);
        return null;
    }
}

// ===== Проверка ежедневного входа =====
export async function checkDailyLogin() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const lastLogin = data.lastDailyLogin;
        const today = new Date().toDateString();

        if (!lastLogin || lastLogin !== today) {
            await updateDoc(userRef, { lastDailyLogin: today });
            await awardXP('DAILY_LOGIN');

            // Проверяем серию дней
            const streak = (data.loginStreak || 0) + 1;
            await updateDoc(userRef, { loginStreak: streak });
            if (streak % 7 === 0) await awardXP('STREAK_BONUS');
        }
    } catch (e) {
        console.error('Daily login check error:', e);
    }
}

// ===== Тост уведомление о XP =====
function showXPToast(xp, label, levelUp = null) {
    // Удаляем старый тост если есть
    const old = document.getElementById('xp-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'xp-toast';
    toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border: 1px solid rgba(99,102,241,0.4);
        border-radius: 16px; padding: 14px 20px;
        display: flex; align-items: center; gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: xpSlideIn 0.4s ease;
        min-width: 220px;
    `;

    toast.innerHTML = `
        <div style="font-size:28px">${levelUp ? '🎉' : '⚡'}</div>
        <div>
            <div style="color:#f1f5f9;font-weight:700;font-size:14px">+${xp} XP</div>
            <div style="color:#94a3b8;font-size:12px">${label}</div>
            ${levelUp ? `<div style="color:#818cf8;font-size:12px;font-weight:700;margin-top:2px">New level: ${levelUp.label}!</div>` : ''}
        </div>
    `;

    // Добавляем анимацию
    if (!document.getElementById('xp-toast-style')) {
        const style = document.createElement('style');
        style.id = 'xp-toast-style';
        style.textContent = `
            @keyframes xpSlideIn { from { transform: translateX(120%); opacity:0; } to { transform: translateX(0); opacity:1; } }
            @keyframes xpSlideOut { from { transform: translateX(0); opacity:1; } to { transform: translateX(120%); opacity:0; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'xpSlideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== Авто-запуск при загрузке =====
onAuthStateChanged(auth, (user) => {
    if (user) checkDailyLogin();
});
