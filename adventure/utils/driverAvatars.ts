const PROF = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions';

// Аватары водителей — все уникальные персонажи
export const DRIVER_AVATARS = [
  // Офисные работники (оригинальные)
  `${PROF}/Man%20Office%20Worker%20Medium%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Dark%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Light%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Medium-Dark%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Medium-Light%20Skin%20Tone.png`,
  `${PROF}/Woman%20Office%20Worker%20Medium%20Skin%20Tone.png`,
  `${PROF}/Woman%20Office%20Worker%20Dark%20Skin%20Tone.png`,
  `${PROF}/Woman%20Office%20Worker%20Light%20Skin%20Tone.png`,
  `${PROF}/Woman%20Office%20Worker%20Medium-Dark%20Skin%20Tone.png`,
  `${PROF}/Woman%20Office%20Worker%20Medium-Light%20Skin%20Tone.png`,
  // Новые — разные прически и стили
  `${PROF}/Man%20Medium-Dark%20Skin%20Tone%2C%20Curly%20Hair.png`,
  `${PROF}/Man%20Medium-Light%20Skin%20Tone%2C%20Curly%20Hair.png`,
  `${PROF}/Man%20Medium-Light%20Skin%20Tone%2C%20White%20Hair.png`,
  `${PROF}/Man%20Medium-Light%20Skin%20Tone%2C%20Red%20Hair.png`,
  `${PROF}/Man%20Wearing%20Turban%20Medium%20Skin%20Tone.png`,
  `${PROF}/Man%20White%20Hair.png`,
  `${PROF}/Old%20Man%20Medium-Dark%20Skin%20Tone.png`,
  `${PROF}/Older%20Person%20Medium%20Skin%20Tone.png`,
  `${PROF}/Person%20Curly%20Hair.png`,
  `${PROF}/Person%20Light%20Skin%20Tone%2C%20Beard.png`,
  `${PROF}/Person%20Medium%20Skin%20Tone%2C%20Curly%20Hair.png`,
  `${PROF}/Person%20Medium-Dark%20Skin%20Tone%2C%20Curly%20Hair.png`,
  `${PROF}/Person%20Medium-Light%20Skin%20Tone%2C%20Beard.png`,
  `${PROF}/Person%20Medium-Light%20Skin%20Tone%2C%20Curly%20Hair.png`,
  `${PROF}/Person%20Medium-Light%20Skin%20Tone%2C%20Red%20Hair.png`,
];

// Хэш строки — стабильный числовой индекс по имени
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDriverAvatar(truckIdOrName: string): string {
  // Если передан truckId (например "truck-1") — используем имя водителя если есть,
  // иначе хэшируем сам truckId
  const hash = hashName(truckIdOrName);
  return DRIVER_AVATARS[hash % DRIVER_AVATARS.length];
}
