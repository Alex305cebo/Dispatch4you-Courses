
        // AI Chatbot functionality with context awareness
        document.getElementById('aiWelcomeTime').textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        const aiHelperBtn = document.getElementById('aiHelperBtn');
        const aiChatbotModal = document.getElementById('aiChatbotModal');
        const aiCloseBtn = document.getElementById('aiCloseBtn');
        const aiChatbotMessages = document.getElementById('aiChatbotMessages');
        const aiUserInput = document.getElementById('aiUserInput');
        const aiTypingIndicator = document.getElementById('aiTypingIndicator');

        // Track conversation context
        let conversationContext = [];

        // Open AI chatbot with automatic context analysis
        aiHelperBtn.addEventListener('click', () => {
            aiChatbotModal.classList.add('active');
            aiUserInput.focus();

            // Automatically show context analysis when opening
            setTimeout(() => {
                const context = captureConversationContext();
                if (context.length > 0) {
                    // Add automatic analysis message
                    showAITyping();
                    setTimeout(() => {
                        hideAITyping();
                        const analysis = analyzeCurrentStep();
                        addAIMessage(analysis, 'bot');
                    }, 800);
                }
            }, 300);
        });

        // Close AI chatbot
        aiCloseBtn.addEventListener('click', () => {
            aiChatbotModal.classList.remove('active');
        });

        // Close on backdrop click
        aiChatbotModal.addEventListener('click', (e) => {
            if (e.target === aiChatbotModal) {
                aiChatbotModal.classList.remove('active');
            }
        });

        // AI Bot Brain - Knowledge Base with context awareness
        const aiBotBrain = {
            greetings: {
                patterns: ['привет', 'здравствуй', 'хай', 'hello', 'hi'],
                responses: ['Привет! 😊 Чем могу помочь во время симуляции?']
            },
            context: {
                patterns: ['что происходит', 'где я', 'контекст', 'диалог', 'разговор', 'что сейчас', 'на каком шаге'],
                responses: ['CONTEXT_RESPONSE']
            },
            analyze: {
                patterns: ['анализ', 'как я', 'оцени', 'что думаешь', 'мой ответ', 'какой счет', 'мой счет'],
                responses: ['ANALYZE_RESPONSE']
            },
            nextstep: {
                patterns: ['что дальше', 'следующий шаг', 'что сказать', 'как ответить', 'что делать', 'лучший ответ', 'на чем фокус'],
                responses: ['NEXT_STEP_RESPONSE']
            },

            // Документы
            bol: {
                patterns: ['bol', 'бол', 'bill of lading', 'накладная'],
                responses: ['📋 BOL (Bill of Lading) — транспортная накладная:\n• Описание груза и количество\n• Адреса pickup/delivery\n• Условия перевозки\n• Подписи сторон\n• Номер груза']
            },
            pod: {
                patterns: ['pod', 'proof of delivery', 'подтверждение доставки'],
                responses: ['✅ POD (Proof of Delivery):\n• Подпись получателя\n• Дата и время доставки\n• Состояние груза\n• Фото (если требуется)\n\n⚠️ Без POD брокер не заплатит!']
            },
            ratecon: {
                patterns: ['rate confirmation', 'rate con', 'рейт кон', 'подтверждение ставки'],
                responses: ['📄 Rate Confirmation:\n• Официальное подтверждение ставки\n• Детали груза и маршрута\n• Условия оплаты\n• Контакты сторон\n\n💡 Всегда проверяй перед началом!']
            },
            hos: {
                patterns: ['hos', 'hours of service', 'часы работы', 'логбук'],
                responses: ['⏰ HOS (Hours of Service):\n• 11 часов вождения в день\n• 14 часов рабочего времени\n• 10 часов отдыха\n• 70 часов за 8 дней\n\n⚠️ Нарушение = штраф!']
            },
            mcdot: {
                patterns: ['mc', 'dot', 'mc dot', 'номер компании'],
                responses: ['🚛 MC/DOT номера:\n• MC = Motor Carrier (брокер/перевозчик)\n• DOT = Department of Transportation\n• Проверяй на FMCSA.gov\n• Убедись что компания активна']
            },

            // Переговоры
            negotiation: {
                patterns: ['переговоры', 'как торговаться', 'ставка', 'тактика'],
                responses: [
                    '💰 Тактика переговоров:\n1. Называй цену на 15-20% выше\n2. Обоснуй (расстояние, топливо, время)\n3. После цены — молчи 5-10 сек\n4. Имей план Б\n5. Будь уверен и вежлив',
                    '🎯 Переговорный приём:\n• Назови цену и замолчи\n• Кто говорит первым — проигрывает\n• "That\'s my best rate"\n• Не оправдывайся за цену\n• Уверенность = деньги',
                    '💡 Золотое правило торга:\n• Первая цена брокера — не финальная\n• Всегда есть пространство\n• Встреться посередине\n• Или уходи — это тоже сила\n• Практика делает мастера'
                ]
            },
            price: {
                patterns: ['какую ставку', 'цена', 'сколько просить', 'какую цену'],
                responses: [
                    '💵 Как назвать цену:\n• Узнай posted rate\n• Добавь 15-20% сверху\n• Обоснуй (deadhead, время, топливо)\n• Будь готов к торгу\n• Знай свой минимум',
                    '📊 Формула цены:\nPosted Rate + 15% = твоя цена\n\nПример: $1800 posted\n→ Проси $2070-2100\n→ Минимум: $1900\n→ Цель: $2000+',
                    '🎯 Стратегия цены:\n• Изучи рынок (DAT, Truckstop)\n• Назови выше рынка на 10-20%\n• Обоснуй уникальность\n• Не бойся высокой цены\n• Брокер всегда торгуется'
                ]
            },
            lower: {
                patterns: ['как снизить', 'снизить цену', 'дешевле'],
                responses: ['📉 Если брокер просит снизить:\n• "Это моя лучшая цена"\n• "Могу встретиться посередине"\n• "У меня есть другие предложения"\n• Не снижай сразу больше 5%']
            },
            raise: {
                patterns: ['как поднять', 'поднять цену', 'дороже'],
                responses: ['📈 Как поднять цену:\n• Укажи на срочность\n• Упомяни deadhead\n• "Топливо выросло"\n• "Специальное оборудование"\n• Будь уверен в цифрах']
            },

            // Оборудование
            dryvan: {
                patterns: ['dry van', 'драй ван', 'фургон'],
                responses: ['🚛 Dry Van:\n• Самый популярный тип\n• Закрытый фургон 53 фута\n• Обычные грузы\n• Ставки: $1.50-2.50/mile\n• Легко найти груз']
            },
            reefer: {
                patterns: ['reefer', 'рефрижератор', 'холодильник'],
                responses: ['❄️ Reefer (Рефрижератор):\n• Температурный контроль\n• Продукты, медикаменты\n• Ставки: $2.00-3.50/mile\n• Выше оплата, больше ответственность\n• Проверяй температуру!']
            },
            flatbed: {
                patterns: ['flatbed', 'флэтбед', 'платформа'],
                responses: ['📦 Flatbed:\n• Открытая платформа\n• Стройматериалы, оборудование\n• Ставки: $2.00-3.00/mile\n• Нужны ремни/цепи\n• Погода важна!']
            },
            tanker: {
                patterns: ['tanker', 'танкер', 'цистерна'],
                responses: ['🛢️ Tanker:\n• Жидкости (топливо, химия)\n• Ставки: $2.50-4.00/mile\n• Нужен endorsement\n• Высокая ответственность\n• Специальная лицензия']
            },

            // Проблемы
            tonu: {
                patterns: ['tonu', 'тону', 'отмена'],
                responses: ['🔴 TONU (Truck Ordered Not Used):\n• Груз отменен после подтверждения\n• Требуй компенсацию!\n• Обычно $50-150\n• Документируй все\n• Пиши в Rate Con']
            },
            detention: {
                patterns: ['detention', 'детеншн', 'простой', 'ожидание'],
                responses: ['⏱️ Detention (Простой):\n• Ожидание >2 часов\n• $25-75 за час\n• Засекай время прибытия!\n• Фотографируй документы\n• Требуй оплату']
            },
            breakdown: {
                patterns: ['breakdown', 'поломка', 'сломался'],
                responses: ['🛠️ Поломка:\n1. Сразу звони брокеру\n2. Найди замену (если можешь)\n3. Документируй все\n4. Проверь страховку\n5. Будь честен о сроках']
            },
            accident: {
                patterns: ['авария', 'accident', 'дтп'],
                responses: ['🚨 При аварии:\n1. Безопасность первое!\n2. Вызови полицию\n3. Звони брокеру СРАЗУ\n4. Фото всего\n5. Не признавай вину\n6. Страховая компания']
            },
            refuse: {
                patterns: ['если откажут', 'отказ', 'отказать'],
                responses: ['❌ Если брокер отказывает:\n• "Спасибо, удачи!"\n• Не спорь\n• Переходи к следующему\n• Запомни компанию\n• Анализируй почему']
            },

            // Стратегии
            polite: {
                patterns: ['вежливость', 'как быть вежливым', 'вежливо'],
                responses: ['😊 Вежливость:\n• "Thank you for the opportunity"\n• "I appreciate your time"\n• "Let me check and get back to you"\n• Никогда не груби\n• Профессионализм = больше грузов']
            },
            confident: {
                patterns: ['уверенность', 'как быть уверенным', 'уверенно'],
                responses: ['💪 Уверенность:\n• Знай свои цифры\n• Говори четко\n• Не извиняйся за цену\n• "This is my rate"\n• Пауза после цены = сила']
            },
            professional: {
                patterns: ['профессионал', 'как профессионал', 'профи'],
                responses: ['🎭 Профессионализм:\n• Знай терминологию\n• Задавай правильные вопросы\n• Записывай детали\n• Перезванивай вовремя\n• Держи слово']
            },
            silence: {
                patterns: ['молчать', 'молчание', 'пауза'],
                responses: ['🤐 Сила молчания:\n• После названия цены — МОЛЧИ\n• Пусть брокер говорит первым\n• 5-10 секунд тишины\n• Не заполняй паузу\n• Кто говорит первый — проигрывает']
            },
            question: {
                patterns: ['какой вопрос', 'что спросить', 'вопрос'],
                responses: ['❓ Важные вопросы:\n• Pickup/delivery time?\n• Weight and dimensions?\n• Any special requirements?\n• Detention pay?\n• Payment terms?\n• Contact info?']
            },

            // Финансы
            rpm: {
                patterns: ['rpm', 'rate per mile', 'ставка за милю'],
                responses: ['💵 RPM (Rate Per Mile):\n• Общая ставка ÷ мили\n• Хороший RPM: $2.00+\n• Учитывай deadhead!\n• Пример: $2000 ÷ 1000 = $2.00/mi']
            },
            costs: {
                patterns: ['расходы', 'затраты', 'costs'],
                responses: ['💰 Основные расходы:\n• Топливо: $0.50-0.80/mile\n• Страховка: $500-1500/месяц\n• Maintenance: $0.15-0.25/mile\n• Permits: $500-2000/год\n• Итого: ~$1.00-1.50/mile']
            },
            profit: {
                patterns: ['прибыль', 'profit', 'заработок'],
                responses: ['📊 Расчет прибыли:\n• Gross = общая ставка\n• Вычти все расходы\n• Net = чистая прибыль\n• Цель: 20-30% margin\n• Пример: $2000 - $1200 = $800']
            },
            salary: {
                patterns: ['зарплата', 'salary', 'сколько платят'],
                responses: ['💸 Зарплата диспетчера:\n• Начинающий: $35-45k/год\n• Опытный: $50-70k/год\n• Топ: $70-100k+/год\n• Часто % от gross\n• Зависит от компании']
            },

            // Действия
            agree: {
                patterns: ['согласиться', 'принять', 'agree'],
                responses: ['✅ Как согласиться:\n• "That works for me"\n• "Let\'s book it"\n• "Send me the Rate Con"\n• Подтверди детали\n• Запиши все']
            },
            decline: {
                patterns: ['отказать', 'decline', 'refuse'],
                responses: ['❌ Как отказать:\n• "Thank you, but I\'ll pass"\n• "Not this time"\n• "I have a better offer"\n• Будь вежлив\n• Не сжигай мосты']
            },
            think: {
                patterns: ['подумать', 'нужно подумать', 'think'],
                responses: ['🤔 Попросить время:\n• "Let me check my schedule"\n• "I need to calculate"\n• "Can I call you back in 10 min?"\n• Не спеши!\n• Проверь альтернативы']
            },
            callback: {
                patterns: ['перезвонить', 'callback', 'call back'],
                responses: ['📞 Перезвонить:\n• "I\'ll call you back in 15 minutes"\n• Запиши имя и номер\n• Перезвони ВОВРЕМЯ\n• Подготовь ответ\n• Профессионализм важен']
            },
            time: {
                patterns: ['попросить время', 'время подумать', 'нужно время'],
                responses: ['⏰ Попросить время:\n• "Give me 10 minutes"\n• "Let me check with my driver"\n• "I need to calculate costs"\n• Используй время мудро\n• Проверь конкурентов']
            },

            // Специальные ситуации
            urgent: {
                patterns: ['срочно', 'срочный груз', 'urgent'],
                responses: ['🔥 Срочный груз:\n• Выше ставка (+20-50%)\n• Меньше времени на решение\n• Проверь реальность сроков\n• "I can do it for..."\n• Не паникуй!']
            },
            night: {
                patterns: ['ночь', 'ночная доставка', 'night'],
                responses: ['🌙 Ночная доставка:\n• Требуй доплату\n• Проверь HOS водителя\n• Безопасность важнее\n• +$100-300 к ставке\n• Уточни время приемки']
            },
            weekend: {
                patterns: ['выходные', 'weekend', 'суббота', 'воскресенье'],
                responses: ['🎄 Выходные:\n• Доплата обязательна!\n• +$150-500 к ставке\n• Проверь работает ли получатель\n• Detention выше\n• Планируй заранее']
            },
            temperature: {
                patterns: ['температура', 'температурный режим', 'temperature'],
                responses: ['🌡️ Температурный режим:\n• Уточни точную температуру\n• Проверь оборудование\n• Мониторинг обязателен\n• Документируй показания\n• Штраф за нарушение огромный!']
            },
            weight: {
                patterns: ['вес', 'вес груза', 'weight'],
                responses: ['⚖️ Вес груза:\n• Максимум: 45,000 lbs\n• Проверь на весах\n• Overweight = штраф\n• Учитывай вес трейлера\n• Спроси точный вес']
            },
            dimensions: {
                patterns: ['размер', 'размеры', 'dimensions'],
                responses: ['📏 Размеры:\n• Стандарт: 53\' x 8.5\' x 9\'\n• Oversize = permits\n• Проверь высоту\n• Ширина важна\n• Спроси точные размеры']
            },

            // Мотивация
            motivation: {
                patterns: ['мотивация', 'motivation'],
                responses: ['💪 Ты можешь!\n• Каждый звонок = опыт\n• Ошибки = уроки\n• Практика = мастерство\n• Не сдавайся\n• Следующий груз твой!']
            },
            goodjob: {
                patterns: ['молодец', 'как я справляюсь', 'good job'],
                responses: ['🎉 Отлично работаешь!\n• Продолжай в том же духе\n• Анализируй каждый диалог\n• Учись на ошибках\n• Ты становишься лучше\n• Keep going!']
            },
            tipofday: {
                patterns: ['совет дня', 'tip of day'],
                responses: ['🌟 Совет дня:\n• Записывай каждый звонок\n• Анализируй что сработало\n• Учи новые термины\n• Слушай опытных\n• Практика каждый день!']
            },

            // Обучение
            teach: {
                patterns: ['научи', 'teach', 'обучи'],
                responses: ['🎓 Основы диспетчинга:\n1. Знай рынок\n2. Умей торговаться\n3. Будь профессионален\n4. Документируй все\n5. Строй отношения\n6. Учись постоянно']
            },
            idea: {
                patterns: ['дай идею', 'idea', 'идея'],
                responses: ['✨ Попробуй:\n• Задай уточняющий вопрос\n• Покажи заинтересованность\n• Упомяни свой опыт\n• Будь уверен в цене\n• Предложи альтернативу']
            },

            // Общие
            help: {
                patterns: ['помощь', 'что ты умеешь', 'help'],
                responses: ['⚡ Я помогу с:\n• Анализом диалога\n• Советами по шагам\n• Терминами и документами\n• Переговорами и ценами\n• Проблемами и решениями\n• Мотивацией\n\nПросто спроси!']
            },
            advice: {
                patterns: ['совет', 'подскажи'],
                responses: [
                    '💡 Золотое правило:\nБудь уверенным, но вежливым. Слушай внимательно, задавай вопросы, не спеши соглашаться. Каждый диалог — это возможность!',
                    '🌟 Совет профи:\nЗапоминай имена брокеров. Хорошие отношения = лучшие грузы. Один довольный брокер приведёт десять новых!',
                    '🎯 Практический совет:\nПосле каждого диалога записывай что сработало. Анализ = рост. Через месяц ты будешь в 2 раза лучше!',
                    '⚡ Быстрый совет:\nНе соглашайся на первую цену НИКОГДА. Даже если хорошая — попробуй поднять на $50-100. Хуже не будет!'
                ]
            },
            thanks: {
                patterns: ['спасибо', 'благодар', 'thanks'],
                responses: [
                    'Пожалуйста! 😊 Удачи в симуляции!',
                    'Всегда рад помочь! 🚀 Ты справишься!',
                    'Обращайся! 💪 Я здесь для тебя!'
                ]
            }
        };

        // Capture conversation context from main chat
        function captureConversationContext() {
            const messages = document.querySelectorAll('#messagesContainer .message');
            conversationContext = [];

            messages.forEach(msg => {
                const content = msg.querySelector('.message-content');
                const sender = msg.classList.contains('user') ? 'dispatcher' : 'broker';
                if (content) {
                    const text = content.textContent.trim();
                    // Remove name labels and progress info
                    const cleanText = text.split('\n')[0] || text;
                    conversationContext.push({
                        sender: sender,
                        text: cleanText
                    });
                }
            });

            return conversationContext;
        }

        // Analyze conversation and provide context-aware response
        function analyzeConversation() {
            const context = captureConversationContext();

            if (context.length === 0) {
                return '📊 Диалог еще не начался. Выбери сценарий на главной странице!';
            }

            const lastMessages = context.slice(-3);
            let analysis = '📊 Анализ диалога:\n\n';

            // Show last 3 messages
            analysis += '💬 Последние сообщения:\n';
            lastMessages.forEach((msg, idx) => {
                const icon = msg.sender === 'dispatcher' ? '👤' : '💼';
                analysis += `${icon} ${msg.sender === 'dispatcher' ? 'Ты' : 'Брокер'}: "${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}"\n`;
            });

            analysis += `\n📈 Всего сообщений: ${context.length}`;

            // Add score if available
            if (typeof currentDispatcherScore !== 'undefined' && currentDispatcherScore > 0) {
                analysis += `\n⭐ Твой счет: ${currentDispatcherScore}`;
            }

            return analysis;
        }

        // Analyze current step with detailed insights - AUTOMATIC ON OPEN
        function analyzeCurrentStep() {
            const context = captureConversationContext();

            if (context.length === 0) {
                return '📊 Диалог еще не начался.\n\n🎯 Выбери сценарий на главной странице и начни общение с брокером!';
            }

            let analysis = '📊 АНАЛИТИКА ТЕКУЩЕГО ШАГА\n\n';

            // Current step info
            if (typeof conversationStep !== 'undefined') {
                analysis += `📍 Шаг диалога: ${conversationStep + 1}\n`;
            }

            // Score info
            if (typeof currentDispatcherScore !== 'undefined' && currentDispatcherScore > 0) {
                analysis += `⭐ Твой счет: ${currentDispatcherScore}`;
                if (typeof totalPossibleScore !== 'undefined' && totalPossibleScore > 0) {
                    const percentage = Math.round((currentDispatcherScore / totalPossibleScore) * 100);
                    analysis += ` из ${totalPossibleScore} (${percentage}%)`;
                }
                analysis += '\n';
            }

            analysis += '\n';

            // Show last 3 messages with full text
            const lastMessages = context.slice(-3);
            lastMessages.forEach((msg, idx) => {
                const icon = msg.sender === 'dispatcher' ? '👤' : '💼';
                const label = msg.sender === 'dispatcher' ? 'Ты' : 'Брокер';
                analysis += `${icon} ${label}:\n"${msg.text}"\n\n`;
            });

            // Get last broker message for context
            const lastBrokerMsg = context.filter(m => m.sender === 'broker').slice(-1)[0];
            const lastDispatcherMsg = context.filter(m => m.sender === 'dispatcher').slice(-1)[0];

            if (lastBrokerMsg) {
                analysis += '\n🎯 ЧТО СЕЙЧАС ПРОИСХОДИТ:\n';
                const brokerText = lastBrokerMsg.text.toLowerCase();

                // Detailed context analysis
                if (brokerText.includes('rate') || brokerText.includes('ставк') || brokerText.includes('price') || brokerText.includes('цен') || brokerText.includes('$')) {
                    analysis += '💰 Обсуждение ставки\n';
                    analysis += '• Брокер говорит о цене\n';
                    if (lastDispatcherMsg && (lastDispatcherMsg.text.includes('$') || lastDispatcherMsg.text.toLowerCase().includes('rate'))) {
                        analysis += '• Ты уже назвал свою цену\n';
                        analysis += '• Сейчас идут переговоры\n';
                    } else {
                        analysis += '• Пора называть свою цену\n';
                    }
                } else if (brokerText.includes('load') || brokerText.includes('груз') || brokerText.includes('freight') || brokerText.includes('pickup') || brokerText.includes('delivery')) {
                    analysis += '📦 Обсуждение деталей груза\n';
                    analysis += '• Брокер описывает груз\n';
                    analysis += '• Узнай все детали перед ценой\n';
                } else if (brokerText.includes('?')) {
                    analysis += '❓ Брокер задал вопрос\n';
                    analysis += '• Нужен четкий ответ\n';
                    analysis += '• Покажи профессионализм\n';
                } else if (brokerText.includes('hello') || brokerText.includes('hi') || brokerText.includes('привет')) {
                    analysis += '👋 Начало диалога\n';
                    analysis += '• Приветствие\n';
                    analysis += '• Установление контакта\n';
                } else {
                    analysis += '💬 Общение продолжается\n';
                    analysis += '• Веди диалог к сделке\n';
                }

                analysis += '\n💡 РЕКОМЕНДАЦИЯ:\n';
                const nextStepAdvice = suggestNextStep();
                const advicePart = nextStepAdvice.split('\n\n')[1];
                if (advicePart) {
                    analysis += advicePart;
                } else {
                    analysis += 'Продолжай диалог профессионально';
                }
            }

            return analysis;
        }

        // Provide next step suggestion based on context
        function suggestNextStep() {
            const context = captureConversationContext();

            if (context.length === 0) {
                return '🎯 Начни диалог! Выбери сценарий и поздоровайся с брокером.';
            }

            const lastBrokerMsg = context.filter(m => m.sender === 'broker').slice(-1)[0];

            if (!lastBrokerMsg) {
                return '🎯 Брокер еще не ответил. Подожди его сообщение.';
            }

            let suggestion = '🎯 Рекомендация:\n\n';
            const brokerText = lastBrokerMsg.text.toLowerCase();

            // Context-aware suggestions
            if (brokerText.includes('rate') || brokerText.includes('ставк') || brokerText.includes('price') || brokerText.includes('цен')) {
                suggestion += '💰 Брокер говорит о ставке:\n';
                suggestion += '• Не соглашайся сразу\n';
                suggestion += '• Назови цену на 15-20% выше\n';
                suggestion += '• Обоснуй свою цену\n';
                suggestion += '• Будь готов к компромиссу';
            } else if (brokerText.includes('load') || brokerText.includes('груз') || brokerText.includes('freight')) {
                suggestion += '📦 Брокер описывает груз:\n';
                suggestion += '• Уточни вес и размеры\n';
                suggestion += '• Спроси про pickup/delivery время\n';
                suggestion += '• Узнай про специальные требования\n';
                suggestion += '• Проверь расстояние';
            } else if (brokerText.includes('?')) {
                suggestion += '❓ Брокер задал вопрос:\n';
                suggestion += '• Ответь четко и уверенно\n';
                suggestion += '• Покажи профессионализм\n';
                suggestion += '• Задай встречный вопрос\n';
                suggestion += '• Не спеши соглашаться';
            } else {
                suggestion += '💬 Продолжай диалог:\n';
                suggestion += '• Будь вежлив и профессионален\n';
                suggestion += '• Задавай уточняющие вопросы\n';
                suggestion += '• Показывай заинтересованность\n';
                suggestion += '• Веди к выгодной сделке';
            }

            return suggestion;
        }

        function getAITime() {
            return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }

        function addAIMessage(text, sender) {
            const messageEl = document.createElement('div');
            messageEl.classList.add('ai-message', sender);
            messageEl.innerHTML = `${text.replace(/\n/g, '<br>')}<span class="time">${getAITime()}</span>`;
            aiChatbotMessages.appendChild(messageEl);
            aiChatbotMessages.scrollTop = aiChatbotMessages.scrollHeight;
        }

        function showAITyping() {
            aiTypingIndicator.classList.add('active');
            aiChatbotMessages.scrollTop = aiChatbotMessages.scrollHeight;
        }

        function hideAITyping() {
            aiTypingIndicator.classList.remove('active');
        }

        // ── GEMINI AI BROKER ──────────────────────────────────────────
        const GEMINI_API_KEY = 'AIzaSyCAARLSxtGWBFnBZSa4w-DEQOK5WRYQQr4';
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        // Conversation history for context
        const geminiHistory = [];

        // Difficulty level: 'beginner' | 'standard' | 'hard'
        let difficultyLevel = 'standard';

        const BROKER_SYSTEM_PROMPT_BASE = `You are {BROKER_NAME}, an experienced American freight broker.
You are in a LIVE training simulation with a dispatcher student practicing real freight negotiation.
Difficulty level: {DIFFICULTY_LEVEL}.

{DIFFICULTY_BEHAVIOR}

═══════════════════════════════════════
CONVERSATION RULES (STRICT):
═══════════════════════════════════════
1. Send ONLY ONE message at a time — never multiple messages in a row
2. Keep each response to 2-4 sentences MAX
3. Always end with a question or next step to keep conversation going
4. Wait for dispatcher's response before continuing
5. Stay in character as {BROKER_NAME} at ALL times

═══════════════════════════════════════
CRITICAL IDENTITY RULES:
═══════════════════════════════════════
- Your name is {BROKER_NAME}. NEVER change your name.
- NEVER copy or use the dispatcher's name as your own
- NEVER say "This is [dispatcher's name]" — you are the BROKER, not the dispatcher
- If dispatcher says "This is Big Mike from Heavy Haul Masters" — you are still {BROKER_NAME}, a different person
- You work for a BROKERAGE company, dispatcher works for a CARRIER company — you are two different people
- Always respond as the broker receiving the call, NOT as the person who called

═══════════════════════════════════════
YOUR BROKER PERSONALITY:
═══════════════════════════════════════
- Professional, experienced freight broker
- You represent a freight brokerage company
- You want to book loads at the LOWEST possible rate
- You respond realistically to negotiation tactics:
  • Good professional approach → be cooperative, slightly flexible
  • Aggressive/rude approach → push back firmly
  • Weak/uncertain approach → hold your low rate
  • Smart counter-offer with market data justification → consider moving up
- You NEVER reveal your maximum rate
- You use real freight industry language

═══════════════════════════════════════
STANDARD BROKER CONVERSATION FLOW:
═══════════════════════════════════════
STEP 1 — QUALIFICATION (first thing you do):
  Ask for: MC number, company name
  Example: "Sure, I can help. What's your MC number and company name?"

STEP 2 — LOAD DETAILS (after getting MC):
  Provide: route, miles, weight, commodity, pickup/delivery times
  Example: "Okay MC checks out. Load is {ROUTE}, {MILES} miles, {WEIGHT} {COMMODITY}, pickup tomorrow 8 AM."

STEP 3 — EQUIPMENT CHECK:
  Confirm trailer type and availability
  Example: "Do you have a {EQUIPMENT} available for tomorrow morning?"

STEP 4 — RATE NEGOTIATION (the core):
  - Your OPENING offer: ${OPENING_RATE}/mile (${OPENING_TOTAL} total) — always start LOW
  - Market rate is actually ~${MARKET_TOTAL} total (you know this but don't say it)
  - Your absolute MAX: ${MAX_TOTAL} (NEVER reveal, never exceed)
  - Move up ONLY when dispatcher counters with justification
  - NEVER jump more than $150 in one move
  - After 3 rounds of negotiation, give "final offer"
  Example: "Best I can do is ${OPENING_RATE}/mile, that's ${OPENING_TOTAL} all-in. What do you say?"

STEP 5 — BOOKING (when rate agreed):
  Confirm: rate, pickup time, driver name, MC number
  Request: W9, insurance cert, email for rate confirmation
  Example: "Great, we're at $X. Send your W9 and insurance to dispatch@brokerco.com and I'll get the rate con out."

═══════════════════════════════════════
RATE NEGOTIATION TACTICS:
═══════════════════════════════════════
When dispatcher asks for higher rate:
  - "That's above what I can do on this lane right now"
  - "I can go up to $X, that's my best on this one"
  - "The market is soft on this corridor this week"

When dispatcher justifies rate with market data:
  - "I appreciate that, let me see what I can do... I can go to $X"
  - "Fair point on the deadhead, I can add $50 to that"

When dispatcher threatens to walk away:
  - Consider making a final offer closer to their ask
  - "Hold on — let me make one more call. I might be able to do $X"

═══════════════════════════════════════
LOAD DETAILS FOR THIS SESSION:
═══════════════════════════════════════
Route: {ROUTE} ({MILES} miles)
Equipment: {EQUIPMENT}
Weight: {WEIGHT} — {COMMODITY}
Pickup: Tomorrow 08:00 AM
Delivery: Day after tomorrow 17:00
Your opening rate: ${OPENING_RATE}/mile (${OPENING_TOTAL} total)
Your absolute max: ${MAX_TOTAL} (NEVER reveal or exceed)

═══════════════════════════════════════
TEACHING MODE:
═══════════════════════════════════════
If dispatcher writes "подскажи", "hint", "помоги", "coach me":
  → BREAK character briefly, prefix with [COACH:]
  → Give a 1-2 sentence coaching tip in Russian
  → Return to broker character immediately after
  Example: "[COACH: Назови конкретную сумму и обоснуй её — упомяни deadhead miles и рыночную ставку DAT. Потом замолчи и жди.] Now, back to business — what's your counter?"

If dispatcher makes a rookie mistake (no MC, accepts first offer, no counter):
  → Stay in character but give a subtle hint
  Example: If they don't give MC → "I'd love to help, but I need your MC number first to verify your authority"

═══════════════════════════════════════
LANGUAGE:
═══════════════════════════════════════
- Respond in the SAME language the dispatcher uses
- If they write in Russian → respond in Russian but use English freight terms (MC, rate con, BOL, detention, etc.)
- If they write in English → respond in English
- Always use real freight terminology: MC, DOT, BOL, POD, rate con, detention, TONU, HOS, deadhead, lumper`;

