'use client';

import { GlowingEffect } from '@/components/ui/glowing-effect';
import FlowFieldBackground from '@/components/ui/flow-field-background';
import { BookOpen, Code, Zap, Users, Brain, Rocket, Target, Lightbulb, Award, TrendingUp, Headphones, FileText } from 'lucide-react';

const learningSteps = [
  {
    id: '01',
    title: 'Регламенты и стандарты',
    description: 'Регламенты FMCSA и DOT • Правила Hours of Service (HOS) • Профессиональные стандарты индустрии',
    icon: BookOpen,
    stage: 'Foundation',
    href: 'pages/module-1.html',
    status: 'active',
    difficulty: 'Basic',
    topics: ['FMCSA', 'DOT', 'HOS', 'Стандарты']
  },
  {
    id: '02',
    title: 'Обучающие модули',
    description: '10 комплексных модулей • Теория + Практические задания • Система мгновенной проверки знаний',
    icon: Code,
    stage: 'Foundation',
    href: 'pages/module-2.html',
    status: 'active',
    difficulty: 'Basic',
    topics: ['Модули', 'Теория', 'Практика', 'Проверка']
  },
  {
    id: '03',
    title: 'Симулятор диспетчера',
    description: 'Реальные рабочие сценарии • Отработка ошибок без финансовых потерь • Оценка эффективности действий',
    icon: Zap,
    stage: 'Practice',
    href: 'pages/calls.html',
    status: 'active',
    difficulty: 'Advanced',
    topics: ['Сценарии', 'Симуляция', 'Оценка', 'Практика']
  },
  {
    id: '04',
    title: 'Тестирование и сертификация',
    description: 'Финальный экзамен • Проверка терминологии • Выдача сертификата по окончании',
    icon: Target,
    stage: 'Foundation',
    href: 'pages/module-4.html',
    status: 'active',
    difficulty: 'Basic',
    topics: ['Экзамен', 'Терминология', 'Сертификат']
  },
  {
    id: '05',
    title: 'Кейсы и конфликты',
    description: 'Решение конфликтных ситуаций • Оптимизация сложных маршрутов • Работа с задержками',
    icon: Brain,
    stage: 'Practice',
    href: 'pages/calls.html',
    status: 'active',
    difficulty: 'Advanced',
    topics: ['Кейсы', 'Конфликты', 'Маршруты', 'Задержки']
  },
  {
    id: '06',
    title: 'Переговоры с брокерами',
    description: 'Скрипты для переговоров • Аудио-примеры диалогов • Ролевые игры и практика',
    icon: Lightbulb,
    stage: 'Expert',
    href: '#',
    status: 'coming',
    difficulty: 'Expert',
    topics: ['Скрипты', 'Аудио', 'Ролевые игры']
  },
  {
    id: '07',
    title: 'Load Board и маршруты',
    description: 'Анализ прибыльности маршрутов • Стратегии ставок • Поиск грузов в реальном времени',
    icon: Users,
    stage: 'Practice',
    href: 'pages/module-7.html',
    status: 'active',
    difficulty: 'Advanced',
    topics: ['Load Board', 'Ставки', 'Маршруты', 'Поиск']
  },
  {
    id: '08',
    title: 'Документооборот',
    description: 'Оформление Rate Confirmation • Работа с BOL и POD • Основы факторинга',
    icon: Rocket,
    stage: 'Expert',
    href: '#',
    status: 'coming',
    difficulty: 'Expert',
    topics: ['Rate Confirmation', 'BOL', 'POD', 'Факторинг']
  },
  {
    id: '09',
    title: 'Экстренные ситуации',
    description: 'Поломки трака на маршруте • Отказ водителя от груза • Проблемы на погрузке/выгрузке',
    icon: Award,
    stage: 'Expert',
    href: '#',
    status: 'coming',
    difficulty: 'Expert',
    topics: ['Поломки', 'Отказы', 'Проблемы', 'Решения']
  }
];

const stages = [
  { name: 'Foundation', label: 'Фундамент' },
  { name: 'Practice', label: 'Погружение' },
  { name: 'Expert', label: 'Мастерство' }
];

const stats = [
  { label: 'Доступных грузов', value: '15,378+', icon: '📦' },
  { label: 'Средняя ставка', value: '$2.95/миля', icon: '💰' },
  { label: 'Активных студентов', value: '50+', icon: '👥' },
  { label: 'Штатов США', value: 'Все 50', icon: '🗺️' }
];

const difficultyColors = {
  'Basic': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  'Advanced': 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  'Expert': 'bg-red-500/20 border-red-500/50 text-red-300'
};

