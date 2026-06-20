// Voice-to-Chat Extension - ИСПРАВЛЕННАЯ ВЕРСИЯ
let recognition;
let isRecording = false;
let recognizedText = '';

// Элементы
const recordBtn = document.getElementById('recordBtn');
const status = document.getElementById('status');
const russianText = document.getElementById('russianText');
const englishText = document.getElementById('englishText');
const copyBtn = document.getElementById('copyBtn');

// API для перевода
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

// Инициализация Web Speech API
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showError('Распознавание речи не поддерживается в этом браузере. Используйте Chrome/Edge');
    recordBtn.disabled = true;
    return false;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    console.log('Распознавание началось');
  };
  
  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript + ' ';
      } else {
        interim += transcript;
      }
    }
    
    recognizedText = (final || interim).trim();
    
    if (recognizedText) {
      const preview = recognizedText.length > 40 
        ? recognizedText.substring(0, 40) + '...'
        : recognizedText;
      status.textContent = '🎤 "' + preview + '"';
    }
  };
  
  recognition.onerror = (event) => {
    console.error('Ошибка распознавания:', event.error);
    
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      // Критическая ошибка - нет разрешения
      // Показываем большую кнопку запроса доступа
      showRequestAccessButton();
      showError('НУЖНО РАЗРЕШЕНИЕ! Нажмите зелёную кнопку ↓');
    } else if (event.error === 'no-speech') {
      showError('Речь не обнаружена. Говорите громче и ближе к микрофону');
    } else if (event.error === 'audio-capture') {
      showError('Микрофон недоступен. Проверьте подключение');
    } else if (event.error === 'network') {
      showError('Нет интернета. Проверьте подключение');
    } else if (event.error === 'aborted') {
      // Пользователь отменил - это нормально
      console.log('Recording aborted by user');
    } else {
      showError('Ошибка: ' + event.error);
    }
  };
  
  recognition.onend = () => {
    console.log('Распознавание завершено');
    if (isRecording) {
      processRecognizedText();
    }
  };
  
  // Автоматическая проверка микрофона при загрузке
  checkMicrophonePermission();
  
  return true;
}

// Проверка разрешения микрофона
async function checkMicrophonePermission() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    
    if (result.state === 'granted') {
      status.textContent = '✅ Готов к записи (микрофон разрешён)';
      status.className = 'status ready';
    } else if (result.state === 'prompt') {
      status.textContent = '⚠️ Нажмите кнопку - Chrome запросит доступ к микрофону';
      status.className = 'status';
      status.style.background = 'rgba(255, 165, 0, 0.2)';
      status.style.borderColor = '#ffa500';
      status.style.color = '#ffa500';
    } else if (result.state === 'denied') {
      status.textContent = '❌ Микрофон ЗАБЛОКИРОВАН! Нажмите кнопку помощи ↓';
      status.className = 'status';
      status.style.background = 'rgba(220, 53, 69, 0.2)';
      status.style.borderColor = '#dc3545';
      status.style.color = '#dc3545';
      
      // Показать кнопку помощи более заметно
      document.getElementById('helpBtn').style.animation = 'pulse 1s infinite';
    }
    
    // Слушать изменения разрешения
    result.addEventListener('change', () => {
      checkMicrophonePermission();
    });
    
  } catch (error) {
    console.log('Не удалось проверить разрешения:', error);
  }
}

// НОВАЯ ФУНКЦИЯ: Явный запрос доступа к микрофону
async function requestMicrophoneAccess() {
  status.textContent = '🔑 Запрос доступа к микрофону...';
  status.className = 'status processing';
  
  try {
    // Явно запрашиваем доступ через getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Получили доступ! Закрываем поток
    stream.getTracks().forEach(track => track.stop());
    
    // Скрываем кнопку запроса
    document.getElementById('requestAccessBtn').style.display = 'none';
    
    // Показываем успех
    status.textContent = '✅ Доступ разрешён! Попробуйте снова';
    status.className = 'status ready';
    
    // Обновляем проверку разрешений
    checkMicrophonePermission();
    
    // Показываем подсказку
    setTimeout(() => {
      alert('✅ Отлично! Доступ к микрофону разрешён.\n\nТеперь нажмите кнопку и говорите.');
    }, 500);
    
  } catch (error) {
    console.error('Не удалось получить доступ:', error);
    
    // Показываем модальное окно помощи
    document.getElementById('helpModal').style.display = 'block';
    
    showError('КРИТИЧЕСКАЯ ОШИБКА: Микрофон заблокирован! Откройте помощь ↑');
    
    // Пульсируем кнопкой помощи
    document.getElementById('helpBtn').style.animation = 'pulse 1s infinite';
  }
}

