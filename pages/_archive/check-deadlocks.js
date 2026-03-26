#!/usr/bin/env node

/**
 * DEADLOCK CHECKER - Проверка диалогов на тупики
 * 
 * Проверяет:
 * 1. Все пути из suggestions существуют
 * 2. Все пути имеют либо brokerQuestion, либо brokerResponse с outcome
 * 3. Нет "висящих" путей без продолжения
 * 4. Warning пути имеют возможность вернуться в master
 * 
 * Usage: node check-deadlocks.js <dialogue-file.js>
 */

const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDeadlocks(filePath) {
    log('\n🔍 DEADLOCK CHECKER', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Файл: ${filePath}\n`, 'blue');

    // Загружаем файл
    let scenario;
    try {
        // Создаем временный массив для загрузки
        global.allScenarios = [];
        require(path.resolve(filePath));
        scenario = global.allScenarios[global.allScenarios.length - 1];
        delete global.allScenarios;
    } catch (error) {
        log(`❌ ОШИБКА загрузки файла: ${error.message}`, 'red');
        return false;
    }

    if (!scenario || !scenario.paths) {
        log('❌ ОШИБКА: Не найден объект scenario с paths', 'red');
        return false;
    }

    log(`📋 Диалог #${scenario.id}: ${scenario.route}`, 'blue');
    log(`   Груз: ${scenario.cargo}`, 'blue');
    log(`   Оборудование: ${scenario.equipment}\n`, 'blue');

    let errors = 0;
    let warnings = 0;

    // Получаем все доступные пути
    const availablePaths = Object.keys(scenario.paths);
    log(`✅ Найдено путей: ${availablePaths.length}`, 'green');
    availablePaths.forEach(p => log(`   - ${p}`, 'cyan'));
    log('');

    // Проверяем каждый путь
    availablePaths.forEach(pathName => {
        const pathSteps = scenario.paths[pathName];

        log(`\n🔍 Проверка пути: ${pathName}`, 'yellow');
        log('-'.repeat(60), 'yellow');

        if (!Array.isArray(pathSteps)) {
            log(`   ❌ ОШИБКА: Путь ${pathName} не является массивом!`, 'red');
            errors++;
            return;
        }

        pathSteps.forEach((step, stepIndex) => {
            const stepNum = stepIndex + 1;

            // Проверка 1: Есть ли brokerQuestion или brokerResponse?
            const hasQuestion = !!step.brokerQuestion;
            const hasResponse = !!step.brokerResponse;

            if (!hasQuestion && !hasResponse) {
                log(`   ❌ ШАГ ${stepNum}: Нет ни brokerQuestion, ни brokerResponse!`, 'red');
                errors++;
                return;
            }

            // Проверка 2: Если есть brokerResponse
            if (hasResponse) {
                // Проверяем есть ли outcome (финальный шаг) или suggestions (промежуточный)
                const hasOutcome = !!step.outcome;
                const hasSuggestions = !!step.suggestions && Array.isArray(step.suggestions);

                if (!hasOutcome && !hasSuggestions) {
                    log(`   ❌ ШАГ ${stepNum}: Есть brokerResponse, но нет ни outcome, ни suggestions!`, 'red');
                    errors++;
                    return;
                }

                if (hasOutcome) {
                    log(`   ✅ ШАГ ${stepNum}: Финальный шаг с outcome`, 'green');
                    return; // Это финальный шаг, дальше не проверяем
                }

                // Если есть suggestions, продолжаем проверку как обычный шаг
                log(`   📝 ШАГ ${stepNum}: Промежуточный шаг с brokerResponse и suggestions`, 'blue');
            }

            // Проверка 3: Если есть brokerQuestion ИЛИ (brokerResponse + suggestions), должны быть suggestions
            if (hasQuestion || (hasResponse && !step.outcome)) {
                if (!step.suggestions || !Array.isArray(step.suggestions)) {
                    log(`   ❌ ШАГ ${stepNum}: Есть вопрос/ответ, но нет suggestions!`, 'red');
                    errors++;
                    return;
                }

                const suggestionsCount = step.suggestions.length;
                log(`   📝 ШАГ ${stepNum}: ${suggestionsCount} вариантов ответа`, 'blue');

                // Проверка 4: Все пути из suggestions существуют?
                const referencedPaths = new Set();
                step.suggestions.forEach((suggestion, suggIndex) => {
                    const suggNum = suggIndex + 1;

                    if (!suggestion.path) {
                        log(`      ❌ Вариант ${suggNum}: Нет path!`, 'red');
                        errors++;
                        return;
                    }

                    referencedPaths.add(suggestion.path);

                    // Проверяем существование пути
                    if (!availablePaths.includes(suggestion.path)) {
                        log(`      ❌ Вариант ${suggNum} (${suggestion.quality}): Путь "${suggestion.path}" НЕ СУЩЕСТВУЕТ! → ТУПИК!`, 'red');
                        errors++;
                    } else {
                        // Проверяем что путь не пустой
                        const targetPath = scenario.paths[suggestion.path];
                        if (!targetPath || targetPath.length === 0) {
                            log(`      ❌ Вариант ${suggNum} (${suggestion.quality}): Путь "${suggestion.path}" ПУСТОЙ! → ТУПИК!`, 'red');
                            errors++;
                        }
                    }
                });

                // Проверка 5: Для warning путей - есть ли возврат в master?
                if (pathName.includes('warning')) {
                    const hasReturnToMaster = Array.from(referencedPaths).some(p => p === 'master');
                    if (!hasReturnToMaster) {
                        log(`      ⚠️  WARNING путь не имеет возврата в master!`, 'yellow');
                        warnings++;
                    } else {
                        log(`      ✅ WARNING путь имеет возврат в master`, 'green');
                    }
                }

                // Проверка 6: Количество вариантов
                if (suggestionsCount !== 6) {
                    log(`      ⚠️  Ожидается 6 вариантов, найдено ${suggestionsCount}`, 'yellow');
                    warnings++;
                }
            }
        });
    });

    // Проверка 7: Обязательные пути
    log('\n\n🔍 Проверка обязательных путей:', 'yellow');
    log('-'.repeat(60), 'yellow');

    const requiredPaths = ['master'];
    const recommendedPaths = ['warning', 'warning_strict'];

    requiredPaths.forEach(reqPath => {
        if (!availablePaths.includes(reqPath)) {
            log(`   ❌ Отсутствует обязательный путь: ${reqPath}`, 'red');
            errors++;
        } else {
            log(`   ✅ Обязательный путь найден: ${reqPath}`, 'green');
        }
    });

    recommendedPaths.forEach(recPath => {
        if (!availablePaths.includes(recPath)) {
            log(`   ⚠️  Рекомендуется добавить путь: ${recPath}`, 'yellow');
            warnings++;
        } else {
            log(`   ✅ Рекомендуемый путь найден: ${recPath}`, 'green');
        }
    });

    // Проверка 8: Reject пути должны заканчиваться на _final
    log('\n\n🔍 Проверка reject путей:', 'yellow');
    log('-'.repeat(60), 'yellow');

    const rejectPaths = availablePaths.filter(p => p.startsWith('reject_'));
    rejectPaths.forEach(rejectPath => {
        if (!rejectPath.endsWith('_final')) {
            log(`   ❌ Reject путь "${rejectPath}" не заканчивается на _final!`, 'red');
            errors++;
        } else {
            // Проверяем что reject путь имеет только 1 элемент с outcome
            const rejectSteps = scenario.paths[rejectPath];
            if (rejectSteps.length !== 1) {
                log(`   ❌ Reject путь "${rejectPath}" должен иметь 1 элемент, найдено ${rejectSteps.length}!`, 'red');
                errors++;
            } else if (!rejectSteps[0].outcome) {
                log(`   ❌ Reject путь "${rejectPath}" не имеет outcome!`, 'red');
                errors++;
            } else {
                log(`   ✅ Reject путь "${rejectPath}" корректен`, 'green');
            }
        }
    });

    // Итоговый результат
    log('\n\n' + '='.repeat(60), 'cyan');
    log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ:', 'cyan');
    log('='.repeat(60), 'cyan');

    if (errors === 0 && warnings === 0) {
        log('\n✅ ОТЛИЧНО! Тупиков не найдено!', 'green');
        log('✅ Все пути корректны!', 'green');
        log('✅ Диалог готов к использованию!\n', 'green');
        return true;
    } else {
        if (errors > 0) {
            log(`\n❌ НАЙДЕНО ОШИБОК: ${errors}`, 'red');
            log('❌ ЕСТЬ ТУПИКИ! Диалог требует исправления!', 'red');
        }
        if (warnings > 0) {
            log(`\n⚠️  НАЙДЕНО ПРЕДУПРЕЖДЕНИЙ: ${warnings}`, 'yellow');
            log('⚠️  Рекомендуется исправить для лучшего качества', 'yellow');
        }
        log('');
        return errors === 0;
    }
}

// Запуск
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        log('\n❌ ОШИБКА: Не указан файл для проверки!', 'red');
        log('\nИспользование:', 'yellow');
        log('  node check-deadlocks.js <dialogue-file.js>', 'cyan');
        log('\nПример:', 'yellow');
        log('  node check-deadlocks.js pages/scenarios-data-v24.js', 'cyan');
        log('');
        process.exit(1);
    }

    const filePath = args[0];

    if (!fs.existsSync(filePath)) {
        log(`\n❌ ОШИБКА: Файл не найден: ${filePath}`, 'red');
        log('');
        process.exit(1);
    }

    const success = checkDeadlocks(filePath);
    process.exit(success ? 0 : 1);
}

module.exports = { checkDeadlocks };
