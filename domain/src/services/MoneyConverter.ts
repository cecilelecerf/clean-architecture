import { Money } from "@domain/values/Money";
import {
  MoneyCurrencyMissingError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
} from "@domain/errors/money";
import { InsufficientFundsError } from "@domain/errors/account";

/**
 * Service de domaine pour gérer les conversions de devises
 * Injecté là où on en a besoin (use cases, entities)
 */
export interface MoneyConverter {
  convert(
    money: Money,
    targetCurrency: string
  ): Promise<
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
  >;

  add(money1: Money, money2: Money): Promise<Money>;

  subtract(
    money1: Money,
    money2: Money
  ): Promise<Money | InsufficientFundsError>;

  isGreaterThan(money1: Money, money2: Money): Promise<boolean>;

  isLessThan(money1: Money, money2: Money): Promise<boolean>;

  isGreaterThanOrEqual(money1: Money, money2: Money): Promise<boolean>;

  isLessThanOrEqual(money1: Money, money2: Money): Promise<boolean>;

  equals(money1: Money, money2: Money): Promise<boolean>;
}
