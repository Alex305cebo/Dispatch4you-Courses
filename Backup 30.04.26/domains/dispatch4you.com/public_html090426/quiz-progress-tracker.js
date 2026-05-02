/**
 * quiz-progress-tracker.js v2 — Сохраняет прогресс тестов в localStorage
 * Загружается на страницах doc-module-* через nav-loader.js
 */
(function () {
  'use strict';

  var match = window.location.pathname.match(/doc-module-(\d+)/);
  if (!match) return;
  var moduleId = 'module-' + match[1];

  function getProgress() {
    try { return JSON.parse(localStorage.getItem('moduleProgress') || '{}'); }
    catch (e) { return {}; }
  }

  // Слушаем клики по вариантам ответов (capture phase — срабатывает ДО inline скриптов)
  document.addEventListener('click', function (e) {
    var option = e.target.closest('.quiz-option');
    if (!option) return;

    var quizBlock = option.closest('.quick-check-block');
    if (!quizBlock) return;

    var quizId = quizBlock.getAttribute('data-quiz-id') || quizBlock.id;
    if (!quizId) return;

    var correctAnswer = quizBlock.getAttribute('data-correct-answer');
    var selectedAnswer = option.getAttribute('data-answer');

    var progress = getProgress();
    if (!progress[moduleId]) progress[moduleId] = {};

    progress[moduleId][quizId] = {
      completed: true,
      correct: selectedAnswer === correctAnswer,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('moduleProgress', JSON.stringify(progress));
  });

  // Восстанавливаем визуальное состояние пройденных тестов
  function restoreSaved() {
    var progress = getProgress();
    var modData = progress[moduleId] || {};

    Object.keys(modData).forEach(function (quizId) {
      if (!modData[quizId] || !modData[quizId].completed) return;

      var block = document.querySelector('[data-quiz-id="' + quizId + '"]') ||
                  document.getElementById(quizId);
      if (!block) return;

      var correctAnswer = block.getAttribute('data-correct-answer');
      var options = block.querySelectorAll('.quiz-option');
      var alreadyAnswered = false;
      options.forEach(function (opt) {
        if (opt.classList.contains('correct') || opt.classList.contains('incorrect')) alreadyAnswered = true;
      });
      if (alreadyAnswered) return;

      options.forEach(function (opt) {
        opt.style.pointerEvents = 'none';
        if (opt.getAttribute('data-answer') === correctAnswer) {
          opt.classList.add('correct');
        }
      });

      var feedback = block.querySelector('.quiz-feedback');
      if (feedback) feedback.classList.add('show');

      block.classList.remove('locked');
      block.style.opacity = '1';
    });
  }

  // Запускаем восстановление — DOM может быть уже готов
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSaved);
  } else {
    restoreSaved();
  }
})();
