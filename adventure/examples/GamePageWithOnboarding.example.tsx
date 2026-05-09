/**
 * Пример интеграции системы обучения в главную страницу игры
 * Скопируйте этот код в ваш game.tsx или аналогичный файл
 */

import React, { useState } from 'react';
import { OnboardingWrapper, triggerOnboardingAction } from '../components/OnboardingWrapper';

export default function GamePage() {
  const [isNewGame, setIsNewGame] = useState(true); // Определяется при создании новой игры

  // Пример: обработчик клика на Load Board
  const handleLoadBoardClick = () => {
    console.log('Load Board clicked');
    
    // Триггерим действие для системы обучения
    triggerOnboardingAction('click_load_board');
    
    // Ваша логика открытия Load Board
    // ...
  };

  // Пример: обработчик выбора груза
  const handleLoadSelect = (loadId: string) => {
    console.log('Load selected:', loadId);
    
    // Триггерим действие
    triggerOnboardingAction('select_load');
    
    // Ваша логика выбора груза
    // ...
  };

  // Пример: обработчик клика на трак
  const handleTruckClick = (truckId: string) => {
    console.log('Truck clicked:', truckId);
    
    // Триггерим действие
    triggerOnboardingAction('click_truck');
    
    // Ваша логика
    // ...
  };

  // Пример: обработчик назначения груза
  const handleAssignLoad = () => {
    console.log('Load assigned');
    
    // Триггерим действие
    triggerOnboardingAction('assign_load');
    
    // Ваша логика
    // ...
  };

  return (
    <OnboardingWrapper isNewGame={isNewGame}>
      <div className="game-container">
        {/* Ваш игровой интерфейс */}
        
        {/* Пример: кнопка Load Board с data-атрибутом для подсветки */}
        <button
          data-onboarding="load-board"
          onClick={handleLoadBoardClick}
          className="load-board-button"
        >
          📋 Load Board
        </button>

        {/* Пример: карточка груза */}
        <div
          data-onboarding="load-card"
          onClick={() => handleLoadSelect('load-123')}
          className="load-card"
        >
          <h3>Chicago → Dallas</h3>
          <p>$2,500 · 800 miles</p>
        </button>

        {/* Пример: карточка трака */}
        <div
          data-onboarding="truck-card"
          onClick={() => handleTruckClick('truck-1')}
          className="truck-card"
        >
          <h3>Truck #1</h3>
          <p>Available</p>
        </div>

        {/* Пример: кнопка назначения */}
        <button
          onClick={handleAssignLoad}
          className="assign-button"
        >
          Assign Load
        </button>

        {/* Остальной интерфейс игры */}
      </div>
    </OnboardingWrapper>
  );
}

/**
 * ВАЖНЫЕ МОМЕНТЫ ИНТЕГРАЦИИ:
 * 
 * 1. Добавьте data-onboarding атрибуты к элементам, которые нужно подсветить:
 *    - data-onboarding="load-board"
 *    - data-onboarding="load-card"
 *    - data-onboarding="truck-card"
 *    - data-onboarding="time-controls"
 *    - data-onboarding="balance"
 * 
 * 2. Вызывайте triggerOnboardingAction() при выполнении действий:
 *    - triggerOnboardingAction('click_load_board')
 *    - triggerOnboardingAction('select_load')
 *    - triggerOnboardingAction('click_truck')
 *    - triggerOnboardingAction('assign_load')
 *    - triggerOnboardingAction('click_play')
 * 
 * 3. Определяйте isNewGame на основе вашей логики:
 *    - Проверка localStorage
 *    - Проверка состояния игры
 *    - Флаг из меню "Новая игра"
 * 
 * 4. Опционально: используйте isFeatureBlockedByOnboarding() для блокировки функций:
 *    import { isFeatureBlockedByOnboarding } from '../components/OnboardingWrapper';
 *    
 *    const handleChatOpen = () => {
 *      if (isFeatureBlockedByOnboarding('chat')) {
 *        console.log('Chat blocked during onboarding');
 *        return;
 *      }
 *      // Открыть чат
 *    };
 */