// Показать кнопку запроса доступа
function showRequestAccessButton() {
  const btn = document.getElementById('requestAccessBtn');
  btn.style.display = 'block';
  btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Обработчики кнопки записи
recordBtn.addEventListener('mousedown', startRecording);
recordBtn.addEventListener('mouseup', stopRecording);
recordBtn.addEventListener('mouseleave', () => {
  if (isRecording) stopRecording();
});

// Кнопка копирования
copyBtn.addEventListener('click', copyToClipboard);

function startRecording() {
  if (isRecording || !recognition) return;
  
  isRecording = true;
  recognizedText = '';
  
  // Обновить UI
  recordBtn.classList.add('recording');
  recordBtn.querySelector('.icon').textContent = '⏺';
  recordBtn.querySelector('.text').textContent = 'ЗАПИСЬ...';
  recordBtn.querySelector('.hint').textContent = '(говорите на русском)';
  
  status.className = 'status recording';
  status.textContent = '🔴 Слушаю... Говорите';
  
  // Очистить предыдущие результаты
  russianText.value = '';
  englishText.value = '';
  
  try {
    // ВАЖНО: start() должен вызываться напрямую от user action (click/mousedown)
    recognition.start();
    console.log('Recognition started successfully');
  } catch (error) {
    console.error('Ошибка запуска:', error);
    
    // Если recognition уже запущен, игнорируем
    if (error.message && error.message.includes('already started')) {
      console.log('Recognition already running, continuing...');
      return;
    }
    
    // Показать специальное сообщение
    showError('Не удалось запустить. Попробуйте: 1) Перезагрузите расширение 2) Перезапустите Chrome');
    resetUI();
    isRecording = false;
  }
}

function stopRecording() {
  if (!isRecording) return;
  
  isRecording = false;
  
  // Обновить UI
  recordBtn.classList.remove('recording');
  recordBtn.querySelector('.icon').textContent = '⏳';
  recordBtn.querySelector('.text').textContent = 'ОБРАБОТКА...';
  recordBtn.querySelector('.hint').textContent = '';
  
  status.className = 'status processing';
  status.textContent = '⏳ Обработка...';
  
  try {
    recognition.stop();
  } catch (error) {
    console.error('Ошибка остановки:', error);
  }
}

async function processRecognizedText() {
  try {
    if (!recognizedText || recognizedText.trim() === '') {
      throw new Error('Речь не распознана. Попробуйте ещё раз');
    }
    
    // Показать русский текст
    russianText.value = recognizedText;
    
    // Перевести на английский
    status.textContent = '🌍 Перевод на английский...';
    const translation = await translateText(recognizedText, 'ru', 'en');
    
    // Показать английский текст
    englishText.value = translation;
    
    // Автокопирование
    await navigator.clipboard.writeText(translation);
    
    // Успех
    status.className = 'status ready';
    status.textContent = '✅ Готово! Текст скопирован';
    copyBtn.disabled = false;
    
  } catch (error) {
    console.error('Ошибка обработки:', error);
    showError(error.message || 'Ошибка обработки');
  } finally {
    resetUI();
  }
}

async function startRecording() {
  if (isRecording) return;
  
  try {
    // Запрос доступа к микрофону с более точными настройками
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
    
    // Проверяем поддержку MediaRecorder
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      throw new Error('Браузер не поддерживает запись аудио');
    }
    
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = processAudio;
    
    mediaRecorder.onerror = (event) => {
      console.error('Ошибка MediaRecorder:', event.error);
      showError('Ошибка записи: ' + event.error);
    };
    
    mediaRecorder.start();
    isRecording = true;
    
    // Обновить UI
    recordBtn.classList.add('recording');
    recordBtn.querySelector('.icon').textContent = '⏺';
    recordBtn.querySelector('.text').textContent = 'ЗАПИСЬ...';
    recordBtn.querySelector('.hint').textContent = '(говорите на русском)';
    
    status.className = 'status recording';
    status.textContent = '🔴 Идёт запись...';
    
  } catch (error) {
    console.error('Ошибка доступа к микрофону:', error);
    
    let errorMessage = 'Нет доступа к микрофону';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Разрешите доступ к микрофону';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'Микрофон не найден';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Микрофон занят другим приложением';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Настройки микрофона не поддерживаются';
    }
    
    showError(errorMessage);
  }
}