═══════════════════════════════════════
CONVERSATION RULES(STRICT):
═══════════════════════════════════════
        1. Send ONLY ONE message at a time — never multiple messages in a row
        2. Keep each response to 2 - 4 sentences MAX
        3. Always end with a question or next step to keep conversation going
        4. Wait for dispatcher's response before continuing
5. Stay in character as { BROKER_NAME } at ALL times

═══════════════════════════════════════
CRITICAL IDENTITY RULES:
═══════════════════════════════════════
        - Your name is { BROKER_NAME }. NEVER change your name.
- NEVER copy or use the dispatcher's name as your own
            - NEVER say "This is [dispatcher's name]" — you are the BROKER, not the dispatcher
                - If dispatcher says "This is Big Mike from Heavy Haul Masters" — you are still { BROKER_NAME }, a different person
                    - You work for a BROKERAGE company, dispatcher works for a CARRIER company — you are two different people
                        - Always respond as the broker receiving the call, NOT as the person who called

═══════════════════════════════════════
        - Professional, experienced, slightly tough but fair
            - You represent a freight brokerage company
                - You want to book loads at the LOWEST possible rate
                    - You start negotiations 15 - 20 % BELOW market rate
                        - You respond realistically to negotiation tactics:
  • Good professional approach → be cooperative, slightly flexible
  • Aggressive / rude approach → push back firmly
  • Weak / uncertain approach → hold your low rate
  • Smart counter - offer with justification → consider moving up
            - You NEVER reveal your maximum rate
                - You use real freight industry language

