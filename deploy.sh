#!/bin/bash
# Скрипт быстрого деплоя на Hostinger

echo "🚀 Деплой на dispatch4you.com через Git"
echo "========================================"

# Проверка изменений
if [[ -z $(git status -s) ]]; then
  echo "❌ Нет изменений для деплоя"
  exit 0
fi

# Показать изменения
echo ""
echo "📝 Измененные файлы:"
git status -s

# Запрос сообщения коммита
echo ""
read -p "💬 Введите описание изменений: " commit_message

if [ -z "$commit_message" ]; then
  commit_message="Update $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Git операции
echo ""
echo "📦 Добавление файлов..."
git add .

echo "💾 Создание коммита..."
git commit -m "$commit_message"

echo "🌐 Отправка на Hostinger..."
git push hostinger main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Деплой успешно завершен!"
  echo "🔗 Проверьте: https://dispatch4you.com/"
else
  echo ""
  echo "❌ Ошибка при деплое. Проверьте подключение к Hostinger."
  exit 1
fi
