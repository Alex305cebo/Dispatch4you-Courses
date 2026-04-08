# 📦 Список резервных копий

Этот файл содержит информацию о всех локальных резервных копиях проекта.

---

## Активные резервы

### 1. Lazy Loading System
**Папка:** `BACKUP_LAZY-LOADING_2026-03-20_22-41-16`
**Дата:** 20 марта 2026, 22:41:16
**Размер:** ~41.5 KB
**Файлов:** 7

**Содержимое:**
- lazy-load-sections.js
- LAZY-LOAD-INTEGRATION.md
- LAZY-LOAD-QUICK-START.md
- integrate-lazy-loading.ps1
- lazy-load-demo.html
- SESSION-2026-03-20-LAZY-LOADING.md
- .kiro/steering/module-creation-rules.md

**Восстановление:**
```powershell
Copy-Item -Path 'BACKUP_LAZY-LOADING_2026-03-20_22-41-16\*' -Destination . -Recurse -Force
```

**Статус:** ✅ Актуальный

---

## Правила работы с резервами

1. **Создание:** Всегда создавай резерв перед крупными изменениями
2. **Именование:** `BACKUP_[ИМЯ]_YYYY-MM-DD_HH-mm-ss`
3. **Хранение:** Локально, без Git
4. **Удаление:** После успешного тестирования (через 7-14 дней)
5. **Документация:** Каждый резерв должен иметь README.md

---

## Команды для работы

### Создать новый резерв:
```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "BACKUP_[ИМЯ]_$timestamp"
New-Item -ItemType Directory -Path $backupFolder
Copy-Item -Path [файлы] -Destination $backupFolder -Recurse
```

### Список всех резервов:
```powershell
Get-ChildItem -Directory -Filter "BACKUP_*" | Sort-Object Name -Descending
```

### Размер резервов:
```powershell
Get-ChildItem -Directory -Filter "BACKUP_*" | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB
    [PSCustomObject]@{
        Name = $_.Name
        Size = "$([math]::Round($size, 2)) KB"
    }
}
```

---

## История изменений

| Дата | Резерв | Описание |
|------|--------|----------|
| 20.03.2026 | BACKUP_LAZY-LOADING_2026-03-20_22-41-16 | Система lazy loading для оптимизации |

---

**Обновлено:** 20 марта 2026, 22:41
