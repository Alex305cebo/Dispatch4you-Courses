// IMPROVED SLOT MACHINE V2 - Realistic casino-style
// 3 РАЗНЫХ сценария, только ОДИН случайный выделяется зеленым как победитель!

function setupRandomScenarioButton() {
    const randomBtn = document.getElementById('randomScenarioBtn');
    const slotDisplay = document.getElementById('slotMachineDisplay');
    const slotItems = [
        document.getElementById('slotItem1'),
        document.getElementById('slotItem2'),
        document.getElementById('slotItem3')
    ];

    if (!randomBtn) return;

    randomBtn.addEventListener('click', () => {
        if (randomBtn.classList.contains('spinning')) return;

        randomBtn.classList.add('spinning');
        slotDisplay.classList.add('active');

        const greetingOptions = generateGreetingOptions();
        if (greetingOptions.length === 0) {
            alert('Нет доступных сценариев');
            return;
        }

        // Выбираем 3 РАЗНЫХ случайных сценария для каждого слота
        const shuffled = [...greetingOptions].sort(() => 0.5 - Math.random());
        const slotScenarios = [
            allScenarios[shuffled[0].scenarioIndex],
            allScenarios[shuffled[1].scenarioIndex],
            allScenarios[shuffled[2].scenarioIndex]
        ];

        // Выбираем ОДИН случайный слот как победитель (0, 1 или 2)
        const winnerSlotIndex = Math.floor(Math.random() * 3);
        const finalOption = shuffled[winnerSlotIndex];

        console.log(`🎰 Winner slot: ${winnerSlotIndex + 1}, Scenario: ${slotScenarios[winnerSlotIndex].route}`);

        // Каждый слот останавливается в разное время
        const slotStopTimes = [1500, 2200, 2900];
        const spinSpeed = 80;

        slotItems.forEach((item, index) => {
            let spinCount = 0;
            const maxSpins = Math.floor(slotStopTimes[index] / spinSpeed);

            const interval = setInterval(() => {
                spinCount++;
                const randomOption = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
                const scenario = allScenarios[randomOption.scenarioIndex];
                item.classList.add('spinning');
                item.innerHTML = `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${scenario.route.split(' → ')[0]}</div><div style="font-size: 13px; font-weight: 700;">${scenario.distance} mi</div>`;
                setTimeout(() => item.classList.remove('spinning'), 40);

                if (spinCount >= maxSpins - 5) {
                    clearInterval(interval);
                    let slowSpinCount = 0;
                    const slowInterval = setInterval(() => {
                        slowSpinCount++;
                        if (slowSpinCount < 5) {
                            const randomOption = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
                            const scenario = allScenarios[randomOption.scenarioIndex];
                            item.innerHTML = `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${scenario.route.split(' → ')[0]}</div><div style="font-size: 13px; font-weight: 700;">${scenario.distance} mi</div>`;
                        } else {
                            clearInterval(slowInterval);
                            const thisSlotScenario = slotScenarios[index];
                            item.innerHTML = `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${thisSlotScenario.route.split(' → ')[0]}</div><div style="font-size: 13px; font-weight: 700;">${thisSlotScenario.distance} mi</div><div style="font-size: 11px; color: #6366f1; margin-top: 4px;">${thisSlotScenario.postedRate || '$0'}</div>`;
                            item.style.transform = 'scale(1.1)';

                            // ТОЛЬКО победитель получает зеленую подсветку!
                            if (index === winnerSlotIndex) {
                                item.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))';
                                item.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                                item.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.4)';
                            } else {
                                item.style.background = 'rgba(30, 41, 59, 0.6)';
                                item.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                                item.style.boxShadow = 'none';
                            }

                            setTimeout(() => item.style.transform = 'scale(1)', 200);

                            if (index === 2) {
                                setTimeout(() => {
                                    randomBtn.style.animation = 'none';
                                    setTimeout(() => randomBtn.style.animation = '', 10);
                                    setTimeout(() => {
                                        randomBtn.classList.remove('spinning');
                                        slotDisplay.classList.remove('active');
                                        slotItems.forEach(item => {
                                            item.style.background = '';
                                            item.style.borderColor = '';
                                            item.style.boxShadow = '';
                                            item.style.transform = '';
                                            item.innerHTML = '';
                                        });
                                        startConversation(finalOption.fullText, finalOption.scenarioIndex);
                                    }, 1000);
                                }, 300);
                            }
                        }
                    }, 150 + (slowSpinCount * 50));
                }
            }, spinSpeed);
        });
    });
}
