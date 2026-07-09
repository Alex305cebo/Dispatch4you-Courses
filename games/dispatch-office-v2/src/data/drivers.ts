// ═══════════════════════════════════════════════════════
//  drivers.ts — пул водителей
// ═══════════════════════════════════════════════════════
import type { Driver } from '@/types';

const FIRST_NAMES = [
  'John', 'Mike', 'Dave', 'Chris', 'Steve', 'Tom', 'Bill', 'Frank',
  'Rob', 'James', 'Brian', 'Kevin', 'Mark', 'Paul', 'Rick', 'Tony',
  'Ivan', 'Sergey', 'Alex', 'Dmitry', 'Vlad', 'Nick', 'Andrew', 'Peter',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
  'Harris', 'Martin', 'Ivanov', 'Petrov', 'Kuznetsov', 'Volkov',
];

let driverIdCounter = 1;

export function generateDriver(): Driver {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const id = `drv_${String(driverIdCounter++).padStart(4, '0')}`;

  return {
    id,
    firstName,
    lastName,
    experience: 1 + Math.floor(Math.random() * 15),
    hosRemaining: 11 * 60, // 11 часов в минутах
    mood: 'normal',
    phone: generatePhone(),
  };
}

function generatePhone(): string {
  const area = Math.floor(200 + Math.random() * 800);
  const prefix = Math.floor(100 + Math.random() * 900);
  const line = Math.floor(1000 + Math.random() * 9000);
  return `(${area}) ${prefix}-${line}`;
}
