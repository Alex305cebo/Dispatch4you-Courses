/**
 * Enhanced Quiz System v1.0
 * Улучшенная система квизов с popup результатами
 * 
 * Функции:
 * - Popup с результатами вместо inline feedback
 * - Счетчик прогресса (X/Y)
 * - Кнопка "Пройти заново" с перезагрузкой
 * - Закрытие popup при клике вне его
 * - Сохранение состояния (не сбрасывается при закрытии popup)
 */

(function() {
    'use strict';

    let quizState = {
        totalQuizzes: 0,
        answeredQuizzes: 0,
        correctAnswers: 0,
        quizResults: {} // {quizId: {correct: boolean, answered: boolean}}
    };

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        initQuizSystem();
    });

    function initQuizSystem() {
        // Подсчитываем общее количество квизов
        const allQuizzes = document.querySelectorAll('.quick-check-block');
        quizState.totalQuizzes = allQuizzes.length;

        // Инициализируем состояние для каждого квиза
        allQuizzes.forEach(quiz => {
            const quizId = quiz.dataset.quizId || quiz.id;
            if (quizId) {
                quizState.quizResults[quizId] = {
                    correct: false,
                    answered: false
                };
            }
        });

        // Добавляем обработчики на все опции квизов
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', handleQuizAnswer);
        });

        // Создаем popup элемент если его еще нет
        if (!document.getElementById('quiz-result-popup')) {
            createResultPopup();
        }
    }

    function handleQuizAnswer(event) {
        const option = event.currentTarget;
        const quizBlock = option.closest('.quick-check-block');
        
        if (!quizBlock) return;

        const quizId = quizBlock.dataset.quizId || quizBlock.id;
        const correctAnswer = quizBlock.dataset.correctAnswer;
        const selectedAnswer = option.dataset.answer;
        const allOptions = quizBlock.querySelectorAll('.quiz-option');

        // Проверяем, не отвечен ли уже этот квиз
        if (quizState.quizResults[quizId]?.answered) {
            return;
        }

        // Блокируем все опции
        allOptions.forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            } else if (opt === option && selectedAnswer !== correctAnswer) {
                opt.classList.add('incorrect');
            }
        });

        // Обновляем состояние
        const isCorrect = selectedAnswer === correctAnswer;
        quizState.answeredQuizzes++;
        if (isCorrect) {
            quizState.correctAnswers++;
        }
        quizState.quizResults[quizId] = {
            correct: isCorrect,
            answered: true
        };

        // Показываем popup с результатом
        showResultPopup(isCorrect);
    }

    function createResultPopup() {
        const popup = document.createElement('div');
        popup.id = 'quiz-result-popup';
        popup.className = 'quiz-popup-overlay';
        popup.innerHTML = `
            <div class="quiz-popup-content">
                <div class="quiz-popup-score" id="quiz-popup-score">2/8</div>
                <div class="quiz-popup-message" id="quiz-popup-message">Перечитайте модуль.</div>
                <button class="quiz-popup-btn" id="quiz-popup-retry">Пройти заново</button>
            </div>
        `;
        document.body.appendChild(popup);

        // Обработчик закрытия при клике вне popup
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closePopup();
            }
        });

        // Обработчик кнопки "Пройти заново"
        document.getElementById('quiz-popup-retry').addEventListener('click', function() {
            resetAllQuizzes();
        });
    }

    function showResultPopup(isCorrect) {
        const popup = document.getElementById('quiz-result-popup');
        const scoreEl = document.getElementById('quiz-popup-score');
        const messageEl = document.getElementById('quiz-popup-message');

        if (!popup) return;

        // Обновляем счетчик
        scoreEl.textContent = `${quizState.correctAnswers}/${quizState.totalQuizzes}`;

        // Обновляем сообщение
        if (quizState.answeredQuizzes === quizState.totalQuizzes) {
            // Все квизы пройдены
            const percentage = (quizState.correctAnswers / quizState.totalQuizzes) * 100;
            if (percentage >= 80) {
                messageEl.textContent = 'Отлично! Вы готовы к следующему модулю.';
                scoreEl.style.color = '#10b981';
            } else if (percentage >= 60) {
                messageEl.textContent = 'Хорошо! Но есть что улучшить.';
                scoreEl.style.color = '#f59e0b';
            } else {
                messageEl.textContent = 'Перечитайте модуль.';
                scoreEl.style.color = '#ef4444';
            }
        } else {
            // Еще не все квизы пройдены
            if (isCorrect) {
                messageEl.textContent = 'Правильно! Продолжайте.';
                scoreEl.style.color = '#10b981';
            } else {
                messageEl.textContent = 'Неправильно. Попробуйте еще раз.';
                scoreEl.style.color = '#ef4444';
            }
        }

        // Показываем popup
        popup.classList.add('show');
    }

    function closePopup() {
        const popup = document.getElementById('quiz-result-popup');
        if (popup) {
            popup.classList.remove('show');
        }
    }

    function resetAllQuizzes() {
        // Сбрасываем состояние
        quizState.answeredQuizzes = 0;
        quizState.correctAnswers = 0;
        Object.keys(quizState.quizResults).forEach(quizId => {
            quizState.quizResults[quizId] = {
                correct: false,
                answered: false
            };
        });

        // Сбрасываем визуальное состояние всех квизов
        document.querySelectorAll('.quick-check-block').forEach(quizBlock => {
            const allOptions = quizBlock.querySelectorAll('.quiz-option');
            allOptions.forEach(opt => {
                opt.style.pointerEvents = 'auto';
                opt.classList.remove('correct', 'incorrect');
            });

            // Скрываем inline feedback если есть
            const feedback = quizBlock.querySelector('.quiz-feedback');
            if (feedback) {
                feedback.classList.remove('show');
            }
        });

        // Закрываем popup
        closePopup();

        // Прокручиваем к первому квизу
        const firstQuiz = document.querySelector('.quick-check-block');
        if (firstQuiz) {
            firstQuiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Экспортируем функции для внешнего использования
    window.EnhancedQuizSystem = {
        reset: resetAllQuizzes,
        getState: () => ({ ...quizState }),
        closePopup: closePopup
    };
})();
