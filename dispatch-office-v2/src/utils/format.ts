// ═══════════════════════════════════════════════════════
//  format.ts — форматирование чисел, денег, времени
// ═══════════════════════════════════════════════════════

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatMiles(miles: number): string {
  return `${Math.round(miles).toLocaleString('en-US')} mi`;
}

/**
 * Минуты от полуночи → "HH:MM"
 */
export function formatGameTime(minutes: number): string {
  const total = Math.floor(((minutes % (24 * 60)) + 24 * 60) % (24 * 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatHOS(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h}h ${m}m`;
}
