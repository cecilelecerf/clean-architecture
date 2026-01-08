import { MoneyConverter } from "@domain/services/MoneyConverter";
import { Money } from "@domain/values/Money";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import {
  MoneyCurrencyMissingError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
} from "@domain/errors/money";

export class MoneyConverterService implements MoneyConverter {
  private ratesCache: Map<string, number> = new Map();
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 heure

  constructor(private readonly currencyRepository: CurrencyRepository) {}

  /**
   * Charge les taux de change depuis la DB (avec cache)
   */
  private async ensureRatesLoaded(): Promise<void> {
    const now = new Date();

    if (
      this.lastCacheUpdate &&
      now.getTime() - this.lastCacheUpdate.getTime() < this.CACHE_TTL
    ) {
      return;
    }

    const currencies = await this.currencyRepository.findAll();
    this.ratesCache.clear();

    for (const currency of currencies) {
      this.ratesCache.set(currency.code, currency.exchangeRate);
    }

    this.lastCacheUpdate = now;
  }

  /**
   * Invalide le cache (appelé quand un directeur modifie un taux)
   */
  public invalidateCache(): void {
    this.lastCacheUpdate = null;
  }

  /**
   * Convertit un montant vers une devise cible
   */
  async convert(
    money: Money,
    targetCurrency: string
  ): Promise<
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
  > {
    if (money.currency === targetCurrency.toUpperCase()) {
      return money;
    }

    await this.ensureRatesLoaded();

    const fromRate = this.ratesCache.get(money.currency);
    const toRate = this.ratesCache.get(targetCurrency.toUpperCase());

    if (!fromRate || !toRate) {
      throw new Error(
        `Taux de change manquant pour ${money.currency} ou ${targetCurrency}`
      );
    }

    return money.convertTo(targetCurrency, fromRate, toRate);
  }

  /**
   * Additionne deux montants (convertit money2 vers la devise de money1)
   */
  async add(money1: Money, money2: Money): Promise<Money> {
    if (money1.currency === money2.currency) {
      return money1.add(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.add(converted);
  }

  /**
   * Soustrait deux montants (convertit money2 vers la devise de money1)
   */
  async subtract(money1: Money, money2: Money): Promise<Money> {
    if (money1.currency === money2.currency) {
      const result = money1.subtract(money2);
      if (result instanceof Error) throw result;
      return result;
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    const result = money1.subtract(converted);
    if (result instanceof Error) throw result;
    return result;
  }

  async isGreaterThan(money1: Money, money2: Money): Promise<boolean> {
    if (money1.currency === money2.currency) {
      return money1.isGreaterThan(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.isGreaterThan(converted);
  }

  async isLessThan(money1: Money, money2: Money): Promise<boolean> {
    if (money1.currency === money2.currency) {
      return money1.isLessThan(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.isLessThan(converted);
  }

  async isGreaterThanOrEqual(money1: Money, money2: Money): Promise<boolean> {
    if (money1.currency === money2.currency) {
      return money1.isGreaterThanOrEqual(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.isGreaterThanOrEqual(converted);
  }

  async isLessThanOrEqual(money1: Money, money2: Money): Promise<boolean> {
    if (money1.currency === money2.currency) {
      return money1.isLessThanOrEqual(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.isLessThanOrEqual(converted);
  }

  async equals(money1: Money, money2: Money): Promise<boolean> {
    if (money1.currency === money2.currency) {
      return money1.equals(money2);
    }

    const converted = await this.convert(money2, money1.currency);
    if (converted instanceof Error) throw converted;

    return money1.equals(converted);
  }
}
