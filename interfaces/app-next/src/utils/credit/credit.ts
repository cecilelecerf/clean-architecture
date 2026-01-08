import { Transaction } from '@infrastructure/types/transaction';

/**
 * Génère toutes les dates de mensualités
 */
export function getCreditMonths(startDate: string, durationMonths: number): Date[] {
  const months: Date[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < durationMonths; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    months.push(d);
  }

  return months;
}