export default function Home() {
  return (
    <div className="relative w-full min-h-screen bg-zinc-950 overflow-hidden">
      {/* Flow Field Background */}
      <div className="fixed inset-0 z-0">
        <FlowFieldBackground 
          color="#6366f1" 
          trailOpacity={0.08}
          particleCount={600}
          speed={1}
        />
        {/* Vignette Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(9, 9, 11, 0.8) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/50">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📚</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Курсы Диспетчера
              </h1>
            </div>
            <p className="text-xl text-zinc-300 mb-8 max-w-3xl">
              Профессиональная экосистема подготовки диспетчеров логистики США
            </p>
            <p className="text-sm text-zinc-400 mb-8">
              Обучение охватывает все штаты США с актуальной информацией о рынке грузоперевозок
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-4">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-20">
          {stages.map((stage) => (
            <section key={stage.name} className="mb-24">
              {/* Stage Title */}
              <div className="mb-12 ml-2">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  {stage.label}
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningSteps
                  .filter(step => step.stage === stage.name)
                  .map((step) => {
                    const Icon = step.icon;
                    const isComingSoon = step.status === 'coming';
                    const diffColor = difficultyColors[step.difficulty as keyof typeof difficultyColors];

                    return (
                      <div key={step.id} className="group">
                        <GlowingEffect 
                          disabled={false} 
                          spread={40} 
                          proximity={64}
                          borderWidth={1}
                        >
                          <a
                            href={isComingSoon ? '#' : step.href}
                            className={`block relative h-full rounded-xl overflow-hidden transition-all duration-300 ${
                              isComingSoon 
                                ? 'opacity-70 cursor-not-allowed' 
                                : 'hover:shadow-lg'
                            }`}
                          >
                            {/* Card Background - More transparent */}
                            <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 group-hover:border-zinc-700/50 transition-colors" />

                            {/* Grid Pattern Background */}
                            <div className="absolute inset-0 opacity-5" style={{
                              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent)',
                              backgroundSize: '50px 50px'
                            }} />

                            {/* Coming Soon Badge */}
                            {isComingSoon && (
                              <div className="absolute top-4 right-4 z-20">
                                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-xs font-bold text-amber-400 uppercase tracking-wider">
                                  Soon
                                </span>
                              </div>
                            )}

                            {/* Difficulty Badge */}
                            <div className="absolute top-4 left-4 z-20">
                              <span className={`px-2 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${diffColor}`}>
                                {step.difficulty}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-6 h-full flex flex-col">
                              {/* Icon */}
                              <div className="mb-4 w-fit">
                                <div className="bg-zinc-800/50 p-3 rounded-lg">
                                  <Icon className="w-6 h-6 text-zinc-100" />
                                </div>
                              </div>

                              {/* Step Number */}
                              <div className="text-5xl font-bold text-zinc-700 mb-2 leading-none">
                                {step.id}
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-bold text-white mb-3">
                                {step.title}
                              </h3>

                              {/* Description */}
                              <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-grow">
                                {step.description}
                              </p>

                              {/* Topics */}
                              <div className="mb-4 flex flex-wrap gap-2">
                                {step.topics.map((topic, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-zinc-800/50 text-zinc-300 rounded border border-zinc-700/50">
                                    {topic}
                                  </span>
                                ))}
                              </div>

                              {/* Arrow */}
                              <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <span className="text-sm font-medium">Начать</span>
                                <span className="text-lg">→</span>
                              </div>
                            </div>
                          </a>
                        </GlowingEffect>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}

          {/* CTA Section */}
          <section className="mt-24 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-16 relative overflow-hidden">
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px'
              }} />
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Готов начать обучение?
                </h2>
                <p className="text-zinc-300 mb-8 max-w-2xl mx-auto text-lg">
                  Присоединяйся к 50+ активным студентам, которые уже улучшили свои навыки диспетчера и достигли успеха в логистике США.
                </p>
                <a
                  href="pages/module-1.html"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-lg"
                >
                  Начать первый модуль →
                </a>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-white mb-2">Практический подход</h3>
              <p className="text-zinc-400 text-sm">Все материалы основаны на реальных сценариях американского рынка логистики</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-white mb-2">Актуальные данные</h3>
              <p className="text-zinc-400 text-sm">Ставки, маршруты и регламенты обновляются в соответствии с текущим рынком</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-6">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2">Сертификация</h3>
              <p className="text-zinc-400 text-sm">Получи признанный сертификат по завершении всех модулей обучения</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 backdrop-blur-xl bg-zinc-950/50 mt-24">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-zinc-500 text-sm">
            <p>&copy; 2026 Dispatcher Courses. Все права защищены.</p>
            <p className="mt-2">Профессиональное обучение для диспетчеров транспортной логистики США</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
