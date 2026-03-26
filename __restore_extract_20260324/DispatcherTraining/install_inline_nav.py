#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для установки встроенной навигации на все страницы
Решает проблему "Failed to fetch" для локальных файлов
"""

import re
import os

# Список страниц для обновления
pages = [
    "blog.html",
    "career.html",
    "contacts.html",
    "course.html",
    "courses.html",
    "dashboard.html",
    "faq.html",
    "help.html",
    "pricing.html"
]

# HTML навигации
nav_html = '''  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-content">
        <a href="index.html" class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">Курсы Диспетчера</span>
        </a>

        <div class="nav-links">
          <a href="index.html" class="nav-link">Главная</a>

          <div class="nav-dropdown">
            <a href="courses.html" class="nav-link">Курсы</a>
            <div class="dropdown-content">
              <a href="course.html">Обзор курса</a>
              <a href="pages/modules.html">12 Модулей обучения</a>
              <a href="pages/simulator.html">Симулятор переговоров</a>
              <a href="pages/calls.html">Примеры звонков</a>
              <a href="pages/cases.html">Практические кейсы</a>
              <a href="pages/testing.html">Тестирование</a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class=