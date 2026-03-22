import Link from 'next/link';
import { BookOpen, Clock, Headphones, Shield, MessageSquare, TrendingUp, Play, Waves, Sparkles } from 'lucide-react';
import { lessons, categories, getTotalDuration } from '@/src/data/courseData';
import ProgressStats from '@/src/components/ui/ProgressStats';

export default function Home() {
  const totalLessons = lessons.length;
  const totalDuration = getTotalDuration();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-10"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-200 mb-6">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Обучение нового поколения</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Учись в любое время
            </span>
            <br />
            <span className="text-gray-900">как подкаст</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Профессиональные курсы с аудио озвучкой. Слушай в дороге, на прогулке или дома.
            Обучение, которое подстраивается под твой ритм жизни.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/course"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Начать обучение бесплатно
                <Play size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>

            <Link
              href="/demo"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-indigo-300 hover:bg-gray-50 transition-all duration-200"
            >
              Посмотреть демо
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-600" />
              <span className="font-semibold text-gray-900">{totalLessons} уроков</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-purple-600" />
              <span className="font-semibold text-gray-900">{totalDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones size={20} className="text-cyan-600" />
              <span className="font-semibold text-gray-900">100% с аудио</span>
            </div>
          </div>

          {/* Progress Stats */}
          <ProgressStats />
        </div>
      </section>

      {/* Bento Grid - Key Modules */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ключевые модули курса
            </h2>
            <p className="text-lg text-gray-600">
              Структурированная программа для профессионального роста
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large card - Negotiation */}
            <div className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white hover:scale-[1.02] transition-transform duration-200">
              <div className="relative z-10">
                <MessageSquare size={48} className="mb-4 opacity-90" />
                <h3 className="text-3xl font-bold mb-3">Переговоры</h3>
                <p className="text-white/90 mb-6 text-lg">
                  Освойте искусство ведения переговоров. От базовых техник до продвинутых стратегий win-win.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">2 урока</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">24 мин</span>
                </div>
              </div>
            </div>

            {/* Medium card - Safety */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white hover:scale-[1.02] transition-transform duration-200">
              <div className="relative z-10">
                <Shield size={40} className="mb-3 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Безопасность</h3>
                <p className="text-white/90 text-sm mb-4">
                  Критически важные знания для защиты себя и команды.
                </p>
                <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">2 урока</span>
              </div>
            </div>

            {/* Medium card - Workflow */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white hover:scale-[1.02] transition-transform duration-200">
              <div className="relative z-10">
                <TrendingUp size={40} className="mb-3 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Рабочий процесс</h3>
                <p className="text-white/90 text-sm mb-4">
                  Эффективные техники организации работы и управления временем.
                </p>
                <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">2 урока</span>
              </div>
            </div>

            {/* Small cards */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white hover:scale-[1.02] transition-transform duration-200">
              <div className="relative z-10">
                <Sparkles size={32} className="mb-2 opacity-90" />
                <h3 className="text-xl font-bold mb-2">Mindset</h3>
                <p className="text-white/90 text-sm">Правильное мышление для успеха</p>
              </div>
            </div>

            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white hover:scale-[1.02] transition-transform duration-200">
              <div className="relative z-10">
                <BookOpen size={32} className="mb-2 opacity-90" />
                <h3 className="text-xl font-bold mb-2">Введение</h3>
                <p className="text-white/90 text-sm">Начните свой путь обучения</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Смотреть все уроки
              <Play size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Audio Experience Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white"></div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 mb-6">
                <Headphones size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Аудио формат</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Учись как слушаешь подкасты
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Каждый урок профессионально озвучен. Слушай в наушниках во время пробежки,
                в машине по дороге на работу или дома за чашкой кофе.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                    <Play size={12} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Удобный плеер</p>
                    <p className="text-sm text-gray-600">Управление скоростью, перемотка, прогресс</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <BookOpen size={12} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Текст + Аудио</p>
                    <p className="text-sm text-gray-600">Читай или слушай - выбирай удобный формат</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center mt-1">
                    <Waves size={12} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Качественная озвучка</p>
                    <p className="text-sm text-gray-600">Профессиональное аудио для комфортного обучения</p>
                  </div>
                </li>
              </ul>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Попробовать аудио
                <Headphones size={18} />
              </Link>
            </div>

            {/* Visual Audio Player Mockup */}
            <div className="relative">
              {/* Glassmorphism card */}
              <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                {/* Waveform visualization - static heights for performance */}
                <div className="flex items-end justify-between gap-1 h-32 mb-6">
                  {[65, 45, 75, 55, 85, 50, 70, 60, 80, 55, 90, 65, 75, 50, 85, 60, 70, 55, 80, 65,
                    75, 50, 85, 60, 90, 55, 70, 65, 80, 50, 75, 60, 85, 55, 70, 65, 80, 50, 75, 60].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full"
                        style={{
                          height: `${height}%`,
                          opacity: 0.4 + (i % 3) * 0.2,
                        }}
                      ></div>
                    ))}
                </div>

                {/* Player controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>2:34</span>
                    <span>8:15</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                      <Play size={20} fill="white" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="font-semibold text-gray-900">Основы переговоров</p>
                  <p className="text-sm text-gray-600">Урок 3 из 10</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Начни обучение прямо сейчас
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Бесплатный доступ ко всем материалам. Без регистрации и подписок.
          </p>
          <Link
            href="/course"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Перейти к курсу
            <Play size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
