// База данных вопросов для диспетчеров
const questionsDatabase = [
    {
        id: 1,
        category: "Основы работы",
        question: "Диспетчер должен принимать заказы только через официальную систему?",
        description: "Все заказы должны регистрироваться в единой системе для контроля и учета. Это обеспечивает прозрачность работы и защиту интересов всех сторон.",
        correctAnswer: true,
        hint: "Официальная система гарантирует сохранность данных и возможность отслеживания"
    },
    {
        id: 2,
        category: "Безопасность",
        question: "Можно ли передавать личные данные клиентов третьим лицам?",
        description: "Личные данные клиентов защищены законом о персональных данных. Передача информации третьим лицам без согласия клиента является нарушением.",
        correctAnswer: false,
        hint: "Конфиденциальность - основа доверия клиентов"
    },
    {
        id: 3,
        category: "Коммуникация",
        question: "Диспетчер должен всегда оставаться вежливым, даже если клиент груб?",
        description: "Профессионализм диспетчера проявляется в умении сохранять спокойствие и вежливость в любой ситуации. Это помогает разрешать конфликты.",
        correctAnswer: true,
        hint: "Вежливость - признак профессионализма"
    },
    {
        id: 4,
        category: "Приоритеты",
        question: "Экстренные вызовы имеют приоритет над обычными заказами?",
        description: "Экстренные ситуации требуют немедленного реагирования. Диспетчер должен уметь правильно расставлять приоритеты.",
        correctAnswer: true,
        hint: "Безопасность и срочность всегда на первом месте"
    },
    {
        id: 5,
        category: "Документация",
        question: "Можно ли не фиксировать устные договоренности с клиентом?",
        description: "Все договоренности должны быть зафиксированы в системе. Это защищает и компанию, и клиента от недоразумений.",
        correctAnswer: false,
        hint: "Документирование - основа прозрачной работы"
    },
    {
        id: 6,
        category: "Время работы",
        question: "Диспетчер может самостоятельно изменять график работы?",
        description: "График работы согласовывается с руководством. Самовольное изменение графика нарушает рабочий процесс и может оставить службу без покрытия.",
        correctAnswer: false,
        hint: "График - это командная ответственность"
    },
    {
        id: 7,
        category: "Технологии",
        question: "Диспетчер должен владеть базовыми компьютерными навыками?",
        description: "Современная диспетчерская работа невозможна без использования компьютерных систем, программ учета и коммуникационных платформ.",
        correctAnswer: true,
        hint: "Технологии - инструмент современного диспетчера"
    },
    {
        id: 8,
        category: "Конфликты",
        question: "При конфликте с водителем диспетчер должен сразу привлекать руководство?",
        description: "Диспетчер должен сначала попытаться решить конфликт самостоятельно, используя навыки коммуникации. К руководству обращаются при невозможности решения.",
        correctAnswer: false,
        hint: "Самостоятельность в решении проблем - важный навык"
    },
    {
        id: 9,
        category: "Качество",
        question: "Диспетчер должен контролировать качество выполнения заказов?",
        description: "Контроль качества - важная часть работы диспетчера. Это включает проверку выполнения заказа и обратную связь от клиентов.",
        correctAnswer: true,
        hint: "Качество услуг - репутация компании"
    },
    {
        id: 10,
        category: "Обучение",
        question: "Диспетчер может игнорировать новые инструкции и работать по старым правилам?",
        description: "Правила и инструкции обновляются для улучшения работы. Игнорирование новых инструкций может привести к ошибкам и снижению качества.",
        correctAnswer: false,
        hint: "Постоянное обучение - путь к профессионализму"
    },
    {
        id: 11,
        category: "Стресс",
        question: "Диспетчер должен уметь работать в стрессовых ситуациях?",
        description: "Работа диспетчера часто связана со стрессом. Умение сохранять спокойствие и принимать решения под давлением - ключевой навык.",
        correctAnswer: true,
        hint: "Стрессоустойчивость - профессиональное качество"
    },
    {
        id: 12,
        category: "Многозадачность",
        question: "Диспетчер может одновременно обрабатывать несколько заказов?",
        description: "Многозадачность - важная часть работы диспетчера. Необходимо уметь эффективно распределять внимание между задачами.",
        correctAnswer: true,
        hint: "Эффективная многозадачность повышает производительность"
    },
    {
        id: 13,
        category: "Ответственность",
        question: "Диспетчер несёт ответственность за ошибки в маршруте?",
        description: "Диспетчер отвечает за правильность построения маршрута и своевременное информирование водителя об изменениях.",
        correctAnswer: true,
        hint: "Ответственность - основа профессионализма"
    },
    {
        id: 14,
        category: "Связь",
        question: "Можно ли игнорировать звонки от водителей во время смены?",
        description: "Связь с водителями критически важна. Игнорирование звонков может привести к серьёзным проблемам и срыву заказов.",
        correctAnswer: false,
        hint: "Постоянная связь - залог успешной работы"
    },
    {
        id: 15,
        category: "Планирование",
        question: "Диспетчер должен планировать маршруты заранее?",
        description: "Предварительное планирование маршрутов помогает оптимизировать работу, избежать задержек и повысить эффективность.",
        correctAnswer: true,
        hint: "Планирование экономит время и ресурсы"
    },
    {
        id: 16,
        category: "Этика",
        question: "Диспетчер может обсуждать проблемы клиентов с посторонними?",
        description: "Информация о клиентах конфиденциальна. Обсуждение их проблем с посторонними нарушает профессиональную этику.",
        correctAnswer: false,
        hint: "Конфиденциальность - профессиональный стандарт"
    },
    {
        id: 17,
        category: "Технологии",
        question: "Диспетчер должен знать основы GPS-навигации?",
        description: "Понимание работы GPS и навигационных систем необходимо для эффективного построения маршрутов и помощи водителям.",
        correctAnswer: true,
        hint: "GPS - основной инструмент современного диспетчера"
    },
    {
        id: 18,
        category: "Клиенты",
        question: "Диспетчер может отказать клиенту без объяснения причин?",
        description: "Любой отказ должен быть обоснован и вежливо объяснён клиенту. Это поддерживает репутацию компании.",
        correctAnswer: false,
        hint: "Прозрачность укрепляет доверие"
    },
    {
        id: 19,
        category: "Команда",
        question: "Диспетчер должен поддерживать хорошие отношения с коллегами?",
        description: "Командная работа критически важна. Хорошие отношения в коллективе повышают эффективность и создают позитивную атмосферу.",
        correctAnswer: true,
        hint: "Команда - это сила"
    },
    {
        id: 20,
        category: "Инициатива",
        question: "Диспетчер может предлагать улучшения в рабочих процессах?",
        description: "Инициатива и предложения по улучшению приветствуются. Диспетчеры часто видят проблемы, которые можно решить.",
        correctAnswer: true,
        hint: "Инициатива ведёт к развитию"
    }
];

