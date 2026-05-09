/**
 * Tutorial Controller
 * Главный контроллер, объединяющий State Machine, Event Bus, Task Tracker и UI
 */

import React, { useEffect, useState } from 'react';
import { getTutorialStateMachine, TutorialState, TutorialAction } from '../store/tutorialStateMachine';
import { getEventBus, TutorialEvent, tutorialEvents } from '../utils/eventBus';
import { getTaskTracker } from '../store/taskTracker';
import { getDialogByState, MentorDialog } from '../data/mentorshipScripts';
import { DialogBubble } from './DialogBubble';
import { HighlightSystem } from './HighlightSystem';
import { TaskTrackerUI } from './TaskTrackerUI';

interface TutorialControllerProps {
  children: React.ReactNode;
  isNewGame: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const TutorialController: React.FC<TutorialControllerProps> = ({
  children,
  isNewGame,
  onComplete,
  onSkip,
}) => {
  const [currentState, setCurrentState] = useState<TutorialState>(TutorialState.NOT_STARTED);
  const [currentDialog, setCurrentDialog] = useState<MentorDialog | null>(null);
  const [isActive, setIsActive] = useState(false);

  const stateMachine = getTutorialStateMachine();
  const eventBus = getEventBus();
  const taskTracker = getTaskTracker();

  // Инициализация обучения
  useEffect(() => {
    const hasCompleted = localStorage.getItem('tutorial-completed');

    if (isNewGame && !hasCompleted) {
      // Запускаем обучение
      stateMachine.transition(TutorialAction.START);
      setIsActive(true);
      eventBus.emit(TutorialEvent.TUTORIAL_STARTED);
    }
  }, [isNewGame]);

  // Подписка на изменения состояния State Machine
  useEffect(() => {
    const unsubscribe = stateMachine.subscribeToAll((state) => {
      setCurrentState(state);
      setIsActive(stateMachine.isActive());

      // Загружаем диалог для нового состояния
      const dialog = getDialogByState(state);
      if (dialog) {
        setCurrentDialog(dialog);

        // Подсвечиваем элементы
        if (dialog.highlightElements) {
          dialog.highlightElements.forEach(selector => {
            tutorialEvents.highlightElement(
              selector,
              dialog.taskDescription,
              dialog.highlightPosition
            );
          });
        }

        // Добавляем задачу в Task Tracker
        if (dialog.taskId && dialog.taskTitle) {
          tutorialEvents.addTask(
            dialog.taskId,
            dialog.taskTitle,
            dialog.taskDescription
          );
        }

        // Отправляем событие изменения состояния
        eventBus.emit(TutorialEvent.STATE_CHANGED, {
          previousState: stateMachine.getPreviousState() || '',
          currentState: state,
          action: '',
        });
      }

      // Проверяем завершение
      if (stateMachine.isCompleted()) {
        handleComplete();
      } else if (stateMachine.isSkipped()) {
        handleSkip();
      }
    });

    // Загружаем текущее состояние
    setCurrentState(stateMachine.getCurrentState());
    setIsActive(stateMachine.isActive());

    return unsubscribe;
  }, [stateMachine]);

  // Обработчик действий игрока
  useEffect(() => {
    // Маппинг событий Event Bus на действия State Machine
    const actionMap: Record<string, TutorialAction> = {
      [TutorialEvent.LOAD_BOARD_OPENED]: TutorialAction.LOAD_BOARD_OPENED,
      [TutorialEvent.LOAD_SELECTED]: TutorialAction.LOAD_SELECTED,
      [TutorialEvent.DOCUMENT_OPENED]: TutorialAction.RATE_CON_OPENED,
      [TutorialEvent.DOCUMENT_FIELD_CLICKED]: TutorialAction.RATE_CON_FIELD_CLICKED,
      [TutorialEvent.TRUCK_SELECTED]: TutorialAction.TRUCK_SELECTED,
      [TutorialEvent.LOAD_ASSIGNED]: TutorialAction.LOAD_ASSIGNED,
    };

    const unsubscribers: (() => void)[] = [];

    Object.entries(actionMap).forEach(([event, action]) => {
      const unsub = eventBus.on(event as TutorialEvent, () => {
        if (stateMachine.canTransition(action)) {
          stateMachine.transition(action);

          // Завершаем текущую задачу
          if (currentDialog?.taskId) {
            tutorialEvents.completeTask(currentDialog.taskId);
          }
        }
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [stateMachine, currentDialog]);

  // Обработчик кнопки "Далее"
  const handleNext = () => {
    if (currentDialog?.requiredAction === TutorialAction.NEXT) {
      stateMachine.transition(TutorialAction.NEXT);

      // Завершаем задачу
      if (currentDialog.taskId) {
        tutorialEvents.completeTask(currentDialog.taskId);
      }
    } else if (currentDialog?.requiredAction === TutorialAction.COMPLETE) {
      stateMachine.transition(TutorialAction.COMPLETE);
    }
  };

  // Обработчик пропуска обучения
  const handleSkip = () => {
    stateMachine.transition(TutorialAction.SKIP);
    tutorialEvents.clearAllHighlights();
    taskTracker.clearAll();
    localStorage.setItem('tutorial-completed', 'true');
    eventBus.emit(TutorialEvent.TUTORIAL_SKIPPED);
    setIsActive(false);
    onSkip?.();
  };

  // Обработчик завершения обучения
  const handleComplete = () => {
    tutorialEvents.clearAllHighlights();
    localStorage.setItem('tutorial-completed', 'true');
    eventBus.emit(TutorialEvent.TUTORIAL_COMPLETED);
    setIsActive(false);
    onComplete?.();
  };

  // Экспортируем функции для внешнего использования
  useEffect(() => {
    (window as any).__tutorialTriggerAction = (action: string) => {
      const tutorialAction = action as TutorialAction;
      if (stateMachine.canTransition(tutorialAction)) {
        stateMachine.transition(tutorialAction);
      }
    };

    (window as any).__tutorialGetState = () => {
      return {
        currentState: stateMachine.getCurrentState(),
        isActive: stateMachine.isActive(),
        progress: stateMachine.getProgress(),
      };
    };

    return () => {
      delete (window as any).__tutorialTriggerAction;
      delete (window as any).__tutorialGetState;
    };
  }, [stateMachine]);

  return (
    <>
      {children}

      {/* Highlight System */}
      {isActive && <HighlightSystem />}

      {/* Task Tracker UI */}
      {isActive && <TaskTrackerUI position="top-right" />}

      {/* Dialog Bubble */}
      {isActive && currentDialog && (
        <DialogBubble
          step={{
            id: currentDialog.id,
            speakerName: currentDialog.speakerName,
            avatar: currentDialog.avatar,
            text: currentDialog.dialogLines.join(' '),
            requiredAction: currentDialog.requiredAction as any,
            highlightElement: currentDialog.highlightElements?.[0],
            position: currentDialog.highlightPosition,
            audioUrl: currentDialog.audioUrl,
            delay: currentDialog.delay,
          }}
          onNext={handleNext}
          onSkip={handleSkip}
          currentStepIndex={Object.values(TutorialState).indexOf(currentState)}
          totalSteps={Object.values(TutorialState).filter(
            s => s !== TutorialState.IDLE &&
                 s !== TutorialState.NOT_STARTED &&
                 s !== TutorialState.COMPLETED &&
                 s !== TutorialState.SKIPPED
          ).length}
          progress={stateMachine.getProgress()}
        />
      )}

      {/* Overlay для блокировки UI */}
      {isActive && currentDialog?.metadata?.blockUI && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            // Блокируем клики вне подсвеченных элементов
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </>
  );
};

// Хелперы для внешнего использования
export const triggerTutorialAction = (action: string) => {
  const trigger = (window as any).__tutorialTriggerAction;
  if (trigger && typeof trigger === 'function') {
    trigger(action);
  }
};

export const getTutorialState = () => {
  const getter = (window as any).__tutorialGetState;
  if (getter && typeof getter === 'function') {
    return getter();
  }
  return null;
};
