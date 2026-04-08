#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для добавления навигации на все модули
"""

import os
import re
from datetime import datetime

# Список модулей для обработки
modules = [
    'doc-module-1-complete.html',
    'doc-module-2-complete.html',
    'doc-module-3-complete.html',
    'doc-module-4-complete.html',
    'doc-module-5-complete.html',
    'doc-module-6-complete.html',
    'doc-module-7-complete.html',
    'doc-module-8-complete.html',
    'doc-module-9-complete.html',
    'doc-module-10-complete.html',
    'doc-module-11-complete.html',
    'doc-module-12-complete.html',
]

# HTML навигации
navigation_html = '''
            <!-- UPDATED: 2026-03-22 - NAVIGATION SECTOR 00 -->
            <!-- СЕКТОР 00: Навигация по курсу -->
            <div class="sector-wrapper sector-navigation">
                <div class="navigation-block">
                    <button class="navigation-toggle" id="navigationToggle">
                        <span class="nav-icon">📚</span>
                        <span class="nav-title">Навигация по курсу</span>
                        <span class="nav-arrow">▼</span>
                    </button>

                    <div class="navigation-content" id="navigationContent">
                        <div class="navigation-grid">
                            <div class="nav-section">
                                <h4 class="section-header">📖 РАЗДЕЛЫ</h4>
                                <div class="section-items">
                                    <a href="intro.html">Введение</a>
                                    <a href="glossary.html">Глоссарий</a>
                                    <a href="role.html">Роль</a>
                                    <a href="equipment.html">Оборудование</a>
                                    <a href="routes.html">Маршруты</a>
                                    <a href="loadboards.html">Load Boards</a>
                                    <a href="negotiation.html">Переговоры</a>
                                    <a href="brokers.html">Брокеры</a>
                                    <a href="docs.html">Документы</a>
                                    <a href="regulations.html">Законы</a>
                                    <a href="technology.html">TMS</a>
                                    <a href="communication.html">Коммуникация</a>
                                    <a href="problems.html">Проблемы</a>
                                    <a href="finances.html">Финансы</a>
                                    <a href="career.html">Карьера</a>
                                </div>
                            </div>

                            <div class="nav-section">
                                <h4 class="section-header">📘 МОДУЛИ</h4>
                                <div class="section-items">
                                    <a href="doc-module-1-complete.html">Индустрия</a>
                                    <a href="doc-module-2-complete.html">Термины</a>
                                    <a href="doc-module-3-complete.html">Диспетчер</a>
                                    <a href="doc-module-4-complete.html">Load Boards</a>
                                    <a href="doc-module-5-complete.html">Маршруты</a>
                                    <a href="doc-module-6-complete.html">Оборудование</a>
                                    <a href="doc-module-7-complete.html">Переговоры</a>
                                    <a href="doc-module-8-complete.html">Брокеры</a>
                                    <a href="doc-module-9-complete.html">CSA Scores</a>
                                    <a href="doc-module-10-complete.html">Грузы</a>
                                    <a href="doc-module-11-complete.html">Проблемы</a>
                                    <a href="doc-module-12-complete.html">Карьера</a>
                                </div>
                            </div>

                            <div class="nav-section">
                                <h4 class="section-header">🔥 ТЕСТЫ</h4>
                                <div class="section-items">
                                    <a href="test-1.html">Основы рынка</a>
                                    <a href="test-2.html">FMCSA / DOT</a>
                                    <a href="test-3.html">HOS</a>
                                    <a href="test-4.html">Load Boards</a>
                                    <a href="test-5.html">Навигация</a>
                                    <a href="test-6.html">Типы грузов</a>
                                    <a href="test-7.html">Коммуникация</a>
                                    <a href="test-8.html">Rate / Docs</a>
                                    <a href="test-9.html">CSA Scores</a>
                                    <a href="test-10.html">Страхование</a>
                                    <a href="test-11.html">TMS / ELD</a>
                                    <a href="test-12.html">Профессионал</a>
                                </div>
                            </div>

                            <div class="nav-section">
                                <h4 class="section-header">⚡ ИНСТРУМЕНТЫ</h4>
                                <div class="section-items">
                                    <a href="simulator.html">🎯 Симулятор</a>
                                    <a href="cases.html">💼 Кейсы</a>
                                    <a href="load-finder.html">🔍 Load Finder</a>
                                    <a href="dispatcher-cards.html">🃏 Карточки</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
'''

# JavaScript для навигации
navigation_js = '''
    <script>
        // Сектор 00: Навигация
        document.addEventListener('DOMContentLoaded', function () {
            const navigationToggle = document.getElementById('navigationToggle');
            const navigationContent = document.getElementById('navigationContent');

            if (navigationToggle && navigationContent) {
                navigationToggle.addEventListener('click', function () {
                    this.classList.toggle('active');
                    navigationContent.classList.toggle('active');
                });
            }
        });
    </script>
'''

def process_module(filepath):
    """Обработка одного модуля"""
    print(f"\n📄 Обрабатываю: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Проверяем, есть ли уже навигация
    if 'id="navigationToggle"' in content:
        print("  ✓ Навигация уже есть, пропускаю...")
        return False
    
    # Ищем место для вставки навигации (после .header или .main начала)
    # Ищем первый <div class="sector-wrapper"> или начало контента
    pattern = r'(<div class="main">.*?</header>)'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        # Вставляем навигацию после header
        insert_pos = match.end()
        content = content[:insert_pos] + navigation_html + content[insert_pos:]
        print("  ✓ Навигация HTML добавлена")
    else:
        print("  ✗ Не найдено место для вставки навигации HTML")
        return False
    
    # Добавляем JavaScript перед </body>
    if '</body>' in content and 'id="navigationToggle"' not in content:
        content = content.replace('</body>', navigation_js + '\n</body>')
        print("  ✓ JavaScript добавлен")
    
    # Сохраняем файл
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ Модуль обновлен!")
    return True

def main():
    """Главная функция"""
    print("=" * 60)
    print("🚀 ДОБАВЛЕНИЕ НАВИГАЦИИ НА ВСЕ МОДУЛИ")
    print("=" * 60)
    
    pages_dir = 'pages'
    updated_count = 0
    skipped_count = 0
    
    for module in modules:
        filepath = os.path.join(pages_dir, module)
        
        if not os.path.exists(filepath):
            print(f"\n⚠️  Файл не найден: {filepath}")
            continue
        
        if process_module(filepath):
            updated_count += 1
        else:
            skipped_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ ГОТОВО!")
    print(f"   Обновлено: {updated_count}")
    print(f"   Пропущено: {skipped_count}")
    print("=" * 60)

if __name__ == '__main__':
    main()
