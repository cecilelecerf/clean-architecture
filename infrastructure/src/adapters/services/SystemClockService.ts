import { ClockService } from "@application/ports/services/ClockService";

export class SystemClockService implements ClockService {
  now(): Date {
    return new Date();
  }
  /**
   * Renvoie une date correspondant à maintenant - X jours
   */
  nowMinusDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  nowMinusMonths(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }
  /**
   * Renvoie une nouvelle date ajoutant X jours à la date fournie
   */
  addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  /**
   * Renvoie une nouvelle date ajoutant X minutes à la date fournie
   */
  addMinutes(date: Date, minutes: number): Date {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  }

  /**
   * Renvoie une date correspondant à maintenant - X millisecondes
   */
  nowMinus(ms: number): Date {
    return new Date(Date.now() - ms);
  }

  /**
   * Renvoie une date correspondant à maintenant + X millisecondes
   */
  nowPlus(ms: number): Date {
    return new Date(Date.now() + ms);
  }

  toDate(date: string): Date {
    return new Date(date);
  }
}
