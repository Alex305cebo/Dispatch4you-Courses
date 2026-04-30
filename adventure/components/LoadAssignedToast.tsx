// Toast-уведомление после назначения груза — под карточкой трака
import React, { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  truckName: string;
  loadInfo: {
    fromCity: string;
    toCity: string;
    rate: number;
    miles: number;
    commodity: string;
  };
  onClose: () => void;
  isDark?: boolean; // Поддержка тёмной/светлой темы
}

export default function LoadAssignedToast({ visible, truckName, loadInfo, onClose, isDark = true }: Props) {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setTimeLeft(4);
      
      // Таймер обратного отсчёта
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Автоматически закрываем через 4 секунды
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Ждём окончания анимации
      }, 4000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: `translate(-50%, ${show ? '0' : '120%'})`,
      zIndex: 10000,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      pointerEvents: 'auto',
      cursor: 'pointer',
    }}
      onClick={() => {
        setShow(false);
        setTimeout(onClose, 300);
      }}
    >
      <div style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(15,20,35,0.97), rgba(20,25,40,0.97))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(250,250,255,0.97))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '14px 18px',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 2px rgba(6,182,212,0.4)'
          : '0 8px 32px rgba(0,0,0,0.15), 0 0 0 2px rgba(6,182,212,0.3)',
        minWidth: 340,
        maxWidth: 400,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}>
        {/* Таймер в правом верхнем углу */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 14,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: isDark ? '#06b6d4' : '#0891b2',
        }}>
          {timeLeft}
        </div>

        {/* Заголовок */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 15, 
              fontWeight: 900, 
              color: isDark ? '#e2e8f0' : '#111827',
              letterSpacing: 0.3,
              marginBottom: 2,
            }}>
              Груз назначен!
            </div>
            <div style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: isDark ? '#94a3b8' : '#6b7280',
            }}>
              {truckName}
            </div>
          </div>
        </div>

        {/* Информация о грузе */}
        <div style={{
          background: isDark 
            ? 'rgba(6,182,212,0.08)' 
            : 'rgba(6,182,212,0.06)',
          borderRadius: 12,
          padding: '10px 12px',
          border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{ 
              fontSize: 13, 
              fontWeight: 700, 
              color: isDark ? '#e2e8f0' : '#111827',
            }}>
              {loadInfo.fromCity} → {loadInfo.toCity}
            </span>
            <span style={{ 
              fontSize: 16, 
              fontWeight: 900, 
              color: '#06b6d4',
            }}>
              ${loadInfo.rate.toLocaleString()}
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: 10,
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#6b7280',
          }}>
            <span>{loadInfo.miles} mi</span>
            <span>•</span>
            <span>${(loadInfo.rate / loadInfo.miles).toFixed(2)}/mi</span>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div style={{
          marginTop: 10,
          height: 4,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
            borderRadius: 2,
            animation: 'toastProgress 4s linear',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
