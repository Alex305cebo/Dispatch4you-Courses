// ═══════════════════════════════════════════════════════
//  delivery.ts — расчёт финансов доставки (P&L)
//  Механика из Game One:
//  - Fuel: $0.45/mile
//  - Driver pay: $0.55/mile
//  - Dispatch fee: 8%
//  - Factoring fee: 3%
//  - Truck payment: 8%
//  - Trailer payment: 5%
//  - Lumper: 30% шанс $150-300
//  - Detention: $75/hour после 2 часов
// ═══════════════════════════════════════════════════════

export interface DeliveryResult {
  truckId: string;
  truckNumber: string;
  driverName: string;
  loadId: string;
  fromCity: string;
  toCity: string;
  miles: number;

  // Revenue
  agreedRate: number;
  detentionPay: number;
  grossRevenue: number;

  // Expenses
  fuelCost: number;
  driverPay: number;
  dispatchFee: number;
  factoringFee: number;
  lumperCost: number;
  truckPayment: number;
  trailerPayment: number;
  totalExpenses: number;

  // Result
  netProfit: number;
  ratePerMile: number;
  profitPerMile: number;

  // Meta
  timestamp: number;
}

export interface DeliveryInput {
  truckId: string;
  truckNumber: string;
  driverName: string;
  loadId: string;
  fromCity: string;
  toCity: string;
  miles: number;
  agreedRate: number;
  detentionMinutes: number; // минуты сверх 2 часов
}

/**
 * Рассчитывает полный P&L доставки.
 * Копирует формулы из Game One.
 */
export function calculateDeliveryResult(input: DeliveryInput): DeliveryResult {
  const { miles, agreedRate, detentionMinutes } = input;

  // Revenue
  const detentionHours = Math.max(0, Math.floor(detentionMinutes / 60));
  const detentionPay = detentionHours * 75;
  const grossRevenue = agreedRate + detentionPay;

  // Expenses
  const fuelCost = Math.round(miles * 0.45);
  const driverPay = Math.round(miles * 0.55);
  const dispatchFee = Math.round(agreedRate * 0.08);
  const factoringFee = Math.round(agreedRate * 0.03);
  const truckPayment = Math.round(agreedRate * 0.08);
  const trailerPayment = Math.round(agreedRate * 0.05);

  // Lumper: 30% шанс
  const lumperCost = Math.random() > 0.7
    ? (Math.random() > 0.5 ? 300 : 150)
    : 0;

  const totalExpenses = fuelCost + driverPay + dispatchFee + factoringFee
    + lumperCost + truckPayment + trailerPayment;

  const netProfit = grossRevenue - totalExpenses;
  const ratePerMile = miles > 0 ? Math.round((agreedRate / miles) * 100) / 100 : 0;
  const profitPerMile = miles > 0 ? Math.round((netProfit / miles) * 100) / 100 : 0;

  return {
    ...input,
    detentionPay,
    grossRevenue,
    fuelCost,
    driverPay,
    dispatchFee,
    factoringFee,
    lumperCost,
    truckPayment,
    trailerPayment,
    totalExpenses,
    netProfit,
    ratePerMile,
    profitPerMile,
    timestamp: Date.now(),
  };
}

/**
 * Рассчитывает оценку смены (S/A/B/C/D).
 * Цель: количество_траков × $2500
 */
export function calculateShiftGrade(
  totalProfit: number,
  truckCount: number
): { grade: 'S' | 'A' | 'B' | 'C' | 'D'; target: number; percentage: number } {
  const target = truckCount * 2500;
  const percentage = Math.round((totalProfit / target) * 100);

  let grade: 'S' | 'A' | 'B' | 'C' | 'D';
  if (percentage >= 150) grade = 'S';
  else if (percentage >= 120) grade = 'A';
  else if (percentage >= 100) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else grade = 'D';

  return { grade, target, percentage };
}
