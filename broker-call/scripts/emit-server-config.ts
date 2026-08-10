import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSystemPrompt } from '../src/call/prompt'
import { buildDebriefSystemPrompt } from '../src/call/debriefPrompt'
import { TOOL_SCHEMAS } from '../src/call/toolSchemas'
import { toGeminiTools } from '../src/call/geminiTools'
import { MODEL_RULES } from '../src/call/geminiModels'
import { SCENARIOS } from '../src/data/scenarios'
import { getBroker } from '../src/data/brokers'

/**
 * Готовит серверный конфиг для боевого PHP-эндпоинта.
 *
 * Системный промпт и схемы инструментов должны остаться на сервере — но
 * собраны они в TypeScript, из данных о грузах и характерах брокеров.
 * Переписывать это в PHP руками означало бы завести вторую копию, которая
 * разъедется с первой на первой же правке. Поэтому единственный источник
 * правды остаётся в TS, а сюда он выгружается при сборке.
 *
 * Результат — .php-файл, возвращающий массив. Такой файл нельзя прочитать по
 * HTTP: PHP исполнит его и не выведет ничего.
 */

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(here, '../../api/broker-config.php')

const config = {
  tools: TOOL_SCHEMAS,
  // Тот же список инструментов в формате Gemini. Конвертер лежит в TS и
  // покрыт тестами — переписывать его на PHP значило бы завести вторую
  // реализацию, которая разъедется с первой ровно там, где это заметят
  // студенты, а не мы.
  geminiTools: toGeminiTools(TOOL_SCHEMAS),
  // Политика выбора модели: какие свойства нужны и какие суточные лимиты
  // приемлемы. Имён моделей здесь нет — их приносит models.list в момент
  // запуска. PHP повторяет только цикл подсчёта очков.
  geminiModelRules: MODEL_RULES,
  scenarios: Object.fromEntries(
    SCENARIOS.map((scenario) => {
      const broker = getBroker(scenario.brokerId)
      return [
        scenario.id,
        {
          prompt: buildSystemPrompt(scenario.id),
          debrief: buildDebriefSystemPrompt(scenario.id),
          opening: scenario.opening,
          broker: broker.name,
        },
      ]
    }),
  ),
}

const json = JSON.stringify(config, null, 2)

const php = `<?php
// СГЕНЕРИРОВАННЫЙ ФАЙЛ — не править руками.
// Источник: broker-call/src/call/prompt.ts, toolSchemas.ts, data/*.ts
// Пересобрать:  cd broker-call && npm run build:server-config
//
// Возвращает массив, ничего не печатает: прямой запрос по HTTP отдаёт пустой
// ответ, поэтому системный промпт наружу не читается.

return json_decode(<<<'BROKER_CONFIG_JSON'
${json}
BROKER_CONFIG_JSON, true);
`

mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, php, 'utf8')

const bytes = Buffer.byteLength(php, 'utf8')
console.log(`broker-config.php: ${Object.keys(config.scenarios).length} сценариев, ${TOOL_SCHEMAS.length} инструментов, ${(bytes / 1024).toFixed(1)} КБ`)
