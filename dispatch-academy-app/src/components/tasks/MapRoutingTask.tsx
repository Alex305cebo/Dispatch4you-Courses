import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MapRoutingData } from '../../types/index';

interface MapRoutingTaskProps {
  data: MapRoutingData;
  onAnswer: (correct: boolean) => void;
}

export default function MapRoutingTask({ data, onAnswer }: MapRoutingTaskProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  // Calculate total cost for each route
  const routesWithCost = useMemo(
    () =>
      data.routes.map((route) => ({
        ...route,
        totalCost: parseFloat((route.miles * route.rate).toFixed(2)),
      })),
    [data.routes]
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      const route = routesWithCost[index];
      onAnswer(route?.isOptimal ?? false);
    },
    [answered, routesWithCost, onAnswer]
  );

  const getCardClasses = (index: number): string => {
    const base =
      'w-full min-h-[44px] p-4 rounded-xl text-left transition-all duration-200 border-2 cursor-pointer';

    if (!answered) {
      return `${base} bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900`;
    }

    // After selection
    const route = routesWithCost[index];
    if (!route) {
      return `${base} bg-white/5 border-white/10 opacity-60 cursor-default`;
    }

    if (route.isOptimal) {
      return `${base} bg-green-500/20 border-green-500 cursor-default`;
    }
    if (index === selectedIndex && !route.isOptimal) {
      return `${base} bg-red-500/20 border-red-500 cursor-default`;
    }
    return `${base} bg-white/5 border-white/10 opacity-60 cursor-default`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-4">
      {/* Origin → Destination header with visual */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-white font-bold text-lg md:text-xl text-center">
          Выберите оптимальный маршрут
        </h2>
        <div className="flex items-center gap-3 mt-2">
          {/* Origin icon */}
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">📍</span>
            <span className="text-cyan-300 font-semibold text-sm md:text-base">
              {data.origin}
            </span>
          </div>

          {/* Arrow connector */}
          <div className="flex items-center gap-1 px-2" aria-hidden="true">
            <span className="block w-8 md:w-12 h-0.5 bg-cyan-500/50" />
            <span className="text-cyan-400 text-lg">→</span>
            <span className="block w-8 md:w-12 h-0.5 bg-cyan-500/50" />
          </div>

          {/* Destination icon */}
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🏁</span>
            <span className="text-cyan-300 font-semibold text-sm md:text-base">
              {data.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-slate-300 text-sm text-center">
        Выберите маршрут с наименьшей стоимостью (rate × miles)
      </p>

      {/* Route cards */}
      <div
        className="flex flex-col gap-3 mt-2"
        role="group"
        aria-label="Варианты маршрутов"
      >
        {routesWithCost.map((route, index) => (
          <motion.button
            key={index}
            type="button"
            className={getCardClasses(index)}
            onClick={() => handleSelect(index)}
            disabled={answered}
            aria-label={`Маршрут ${route.name}: ${route.miles} миль, $${route.rate} за милю, итого $${route.totalCost}`}
            aria-disabled={answered}
            whileTap={!answered ? { scale: 0.98 } : undefined}
            animate={
              answered && index === selectedIndex && !route.isOptimal
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-2">
              {/* Route name */}
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-base">
                  {route.name}
                </span>
                {answered && route.isOptimal && (
                  <span className="text-green-400 text-xs font-bold uppercase">
                    ✓ Оптимальный
                  </span>
                )}
              </div>

              {/* Route details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-slate-300">
                  🛣️ {route.miles} миль
                </span>
                <span className="text-slate-300">
                  💲 ${route.rate.toFixed(2)}/миля
                </span>
                <span className="text-cyan-300 font-bold">
                  Итого: ${route.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feedback after answer */}
      {answered && selectedIndex !== null && routesWithCost[selectedIndex] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`mt-2 p-4 rounded-xl border-2 ${
            routesWithCost[selectedIndex]?.isOptimal
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-red-500/10 border-red-500/40'
          }`}
          role="alert"
          aria-live="polite"
        >
          <p
            className={`font-bold text-base mb-1 ${
              routesWithCost[selectedIndex]?.isOptimal
                ? 'text-green-300'
                : 'text-red-300'
            }`}
          >
            {routesWithCost[selectedIndex]?.isOptimal
              ? '✅ Верно! Это самый выгодный маршрут.'
              : '❌ Неверно.'}
          </p>
          {!routesWithCost[selectedIndex]?.isOptimal && (
            <p className="text-sm text-slate-200">
              Оптимальный маршрут:{' '}
              <span className="font-semibold text-green-300">
                {routesWithCost.find((r) => r.isOptimal)?.name}
              </span>
              {' — '}
              ${routesWithCost.find((r) => r.isOptimal)?.totalCost.toFixed(2)}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
