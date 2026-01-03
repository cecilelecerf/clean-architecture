import { Transaction } from "@infrastructure/types/transaction";

/**
 * Génère toutes les dates de mensualités
 */
export function getCreditMonths(
  startDate: string,
  durationMonths: number
): Date[] {
  const months: Date[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < durationMonths; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    months.push(d);
  }

  return months;
}

/**
 * Vérifie si une mensualité est payée
 */
export function isMonthPaid(
  monthDate: Date,
  transactions: Transaction[]
): boolean {
  return transactions.some(t => {
    const tDate = new Date(t.date);
    return (
      tDate.getUTCFullYear() === monthDate.getUTCFullYear() &&
      tDate.getUTCMonth() === monthDate.getUTCMonth()
    );
  });
}

/**
 * Formatter la date
 */
export function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