function showError(message) {
  status.className = 'status';
  status.style.background = 'rgba(220, 53, 69, 0.2)';
  status.style.borderColor = '#dc3545';
  status.style.color = '#dc3545';
  status.textContent = '❌ ' + message;
  
  recordBtn.classList.remove('recording');
  recordBtn.querySelector('.icon').textContent = '🔴';
  recordBtn.querySelector('.text').textContent = 'ПОПРОБУЙТЕ СНОВА';
  recordBtn.querySelector('.hint').textContent = 'Проверьте разрешения';
}

function stopRecording() {
  if (!isRecording) return;
  
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach(track => track.stop());
  isRecording = false;
  
  // Обновить UI
  recordBtn.classList.remove('recording');
  recordBtn.querySelector('.icon').textContent = '⏳';
  recordBtn.querySelector('.text').textContent = 'ОБРАБОТКА...';
  recordBtn.querySelector('.hint').textContent = '';
  
  status.className = 'status processing';
  status.textContent = '⏳ Распознавание речи...';
}

async function processAudio() {
  try {
    // Создать аудио blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    if (audioBlob.size === 0) {
      throw new Error('Пустая запись');
    }
    
    status.textContent = '🎤 Распознавание речи...';
    
    // Распознавание речи через Web Speech API
    const text = await recognizeSpeechFromMicrophone();
    
    if (!text || text.trim() === '') {
      throw new Error('Речь не распознана');
    }
    
    // Показать русский текст
    russianText.value = text;
    
    // Перевести на английский
    status.textContent = '🌍 Перевод на английский...';
    const translation = await translateText(text, 'ru', 'en');
    
    // Показать английский текст
    englishText.value = translation;
    
    // Автокопирование
    await navigator.clipboard.writeText(translation);
    
    // Успех
    status.className = 'status ready';
    status.textContent = '✅ Готово! Текст скопирован';
    copyBtn.disabled = false;
    
  } catch (error) {
    console.error('Ошибка обработки:', error);
    showError(error.message || 'Ошибка обработки аудио');
  } finally {
    // Вернуть кнопку в нормальное состояние
    recordBtn.querySelector('.icon').textContent = '🔴';
    recordBtn.querySelector('.text').textContent = 'ЗАЖМИ И ГОВОРИ';
    recordBtn.querySelector('.hint').textContent = '(на русском)';
  }
}

