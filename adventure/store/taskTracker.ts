/**
 * Task Tracker System
 * Управление задачами диспетчера во время обучения
 */

import { getEventBus, TutorialEvent, TaskPayload } from '../utils/eventBus';

export enum TaskStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  progress: number; // 0-100
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  metadata?: {
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    icon?: string;
    [key: string]: any;
  };
}

export class TaskTracker {
  private tasks: Map<string, Task> = new Map();
  private taskOrder: string[] = []; // Порядок задач
  private listeners: Set<(tasks: Task[]) => void> = new Set();
  private eventBus = getEventBus();

  constructor() {
    // Подписываемся на события задач
    this.eventBus.on<TaskPayload>(TutorialEvent.TASK_ADDED, (payload) => {
      this.addTask(payload.taskId, payload.title, payload.description);
    });

    this.eventBus.on<TaskPayload>(TutorialEvent.TASK_UPDATED, (payload) => {
      this.updateTask(payload.taskId, { progress: payload.progress });
    });

    this.eventBus.on<TaskPayload>(TutorialEvent.TASK_COMPLETED, (payload) => {
      this.completeTask(payload.taskId);
    });

    this.eventBus.on<TaskPayload>(TutorialEvent.TASK_FAILED, (payload) => {
      this.failTask(payload.taskId);
    });
  }

  // Добавить задачу
  addTask(
    id: string,
    title: string,
    description?: string,
    metadata?: Task['metadata']
  ): Task {
    const task: Task = {
      id,
      title,
      description,
      status: TaskStatus.PENDING,
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };

    this.tasks.set(id, task);
    this.taskOrder.push(id);
    this.notifyListeners();

    console.log(`✅ Task added: ${title} (${id})`);
    return task;
  }

  // Обновить задачу
  updateTask(id: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      console.warn(`❌ Task not found: ${id}`);
      return null;
    }

    Object.assign(task, updates, { updatedAt: Date.now() });
    this.tasks.set(id, task);
    this.notifyListeners();

    console.log(`🔄 Task updated: ${task.title} (${id})`);
    return task;
  }

  // Активировать задачу
  activateTask(id: string): Task | null {
    return this.updateTask(id, { status: TaskStatus.ACTIVE });
  }

  // Завершить задачу
  completeTask(id: string): Task | null {
    const task = this.updateTask(id, {
      status: TaskStatus.COMPLETED,
      progress: 100,
      completedAt: Date.now(),
    });

    if (task) {
      console.log(`✅ Task completed: ${task.title} (${id})`);
    }

    return task;
  }

  // Провалить задачу
  failTask(id: string): Task | null {
    const task = this.updateTask(id, {
      status: TaskStatus.FAILED,
    });

    if (task) {
      console.log(`❌ Task failed: ${task.title} (${id})`);
    }

    return task;
  }

  // Удалить задачу
  removeTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      this.taskOrder = this.taskOrder.filter(taskId => taskId !== id);
      this.notifyListeners();
      console.log(`🗑️ Task removed: ${id}`);
    }
    return deleted;
  }

  // Получить задачу по ID
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  // Получить все задачи
  getAllTasks(): Task[] {
    return this.taskOrder.map(id => this.tasks.get(id)!).filter(Boolean);
  }

  // Получить задачи по статусу
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter(task => task.status === status);
  }

  // Получить активные задачи
  getActiveTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.ACTIVE);
  }

  // Получить завершённые задачи
  getCompletedTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.COMPLETED);
  }

  // Получить текущую задачу (первая активная или pending)
  getCurrentTask(): Task | undefined {
    return this.getAllTasks().find(
      task => task.status === TaskStatus.ACTIVE || task.status === TaskStatus.PENDING
    );
  }

  // Получить прогресс всех задач
  getOverallProgress(): number {
    const tasks = this.getAllTasks();
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }

  // Получить статистику
  getStatistics(): {
    total: number;
    pending: number;
    active: number;
    completed: number;
    failed: number;
    completionRate: number;
  } {
    const tasks = this.getAllTasks();
    const stats = {
      total: tasks.length,
      pending: 0,
      active: 0,
      completed: 0,
      failed: 0,
      completionRate: 0,
    };

    tasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.ACTIVE:
          stats.active++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
        case TaskStatus.FAILED:
          stats.failed++;
          break;
      }
    });

    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);
    }

    return stats;
  }

  // Очистить все задачи
  clearAll(): void {
    this.tasks.clear();
    this.taskOrder = [];
    this.notifyListeners();
    console.log('🗑️ All tasks cleared');
  }

  // Очистить завершённые задачи
  clearCompleted(): void {
    const completedIds = this.getCompletedTasks().map(task => task.id);
    completedIds.forEach(id => this.removeTask(id));
    console.log(`🗑️ Cleared ${completedIds.length} completed tasks`);
  }

  // Подписаться на изменения
  subscribe(callback: (tasks: Task[]) => void): () => void {
    this.listeners.add(callback);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Уведомить слушателей
  private notifyListeners(): void {
    const tasks = this.getAllTasks();
    this.listeners.forEach(callback => {
      try {
        callback(tasks);
      } catch (error) {
        console.error('Error in task listener:', error);
      }
    });
  }

  // Сохранить в localStorage
  save(): void {
    try {
      const data = {
        tasks: Array.from(this.tasks.entries()),
        taskOrder: this.taskOrder,
      };
      localStorage.setItem('tutorial-tasks', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  // Загрузить из localStorage
  load(): void {
    try {
      const saved = localStorage.getItem('tutorial-tasks');
      if (saved) {
        const data = JSON.parse(saved);
        this.tasks = new Map(data.tasks);
        this.taskOrder = data.taskOrder;
        this.notifyListeners();
        console.log(`📥 Loaded ${this.tasks.size} tasks`);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  // Отладочная информация
  debug(): void {
    console.group('🔍 Task Tracker Debug Info');
    console.log('Total tasks:', this.tasks.size);
    console.log('Statistics:', this.getStatistics());
    console.log('Current task:', this.getCurrentTask());
    console.log('All tasks:', this.getAllTasks());
    console.groupEnd();
  }
}

// Singleton instance
let taskTrackerInstance: TaskTracker | null = null;

export const getTaskTracker = (): TaskTracker => {
  if (!taskTrackerInstance) {
    taskTrackerInstance = new TaskTracker();
    taskTrackerInstance.load();
  }
  return taskTrackerInstance;
};
