import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
    authDomain: "dispatch4you-80e0f.firebaseapp.com",
    projectId: "dispatch4you-80e0f",
    storageBucket: "dispatch4you-80e0f.firebasestorage.app",
    messagingSenderId: "349235354473",
    appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ждём инициализации Firebase Auth перед проверкой
let authCheckTimeout;

onAuthStateChanged(auth, (user) => {
    // Очищаем предыдущий таймаут если был
    if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
    }
    
    // Даём небольшую задержку для завершения процесса авторизации
    authCheckTimeout = setTimeout(() => {
        const currentPath = window.location.pathname;
        
        // Проверяем localStorage как fallback
        const hasLocalUser = localStorage.getItem('user');
        const hasAuthToken = localStorage.getItem('authToken');
        
        if (!user && !hasLocalUser && !hasAuthToken) {
            // Перенаправляем, только если мы не на странице входа или регистрации
            if (!currentPath.includes('login.html') && !currentPath.includes('register.html') && !currentPath.includes('index.html')) {
                console.log('Пользователь не авторизован, перенаправление на login.html');
                // Определяем правильный путь к login.html
                const loginPath = window.location.pathname.includes('/pages/') ? '../login.html' : '/login.html';
                window.location.href = loginPath;
            }
        }
    }, 300); // Задержка 300мс для завершения процесса
});
