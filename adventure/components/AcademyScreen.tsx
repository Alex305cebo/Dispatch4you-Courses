/**
 * ACADEMY SCREEN — Слой 3 «Академия Диспетчера»
 * Полноценный Duolingo-style экран с прогрессом по модулям
 * Открывается из главного меню → «Обучение»
 */
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLessonStore } from '../store/lessonStore';
import { allDuolingoDialogs, getDialogById, getTotalXP } from '../data/duolingoDialogs';
import type { DuolingoDialog } from '../data/duolingoDialogs';
import DuolingoQuizDialog from './DuolingoQuizDialog';

interface Props {
  onClose: () => void;
}

/** Структура модуля для отображения */
interface ModuleInfo {
  id: number;
  icon: string;
  title: string;
  lessons: DuolingoDialog[];
  totalXP: number;
}

/** Все 12 модулей */
const MODULES: Omit<ModuleInfo, 'lessons' | 'totalXP'>[] = [
  { id: 1,  icon: '🚛', title: 'Основы диспетчерства' },
  { id: 2,  icon: '🏛️', title: 'FMCSA и DOT' },
  { id: 3,  icon: '⏰', title: 'Hours of Service' },
  { id: 4,  icon: '📋', title: 'Load Boards' },
  { id: 5,  icon: '📞', title: 'Коммуникация с брокерами' },
  { id: 6,  icon: '👥', title: 'Работа с водителями' },
  { id: 7,  icon: '🗺️', title: 'Маршрутизация' },
  { id: 8,  icon: '📦', title: 'Типы грузов' },
  { id: 9,  icon: '💰', title: 'Финансы' },
  { id: 10, icon: '🚨', title: 'Критические ситуации' },
  { id: 11, icon: '🖥️', title: 'Технологии' },
  { id: 12, icon: '📈', title: 'Карьера' },
];

function buildModules(): ModuleInfo[] {
  return MODULES.map(m => {
    const lessons = allDuolingoDialogs.filter(d => d.module === `Модуль ${m.id}`);
    return {
      ...m,
      lessons,
      totalXP: lessons.reduce((sum, l) => sum + l.xp, 0),
    };
  });
}