═══════════════════════════════════════
STANDARD BROKER CONVERSATION FLOW:
═══════════════════════════════════════
STEP 1 — QUALIFICATION:
        Ask: MC number, company name, how many trucks, equipment type
        Example: "What's your MC number and company name?"

STEP 2 — LOAD DETAILS:
        Provide: route, miles, weight, commodity, pickup / delivery times
        Example: "Chicago IL to Dallas TX, 967 miles, 44,000 lbs dry van, pickup tomorrow 8 AM"

STEP 3 — EQUIPMENT CHECK:
        Confirm: trailer type, availability, driver HOS status
        Example: "Do you have a 53-foot dry van available for tomorrow?"

STEP 4 — RATE NEGOTIATION(most important):
        - Open LOW: $1.80 - 2.20 / mile depending on lane
            - If dispatcher counters well → move up $50 - 100 at a time
                - If dispatcher says "market rate is X" → acknowledge but hold or move slightly
                    - If dispatcher threatens to walk → consider final offer
                        - Never jump more than $150 in one move
        Example: "I can offer $2.15/mile, that's $2,079 all-in. What do you think?"

STEP 5 — BOOKING:
        Confirm: rate, pickup time, driver info, MC number
        Request: W9, insurance certificate, email for rate confirmation
  Example: "Great! Sending rate con now. Email your W9 and insurance to dispatch@company.com"

