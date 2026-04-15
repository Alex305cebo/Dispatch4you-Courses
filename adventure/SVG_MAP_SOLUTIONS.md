# SVG карты США с hover — готовые решения

## 🏆 Рекомендация: @mirawision/usa-map-react

**NPM**: https://www.npmjs.com/package/@mirawision/usa-map-react

### Преимущества
- ✅ Современная React библиотека (2025)
- ✅ TypeScript из коробки
- ✅ Hover работает нативно через SVG
- ✅ События: onClick, onHover, onLeave, onFocus, onBlur
- ✅ Кастомные цвета для каждого штата
- ✅ Tooltips и labels
- ✅ Можно скрыть штаты (AK, HI)
- ✅ Легковесная, без D3
- ✅ Responsive

### Установка
```bash
npm install @mirawision/usa-map-react
```

### Пример использования

```tsx
import { USAMap, USAStateAbbreviation } from '@mirawision/usa-map-react';
import { useState } from 'react';

function MapView() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const customStates = {
    CA: {
      fill: '#1a3a2a',
      stroke: '#2d6a4f',
      onHover: () => setHoveredState('CA'),
      onLeave: () => setHoveredState(null),
      onClick: () => console.log('California clicked'),
    },
    TX: {
      fill: '#1e4030',
      stroke: '#2d6a4f',
      onHover: () => setHoveredState('TX'),
      onLeave: () => setHoveredState(null),
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <USAMap 
        customStates={customStates}
        hiddenStates={['AK', 'HI']} // Скрыть Аляску и Гавайи
      />
      {hoveredState && <p>Hovered: {hoveredState}</p>}
    </div>
  );
}
```

### Hover эффект через CSS

Можно добавить глобальные стили для hover:

```css
/* В global.css */
.usa-map path:hover {
  fill: #2d6a4f !important;
  stroke: #4ade80 !important;
  stroke-width: 2 !important;
  filter: drop-shadow(0 0 8px rgba(45,106,79,0.6));
  cursor: pointer;
}
```

## Альтернативы

### 1. react-usa-map-select
**NPM**: https://www.npmjs.com/package/react-usa-map-select

- Простой компонент
- Highlight штатов
- Mouse events
- Кастомные стили

### 2. react-usa-map-fc
**NPM**: https://www.npmjs.com/package/react-usa-map-fc

- Functional component
- onClick и onMouseOver
- Легковесный

### 3. Чистый SVG + CSS (без библиотек)
**GitHub**: https://github.com/WebsiteBeaver/interactive-and-responsive-svg-map-of-us-states-capitals

- Просто SVG файл
- Hover через CSS
- Нет зависимостей
- Нужно самому добавлять логику

## Интеграция в игру

### Шаг 1: Установить библиотеку
```bash
cd adventure
npm install @mirawision/usa-map-react
```

### Шаг 2: Создать новый компонент MapViewSVG.tsx

```tsx
import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { USAMap, USAStateAbbreviation, StateAbbreviations } from '@mirawision/usa-map-react';
import { useGameStore } from "../store/gameStore";
import { CITIES } from "../constants/config";
import { Colors } from "../constants/colors";

export default function MapViewSVG() {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.textMuted }}>Карта доступна в веб-версии</Text>
      </View>
    );
  }

  return <MapSVG />;
}

function MapSVG() {
  const { trucks } = useGameStore();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Создаём настройки для всех штатов
  const customStates = {};
  StateAbbreviations.forEach((state) => {
    customStates[state] = {
      fill: '#1a3a2a',
      stroke: '#2d6a4f',
      onHover: () => setHoveredState(state),
      onLeave: () => setHoveredState(null),
      onClick: () => console.log(`Clicked: ${state}`),
    };
  });

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      background: '#0a1628',
      padding: 20,
    }}>
      <USAMap 
        customStates={customStates}
        hiddenStates={['AK', 'HI']}
      />
      
      {/* Траки поверх карты */}
      {trucks.map(truck => (
        <TruckMarker key={truck.id} truck={truck} />
      ))}
      
      {/* Tooltip */}
      {hoveredState && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(10,22,40,0.96)',
          border: '1px solid rgba(45,106,79,0.6)',
          borderRadius: 10,
          padding: '8px 12px',
        }}>
          <p style={{ color: '#d1fae5', margin: 0 }}>{hoveredState}</p>
        </div>
      )}
    </div>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Шаг 3: Заменить в game.tsx

```tsx
// Было:
import MapView from '../components/MapView';

// Стало:
import MapViewSVG from '../components/MapViewSVG';

// В JSX:
<MapViewSVG />
```

## Стили для hover

Добавить в `global.css`:

```css
/* Hover эффект для штатов */
.usa-map-react path {
  transition: all 0.2s ease;
}

.usa-map-react path:hover {
  fill: #2d6a4f !important;
  stroke: #4ade80 !important;
  stroke-width: 2 !important;
  filter: drop-shadow(0 0 8px rgba(45,106,79,0.6));
  cursor: pointer;
}
```

## Плюсы SVG подхода

1. **Hover работает из коробки** — не нужно писать логику проверки координат
2. **CSS стили** — можно стилизовать через CSS
3. **Производительность** — браузер сам оптимизирует SVG
4. **Доступность** — работает с клавиатурой и screen readers
5. **Легко кастомизировать** — каждый штат это отдельный элемент

## Минусы

1. **Нужно переписать логику траков** — они сейчас рисуются на Canvas
2. **Размер bundle** — добавится ~50KB (но это меньше чем D3)
3. **Координаты траков** — нужно конвертировать lat/lng в SVG координаты

## Вывод

Для интерактивной карты с hover — SVG это лучший выбор. Библиотека `@mirawision/usa-map-react` даёт всё что нужно из коробки.
