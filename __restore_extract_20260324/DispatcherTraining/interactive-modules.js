/* ============================================
   INTERACTIVE MODULES JAVASCRIPT
   Case Study & Quick Check Logic
   ============================================ */

(function () {
    'use strict';

    // Initialize all interactive components
    function initInteractiveModules() {
        initQuickChecks();
        initAudioCompletionTriggers();
    }

    // Quick Check Quiz Logic
    function initQuickChecks() {
        const quickChecks = document.querySelectorAll('.quick-check-block');

        quickChecks.forEach((block, index) => {
            const options = block.querySelectorAll('.quick-check-option');
            const radioButtons = block.querySelectorAll('input[type="radio"]');
            const feedbackDiv = block.querySelector('.quick-check-feedback');

            // Get correct answer from data attribute
            const correctAnswer = block.dataset.correctAnswer;

            // Handle option selection
            options.forEach((option) => {
                option.addEventListener('click', function () {
                    const radio = this.querySelector('input[type="radio"]');
                    if (!radio.disabled) {
                        radio.checked = true;
                        handleAnswer(block, radio.value, correctAnswer, options, feedbackDiv);
                    }
                });
            });

            // Handle radio button change
            radioButtons.forEach((radio) => {
                radio.addEventListener('change', function () {
                    if (!this.disabled) {
                        handleAnswer(block, this.value, correctAnswer, options, feedbackDiv);
                    }
                });
            });
        });
    }

    // Handle answer selection
    function handleAnswer(block, selectedAnswer, correctAnswer, options, feedbackDiv) {
        // Disable all options
        options.forEach(opt => {
            opt.classList.add('disabled');
            const radio = opt.querySelector('input[type="radio"]');
            radio.disabled = true;
        });

        // Check if answer is correct
        const isCorrect = selectedAnswer === correctAnswer;

        // Mark selected option
        options.forEach(opt => {
            const radio = opt.querySelector('input[type="radio"]');
            if (radio.value === selectedAnswer) {
                if (isCorrect) {
                    opt.classList.add('correct');
                } else {
                    opt.classList.add('wrong');
                }
            }
            // Also highlight the correct answer if user was wrong
            if (!isCorrect && radio.value === correctAnswer) {
                opt.classList.add('correct');
            }
        });

        // Show feedback
        if (feedbackDiv) {
            feedbackDiv.classList.add('visible');
            if (isCorrect) {
                feedbackDiv.classList.add('correct');
            } else {
                feedbackDiv.classList.add('wrong');
            }
        }

        // Save progress to localStorage
        saveQuizProgress(block.dataset.quizId, isCorrect);

        // Unlock next section if exists
        unlockNextSection(block);
    }

    // Audio Completion Triggers
    function initAudioCompletionTriggers() {
        const triggers = document.querySelectorAll('.audio-completion-trigger');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', function () {
                this.classList.add('completed');
                this.textContent = '✓ Завершено';

                // Show associated quick check
                const targetId = this.dataset.unlocks;
                if (targetId) {
                    const targetBlock = document.getElementById(targetId);
                    if (targetBlock) {
                        targetBlock.classList.add('visible');
                        targetBlock.classList.remove('locked');

                        // Hide unlock message
                        const unlockMessage = targetBlock.querySelector('.quiz-unlock-message');
                        if (unlockMessage) {
                            unlockMessage.style.display = 'none';
                        }

                        // Smooth scroll to the quiz
                        setTimeout(() => {
                            targetBlock.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }, 300);
                    }
                }
            });
        });

        // Auto-unlock quiz when audio ends (if audio player exists)
        const audioPlayers = document.querySelectorAll('audio');
        audioPlayers.forEach(audio => {
            audio.addEventListener('ended', function () {
                const sectionId = this.closest('.content-section')?.id;
                if (sectionId) {
                    const trigger = document.querySelector(`[data-section="${sectionId}"]`);
                    if (trigger && !trigger.classList.contains('completed')) {
                        trigger.click();
                    }
                }
            });
        });
    }

    // Unlock next section
    function unlockNextSection(currentBlock) {
        const nextSection = currentBlock.nextElementSibling;
        if (nextSection && nextSection.classList.contains('locked')) {
            setTimeout(() => {
                nextSection.classList.remove('locked');
                nextSection.classList.add('visible');
            }, 1000);
        }
    }

    // Save quiz progress to localStorage
    function saveQuizProgress(quizId, isCorrect) {
        if (!quizId) return;

        const progress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');
        const moduleId = document.body.dataset.moduleId || 'module-1';

        if (!progress[moduleId]) {
            progress[moduleId] = {};
        }

        progress[moduleId][quizId] = {
            completed: true,
            correct: isCorrect,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('moduleProgress', JSON.stringify(progress));

        // Update progress indicator if exists
        updateProgressIndicator(moduleId);
    }

    // Update progress indicator
    function updateProgressIndicator(moduleId) {
        const progress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');
        const moduleProgress = progress[moduleId] || {};

        const totalQuizzes = document.querySelectorAll('.quick-check-block').length;
        const completedQuizzes = Object.keys(moduleProgress).length;

        const progressBar = document.querySelector('.module-progress-bar');
        if (progressBar) {
            const percentage = (completedQuizzes / totalQuizzes) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        const progressText = document.querySelector('.module-progress-text');
        if (progressText) {
            progressText.textContent = `${completedQuizzes} / ${totalQuizzes} завершено`;
        }
    }

    // Load saved progress on page load
    function loadSavedProgress() {
        const moduleId = document.body.dataset.moduleId || 'module-1';
        const progress = JSON.parse(localStorage.getItem('moduleProgress') || '{}');
        const moduleProgress = progress[moduleId] || {};

        // Mark completed quizzes
        Object.keys(moduleProgress).forEach(quizId => {
            const block = document.querySelector(`[data-quiz-id="${quizId}"]`);
            if (block && moduleProgress[quizId].completed) {
                // Auto-fill the correct answer (optional)
                const correctAnswer = block.dataset.correctAnswer;
                const options = block.querySelectorAll('.quick-check-option');

                options.forEach(opt => {
                    const radio = opt.querySelector('input[type="radio"]');
                    if (radio.value === correctAnswer) {
                        radio.checked = true;
                        opt.classList.add('correct');
                    }
                    opt.classList.add('disabled');
                    radio.disabled = true;
                });

                const feedbackDiv = block.querySelector('.quick-check-feedback');
                if (feedbackDiv) {
                    feedbackDiv.classList.add('visible', 'correct');
                }
            }
        });

        updateProgressIndicator(moduleId);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initInteractiveModules();
            loadSavedProgress();
        });
    } else {
        initInteractiveModules();
        loadSavedProgress();
    }

    // Expose functions globally if needed
    window.InteractiveModules = {
        init: initInteractiveModules,
        loadProgress: loadSavedProgress
    };

})();
