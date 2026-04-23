// Применяем тёмную тему ДО загрузки React чтобы не было вспышки
if (typeof document !== 'undefined') {
  try {
    const savedTheme = localStorage.getItem('dispatch-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.style.backgroundColor = savedTheme === 'dark' ? '#0f172a' : '#ffffff';
  } catch {}
}

import 'expo-router/entry';
