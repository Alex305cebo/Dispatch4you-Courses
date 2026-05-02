# Background Paper Shaders Integration

## ✅ Статус: ЗАВЕРШЕНО

Компонент `background-paper-shaders.tsx` успешно интегрирован в проект.

## 📋 Проверка требований

### ✅ Структура проекта
- **shadcn/ui структура**: ✓ Используется `/src/components/ui`
- **Tailwind CSS**: ✓ Установлен и настроен (v3.3.6)
- **TypeScript**: ✓ Полная поддержка (v5.3.2)

### ✅ Зависимости
Все необходимые пакеты уже установлены:
- `three`: ^0.183.1
- `@react-three/fiber`: ^9.5.0
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

## 📁 Структура файлов

```
src/components/ui/
├── background-paper-shaders.tsx  ← Новый компонент
├── glowing-effect.tsx
├── glowing-card.tsx
├── glowing-effect-demo.tsx
└── shader-background.tsx
```

## 🎨 Компонент: background-paper-shaders.tsx

### Экспортируемые компоненты

#### 1. ShaderPlane
Плоскость с анимированным шейдером для фона.

```tsx
<ShaderPlane 
  position={[0, 0, 0]} 
  color1="#6366f1" 
  color2="#8b5cf6" 
/>
```

**Параметры:**
- `position: [number, number, number]` - позиция в 3D пространстве
- `color1?: string` - первый цвет (hex, default: "#ff5722")
- `color2?: string` - второй цвет (hex, default: "#ffffff")

**Особенности:**
- Увеличенная геометрия: 20x20 с 128x128 сегментами
- Масштаб: 2x для большего эффекта
- Волнообразная анимация по всем осям
- Многослойный шум для деталей

#### 2. EnergyRing
Кольцо с анимацией вращения и пульсации.

```tsx
<EnergyRing 
  radius={2} 
  position={[0, 0, -1]} 
/>
```

**Параметры:**
- `radius?: number` - радиус кольца (default: 1)
- `position?: [number, number, number]` - позиция (default: [0, 0, 0])

**Особенности:**
- Вращение вокруг Z-оси
- Пульсирующая прозрачность
- Оранжевый цвет (#ff5722)

## 🔧 Шейдеры

### Vertex Shader
- Анимирует вершины по X, Y, Z осям
- Использует sin/cos функции для волнообразного эффекта
- Параметры:
  - `time` - текущее время анимации
  - `intensity` - интенсивность эффекта (пульсирует)

### Fragment Shader
- Создает многослойный шум (3 слоя)
- Смешивает два цвета на основе шума
- Добавляет эффект свечения (glow)
- Использует радиальный градиент

## 📊 Параметры шейдера

| Параметр | Значение | Описание |
|----------|----------|---------|
| `time` | 0-∞ | Синхронизируется с часами Three.js |
| `intensity` | 0.7-1.3 | Пульсирует синусоидально |
| `color1` | Hex color | Первый цвет градиента |
| `color2` | Hex color | Второй цвет градиента |

## 🎬 Анимация

- **Длительность цикла**: ~6.28 секунд (2π)
- **Интенсивность**: Пульсирует от 0.7 до 1.3
- **Скорость**: Контролируется через `time` uniform
- **Плавность**: 60 FPS через requestAnimationFrame

## 🌈 Цвета

Текущие цвета в примере:
- **color1**: #6366f1 (Индиго)
- **color2**: #8b5cf6 (Фиолетовый)

Можно изменить на любые hex цвета:
```tsx
<ShaderPlane 
  position={[0, 0, 0]} 
  color1="#ff0000" 
  color2="#00ff00" 
/>
```

## 📱 Использование в React

### С Canvas (React Three Fiber)

```tsx
import { Canvas } from "@react-three/fiber"
import { ShaderPlane, EnergyRing } from "@/components/ui/background-paper-shaders"

export function MyComponent() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
      <ShaderPlane position={[0, 0, 0]} color1="#6366f1" color2="#8b5cf6" />
      <EnergyRing radius={2} position={[0, 0, -1]} />
    </Canvas>
  )
}
```

### С ShaderBackground компонентом

```tsx
import { ShaderBackground } from "@/components/ui/shader-background"

export function MyPage() {
  return (
    <div className="relative min-h-screen">
      <ShaderBackground color1="#6366f1" color2="#8b5cf6" />
      {/* Ваш контент */}
    </div>
  )
}
```

## ⚡ Производительность

- **WebGL ускорение**: Использует GPU для рендеринга
- **Оптимизированные шейдеры**: Минимальные вычисления
- **Эффективная геометрия**: 128x128 сегментов достаточно для деталей
- **Плавная анимация**: 60 FPS на большинстве устройств

## 🔗 Интеграция с проектом

Компонент полностью интегрирован с:
- ✅ React 18.2+
- ✅ Next.js 14
- ✅ TypeScript 5.3+
- ✅ Tailwind CSS 3.3+
- ✅ Three.js 0.183+
- ✅ @react-three/fiber 9.5+

## 📝 Примечания

1. **Canvas требует контейнера** - ShaderBackground должен быть в контейнере с `relative overflow-hidden`
2. **Z-index** - Используйте `relative z-10` для контента над фоном
3. **Производительность** - На слабых устройствах может потребоваться снижение качества
4. **Браузеры** - Требует поддержки WebGL (все современные браузеры)

## 🚀 Расширение

Для добавления новых шейдеров:

1. Создайте новые vertex/fragment shaders
2. Добавьте новый компонент в `background-paper-shaders.tsx`
3. Используйте в `shader-background.tsx` через Canvas

## 📚 Ресурсы

- [Three.js Documentation](https://threejs.org/docs/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- [GLSL Shaders](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [21st.dev Components](https://21st.dev/)

## ✨ Особенности

- 🎨 Многоцветный градиент
- 💫 Эффект свечения и пульсация
- 📱 Полная адаптивность
- ⚡ WebGL ускорение
- 🖱️ Отслеживание мыши (через GlowingCard)
- 🌊 Волнообразная анимация
- 🔄 Плавные переходы

## 🎯 Следующие шаги

1. Используйте `ShaderPlane` и `EnergyRing` в Canvas
2. Интегрируйте с `ShaderBackground` для полноэкранного фона
3. Настройте цвета под ваш дизайн
4. Оптимизируйте параметры для вашего устройства