// Состояние приложения
let currentQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let currentCard = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    setupEventListeners();
});

function initQuiz() {
    // Перемешиваем вопросы
    currentQuestions = shuffleArray([...questionsDatabase]);
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    
    updateProgress();
    renderCard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderCard() {
    const container = document.getElementById('cardsContainer');
    
    if (currentIndex >= currentQuestions.length) {
        showResults();
        return;
    }
    
    const question = currentQuestions[currentIndex];
    
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-category">${question.category}</div>
        <div class="card-question">${question.question}</div>
        <div class="card-description">${question.description}</div>
        ${question.hint ? `<div class="card-hint">💡 ${question.hint}</div>` : ''}
        <div class="swipe-indicator left">✗</div>
        <div class="swipe-indicator right">✓</div>
    `;
    
    container.innerHTML = '';
    container.appendChild(card);
    currentCard = card;
    
    setupCardSwipe(card, question);
}

function setupCardSwipe(card, question) {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    
    const onStart = (e) => {
        isDragging = true;
        card.classList.add('swiping');
        
        const point = e.type.includes('mouse') ? e : e.touches[0];
        startX = point.clientX;
        startY = point.clientY;
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        
        const point = e.type.includes('mouse') ? e : e.touches[0];
        currentX = point.clientX - startX;
        currentY = point.clientY - startY;
        
        const rotation = currentX / 20;
        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
        
        // Показываем индикаторы
        if (currentX > 50) {
            card.classList.add('swiping-right');
            card.classList.remove('swiping-left');
        } else if (currentX < -50) {
            card.classList.add('swiping-left');
            card.classList.remove('swiping-right');
        } else {
            card.classList.remove('swiping-left', 'swiping-right');
        }
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('swiping');
        
        const threshold = 100;
        
        if (Math.abs(currentX) > threshold) {
            // Свайп выполнен
            const isRight = currentX > 0;
            handleAnswer(isRight, question);
            animateCardOut(card, isRight);
        } else {
            // Возвращаем карточку
            card.style.transform = '';
            card.classList.remove('swiping-left', 'swiping-right');
        }
        
        currentX = 0;
        currentY = 0;
    };
    
    // Touch events
    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);
    
    // Mouse events
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
}

function animateCardOut(card, isRight) {
    const direction = isRight ? 1 : -1;
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = `translate(${direction * 1000}px, ${currentY}px) rotate(${direction * 50}deg)`;
    
    setTimeout(() => {
        currentIndex++;
        updateProgress();
        renderCard();
    }, 300);
}

function handleAnswer(userAnswer, question) {
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
        correctCount++;
        playSound('correct');
    } else {
        wrongCount++;
        playSound('wrong');
    }
    
    updateScore();
}

function updateProgress() {
    document.getElementById('currentQuestion').textContent = currentIndex + 1;
    document.getElementById('totalQuestions').textContent = currentQuestions.length;
    
    const progress = ((currentIndex) / currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function updateScore() {
    document.getElementById('scoreCorrect').textContent = correctCount;
    document.getElementById('scoreWrong').textContent = wrongCount;
}

function playSound(type) {
    // Вибрация на мобильных устройствах
    if (navigator.vibrate) {
        if (type === 'correct') {
            navigator.vibrate(50);
        } else {
            navigator.vibrate([50, 50, 50]);
        }
    }
}

function setupEventListeners() {
    // Кнопка "Неверно"
    document.getElementById('btnWrong').addEventListener('click', () => {
        if (currentCard && currentIndex < currentQuestions.length) {
            const question = currentQuestions[currentIndex];
            handleAnswer(false, question);
            animateCardOut(currentCard, false);
        }
    });
    
    // Кнопка "Верно"
    document.getElementById('btnCorrect').addEventListener('click', () => {
        if (currentCard && currentIndex < currentQuestions.length) {
            const question = currentQuestions[currentIndex];
            handleAnswer(true, question);
            animateCardOut(currentCard, true);
        }
    });
    
    // Кнопка "Информация"
    document.getElementById('btnInfo').addEventListener('click', () => {
        if (currentCard) {
            const hint = currentCard.querySelector('.card-hint');
            if (hint) {
                hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
}

function showResults() {
    const total = currentQuestions.length;
    const percent = Math.round((correctCount / total) * 100);
    
    document.getElementById('finalCorrect').textContent = correctCount;
    document.getElementById('finalWrong').textContent = wrongCount;
    document.getElementById('finalPercent').textContent = `${percent}%`;
    
    document.getElementById('resultsModal').classList.add('active');
}

function restartQuiz() {
    document.getElementById('resultsModal').classList.remove('active');
    initQuiz();
}

// Предотвращаем случайное закрытие
window.addEventListener('beforeunload', (e) => {
    if (currentIndex > 0 && currentIndex < currentQuestions.length) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Поддержка клавиатуры
document.addEventListener('keydown', (e) => {
    if (currentIndex >= currentQuestions.length) return;
    
    if (e.key === 'ArrowLeft') {
        // Неверный ответ
        document.getElementById('btnWrong').click();
    } else if (e.key === 'ArrowRight') {
        // Правильный ответ
        document.getElementById('btnCorrect').click();
    } else if (e.key === 'ArrowUp' || e.key === ' ') {
        // Показать подсказку
        e.preventDefault();
        document.getElementById('btnInfo').click();
    }
});
