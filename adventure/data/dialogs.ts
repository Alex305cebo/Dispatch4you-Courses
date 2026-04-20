import { DialogStep } from '../components/CharacterDialog';

const AVATARS_BASE = '/assets/avatars';

export const CHARACTERS = {
  driver: {
    name: 'Джон',
    role: 'Водитель трака',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Light%20Skin%20Tone.png',
  },
  driver2: {
    name: 'Майк',
    role: 'Водитель трака',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Pilot%20Dark%20Skin%20Tone.png',
  },
  driver3: {
    name: 'Карлос',
    role: 'Водитель трака',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Older%20Person%20Medium-Light%20Skin%20Tone.png',
  },
  mechanic: {
    name: 'Механик',
    role: 'Механик',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Mechanic%20Light%20Skin%20Tone.png',
  },
  broker: {
    name: 'Сара',
    role: 'Брокер',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20Light%20Skin%20Tone%2C%20Curly%20Hair.png',
  },
  owner: {
    name: 'Майк',
    role: 'Владелец компании',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20White%20Hair.png',
  },
  system: {
    name: 'Dispatch Office',
    role: 'Система',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp',
  },
  accountant: {
    name: 'Лиза',
    role: 'Бухгалтер',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Curly%20Hair.png',
  },
  dispatcher: {
    name: 'Ты',
    role: 'Диспетчер',
    avatar: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium-Light%20Skin%20Tone.png',
  },
};

// Диалог: Водитель при старте игры
export const DIALOG_DRIVER_START: DialogStep[] = [
  {
    from: 'character',
    text: 'Привет! Я Джон, твой водитель. PTI сделан, трак готов к работе.',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '👍 Отлично! Документы в порядке?' },
      { text: '⏰ Сколько часов у тебя есть?' },
    ],
  },
  {
    from: 'character',
    text: 'Да, всё на месте: CDL, медкарта, страховка. ELD логбук настроен, 11 часов вождения доступно.',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '📍 Где ты сейчас находишься?' },
      { text: '🚛 Готов выезжать на загрузку?' },
    ],
  },
  {
    from: 'character',
    text: 'Я в Knoxville, TN. Жду твоих указаний — найди груз и я сразу выеду!',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '💪 Понятно, ищу груз прямо сейчас!' },
    ],
  },
];

// Диалог: Брокер при первом грузе
export const DIALOG_BROKER_FIRST_CALL: DialogStep[] = [
  {
    from: 'character',
    text: 'Привет! Я Сара, брокер из DAT. Вижу ты интересуешься моим грузом из Chicago в Dallas.',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '💰 Какая ставка?' },
      { text: '📦 Расскажи про груз подробнее' },
    ],
  },
  {
    from: 'character',
    text: 'Ставка $2,800. Груз — паллеты с электроникой, 42,000 lbs. Погрузка завтра в 8 AM.',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '✅ Договорились, пришли Rate Con' },
      { text: '🤝 Можешь поднять до $3,000?' },
    ],
  },
  {
    from: 'character',
    text: 'Договорились! Отправляю Rate Con на почту. Проверь все детали перед подтверждением.',
  },
  {
    from: 'player',
    text: '',
    options: [
      { text: '📧 Принял, проверяю документы' },
    ],
  },
];

// Хелперы localStorage
const STORAGE_PREFIX = 'dialog-shown-';

export function isDialogShown(dialogId: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return localStorage.getItem(STORAGE_PREFIX + dialogId) === '1';
  } catch { return false; }
}

export function markDialogShown(dialogId: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(STORAGE_PREFIX + dialogId, '1');
  } catch {}
}