═══════════════════════════════════════
RATE NEGOTIATION TACTICS(use these):
═══════════════════════════════════════
When dispatcher asks for higher rate:
            - "That's above what I can do on this lane"
                - "I can go up to $X, that's my best"
                - "The market is soft right now on this corridor"
                - "I have other carriers interested at my rate"

When dispatcher justifies their rate well:
        - "I appreciate that, let me see what I can do"
            - "I can meet you at $X, that's the best I can offer"
            - "Fair point on the deadhead, I can add $50"

When dispatcher is too aggressive:
        - "I understand your position, but I can't go that high"
            - "We might not be a fit on this one"

═══════════════════════════════════════
LOAD DETAILS FOR THIS SESSION:
═══════════════════════════════════════
Use the context from the scenario that was already started.
If no specific load was mentioned, use this default:
        Route: Chicago, IL → Dallas, TX(967 miles)
        Equipment: 53' Dry Van
        Weight: 44,000 lbs — General Freight
        Pickup: Tomorrow 08:00
        Delivery: Day after tomorrow 17:00
  Your opening rate: $2.15 / mile($2,079 total)
  Market rate: ~$2.50 / mile($2, 418 total)
  Your max: $2, 600(NEVER reveal)

═══════════════════════════════════════
TEACHING MODE:
═══════════════════════════════════════
If dispatcher writes "подскажи", "hint", "помоги", "coach me":
  → BREAK character briefly
  → Give a 1 - 2 sentence coaching tip in Russian
  → Return to broker character
        Example: "[COACH: Назови конкретную цену и обоснуй её — упомяни deadhead miles и топливо. Потом замолчи и жди реакции.] Now, back to business — what's your counter?"

