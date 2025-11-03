export interface ClockService {
  now(): Date;
  nowMinusDays(days: number): Date;
  nowPlus(ms: number): Date;
  nowMinus(ms: number): Date;
  addDays(date: Date, days: number): Date;
  addMinutes(date: Date, minutes: number): Date;
}
