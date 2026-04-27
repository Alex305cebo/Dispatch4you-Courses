/**
 * TruckStatsView — панель характеристик трака.
 * Поддерживает тёмную и светлую тему через useThemeStore.
 * Показывает reliability, comfort, legalStatus, performance
 * с цветными прогресс-барами и кнопками действий.
 */
import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useGameStore } from '../store/gameStore';

interface TruckStatsViewProps {
  truck: any;
  onRepair?: () => void;
  onUpgrade?: () => void;
  compact?: boolean; // компактный режим для карточки
}

interface StatConfig {
  key: 'reliability' | 'comfort' | 'legalStatus' | 'performance';
  label: string;
  icon: string;
  description: string;
  goodThreshold: number;
  warnThreshold: number;
}

const STATS: StatConfig[] = [
  {
    key: 'reliability',
    label: 'Надёжность',
    icon: '🔧',
    description: 'Влияет на частоту поломок',
    goodThreshold: 70,
    warnThreshold: 40,
  },
  {
    key: 'comfort',
    label: 'Комфорт',
    icon: '🛋️',
    description: 'Влияет на настроение водителя',
    goodThreshold: 70,
    warnThreshold: 40,
  },
  {
    key: 'legalStatus',
    label: 'Тех. состояние',
    icon: '📋',
    description: 'Влияет на инспекции и штрафы',
    goodThreshold: 70,
    warnThreshold: 40,
  },
  {
    key: 'performance',
    label: 'Производительность',
    icon: '⚡',
    description: 'Влияет на скорость движения',
    goodThreshold: 70,
    warnThreshold: 40,
  },
];

function getStatColor(value: number, good: number, warn: number): string {
  if (value >= good) return '#30d158'; // success green
  if (value >= warn) return '#ffd60a'; // warning yellow
  return '#ff453a';                    // danger red
}

function getStatBg(value: number, good: number, warn: number, isDark: boolean): string {
  if (value >= good) return isDark ? 'rgba(48,209,88,0.12)' : 'rgba(52,199,89,0.1)';
  if (value >= warn) return isDark ? 'rgba(255,214,10,0.12)' : 'rgba(255,149,0,0.1)';
  return isDark ? 'rgba(255,69,58,0.12)' : 'rgba(255,59,48,0.1)';
}

function getStatBorder(value: number, good: number, warn: number, isDark: boolean): string {
  if (value >= good) return isDark ? 'rgba(48,209,88,0.25)' : 'rgba(52,199,89,0.3)';
  if (value >= warn) return isDark ? 'rgba(255,214,10,0.25)' : 'rgba(255,149,0,0.3)';
  return isDark ? 'rgba(255,69,58,0.25)' : 'rgba(255,59,48,0.3)';
}

function getOverallGrade(truck: any): { grade: string; color: string; label: string } {
  const avg = (
    (truck.reliability ?? 100) +
    (truck.comfort ?? 100) +
    (truck.legalStatus ?? 100) +
    (truck.performance ?? 100)
  ) / 4;

  if (avg >= 85) return { grade: 'A', color: '#30d158', label: 'Отличное состояние' };
  if (avg >= 70) return { grade: 'B', color: '#34c759', label: 'Хорошее состояние' };
  if (avg >= 55) return { grade: 'C', color: '#ffd60a', label: 'Удовлетворительно' };
  if (avg >= 40) return { grade: 'D', color: '#ff9f0a', label: 'Требует внимания' };
  return { grade: 'F', color: '#ff453a', label: 'Критическое состояние' };
}

