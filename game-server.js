/**
 * DISPATCH OFFICE GAME — Live Server
 * Простой Express сервер для запуска игры на отдельном порту
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Новый порт для игры

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Главная страница игры
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'game', 'index.html'));
});

// Статические файлы игры
app.use('/game', express.static(path.join(__dirname, 'game')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/assets', express.static(path.join(__dirname, 'game', 'assets')));

// API для сохранения игровых данных (localStorage backup)
app.post('/api/save-game', (req, res) => {
  console.log('💾 Game save request:', req.body.sessionName);
  res.json({ success: true, message: 'Game saved successfully' });
});

// API для загрузки игровых данных
app.get('/api/load-game/:sessionId', (req, res) => {
  console.log('📂 Game load request:', req.params.sessionId);
  res.json({ success: true, data: null });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    game: 'Dispatch Office',
    version: '2.2.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('\n🚛 ═══════════════════════════════════════════════════');
  console.log('   DISPATCH OFFICE GAME — Live Server Started');
  console.log('   ═══════════════════════════════════════════════════');
  console.log(`   🌐 Game URL: http://localhost:${PORT}`);
  console.log(`   📁 Game folder: ${path.join(__dirname, 'game')}`);
  console.log(`   ⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('   ═══════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});
