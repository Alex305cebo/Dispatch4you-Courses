/**
 * Task Tracker UI Component
 * Отображение текущих задач диспетчера (рабочий лист)
 */

import React, { useEffect, useState } from 'react';
import { getTaskTracker, Task, TaskStatus } from '../store/taskTracker';

interface TaskTrackerUIProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export const TaskTrackerUI: React.FC<TaskTrackerUIProps> = ({
  position = 'top-right',
  compact = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const taskTracker = getTaskTracker();

  useEffect(() => {
    // Подписываемся на изменения задач
    const unsubscribe = taskTracker.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });

    // Загружаем текущие задачи
    setTasks(taskTracker.getAllTasks());

    return unsubscribe;
  }, [taskTracker]);

  const stats = taskTracker.getStatistics();
  const currentTask = taskTracker.getCurrentTask();

  // Позиционирование
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9998,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 80, left: 16 };
      case 'top-right':
        return { ...base, top: 80, right: 16 };
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16 };
      case 'bottom-right':
        return { ...base, bottom: 16, right: 16 };
      default:
        return base;
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div style={getPositionStyles()}>
      {/* Glassmorphism Card */}
      <div
        style={{
          width: compact ? '280px' : '360px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))',
            borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                Рабочий лист
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                {stats.completed}/{stats.total} задач
              </p>
            </div>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#06b6d4',
              fontSize: 20,
              cursor: 'pointer',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            ▼
          </button>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${stats.completionRate}%`,
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* Task List */}
        {isExpanded && (
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '12px',
            }}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} compact={compact} />
            ))}

            {tasks.length === 0 && (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: 14,
                }}
              >
                Нет активных задач
              </div>
            )}
          </div>
        )}

        {/* Current Task Highlight */}
        {!isExpanded && currentTask && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(6, 182, 212, 0.1)',
              borderTop: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <div style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600, marginBottom: 4 }}>
              Текущая задача:
            </div>
            <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>
              {currentTask.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Карточка задачи
interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, compact }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return '✅';
      case TaskStatus.ACTIVE:
        return '🔄';
      case TaskStatus.FAILED:
        return '❌';
      case TaskStatus.PENDING:
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return '#10b981';
      case TaskStatus.ACTIVE:
        return '#06b6d4';
      case TaskStatus.FAILED:
        return '#ef4444';
      case TaskStatus.PENDING:
      default:
        return '#64748b';
    }
  };

  const isActive = task.status === TaskStatus.ACTIVE;

  return (
    <div
      style={{
        padding: compact ? '10px' : '12px',
        marginBottom: '8px',
        background: isActive
          ? 'rgba(6, 182, 212, 0.15)'
          : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        animation: isActive ? 'task-pulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{getStatusIcon()}</span>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: compact ? 13 : 14,
              fontWeight: 700,
              color: '#e2e8f0',
              lineHeight: 1.4,
            }}
          >
            {task.title}
          </h4>
          {task.description && !compact && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: '#94a3b8',
                lineHeight: 1.4,
              }}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar (только для активных задач) */}
      {task.status === TaskStatus.ACTIVE && task.progress > 0 && (
        <div
          style={{
            height: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${task.progress}%`,
              background: getStatusColor(),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Metadata */}
      {task.metadata?.priority && !compact && (
        <div
          style={{
            marginTop: 8,
            display: 'inline-block',
            padding: '2px 8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}
        >
          {task.metadata.priority}
        </div>
      )}

      <style>{`
        @keyframes task-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
          }
        }
      `}</style>
    </div>
  );
};