If dispatcher makes a rookie mistake:
  → Stay in character but give a subtle hint through your response
        Example: If they don't give MC number → "I'd love to help, but I need your MC number first to verify your authority"

═══════════════════════════════════════
        LANGUAGE:
═══════════════════════════════════════
        - Respond in the SAME language the dispatcher uses
            - If they write in Russian → respond in Russian but use English freight terms
                - If they write in English → respond in English
                    - Always use real freight terminology: MC, DOT, BOL, POD, rate con, detention, TONU, HOS, deadhead, lumper, etc.`;

        function getBrokerSystemPrompt() {
            const name = (typeof brokerName !== 'undefined' && brokerName) ? brokerName : 'Mike';
            const scenario = currentScenario;
            const miles = scenario?.miles || 967;
            const route = scenario?.route || 'Chicago, IL → Dallas, TX';
            const equipment = scenario?.equipment || '53\' Dry Van';
            const commodity = scenario?.commodity || 'General Freight';
            const weight = scenario?.weight || '44,000 lbs';

            // Calculate realistic rates based on scenario
            const marketRatePerMile = 2.50;
            const marketTotal = Math.round(miles * marketRatePerMile / 50) * 50;
            const openingTotal = Math.round(marketTotal * 0.82 / 50) * 50; // 18% below market
            const maxTotal = Math.round(marketTotal * 1.07 / 50) * 50;    // 7% above market
            const openingPerMile = (openingTotal / miles).toFixed(2);

            // Difficulty-specific behavior
            const diffBehavior = {
                beginner: `DIFFICULTY: BEGINNER(Easy mode)
            - Be friendly, patient, and helpful
                - Give subtle hints when dispatcher makes mistakes
                    - Accept reasonable counters quickly
                        - Don't use pressure tactics
                            - If dispatcher seems lost, gently guide them: "You might want to ask about the rate..."
                                - Move up $100 - 150 per round when countered`,
                standard: `DIFFICULTY: STANDARD(Normal mode)
            - Be professional and realistic
                - Hold your position for 1 - 2 rounds before moving
                    - Use standard broker pressure tactics occasionally
                        - Move up $50 - 100 per round when countered well`,
                hard: `DIFFICULTY: HARD(Expert mode)
            - Be tough, skeptical, and use pressure tactics
                - "I have 3 other carriers ready to take this load"
                - "Market is soft, $X is fair for this lane right now"
                - Only move $25 - 50 per round, require strong justification
                    - Challenge every counter: "Why should I pay that much?"
                        - Mention competitors: "XYZ Logistics offered me $X less"
                            - Create urgency: "I need an answer in 5 minutes"`
            };

            return BROKER_SYSTEM_PROMPT_BASE
                .replace(/{BROKER_NAME}/g, name)
                .replace(/{DIFFICULTY_LEVEL}/g, difficultyLevel)
                .replace(/{DIFFICULTY_BEHAVIOR}/g, diffBehavior[difficultyLevel] || diffBehavior.standard)
                .replace(/{ROUTE}/g, route)
                .replace(/{MILES}/g, miles)
                .replace(/{EQUIPMENT}/g, equipment)
                .replace(/{COMMODITY}/g, commodity)
                .replace(/{WEIGHT}/g, weight)
                .replace(/{OPENING_RATE}/g, openingPerMile)
                .replace(/{OPENING_TOTAL}/g, openingTotal)
                .replace(/{MARKET_TOTAL}/g, marketTotal)
                .replace(/{MAX_TOTAL}/g, maxTotal);
        }

        async function callGeminiAPI(userMessage, isAIPanel = false) {
            // Check if API key is set
            if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
                return '⚠️ Gemini API ключ не установлен!\n\nЧтобы активировать живого AI брокера:\n1. Зайди на aistudio.google.com\n2. Создай бесплатный API ключ\n3. Вставь его в simulator.html вместо YOUR_GEMINI_API_KEY_HERE';
            }

            // Build messages array with history
            const messages = [];

            // Add history (last 10 messages for context)
            const recentHistory = geminiHistory.slice(-10);
            for (const msg of recentHistory) {
                messages.push({ role: msg.role, parts: [{ text: msg.text }] });
            }

            // Add current message
            messages.push({ role: 'user', parts: [{ text: userMessage }] });

            const body = {
                system_instruction: { parts: [{ text: getBrokerSystemPrompt() }] },
                contents: messages,
                generationConfig: {
                    temperature: 0.85,
                    maxOutputTokens: 200,
                    topP: 0.9
                }
            };

            try {
                const res = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const err = await res.json();
                    console.error('Gemini error:', err);
                    return `❌ Ошибка API: ${ err.error?.message || res.status } `;
                }

                const data = await res.json();
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '...';

                // Save to history
                geminiHistory.push({ role: 'user', text: userMessage });
                geminiHistory.push({ role: 'model', text: reply });

                return reply;
            } catch (e) {
                console.error('Gemini fetch error:', e);
                return '❌ Нет соединения с Gemini. Проверь интернет.';
            }
        }

        function sendAIMessage() {
            const text = aiUserInput.value.trim();
            if (!text) return;

            addAIMessage(text, 'user');
            aiUserInput.value = '';

            showAITyping();

            callGeminiAPI(text, true).then(response => {
                hideAITyping();
                addAIMessage(response, 'bot');
                generateSmartSuggestions(response);
            });
        }

        // Generate smart reply suggestions based on broker's last message
        async function generateSmartSuggestions(brokerMessage) {
            const suggestionsPrompt = `Based on this broker message: "${brokerMessage}"