export default function TruckStatsView({ truck, onRepair, onUpgrade, compact = false }: TruckStatsViewProps) {
  const { mode, colors: T } = useThemeStore();
  const isDark = mode === 'dark';
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const overall = getOverallGrade(truck);
  const hasLowStat = STATS.some(s => (truck[s.key] ?? 100) < s.warnThreshold);

  if (compact) {
    // ── КОМПАКТНЫЙ РЕЖИМ: только бары без описаний ──
    return (
      <div style={{
        padding: '8px 10px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 10,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>
            Состояние трака
          </span>
          <span style={{
            fontSize: 12, fontWeight: 900, color: overall.color,
            background: isDark ? `${overall.color}18` : `${overall.color}15`,
            border: `1px solid ${overall.color}44`,
            borderRadius: 6, padding: '1px 7px',
          }}>
            {overall.grade}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STATS.map(stat => {
            const val = truck[stat.key] ?? 100;
            const color = getStatColor(val, stat.goodThreshold, stat.warnThreshold);
            return (
              <div key={stat.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, width: 14, textAlign: 'center' }}>{stat.icon}</span>
                <span style={{ fontSize: 10, color: T.textMuted, width: 90, flexShrink: 0 }}>
                  {stat.label}
                </span>
                <div style={{
                  flex: 1, height: 4,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${val}%`,
                    background: color,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color, width: 28, textAlign: 'right' }}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ПОЛНЫЙ РЕЖИМ ──
  return (
    <div style={{
      background: isDark ? T.bgCard : T.bgCard,
      borderRadius: 16,
      border: `1px solid ${isDark ? T.border : T.border}`,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ── ЗАГОЛОВОК ── */}
      <div style={{
        padding: '12px 16px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🚛</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
              Характеристики трака
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
              {truck.name}
            </div>
          </div>
        </div>

        {/* Общая оценка */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isDark ? `${overall.color}15` : `${overall.color}12`,
          border: `1.5px solid ${overall.color}44`,
          borderRadius: 12, padding: '6px 12px',
          minWidth: 56,
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: overall.color, lineHeight: 1 }}>
            {overall.grade}
          </span>
          <span style={{ fontSize: 9, color: overall.color, fontWeight: 700, marginTop: 2, opacity: 0.8 }}>
            {overall.label}
          </span>
        </div>
      </div>

      {/* ── СТАТЫ ── */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATS.map(stat => {
          const val = truck[stat.key] ?? 100;
          const color = getStatColor(val, stat.goodThreshold, stat.warnThreshold);
          const bg = getStatBg(val, stat.goodThreshold, stat.warnThreshold, isDark);
          const border = getStatBorder(val, stat.goodThreshold, stat.warnThreshold, isDark);
          const isHovered = hoveredStat === stat.key;
          const isCritical = val < stat.warnThreshold;

          return (
            <div
              key={stat.key}
              onMouseEnter={() => setHoveredStat(stat.key)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                background: isHovered ? bg : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                border: `1px solid ${isHovered ? border : (isDark ? T.border : T.border)}`,
                borderRadius: 10,
                padding: '8px 10px',
                transition: 'all 0.15s ease',
                cursor: 'default',
              }}
            >
              {/* Строка: иконка + название + значение */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{stat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                      {stat.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {isCritical && (
                        <span style={{ fontSize: 11 }}>⚠️</span>
                      )}
                      <span style={{
                        fontSize: 14, fontWeight: 900, color,
                        minWidth: 32, textAlign: 'right',
                      }}>
                        {val}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>
                    {stat.description}
                  </div>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div style={{
                height: 6,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${val}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: isHovered ? `0 0 8px ${color}66` : 'none',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ПРЕДУПРЕЖДЕНИЕ ── */}
      {hasLowStat && (
        <div style={{
          margin: '0 16px 12px',
          padding: '8px 12px',
          background: isDark ? 'rgba(255,69,58,0.08)' : 'rgba(255,59,48,0.06)',
          border: `1px solid ${isDark ? 'rgba(255,69,58,0.25)' : 'rgba(255,59,48,0.2)'}`,
          borderRadius: 10,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#ff6b6b' : '#ff3b30' }}>
              Требуется обслуживание
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>
              Один или несколько показателей ниже нормы. Водитель будет жаловаться и трак может сломаться.
            </div>
          </div>
        </div>
      )}

      {/* ── КНОПКИ ДЕЙСТВИЙ ── */}
      {(onRepair || onUpgrade) && (
        <div style={{
          padding: '0 16px 14px',
          display: 'flex', gap: 8,
        }}>
          {onRepair && (
            <ActionButton
              icon="🔧"
              label="Ремонт"
              sublabel={truck.isOldTruck ? '$2,500' : '$1,200'}
              color={T.danger}
              colorDark="#ff453a"
              isDark={isDark}
              onClick={onRepair}
              variant="danger"
            />
          )}
          {onUpgrade && (
            <ActionButton
              icon="⬆️"
              label="Улучшить"
              sublabel="Апгрейды"
              color={T.primary}
              colorDark="#0a84ff"
              isDark={isDark}
              onClick={onUpgrade}
              variant="primary"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── ПРОФЕССИОНАЛЬНАЯ КНОПКА ДЕЙСТВИЯ ──────────────────────────────────────
interface ActionButtonProps {
  icon: string;
  label: string;
  sublabel?: string;
  color: string;
  colorDark: string;
  isDark: boolean;
  onClick: () => void;
  variant: 'primary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    bg: 'rgba(10,132,255,0.12)',
    bgHover: 'rgba(10,132,255,0.2)',
    border: 'rgba(10,132,255,0.35)',
    borderHover: 'rgba(10,132,255,0.6)',
    text: '#0a84ff',
    glow: 'rgba(10,132,255,0.25)',
  },
  danger: {
    bg: 'rgba(255,69,58,0.1)',
    bgHover: 'rgba(255,69,58,0.18)',
    border: 'rgba(255,69,58,0.3)',
    borderHover: 'rgba(255,69,58,0.55)',
    text: '#ff453a',
    glow: 'rgba(255,69,58,0.2)',
  },
  success: {
    bg: 'rgba(48,209,88,0.1)',
    bgHover: 'rgba(48,209,88,0.18)',
    border: 'rgba(48,209,88,0.3)',
    borderHover: 'rgba(48,209,88,0.55)',
    text: '#30d158',
    glow: 'rgba(48,209,88,0.2)',
  },
  warning: {
    bg: 'rgba(255,214,10,0.1)',
    bgHover: 'rgba(255,214,10,0.18)',
    border: 'rgba(255,214,10,0.3)',
    borderHover: 'rgba(255,214,10,0.55)',
    text: '#ffd60a',
    glow: 'rgba(255,214,10,0.2)',
  },
};

function ActionButton({ icon, label, sublabel, isDark, onClick, variant, disabled }: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);
  const { colors: T } = useThemeStore();
  const v = VARIANT_STYLES[variant];

  // Светлая тема — другие цвета
  const lightVariant = {
    primary: { bg: 'rgba(0,122,255,0.08)', bgHover: 'rgba(0,122,255,0.14)', border: 'rgba(0,122,255,0.3)', borderHover: 'rgba(0,122,255,0.5)', text: '#007aff', glow: 'rgba(0,122,255,0.15)' },
    danger:  { bg: 'rgba(255,59,48,0.07)', bgHover: 'rgba(255,59,48,0.13)', border: 'rgba(255,59,48,0.25)', borderHover: 'rgba(255,59,48,0.45)', text: '#ff3b30', glow: 'rgba(255,59,48,0.12)' },
    success: { bg: 'rgba(52,199,89,0.07)', bgHover: 'rgba(52,199,89,0.13)', border: 'rgba(52,199,89,0.25)', borderHover: 'rgba(52,199,89,0.45)', text: '#34c759', glow: 'rgba(52,199,89,0.12)' },
    warning: { bg: 'rgba(255,149,0,0.07)', bgHover: 'rgba(255,149,0,0.13)', border: 'rgba(255,149,0,0.25)', borderHover: 'rgba(255,149,0,0.45)', text: '#ff9500', glow: 'rgba(255,149,0,0.12)' },
  };

  const style = isDark ? v : lightVariant[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '10px 14px',
        background: hovered ? style.bgHover : style.bg,
        border: `1.5px solid ${hovered ? style.borderHover : style.border}`,
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? `0 4px 16px ${style.glow}` : 'none',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        opacity: disabled ? 0.45 : 1,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      } as any}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: style.text,
          lineHeight: 1.2,
        }}>
          {label}
        </span>
        {sublabel && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            lineHeight: 1.2, marginTop: 1,
          }}>
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}

// ── ЭКСПОРТ ActionButton для переиспользования ─────────────────────────────
export { ActionButton };
export type { ActionButtonProps };
