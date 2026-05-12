import { STATES, REGIONS } from "./states";
import { CITIES } from "./cities";

// ── Утилиты ──────────────────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrong(arr, correct, count) {
  return shuffle(arr.filter((x) => x !== correct)).slice(0, count);
}

function makeOptions(correct, pool, labelFn = (x) => x) {
  const wrong = pickWrong(pool, correct, 3);
  return shuffle([correct, ...wrong]).map((v) => ({ value: v, label: labelFn(v) }));
}

// ── Строители вопросов по режиму ─────────────────────────────

function buildRegionsIntro(count) {
  // Показываем штат → выбери регион (только 6 вариантов)
  const states = shuffle(STATES).slice(0, count);
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          state.name,
    hint:          "В каком регионе США этот штат?",
    correctAnswer: state.region,
    options:       REGIONS.map((r) => ({ value: r, label: r })),
    hintText:      `Подсказка: посмотри на карте где находится ${state.name}`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildFindState(count) {
  const states = shuffle(STATES).slice(0, count);
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          state.name,
    hint:          "Найди этот штат на карте:",
    correctAnswer: state.id,
    hintText:      `Регион: ${state.region} · Часовой пояс: ${state.tz} Time`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildNameState(count) {
  const states = shuffle(STATES).slice(0, count);
  const allNames = STATES.map((s) => s.name);
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          "Как называется выделенный штат?",
    hint:          "Посмотри на карту и выбери правильное название",
    correctAnswer: state.name,
    options:       makeOptions(state.name, allNames),
    hintText:      `Регион: ${state.region} · Столица: ${state.capital}`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildTimezone(count) {
  const states = shuffle(STATES).slice(0, count);
  const allTZ = [...new Set(STATES.map((s) => s.tz))];
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          state.name,
    hint:          "В каком часовом поясе этот штат?",
    correctAnswer: state.tz,
    options:       makeOptions(state.tz, allTZ, (t) => `${t} Time`),
    hintText:      `Регион: ${state.region}`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildCapitals(count) {
  const states = shuffle(STATES).slice(0, count);
  const allCapitals = STATES.map((s) => s.capital);
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          state.name,
    hint:          "Какая столица этого штата?",
    correctAnswer: state.capital,
    options:       makeOptions(state.capital, allCapitals),
    hintText:      `Регион: ${state.region} · Часовой пояс: ${state.tz} Time`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildFindCity(count) {
  const cities = shuffle(CITIES).slice(0, count);
  return cities.map((city) => {
    const stateData = STATES.find(s => s.id === city.state);
    const fullStateName = stateData ? stateData.name : city.state;
    return {
      stateId:       city.state,
      stateName:     fullStateName,
      cityName:      city.name,
      cityLat:       city.lat,
      cityLng:       city.lng,
      cityType:      city.type,
      text:          city.name,
      hint:          "Найди этот город на карте:",
      correctAnswer: city.name,
      hintText:      `Штат: ${fullStateName} · ${city.tz} Time`,
      tz:            city.tz,
      region:        stateData?.region || "",
      capital:       stateData?.capital || "",
    };
  });
}

function buildRegion(count) {
  const states = shuffle(STATES).slice(0, count);
  return states.map((state) => ({
    stateId:       state.id,
    stateName:     state.name,
    text:          state.name,
    hint:          "В каком регионе перевозок этот штат?",
    correctAnswer: state.region,
    options:       makeOptions(state.region, REGIONS),
    hintText:      `Часовой пояс: ${state.tz} Time`,
    tz:            state.tz,
    region:        state.region,
    capital:       state.capital,
  }));
}

function buildProMix(count) {
  // Микс всех режимов
  const perMode = Math.ceil(count / 5);
  const all = [
    ...buildFindState(perMode),
    ...buildNameState(perMode),
    ...buildTimezone(perMode),
    ...buildCapitals(perMode),
    ...buildRegion(perMode),
  ];
  return shuffle(all).slice(0, count);
}

// ── Главная функция ───────────────────────────────────────────
export function buildQuestions(mode, count) {
  switch (mode) {
    case "regions-intro": return buildRegionsIntro(count);
    case "find-state":    return buildFindState(count);
    case "name-state":    return buildNameState(count);
    case "timezone":      return buildTimezone(count);
    case "capitals":      return buildCapitals(count);
    case "find-city":     return buildFindCity(count);
    case "region":        return buildRegion(count);
    case "pro-mix":       return buildProMix(count);
    default:              return buildFindState(count);
  }
}

// Режимы где нужна карта для ответа (клик по штату)
export const MAP_CLICK_MODES = new Set(["find-state", "find-city"]);

// Режимы где карта показывается но ответ через кнопки
export const MAP_SHOW_MODES = new Set(["find-state", "name-state", "timezone", "capitals", "region", "find-city", "pro-mix", "regions-intro"]);
