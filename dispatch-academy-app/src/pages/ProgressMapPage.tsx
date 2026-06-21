import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProgressStore } from '../store/useProgressStore';
import { loadDayContent } from '../services/content-loader';
import TaskRenderer from '../components/tasks/TaskRenderer';
import type { DayContent } from '../types/index';
import type { TaskResult } from '../types/progress';

declare global {
  interface Window { __progressReset?: boolean; }
}

/**
 * Progress Map — Game-style level map.
 * - Completed levels connected by a glowing curved SVG path
 * - Tooltip clouds show level info
 * - Path grows as student progresses
 */

// Exact stone coordinates (from editor mode)
const LEVEL_POSITIONS = [
  { id: 1, x: 50.1, y: 86.8 },
  { id: 2, x: 23.3, y: 73 },
  { id: 3, x: 50.3, y: 66.5 },
  { id: 4, x: 78.2, y: 60.3 },
  { id: 5, x: 49.9, y: 53.7 },
  { id: 6, x: 24.3, y: 47.9 },
  { id: 7, x: 50.3, y: 41 },
  { id: 8, x: 78.1, y: 34.5 },
  { id: 9, x: 50.1, y: 26.8 },
  { id: 10, x: 22.9, y: 20.6 },
  { id: 11, x: 49.5, y: 13.2 },
];

// Level descriptions — motivational, shown in tooltip cloud
const LEVEL_INFO = [
  '🚀 Старт! Начни карьеру',
  '📄 Изучи документы',
  '👔 Узнай свою роль',
  '💰 Разбери Rate Con',
  '🔍 Найди первый груз',
  '🤝 Научись договариваться',
  '⏱ Правила часов (HOS)',
  '🗺️ Планируй маршрут',
  '💵 Считай прибыль',
  '🚨 Реши проблему',
  '🏆 Финальный тест!',
];