function recognizeSpeechFromMicrophone() {
  return new Promise((resolve, reject) => {
    // Проверка поддержки Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Распознавание речи не поддерживается в этом браузере'));
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    let finalTranscript = '';
    let hasResult = false;
    
    recognition.onstart = () => {
      console.log('Распознавание речи началось');
    };
    
    recognition.onresult = (event) => {
      hasResult = true;
      const result = event.results[0];
      if (result.isFinal) {
        finalTranscript = result[0].transcript;
        console.log('Распознано:', finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Ошибка распознавания:', event.error);
      
      let errorMsg = 'Ошибка распознавания';
      if (event.error === 'no-speech') {
        errorMsg = 'Речь не обнаружена. Говорите громче';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'Микрофон недоступен';
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Нет разрешения на микрофон';
      } else if (event.error === 'network') {
        errorMsg = 'Нет подключения к интернету';
      }
      
      reject(new Error(errorMsg));
    };
    
    recognition.onend = () => {
      console.log('Распознавание завершено');
      if (hasResult && finalTranscript) {
        resolve(finalTranscript);
      } else {
        reject(new Error('Речь не распознана. Попробуйте ещё раз'));
      }
    };
    
    // Запуск распознавания
    try {
      recognition.start();
    } catch (e) {
      reject(new Error('Не удалось запустить распознавание: ' + e.message));
    }
  });
}

function resetUI() {
  recordBtn.classList.remove('recording');
  recordBtn.querySelector('.icon').textContent = '🔴';
  recordBtn.querySelector('.text').textContent = 'ЗАЖМИ И ГОВОРИ';
  recordBtn.querySelector('.hint').textContent = '(на русском)';
}

function showError(message) {
  status.className = 'status';
  status.style.background = 'rgba(220, 53, 69, 0.2)';
  status.style.borderColor = '#dc3545';
  status.style.color = '#dc3545';
  status.textContent = '❌ ' + message;
  
  resetUI();
}

async function translateText(text, from, to) {
  try {
    // Используем бесплатный Google Translate API
    const url = `${TRANSLATE_API}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Ошибка сервера перевода');
    }
    
    const data = await response.json();
    
    // Извлекаем перевод
    const translation = data[0].map(item => item[0]).join('');
    return translation;
    
  } catch (error) {
    console.error('Ошибка перевода:', error);
    throw new Error('Не удалось перевести текст. Проверьте интернет');
  }
}

async function copyToClipboard() {
  const text = englishText.value;
  
  if (!text) return;
  
  try {
    await navigator.clipboard.writeText(text);
    
    // Анимация успеха
    copyBtn.classList.add('copied');
    copyBtn.textContent = '✅ Скопировано!';
    
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.textContent = '📋 Копировать в буфер';
    }, 2000);
    
  } catch (error) {
    console.error('Ошибка копирования:', error);
    alert('Не удалось скопировать в буфер обмена');
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (initSpeechRecognition()) {
    status.textContent = '✅ Готов к записи';
  }
  
  // Модальное окно помощи
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeBtn = document.querySelector('.close');
  const openChromeSettings = document.getElementById('openChromeSettings');
  const openWindowsSettings = document.getElementById('openWindowsSettings');
  const testMicrophone = document.getElementById('testMicrophone');
  const testResult = document.getElementById('testResult');
  const requestAccessBtn = document.getElementById('requestAccessBtn');
  
  // НОВАЯ: Кнопка запроса доступа
  requestAccessBtn.addEventListener('click', () => {
    requestMicrophoneAccess();
  });
  
  // Открыть помощь
  helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'block';
  });
  
  // Закрыть помощь
  closeBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });
  
  // Закрыть при клике вне окна
  window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });
  
  // Открыть настройки Chrome
  openChromeSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://settings/content/microphone' });
  });
  
  // Открыть настройки Windows
  openWindowsSettings.addEventListener('click', () => {
    // Для Windows 10/11
    chrome.tabs.create({ url: 'ms-settings:privacy-microphone' });
  });
  
  // Тест микрофона
  testMicrophone.addEventListener('click', async () => {
    testResult.className = 'test-result';
    testResult.textContent = '⏳ Тестирование...';
    testResult.style.display = 'block';
    
    try {
      // Запрос доступа к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Успех!
      testResult.className = 'test-result success';
      testResult.textContent = '✅ Микрофон работает! Доступ разрешён';
      
      // Остановить поток
      stream.getTracks().forEach(track => track.stop());
      
      // Автозакрыть модалку через 2 секунды
      setTimeout(() => {
        helpModal.style.display = 'none';
        testResult.style.display = 'none';
      }, 2000);
      
    } catch (error) {
      testResult.className = 'test-result error';
      
      let errorMsg = '❌ Ошибка: ';
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Нет разрешения. Нажмите "Разрешить" когда Chrome спросит';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'Микрофон не найден. Подключите микрофон';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Микрофон занят другой программой';
      } else {
        errorMsg += error.message;
      }
      
      testResult.textContent = errorMsg;
    }
  });
});
