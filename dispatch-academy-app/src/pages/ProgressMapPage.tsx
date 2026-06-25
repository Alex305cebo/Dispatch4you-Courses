import { useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProgressStore } from '../store/useProgressStore';
import { loadDayContent } from '../services/content-loader';
import TaskRenderer from '../components/tasks/TaskRenderer';
import type { DayContent } from '../types/index';
import type { TaskResult } from '../types/progress';

/**
 * Progress Map — Game-style level map with multiple maps.
 * - Completed levels connected by a glowing curved SVG path
 * - Tooltip clouds show level info
 * - Path grows as student progresses
 * - Navigate between maps via arrows
 */

// Map configurations
const MAPS = [
  {
    id: 1,
    image: '/dispatch-academy-app/maps/week-1.webp',
    title: 'Основы тракинга',
    levels: [
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
    ],
    levelInfo: [
      '🚀 Старт! Начни карьеру',
      '📄 Роли в тракинге',
      '👔 Документы',
      '💰 Load Boards',
      '🔍 Расчёты RPM',
      '🤝 Переговоры',
      '⏱ Правила HOS',
      '🗺️ Планируй маршрут',
      '💵 Кризисные ситуации',
      '🚨 Финансы',
      '🏆 Тест карты 1!',
    ],
    transition: 'up',
  },
  {
    id: 2,
    image: '/dispatch-academy-app/maps/week-2.webp',
    title: 'Профессиональный диспетчинг',
    levels: [
      { id: 12, x: 50.2, y: 85.4 },
      { id: 13, x: 50.9, y: 70.9 },
      { id: 14, x: 63.5, y: 63.6 },
      { id: 15, x: 70.9, y: 55.8 },
      { id: 16, x: 52.6, y: 49.5 },
      { id: 17, x: 47.9, y: 41.2 },
      { id: 18, x: 63.8, y: 34.3 },
      { id: 19, x: 60.5, y: 28 },
      { id: 20, x: 40.9, y: 24.4 },
      { id: 21, x: 41.4, y: 19.4 },
      { id: 22, x: 56.7, y: 15.2 },
      { id: 23, x: 50.7, y: 10.3 },
    ],
    levelInfo: [
      '🚛 Несколько траков',
      '📦 Типы прицепов',
      '💬 Продвинутые переговоры',
      '📱 ELD и логи',
      '⏰ Detention & TONU',
      '🛡️ Страхование',
      '🤝 Owner-operators',
      '📊 Сезонность рынка',
      '🔥 Multi-step кейсы',
      '📋 Аудит FMCSA',
      '🏆 Тест карты 2!',
      '⭐ Бонусный уровень',
    ],
    transition: 'up',
  },
  {
    id: 3,
    image: '/dispatch-academy-app/maps/dream.webp',
    title: '💤 Сон диспетчера',
    levels: [
      { id: 101, x: 49.7, y: 90.9 },
      { id: 102, x: 68.8, y: 65.2 },
      { id: 103, x: 50.7, y: 59.7 },
      { id: 104, x: 27.7, y: 55.1 },
      { id: 105, x: 45.4, y: 52.5 },
      { id: 106, x: 60.5, y: 52.6 },
      { id: 107, x: 74.7, y: 34 },
      { id: 108, x: 49.5, y: 29.3 },
      { id: 109, x: 31.6, y: 24.4 },
      { id: 110, x: 45.2, y: 18.8 },
      { id: 111, x: 60.7, y: 16.6 },
    ],
    levelInfo: [
      '🌙 Трак-тыква',
      '👻 Груз-призрак',
      '🦖 Динозавр на I-95',
      '🪐 Доставка на Марс',
      '🐙 8 водителей сразу',
      '🎰 Брокер-казино',
      '⏰ День сурка',
      '🌊 Подводная доставка',
      '🤖 AI vs Диспетчер',
      '💰 Миллион за рейс',
      '🌅 Пробуждение',
    ],
    transition: 'dream',
  },
];

