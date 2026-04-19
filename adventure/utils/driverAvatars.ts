const PROF = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions';

// Аватары которые точно работают в репозитории
export const DRIVER_AVATARS = [
  `${PROF}/Man%20Office%20Worker%20Medium%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Light%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Medium-Dark%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Dark%20Skin%20Tone.png`,
  `${PROF}/Man%20Office%20Worker%20Medium-Light%20Skin%20Tone.png`,
];

export function getDriverAvatar(truckId: string): string {
  const idNum = parseInt(truckId.replace(/\D/g, '')) || 0;
  return DRIVER_AVATARS[idNum % DRIVER_AVATARS.length];
}