export default function ProgressMapPage() {
  const { taskScores } = useProgressStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editorMode = searchParams.get('editor') === 'true';

  // === EDITOR MODE STATE ===
  const [editorPositions, setEditorPositions] = useState(LEVEL_POSITIONS.map(p => ({ ...p })));
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const positions = editorMode ? editorPositions : LEVEL_POSITIONS;

  const handleEditorPointerDown = (id: number, e: React.PointerEvent) => {
    if (!editorMode) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleEditorPointerMove = (e: React.PointerEvent) => {
    if (!editorMode || draggingId === null || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEditorPositions(prev => prev.map(p => p.id === draggingId ? { ...p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : p));
  };

  const handleEditorPointerUp = () => {
    setDraggingId(null);
  };

  const copyEditorPositions = () => {
    const code = `const LEVEL_POSITIONS = [\n${editorPositions.map(p => `  { id: ${p.id}, x: ${p.x}, y: ${p.y} },`).join('\n')}\n];`;
    navigator.clipboard.writeText(code);
    alert('Координаты скопированы в буфер обмена!');
  };

  // TEMP: Reset progress to level 1
  if (typeof window !== 'undefined' && !window.__progressReset) {
    window.__progressReset = true;
    localStorage.removeItem('dispatch-academy-progress');
    useProgressStore.setState({ taskScores: {}, totalXP: 0, level: 1, currentStreak: 0, dayStatuses: { 1: 'available' } });
  }

  // Current level
  const completedDayIds = Object.keys(taskScores)
    .filter((k) => k.startsWith('d'))
    .map((k) => parseInt(k.split('-')[0]!.slice(1)))
    .filter((n) => !isNaN(n));
  const highestCompleted = completedDayIds.length > 0 ? Math.max(...completedDayIds) : 0;
  const currentLevel = Math.min(highestCompleted + 1, LEVEL_POSITIONS.length);

  // Build SVG path connecting completed levels (smooth bezier curves)
  const progressPath = useMemo(() => {
    const completedCount = currentLevel - 1; // levels below current are completed
    if (completedCount < 1) return '';

    // Convert % to SVG viewBox coordinates (1000x1778 for 9:16 ratio)
    const points = LEVEL_POSITIONS.slice(0, completedCount + 1).map((p) => ({
      x: (p.x / 100) * 1000,
      y: (p.y / 100) * 1778,
    }));

    if (points.length < 2) return '';

    let path = `M ${points[0]!.x} ${points[0]!.y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]!;
      const next = points[i + 1]!;
      const midY = (curr.y + next.y) / 2;
      path += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }
    return path;
  }, [currentLevel]);

  const handleLevelTap = (levelId: number) => {
    if (levelId <= currentLevel) {
      openLevelPopup(levelId);
    }
  };

  // === LEVEL POPUP STATE ===
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<DayContent | null>(null);
  const [popupTaskIndex, setPopupTaskIndex] = useState(0);
  const [popupLevelId, setPopupLevelId] = useState(0);

  const completeTask = useProgressStore((s) => s.completeTask);
  const addXP = useProgressStore((s) => s.addXP);

  const openLevelPopup = useCallback(async (levelId: number) => {
    try {
      const content = await loadDayContent(levelId);
      setPopupContent(content);
      setPopupTaskIndex(0);
      setPopupLevelId(levelId);
      setPopupOpen(true);
    } catch {
      // fallback to navigation
      navigate(`/day/${levelId}`);
    }
  }, [navigate]);

  const handlePopupTaskComplete = useCallback((result: TaskResult) => {
    completeTask(popupLevelId, result);
    addXP(result.correct ? 20 : 5, 'task-complete');

    if (popupContent && popupTaskIndex + 1 >= popupContent.tasks.length) {
      // Level complete — close popup
      setTimeout(() => {
        setPopupOpen(false);
        setPopupContent(null);
      }, 800);
    } else {
      // Next task
      setPopupTaskIndex((i) => i + 1);
    }
  }, [popupLevelId, popupContent, popupTaskIndex, completeTask, addXP]);

  const closePopup = () => {
    setPopupOpen(false);
    setPopupContent(null);
  };

  const getStatus = (id: number): 'completed' | 'current' | 'locked' => {
    if (id < currentLevel) return 'completed';
    if (id === currentLevel) return 'current';
    return 'locked';
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <div
        ref={mapRef}
        className="relative w-full h-full overflow-hidden"
        style={{ maxWidth: '500px' }}
        onPointerMove={editorMode ? handleEditorPointerMove : undefined}
        onPointerUp={editorMode ? handleEditorPointerUp : undefined}
      >
        {/* Background image */}
        <img
          src="/maps/week-1.jpg"
          alt="Карта прогресса"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

        {/* SVG progress path — glowing curve connecting completed levels */}
        {progressPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 1778"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Glow layer */}
            <path
              d={progressPath}
              stroke="rgba(34, 197, 94, 0.4)"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
            />
            {/* Main path */}
            <path
              d={progressPath}
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Level nodes */}
        {positions.map((pos, index) => {
          const status = getStatus(pos.id);
          const info = LEVEL_INFO[index] ?? '';

          return (
            <div
              key={pos.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${editorMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onPointerDown={editorMode ? (e) => handleEditorPointerDown(pos.id, e) : undefined}
            >
              {/* Tooltip cloud — for current level, centered above button */}
              {status === 'current' && !editorMode && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 sm:w-36">
                  <div className="px-3 py-1.5 rounded-xl bg-white shadow-lg text-slate-800 text-[11px] sm:text-[13px] font-bold border border-slate-200 text-center leading-snug">
                    {info}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 -mt-1" />
                  </div>
                </div>
              )}

              {/* Editor mode: show coordinates */}
              {editorMode && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-cyan-300 font-mono whitespace-nowrap bg-black/70 px-1 rounded">
                  {pos.x}, {pos.y}
                </div>
              )}

              {/* Level button */}
              <button
                onClick={() => !editorMode && handleLevelTap(pos.id)}
                disabled={status === 'locked' && !editorMode}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-transform active:scale-95 ${
                  editorMode
                    ? 'bg-gradient-to-b from-cyan-300 to-cyan-600 text-white border-2 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                    : status === 'completed'
                      ? 'bg-gradient-to-b from-green-300 to-green-600 text-white shadow-[0_3px_0_#166534] border-2 border-green-200/60 hover:scale-110'
                      : status === 'current'
                        ? 'bg-gradient-to-b from-cyan-300 to-cyan-600 text-white shadow-[0_3px_0_#155e75,0_0_12px_rgba(6,182,212,0.5)] border-2 border-cyan-200/60 hover:scale-110'
                        : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-300 shadow-[0_2px_0_#1f2937] border-2 border-gray-500/40 cursor-not-allowed opacity-70'
                }`}
              >
                {pos.id}
              </button>
            </div>
          );
        })}

        {/* Editor mode: floating panel with copy button */}
        {editorMode && (
          <div className="absolute top-2 right-2 z-50 flex flex-col gap-2">
            <button
              onClick={copyEditorPositions}
              className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg shadow-lg"
            >
              📋 Копировать координаты
            </button>
            <div className="bg-black/80 text-[10px] text-green-300 font-mono p-2 rounded max-h-48 overflow-y-auto">
              {editorPositions.map(p => (
                <div key={p.id}>#{p.id}: x={p.x}, y={p.y}</div>
              ))}
            </div>
          </div>
        )}
        {/* ===== LEVEL POPUP — rendered via Portal to document.body ===== */}
        {popupOpen && popupContent && createPortal(
          <div className="fixed inset-0 bottom-[52px] z-[9999] flex flex-col bg-slate-900/85 backdrop-blur-sm">

            {/* Top navigation bar */}
            <div className="relative z-10 shrink-0 px-4 pt-3 pb-2">
              <div className="max-w-lg mx-auto">
                {/* Nav row: back button + title + close */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={closePopup}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-sm border border-white/10 transition-colors"
                  >
                    ← Карта
                  </button>
                  <span className="text-white/90 text-sm font-bold">
                    Уровень {popupLevelId}
                  </span>
                  <button
                    onClick={closePopup}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/10"
                    aria-label="Закрыть"
                  >
                    ✕
                  </button>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full transition-all duration-300"
                      style={{ width: `${((popupTaskIndex + 1) / popupContent.tasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/80 text-xs font-bold">
                    {popupTaskIndex + 1}/{popupContent.tasks.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Task content — centered, with avatar on desktop left */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
              <div className="w-full max-w-3xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-6 min-h-full">
                {/* Avatar video — mobile: top center small, desktop: left side */}
                <div className="flex justify-center lg:justify-start shrink-0 mb-3 lg:mb-0">
                  <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <video
                      className="w-full h-full object-cover"
                      src="/videos/student-avatar.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                </div>
                {/* Task content */}
                <div className="max-w-lg w-full mx-auto lg:mx-0">
                  {popupContent.tasks[popupTaskIndex] && (
                    <TaskRenderer
                      key={`${popupLevelId}-${popupTaskIndex}`}
                      task={popupContent.tasks[popupTaskIndex]!}
                      onComplete={handlePopupTaskComplete}
                      isRetry={false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
