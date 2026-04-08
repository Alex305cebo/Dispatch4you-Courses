#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор модулей курса на основе documentation.html
Создает полные HTML файлы для модулей 2-12
"""

import os
import shutil

# Базовый шаблон будет взят из doc-module-1.html
# Контент для каждого модуля

modules_content = {
    2: {
        "title": "Регулирование и законодательство",
        "description": "FMCSA, DOT требования, Hours of Service (HOS), ELD mandate и другие важные регулирования для диспетчеров.",
        "audio_blocks": 6,
        "duration": 35,
        "sectors": [
            {
                "number": 1,
                "title": "FMCSA и DOT - основы регулирования",
                "content": """
                <p>Federal Motor Carrier Safety Administration (FMCSA) и Department of Transportation (DOT) - главные регулирующие органы в индустрии грузоперевозок США.</p>
                
                <h3>🏛️ FMCSA (Federal Motor Carrier Safety Administration)</h3>
                <ul>
                    <li><strong>Основана:</strong> 2000 год (часть DOT)</li>
                    <li><strong>Миссия:</strong> Снижение аварий, травм и смертей с участием коммерческих траков</li>
                    <li><strong>Регулирует:</strong> Более 500,000 транспортных компаний и 3.5M+ водителей</li>
                </ul>

                <h3>📋 Основные требования FMCSA:</h3>
                <ul>
                    <li><strong>MC Number (Motor Carrier):</strong> Обязателен для всех перевозчиков</li>
                    <li><strong>DOT Number:</strong> Уникальный идентификатор компании</li>
                    <li><strong>Insurance Requirements:</strong> Минимум $750K liability, $100K cargo</li>
                    <li><strong>Safety Ratings:</strong> Satisfactory, Conditional, Unsatisfactory</li>
                </ul>

                <div class="alert alert-info">
                    <strong>💡 Важно для диспетчера:</strong> Всегда проверяйте MC/DOT статус брокеров через safer.fmcsa.dot.gov перед работой!
                </div>
                """
            },