export default function AcademyScreen({ onClose }: Props) {
  const { width: W } = useWindowDimensions();
  const isMobile = W < 600;

  const { completedLessons, totalXP, streak } = useLessonStore();
  const completeLesson = useLessonStore(s => s.completeLesson);

  const [activeLesson, setActiveLesson] = useState<DuolingoDialog | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const modules = buildModules();
  const totalLessons = allDuolingoDialogs.length;
  const maxXP = getTotalXP();
  const progressPct = Math.round((completedLessons.length / totalLessons) * 100);

  function isModuleUnlocked(moduleId: number): boolean {
    if (moduleId === 1) return true;
    // Модуль разблокирован если предыдущий пройден хотя бы на 50%
    const prevModule = modules.find(m => m.id === moduleId - 1);
    if (!prevModule) return true;
    const prevCompleted = prevModule.lessons.filter(l => completedLessons.includes(l.id)).length;
    return prevCompleted >= Math.ceil(prevModule.lessons.length / 2);
  }

  function getModuleProgress(moduleId: number): { done: number; total: number; pct: number } {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return { done: 0, total: 0, pct: 0 };
    const done = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { done, total: mod.lessons.length, pct: mod.lessons.length > 0 ? Math.round((done / mod.lessons.length) * 100) : 0 };
  }

  function handleLessonPress(lesson: DuolingoDialog) {
    setActiveLesson(lesson);
  }

  function toggleModule(moduleId: number) {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  }

  // ── ACTIVE LESSON QUIZ ──
  if (activeLesson) {
    return (
      <DuolingoQuizDialog
        lessonId={activeLesson.id}
        visible={true}
        title={`${activeLesson.module} · ${activeLesson.topic}`}
        onClose={() => setActiveLesson(null)}
        onComplete={() => setActiveLesson(null)}
      />
    );
  }

  // ── MAIN ACADEMY VIEW ──
  return (
    <View style={s.overlay}>
      <style>{`
        @keyframes academySlideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .academy-card { animation: academySlideUp 0.4s ease-out; }
        .module-row:hover { background: rgba(255,255,255,0.04) !important; }
        .lesson-row:hover { background: rgba(10,132,255,0.08) !important; }
      `}</style>

      <View
        // @ts-ignore
        className="academy-card"
        style={[s.card, { width: isMobile ? W - 24 : 520, maxWidth: '96%' }]}
      >
        <View style={s.cardGlass} />

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>📚 Академия Диспетчера</Text>
            <Text style={s.headerSub}>Интерактивное обучение · 12 модулей</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS BAR ── */}
        <View style={s.statsBar}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{completedLessons.length}/{totalLessons}</Text>
            <Text style={s.statLabel}>Уроков</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: '#ffd60a' }]}>{totalXP}</Text>
            <Text style={s.statLabel}>XP ⭐</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: '#ff9f0a' }]}>{streak > 0 ? `🔥 ${streak}` : '—'}</Text>
            <Text style={s.statLabel}>Серия</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: '#30d158' }]}>{progressPct}%</Text>
            <Text style={s.statLabel}>Прогресс</Text>
          </View>
        </View>

        {/* ── PROGRESS BAR ── */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <LinearGradient
              colors={['#0a84ff', '#bf5af2']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${progressPct}%` } as any]}
            />
          </View>
        </View>

        {/* ── MODULES LIST ── */}
        <ScrollView style={s.modulesList} showsVerticalScrollIndicator={false}>
          {modules.map((mod) => {
            const unlocked = isModuleUnlocked(mod.id);
            const progress = getModuleProgress(mod.id);
            const isExpanded = expandedModule === mod.id;
            const isComplete = progress.pct === 100;

            return (
              <View key={mod.id}>
                {/* Module row */}
                <TouchableOpacity
                  onPress={() => unlocked && toggleModule(mod.id)}
                  activeOpacity={unlocked ? 0.7 : 1}
                  // @ts-ignore
                  className="module-row"
                  style={[
                    s.moduleRow,
                    !unlocked && s.moduleLocked,
                    isExpanded && s.moduleExpanded,
                    isComplete && s.moduleComplete,
                  ]}
                >
                  {/* Status icon */}
                  <View style={[
                    s.moduleIcon,
                    isComplete && { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: 'rgba(48,209,88,0.3)' },
                    !unlocked && { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
                  ]}>
                    <Text style={{ fontSize: 20 }}>
                      {!unlocked ? '🔒' : isComplete ? '✅' : mod.icon}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={[s.moduleTitle, !unlocked && { color: '#475569' }]}>
                      {mod.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <Text style={[s.moduleMeta, !unlocked && { color: '#334155' }]}>
                        {progress.done}/{progress.total} уроков
                      </Text>
                      <Text style={[s.moduleMeta, { color: '#ffd60a' }]}>
                        {mod.totalXP} XP
                      </Text>
                    </View>
                    {/* Mini progress bar */}
                    {unlocked && (
                      <View style={s.miniProgress}>
                        <View style={[s.miniProgressFill, {
                          width: `${progress.pct}%`,
                          backgroundColor: isComplete ? '#30d158' : '#0a84ff',
                        } as any]} />
                      </View>
                    )}
                  </View>

                  {/* Chevron */}
                  {unlocked && (
                    <Text style={[s.chevron, isExpanded && s.chevronOpen]}>
                      ▾
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Expanded lessons */}
                {isExpanded && unlocked && (
                  <View style={s.lessonsWrap}>
                    {mod.lessons.map((lesson, li) => {
                      const isDone = completedLessons.includes(lesson.id);
                      const diffColor = lesson.difficulty === 'beginner' ? '#30d158'
                        : lesson.difficulty === 'intermediate' ? '#ffd60a' : '#ff453a';

                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          onPress={() => handleLessonPress(lesson)}
                          activeOpacity={0.7}
                          // @ts-ignore
                          className="lesson-row"
                          style={[s.lessonRow, isDone && s.lessonDone]}
                        >
                          <View style={[s.lessonNum, isDone && { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: '#30d158' }]}>
                            <Text style={[s.lessonNumText, isDone && { color: '#30d158' }]}>
                              {isDone ? '✓' : li + 1}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.lessonTitle, isDone && { color: '#64748b' }]}>
                              {lesson.topic}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                              <View style={[s.lessonBadge, { borderColor: diffColor + '40', backgroundColor: diffColor + '12' }]}>
                                <Text style={[s.lessonBadgeText, { color: diffColor }]}>
                                  {lesson.difficulty === 'beginner' ? 'Новичок' : lesson.difficulty === 'intermediate' ? 'Средний' : 'Эксперт'}
                                </Text>
                              </View>
                              <Text style={s.lessonXp}>{lesson.xp} XP</Text>
                              <Text style={s.lessonTime}>~{Math.round(lesson.estimatedTime / 60)} мин</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 16, color: isDone ? '#30d158' : '#334155' }}>
                            {isDone ? '✅' : '▸'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  card: {
    borderRadius: 24, overflow: 'hidden',
    position: 'relative' as any,
    maxHeight: '92%',
    // @ts-ignore
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(191,90,242,0.15)',
  },
  cardGlass: {
    position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.96)',
    // @ts-ignore
    backdropFilter: 'blur(40px)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, paddingBottom: 10, zIndex: 1,
  },
  headerTitle: {
    fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    // @ts-ignore
    cursor: 'pointer',
  },
  closeTxt: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },

  // Stats bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, paddingVertical: 10,
    zIndex: 1,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Progress
  progressWrap: { paddingHorizontal: 16, marginBottom: 10, zIndex: 1 },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  // Modules list
  modulesList: { flex: 1, paddingHorizontal: 12, zIndex: 1 },

  // Module row
  moduleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 4,
    // @ts-ignore
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  moduleLocked: {
    opacity: 0.5,
    // @ts-ignore
    cursor: 'default',
  },
  moduleExpanded: {
    borderColor: 'rgba(10,132,255,0.25)',
    backgroundColor: 'rgba(10,132,255,0.04)',
  },
  moduleComplete: {
    borderColor: 'rgba(48,209,88,0.2)',
  },
  moduleIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  moduleTitle: {
    fontSize: 14, fontWeight: '800', color: '#e2e8f0',
  },
  moduleMeta: {
    fontSize: 11, color: '#64748b', fontWeight: '600',
  },
  miniProgress: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden', marginTop: 6,
  },
  miniProgressFill: {
    height: '100%', borderRadius: 2,
    // @ts-ignore
    transition: 'width 0.3s ease',
  },
  chevron: {
    fontSize: 16, color: '#64748b', fontWeight: '700',
    // @ts-ignore
    transition: 'transform 0.2s ease',
  },
  chevronOpen: {
    // @ts-ignore
    transform: [{ rotate: '180deg' }],
  },

  // Lessons
  lessonsWrap: {
    paddingLeft: 20, paddingRight: 4, paddingBottom: 8, gap: 3,
  },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'transparent',
    // @ts-ignore
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  lessonDone: {
    borderColor: 'rgba(48,209,88,0.1)',
    backgroundColor: 'rgba(48,209,88,0.03)',
  },
  lessonNum: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 12, fontWeight: '900', color: '#94a3b8',
  },
  lessonTitle: {
    fontSize: 13, fontWeight: '700', color: '#e2e8f0',
  },
  lessonBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1,
  },
  lessonBadgeText: { fontSize: 9, fontWeight: '800' },
  lessonXp: { fontSize: 10, color: '#ffd60a', fontWeight: '700' },
  lessonTime: { fontSize: 10, color: '#475569', fontWeight: '600' },
});
