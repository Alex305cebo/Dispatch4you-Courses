#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix encoding issues in documentation.html
Replaces broken Cyrillic characters with correct ones
"""

import sys

def fix_encoding(input_file, output_file):
    """Read file and fix encoding issues"""
    
    # Read file with UTF-8
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Common broken patterns and their fixes
    replacements = {
        # Technology section
        '?? ���������� � ����������� ����������': '💻 Технологии и инструменты диспетчера',
        '����������� ��������� � ��� �� ������ ������� � ���������': 'Современный диспетчер — это не просто человек с телефоном',
        '������ ������, ������ ������, ������ �������': 'больше грузов, лучшие ставки, меньше стресса',
        '?? ��������� #1: DAT Load Board': '🥇 Приоритет #1: DAT Load Board',
        '������ � ���': 'грузов в год',
        '������ ���������': 'грузов ежедневно',
        '������������': 'перевозчиков',
        '�������� ����������� DAT': 'Ключевые возможности DAT',
        '����� ������': 'Поиск грузов',
        '�������� ��������': 'Рыночные тренды',
        '������': 'Алерты',
        '��������� ���������': 'Умнейшее планирование',
        '��������� ����������': 'Проверка брокеров',
        
        # Documentation section  
        '?? ������������ � Paperwork': '📋 Документация и Paperwork',
        '��������� � ��� ������': 'Документы — это деньги',
        
        # Regulations section
        '?? ��������������� � Compliance': '⚖️ Законодательство и Compliance',
        '�������� ������ �� ����������� �� ����������������': 'Незнание закона не освобождает от ответственности',
    }
    
    # Apply replacements
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Write fixed content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed encoding: {input_file} -> {output_file}")
    print(f"   Applied {len(replacements)} replacements")

if __name__ == '__main__':
    input_file = 'pages/documentation.html'
    output_file = 'pages/documentation.html'
    
    fix_encoding(input_file, output_file)