export default function ProgressMapPage() {
  const { taskScores } = useProgressStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editorMode = searchParams.get('editor') === 'true';

  // === MULTI-MAP STATE ===
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const [mapTransition, setMapTransition] = useState<'none' | 'slide-up' | 'slide-down' | 'dream-in' | 'dream-out'>('none');
  const currentMap = MAPS[currentMapIndex]!;
  const LEVEL_POSITIONS = currentMap.levels;
  const currentLevelInfo = currentMap.levelInfo;

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

  // Current level (global across all maps)
  const completedDayIds = Object.keys(taskScores)
    .filter((k) => k.startsWith('d'))
    .map((k) => parseInt(k.split('-')[0]!.slice(1)))
    .filter((n) => !isNaN(n));
  const highestCompleted = completedDayIds.length > 0 ? Math.max(...completedDayIds) : 0;
  const globalCurrentLevel = highestCompleted + 1;

  // For the current map: figure out which levels are completed/current/locked
  const mapLastLevel = LEVEL_POSITIONS[LEVEL_POSITIONS.length - 1]?.id ?? 11;
  const mapFirstLevel = LEVEL_POSITIONS[0]?.id ?? 1;

  // For dream map (ids 101–111) need separate tracking since ids are non-sequential with main levels
  const isDreamMap = currentMap.transition === 'dream';
  const completedOnCurrentMap = LEVEL_POSITIONS.filter(p => completedDayIds.includes(p.id));
  const highestCompletedOnMap = completedOnCurrentMap.length > 0
    ? Math.max(...completedOnCurrentMap.map(p => p.id))
    : 0;

  // currentLevel: next level to play on this map
  const currentLevel = isDreamMap
    ? (highestCompletedOnMap > 0 ? highestCompletedOnMap + 1 : mapFirstLevel)
    : Math.min(globalCurrentLevel, mapLastLevel + 1);

  // Dream map locked condition: all map 1 levels completed
  const map1Levels = MAPS[0]!.levels;
  const map1AllCompleted = map1Levels.every(lvl => completedDayIds.includes(lvl.id));
  const allScoresArr = Object.values(taskScores);
  const globalAccuracy = allScoresArr.length > 0 ? (allScoresArr.filter((s: any) => s?.correct).length / allScoresArr.length) * 100 : 0;
  const isDreamLocked = currentMap.transition === 'dream' && !map1AllCompleted;
  
  // Dream map levels
  const dreamMap = MAPS.find(m => m.transition === 'dream');
  const dreamLevels = dreamMap?.levels ?? [];
  const dreamAllCompleted = dreamLevels.length > 0 && dreamLevels.every(lvl => completedDayIds.includes(lvl.id));

  // Map 2+ locked: need ALL map 1 levels + ALL dream levels completed
  const isMap2Locked = currentMapIndex > 0 && currentMap.transition !== 'dream' && (!map1AllCompleted || !dreamAllCompleted);
  
  const isMapLocked = isMap2Locked || isDreamLocked;

  // Build SVG path connecting completed levels (smooth bezier curves)
  const progressPath = useMemo(() => {
    // Find how many consecutive levels from start are completed
    let completedCount = 0;
    for (const pos of LEVEL_POSITIONS) {
      if (completedDayIds.includes(pos.id)) {
        completedCount++;
      } else {
        break;
      }
    }
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
  }, [completedDayIds, LEVEL_POSITIONS]);

  const handleLevelTap = (levelId: number) => {
    const status = getStatus(levelId);
    if (status === 'completed' || status === 'current') {
      openLevelPopup(levelId);
    }
  };

  // === LEVEL POPUP STATE ===
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<DayContent | null>(null);
  const [popupTaskIndex, setPopupTaskIndex] = useState(0);
  const [popupLevelId, setPopupLevelId] = useState(0);
  const [popupTaskLimit, setPopupTaskLimit] = useState(0);

  const completeTask = useProgressStore((s) => s.completeTask);
  const addXP = useProgressStore((s) => s.addXP);

  const openLevelPopup = useCallback(async (levelId: number) => {
    try {
      const content = await loadDayContent(levelId);

      // Progressive task count: level 1 = 1 task, level 2 = 2 tasks, etc.
      const isDream = levelId >= 100;
      const levelNumber = isDream ? levelId - 100 : levelId;
      const limit = Math.min(levelNumber, content.tasks.length);

      setPopupContent(content);
      setPopupTaskIndex(0);
      setPopupLevelId(levelId);
      setPopupTaskLimit(limit);
      setPopupOpen(true);
    } catch {
      // fallback to navigation
      navigate(`/day/${levelId}`);
    }
  }, [navigate]);

  const handlePopupTaskComplete = useCallback((result: TaskResult) => {
    completeTask(popupLevelId, result);
    addXP(result.correct ? 20 : 5, 'task-complete');

    const nextIndex = popupTaskIndex + 1;
    if (nextIndex >= popupTaskLimit) {
      // Level complete — close popup
      setTimeout(() => {
        setPopupOpen(false);
        setPopupContent(null);
      }, 800);
    } else {
      // Next task
      setPopupTaskIndex(nextIndex);
    }
  }, [popupLevelId, popupContent, popupTaskIndex, popupTaskLimit, completeTask, addXP]);

  const closePopup = () => {
    setPopupOpen(false);
    setPopupContent(null);
  };

  const getStatus = (id: number): 'completed' | 'current' | 'locked' => {
    if (completedDayIds.includes(id)) return 'completed';
    if (id === currentLevel) return 'current';
    // For sequential maps: levels below currentLevel that aren't completed (shouldn't happen but guard)
    if (!isDreamMap && id < currentLevel) return 'completed';
    return 'locked';
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <div
        ref={mapRef}
        className={`relative w-full h-full overflow-hidden transition-all duration-400 ${
          mapTransition === 'slide-up' ? 'animate-map-slide-up' :
          mapTransition === 'slide-down' ? 'animate-map-slide-down' :
          mapTransition === 'dream-in' ? 'animate-map-dream-in' :
          mapTransition === 'dream-out' ? 'animate-map-dream-out' : ''
        }`}
        style={{ maxWidth: '400px' }}
        onPointerMove={editorMode ? handleEditorPointerMove : undefined}
        onPointerUp={editorMode ? handleEditorPointerUp : undefined}
      >
        {/* Background image */}
        <img
          src={currentMap.image}
          alt={currentMap.title}
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

        {/* Animated decorative elements — subtle particles */}
        {!editorMode && (
          <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
            {/* Floating light particles — left edge */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400/50 animate-particle-float" style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
            <div className="absolute w-2 h-2 rounded-full bg-cyan-300/40 animate-particle-float" style={{ top: '25%', left: '8%', animationDelay: '1.5s', animationDuration: '7s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/50 animate-particle-float" style={{ top: '45%', left: '3%', animationDelay: '3s', animationDuration: '5s' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-green-300/40 animate-particle-float" style={{ top: '65%', left: '6%', animationDelay: '0.8s', animationDuration: '8s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-amber-300/50 animate-particle-float" style={{ top: '80%', left: '4%', animationDelay: '2.2s' }} />

            {/* Floating light particles — right edge */}
            <div className="absolute w-2 h-2 rounded-full bg-cyan-400/40 animate-particle-float" style={{ top: '15%', right: '6%', animationDelay: '0.5s', animationDuration: '6s' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-300/40 animate-particle-float" style={{ top: '35%', right: '4%', animationDelay: '2s', animationDuration: '7s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/60 animate-particle-float" style={{ top: '55%', right: '7%', animationDelay: '1s', animationDuration: '5.5s' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-green-400/40 animate-particle-float" style={{ top: '72%', right: '5%', animationDelay: '3.5s', animationDuration: '8s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-cyan-200/50 animate-particle-float" style={{ top: '88%', right: '8%', animationDelay: '1.8s' }} />

            {/* Glow orbs — edges, larger and softer */}
            <div className="absolute w-5 h-5 rounded-full bg-cyan-400/15 blur-md animate-glow-orb" style={{ top: '18%', left: '2%' }} />
            <div className="absolute w-4 h-4 rounded-full bg-green-400/15 blur-md animate-glow-orb" style={{ top: '50%', right: '3%', animationDelay: '2.5s' }} />
            <div className="absolute w-6 h-6 rounded-full bg-purple-400/10 blur-lg animate-glow-orb" style={{ top: '75%', left: '1%', animationDelay: '4s' }} />
            <div className="absolute w-4 h-4 rounded-full bg-amber-400/12 blur-md animate-glow-orb" style={{ top: '30%', right: '1%', animationDelay: '1.5s' }} />

            {/* Shimmer streaks — diagonal light rays near edges */}
            <div className="absolute w-[2px] h-8 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent animate-shimmer-streak" style={{ top: '20%', left: '10%', transform: 'rotate(15deg)' }} />
            <div className="absolute w-[2px] h-6 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-shimmer-streak" style={{ top: '40%', right: '10%', transform: 'rotate(-10deg)', animationDelay: '2s' }} />
            <div className="absolute w-[2px] h-10 bg-gradient-to-b from-transparent via-green-300/30 to-transparent animate-shimmer-streak" style={{ top: '60%', left: '8%', transform: 'rotate(20deg)', animationDelay: '3.5s' }} />
            <div className="absolute w-[2px] h-7 bg-gradient-to-b from-transparent via-cyan-200/35 to-transparent animate-shimmer-streak" style={{ top: '82%', right: '9%', transform: 'rotate(-15deg)', animationDelay: '1s' }} />

            {/* Star twinkles — tiny bright dots */}
            <div className="absolute w-1 h-1 rounded-full bg-white animate-twinkle" style={{ top: '8%', left: '15%' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white animate-twinkle" style={{ top: '22%', right: '12%', animationDelay: '1s' }} />
            <div className="absolute w-0.5 h-0.5 rounded-full bg-white animate-twinkle" style={{ top: '38%', left: '12%', animationDelay: '2.5s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white animate-twinkle" style={{ top: '58%', right: '14%', animationDelay: '0.7s' }} />
            <div className="absolute w-0.5 h-0.5 rounded-full bg-white animate-twinkle" style={{ top: '70%', left: '14%', animationDelay: '3.2s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white animate-twinkle" style={{ top: '90%', right: '11%', animationDelay: '1.8s' }} />
          </div>
        )}

        {/* SVG progress path — glowing curve connecting completed levels */}
        {progressPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 1778"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Soft glow trail */}
            <path
              d={progressPath}
              stroke="rgba(34, 197, 94, 0.2)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="4 20"
              fill="none"
            />
            {/* Main dotted path */}
            <path
              d={progressPath}
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 16"
              fill="none"
              opacity="0.7"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Vignette overlay — darkened edges for depth */}
        <div className="absolute inset-0 pointer-events-none z-[4]" style={{ boxShadow: 'inset 0 0 60px 20px rgba(0,0,0,0.4)' }} />

        {/* Locked map overlay — liquid glass + blur */}
        {isMapLocked && !editorMode && (
          <div className="absolute inset-0 z-[25] flex flex-col items-center justify-center">
            {/* Blur layer */}
            <div className="absolute inset-0" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
            {/* Liquid glass panel */}
            <div
              className="relative px-6 py-5 rounded-2xl flex flex-col items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px) saturate(150%)',
                WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => { setCurrentMapIndex(0); setEditorPositions(MAPS[0]!.levels.map(p => ({ ...p }))); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
              {/* Top refraction highlight */}
              <div className="absolute top-0 left-4 right-4 h-[30%] rounded-t-2xl" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)' }} />
              <span className="text-3xl relative z-10">🔒</span>
              <p className="text-white/90 text-sm font-bold relative z-10">
                {isDreamLocked ? 'Бонусная карта заблокирована' : 'Карта заблокирована'}
              </p>
              <div className="text-white/60 text-xs text-center relative z-10 space-y-1">
                {isDreamLocked ? (
                  !map1AllCompleted ? (
                    <>
                      <p>Пройдите все уровни карты 1</p>
                      <p className="text-white/40">Пройдено: {map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length} / {map1Levels.length}</p>
                    </>
                  ) : (
                    <>
                      <p>✅ Карта 1 пройдена</p>
                      <p>Карта сна уже должна быть открыта!</p>
                    </>
                  )
                ) : (
                  <>
                    <p className={map1AllCompleted ? 'text-green-400' : ''}>
                      {map1AllCompleted ? '✅' : '○'} Карта 1: {map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length}/{map1Levels.length}
                    </p>
                    <p className={dreamAllCompleted ? 'text-green-400' : ''}>
                      {dreamAllCompleted ? '✅' : '○'} Бонус «Сон»: {dreamLevels.filter(lvl => completedDayIds.includes(lvl.id)).length}/{dreamLevels.length}
                    </p>
                  </>
                )}
              </div>
              {/* Progress indicator */}
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20 relative z-10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full transition-all"
                  style={{ width: `${isDreamLocked
                    ? (!map1AllCompleted ? (map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length / map1Levels.length) * 100 : (globalAccuracy / 80) * 100)
                    : (!map1AllCompleted
                      ? (map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length / map1Levels.length) * 100
                      : dreamLevels.length > 0 ? (dreamLevels.filter(lvl => completedDayIds.includes(lvl.id)).length / dreamLevels.length) * 100 : 0)}%` }}
                />
              </div>
              {/* Back button */}
              <button
                onClick={() => { setCurrentMapIndex(0); setEditorPositions(MAPS[0]!.levels.map(p => ({ ...p }))); }}
                className="relative z-10 mt-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all hover:scale-105"
              >
                ← Вернуться
              </button>
            </div>
          </div>
        )}

        {/* Level nodes */}
        {positions.map((pos, index) => {
          const status = getStatus(pos.id);
          const info = currentLevelInfo[index] ?? '';

          return (
            <div
              key={pos.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 hover:z-40 group ${editorMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: status === 'current' ? 40 : undefined }}
              onPointerDown={editorMode ? (e) => handleEditorPointerDown(pos.id, e) : undefined}
            >
              {/* Sparkle dust around completed levels */}
              {status === 'completed' && !editorMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-1 h-1 rounded-full bg-green-300 animate-twinkle" style={{ animationDelay: `${index * 0.3}s` }} />
                  <div className="absolute -top-2 right-0 w-0.5 h-0.5 rounded-full bg-emerald-200 animate-twinkle" style={{ animationDelay: `${index * 0.3 + 0.8}s` }} />
                  <div className="absolute -bottom-1 -right-1 w-1 h-1 rounded-full bg-green-200 animate-twinkle" style={{ animationDelay: `${index * 0.3 + 1.5}s` }} />
                </div>
              )}

              {/* Breathing glow ring for current level */}
              {status === 'current' && !editorMode && (
                <div className="absolute inset-0 -m-2 rounded-full animate-breathe-glow border-2 border-cyan-400/50" />
              )}

              {/* Tooltip cloud — show on current AND locked (dimmed) levels */}
              {!editorMode && (() => {
                const showBelow = pos.y < 20; // near top of map — show tooltip below
                return (
                  <div className={`absolute ${showBelow ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-32 sm:w-36 z-50 ${status === 'locked' ? 'opacity-0 group-hover:opacity-60' : status === 'current' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} transition-opacity`}>
                    <div className="relative px-3 py-1.5 rounded-xl bg-white shadow-lg text-slate-800 text-[11px] sm:text-[13px] font-bold border border-slate-200 text-center leading-snug">
                      {info}
                      {/* Arrow pointing UP (tooltip is below button) */}
                      {showBelow && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-slate-200 rotate-45 mb-[-1px]" />
                      )}
                      {/* Arrow pointing DOWN (tooltip is above button) */}
                      {!showBelow && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 -mt-1" />
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Editor mode: show coordinates */}
              {editorMode && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-cyan-300 font-mono whitespace-nowrap bg-black/70 px-1 rounded">
                  {pos.x}, {pos.y}
                </div>
              )}

              {/* Level button — liquid glass style */}
              <button
                onClick={() => !editorMode && handleLevelTap(pos.id)}
                disabled={status === 'locked' && !editorMode}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                  editorMode
                    ? 'bg-gradient-to-b from-cyan-300 to-cyan-600 text-white border-2 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                    : status === 'completed'
                      ? 'text-white hover:scale-110'
                      : status === 'current'
                        ? 'text-white hover:scale-110 animate-current-bounce'
                        : 'text-white/70 hover:scale-105'
                }`}
                style={!editorMode ? {
                  background: status === 'completed'
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.6), rgba(16,185,129,0.4))'
                    : status === 'current'
                      ? 'rgba(6, 182, 212, 0.15)'
                      : 'linear-gradient(135deg, rgba(71,85,105,0.75), rgba(51,65,85,0.65))',
                  backdropFilter: status === 'completed' ? 'blur(2px)' : 'blur(4px) saturate(130%)',
                  WebkitBackdropFilter: status === 'completed' ? 'blur(2px)' : 'blur(4px) saturate(130%)',
                  border: status === 'completed'
                    ? '2px solid rgba(34, 197, 94, 0.7)'
                    : status === 'current'
                      ? '1.5px solid rgba(6, 182, 212, 0.5)'
                      : '1.5px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: status === 'completed'
                    ? '0 0 10px rgba(34,197,94,0.4), inset 0 1px 3px rgba(255,255,255,0.2)'
                    : status === 'current'
                      ? 'inset 0 1px 2px rgba(255,255,255,0.15), 0 0 12px rgba(6,182,212,0.4)'
                      : '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
                } : undefined}
              >
                {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : pos.id}
              </button>
            </div>
          );
        })}

        {/* Editor mode: floating panel with copy button */}
        {editorMode && (
          <div className="absolute top-2 left-2 z-50 flex flex-col gap-2">
            {/* Editor: map switcher */}
            <div className="flex gap-1">
              {MAPS.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => { setCurrentMapIndex(i); setEditorPositions(MAPS[i]!.levels.map(p => ({ ...p }))); }}
                  className={`px-2 py-1 text-[9px] font-bold rounded ${currentMapIndex === i ? 'bg-cyan-500 text-black' : 'bg-black/60 text-white'}`}
                >
                  {m.id}
                </button>
              ))}
            </div>
            <button
              onClick={copyEditorPositions}
              className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg shadow-lg"
            >
              📋 Копировать
            </button>
            <div className="bg-black/80 text-[10px] text-green-300 font-mono p-2 rounded max-h-32 overflow-y-auto">
              {editorPositions.map(p => (
                <div key={p.id}>#{p.id}: {p.x},{p.y}</div>
              ))}
            </div>
          </div>
        )}
        {/* ===== MAP NAVIGATION ===== */}
        <>
          {/* Arrow to NEXT map (top center) — requires all levels + dream completed */}
          {currentMapIndex < MAPS.length - 1 && MAPS[currentMapIndex + 1]?.transition !== 'dream' && (() => {
            const nextMapUnlocked = map1AllCompleted && dreamAllCompleted;
            const completedOnCurrentMap = map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length;

            return (
              <button
                onClick={() => {
                  const next = currentMapIndex + 1;
                  setMapTransition('slide-up');
                  setTimeout(() => { setCurrentMapIndex(next); setEditorPositions(MAPS[next]!.levels.map(p => ({ ...p }))); setMapTransition('none'); }, 700);
                }}
                className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full border text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
                  nextMapUnlocked
                    ? 'bg-gradient-to-r from-cyan-500/80 to-blue-500/80 border-cyan-300/50 text-white hover:scale-105 shadow-cyan-500/30 animate-pulse-slow'
                    : 'bg-slate-800/60 border-slate-600/50 text-slate-400 hover:scale-105'
                }`}
              >
                <span>{nextMapUnlocked ? '↑' : '🔒'}</span>
                {nextMapUnlocked ? `Карта ${currentMapIndex + 2}` : `${completedOnCurrentMap}/${map1Levels.length}`}
              </button>
            );
          })()}

          {/* Dream map button — visible circle on the map, map 1 only */}
          {MAPS.some(m => m.transition === 'dream') && currentMapIndex === 0 && (() => {
            const map1Levels = MAPS[0]!.levels;
            const map1Completed = map1Levels.filter(lvl => completedDayIds.includes(lvl.id)).length;
            const map1AllDone = map1Completed >= map1Levels.length;
            const allScores = Object.values(taskScores);
            const totalAnswered = allScores.length;
            const totalCorrect = allScores.filter((s: any) => s?.correct).length;
            const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
            const dreamUnlocked = map1AllDone;

            return (
              <div
                className="absolute z-30 flex flex-col items-center"
                style={{ top: '10%', right: '10%' }}
              >
                {/* Ripple waves — fires every 5s when unlocked */}
                {dreamUnlocked && (
                  <>
                    <div
                      className="absolute rounded-full pointer-events-none animate-dream-ripple"
                      style={{
                        inset: 0,
                        border: '2.5px solid rgba(168,85,247,0.8)',
                      }}
                    />
                    <div
                      className="absolute rounded-full pointer-events-none animate-dream-ripple"
                      style={{
                        inset: 0,
                        border: '2.5px solid rgba(168,85,247,0.5)',
                        animationDelay: '0.4s',
                      }}
                    />
                  </>
                )}

                <button
                  onClick={() => {
                    const dreamIdx = MAPS.findIndex(m => m.transition === 'dream');
                    setMapTransition('dream-in');
                    setTimeout(() => {
                      setCurrentMapIndex(dreamIdx);
                      setEditorPositions(MAPS[dreamIdx]!.levels.map(p => ({ ...p })));
                      setMapTransition('none');
                    }, 900);
                  }}
                  className={`relative flex flex-col items-center justify-center transition-all ${
                    dreamUnlocked
                      ? 'animate-glass-float hover:scale-110 active:scale-95 cursor-pointer'
                      : 'hover:scale-105 cursor-pointer opacity-70'
                  }`}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: dreamUnlocked
                      ? 'linear-gradient(145deg, rgba(192,132,252,0.55), rgba(99,102,241,0.45))'
                      : 'rgba(60,60,80,0.6)',
                    border: dreamUnlocked
                      ? '2.5px solid rgba(216,180,254,0.85)'
                      : '2px solid rgba(255,255,255,0.3)',
                    boxShadow: dreamUnlocked
                      ? '0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.25), inset 0 1px 4px rgba(255,255,255,0.3)'
                      : '0 2px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                >
                  {/* Top glare highlight */}
                  <div
                    className="absolute top-[3px] left-[8px] right-[8px] rounded-full pointer-events-none"
                    style={{
                      height: '32%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
                    }}
                  />
                  {/* Icon */}
                  <span className="text-2xl leading-none relative z-10">
                    {dreamUnlocked ? '💤' : '🔒'}
                  </span>
                </button>

                {/* Label */}
                <div
                  className="mt-1.5 px-2 py-0.5 rounded-full text-center"
                  style={{
                    background: dreamUnlocked ? 'rgba(168,85,247,0.35)' : 'rgba(0,0,0,0.45)',
                    border: dreamUnlocked ? '1px solid rgba(216,180,254,0.5)' : '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <p className={`text-[10px] font-bold leading-tight whitespace-nowrap ${dreamUnlocked ? 'text-purple-100' : 'text-white/50'}`}>
                    {dreamUnlocked ? '💤 Бонус: Сон' : !map1AllDone ? `${map1Completed}/${map1Levels.length}` : `${Math.round(accuracy)}%`}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Arrow to PREVIOUS map (bottom center) */}
          {currentMapIndex > 0 && MAPS[currentMapIndex]?.transition !== 'dream' && (
            <button
              onClick={() => {
                const prevIdx = currentMapIndex - 1;
                setMapTransition('slide-down');
                setTimeout(() => { setCurrentMapIndex(prevIdx); setEditorPositions(MAPS[prevIdx]!.levels.map(p => ({ ...p }))); setMapTransition('none'); }, 700);
              }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-500/80 border border-cyan-300/50 text-white text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-cyan-500/30 animate-pulse-slow"
            >
              <span>↓</span> Карта {currentMapIndex}
            </button>
          )}

          {/* Back from Dream map — TOP */}
          {MAPS[currentMapIndex]?.transition === 'dream' && (
            <button
              onClick={() => {
                setMapTransition('dream-out');
                setTimeout(() => { setCurrentMapIndex(0); setEditorPositions(MAPS[0]!.levels.map(p => ({ ...p }))); setMapTransition('none'); }, 700);
              }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/70 to-indigo-500/70 border border-purple-300/40 text-white text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-md shadow-purple-500/20"
            >
              <span>🌅</span> Проснуться
            </button>
          )}
        </>
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
                      style={{ width: `${((popupTaskIndex + 1) / popupTaskLimit) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/80 text-xs font-bold">
                    {popupTaskIndex + 1}/{popupTaskLimit}
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
                      src={currentMapIndex === 0 ? '/dispatch-academy-app/videos/student-avatar.mp4' : '/dispatch-academy-app/videos/student-avatar-2.mp4'}
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
                      onSkip={popupTaskIndex < popupTaskLimit - 1 ? () => setPopupTaskIndex((i) => i + 1) : undefined}
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
