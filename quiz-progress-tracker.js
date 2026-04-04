/**
 * quiz-progress-tracker.js — Автоматически сохраняет прогресс тестов в localStorage
 * Подключается на всех страницах модулей через nav-loader.js
 * Слушает клики по .quiz-option и сохраняет результат в moduleProgress
 */
(function () {
  'use strict';

  // Определяем ID модуля из URL
  function detectModuleId() {
    var match = window.location.pathname.match(/doc-module-(\d+)/);
    return match ? 'module-' + match[1] : null;
  }

  var moduleId = detectModuleId();
  if (!moduleId) return; // Не страница модуля — выходим

  // Слушаем клики по вариантам ответов
  document.addEventListener('click', function (e) {
    var option = e.target.closest('.quiz-option');
    if (!option) return;

    var quizBlock = option.closest('.quick-check-block');
    if (!quizBlock) return;

    var quizId = quizBlock.dataset.quizId || quizBlock.id;
    if (!quizId) return;

    var correctAnswer = quizBlock.dataset.correctAnswer;
    var selectedAnswer = option.dataset.answer;
    var isCorrect = selectedAnswer === correctAnswer;

    // Сохраняем в localStorage
    var progress = {};
    try { progress = JSON.parse(localStorage.getItem('moduleProgress') || '{}'); } catch (e) {}

    if (!progress[moduleId]) progress[moduleId] = {};

    progress[moduleId][quizId] = {
      completed: true,
      correct: isCorrect,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('moduleProgress', JSON.stringify(progress));
  });

  // При загрузке — восстанавливаем визуальное состояние пройденных тестов
  document.addEventListener('DOMContentLoaded', function () {
    var progress = {};
    try { progress = JSON.parse(localStorage.getItem('moduleProgress') || '{}'); } catch (e) {}
    var modData = progress[moduleId] || {};

    Object.keys(modData).forEach(function (quizId) {
      if (!modData[quizId].completed) return;

      var block = document.querySelector('[data-quiz-id="' + quizId + '"]') ||
                  document.getElementById(quizId);
      if (!block) return;

      var correctAnswer = block.dataset.correctAnswer;
      block.querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.style.pointerEvents = 'none';
        if (opt.dataset.answer === correctAnswer) {
          opt.classList.add('correct');
        }
      });

      var feedback = block.querySelector('.quiz-feedback');
      if (feedback) feedback.classList.add('show');

      // Разблокируем если был locked
      block.classList.remove('locked');
      block.style.opacity = '1';
    });
  });
})();