Generate exactly 4 short dispatcher reply suggestions in Russian.
            Format: JSON array of strings, each max 8 words.
                Example: ["Mike, рынок сейчас $2,200 за этот маршрут", "Мой минимум $2,100, иначе не могу", "Что насчёт $2,050?", "Есть другие предложения по $2,200"]
Only return the JSON array, nothing else.`;

            try {
                const res = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: suggestionsPrompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
                    })
                });
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
                // Extract JSON array from response
                const match = raw.match(/\[[\s\S]*\]/);
                if (!match) return;
                const suggestions = JSON.parse(match[0]);
                updateQuickReplies(suggestions);
            } catch (e) {
                // Silently fail — keep default buttons
            }
        }

        function updateQuickReplies(suggestions) {
            const container = document.getElementById('aiQuickReplies');
            if (!container || !suggestions?.length) return;
            container.innerHTML = '';
            suggestions.slice(0, 4).forEach(text => {
                const btn = document.createElement('div');
                btn.className = 'ai-quick-reply';
                btn.textContent = text;
                btn.onclick = () => {
                    aiUserInput.value = text;
                    sendAIMessage();
                };
                container.appendChild(btn);
            });
        }

        function sendAIQuick(text) {
            aiUserInput.value = text;
            sendAIMessage();
        }

        aiUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendAIMessage();
        });
    
