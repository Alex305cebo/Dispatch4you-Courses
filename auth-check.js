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

onAuthStateChanged(auth, (user) => {
    if (!user) {
        const currentPath = window.location.pathname;
        // Перенаправляем, только если мы не на странице входа или регистрации
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
            console.log('Пользователь не авторизован, перенаправление на login.html');
            // Определяем правильный путь к login.html
            const loginPath = window.location.pathname.includes('/pages/') ? '../login.html' : '/login.html';
            window.location.href = loginPath;
        }
    }
});
