import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UuidService } from "@application/ports/services/UuidService";
import { ClockService } from "@application/ports/services/ClockService";
import { MoneyConverter } from "@domain/services/MoneyConverter";
import { OrderEntity, OrderToDTO } from "@domain/entities/OrderEntity";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionEntity } from "@domain/entities/ActionEntity";
import {
  InvalidOrderTypeError,
  InvalidQuantityError,
} from "@domain/errors/order";
import {
  ActionNotAvailableError,
  ActionNotFoundError,
} from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  InvalidTransactionAmountError,
  InvalidTransactionLabelError,
} from "@domain/errors/transaction";
import { SameAccountTransactionError } from "@domain/errors/transaction/SameAccountTransactionError";
import { AccountNotFoundError } from "@application/errors/accounts";
import { ISIN } from "@domain/values/ISIN";
import { InvalidISINError } from "@domain/errors/ISIN";

type PlaceOrderParams = {
  userId: string;
  IBAN: string;
  isin: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
};

export class PlaceOrderUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly moneyService: MoneyConverter
  ) {}

  async execute({
    userId,
    IBAN: accountId,
    isin,
    type,
    quantity,
    price,
  }: PlaceOrderParams): Promise<
    | OrderToDTO
    | InvalidOrderTypeError
    | ActionNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | ActionNotAvailableError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidQuantityError
    | AccountNotFoundError
    | InvalidISINError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const validateIsin = ISIN.isValid(isin);
    if (validateIsin instanceof Error) return validateIsin;
    const action = await this.actionRepository.findByISIN(validateIsin);
    if (!action) return new ActionNotFoundError();
    if (!action.isAvailable) return new ActionNotAvailableError(action.ISIN);

    const accountIBAN = IBAN.create(accountId);
    if (accountIBAN instanceof Error) return accountIBAN;

    const userAccount = await this.accountRepository.findByIBAN(accountIBAN);
    if (!userAccount || userAccount.userId !== userId) {
      return new AccountNotFoundError();
    }

    const moneyPrice = Money.create({
      amount: price,
      currency: action.price.currency,
    });
    if (moneyPrice instanceof Error) return moneyPrice;

    const order = OrderEntity.create({
      id: this.uuidService.generate(),
      IBAN: accountIBAN,
      ISIN: action.ISIN,
      type: type,
      quantity: quantity,
      price: moneyPrice,
      createdAt: this.clockService.now(),
    });

    if (order instanceof Error) return order;

    await this.orderRepository.save(order);

    const matchResult = await this.tryMatchOrder(order, action);

    if (matchResult.remainingOrder) {
      let isMatch = true;
      let remainingOrder: OrderEntity | undefined = matchResult.remainingOrder;
      while (isMatch && remainingOrder) {
        const newMatch = await this.tryMatchOrder(remainingOrder, action);
        isMatch = newMatch.matched;
        remainingOrder = newMatch.remainingOrder;
      }
    }
    if (matchResult.matched) {
      return matchResult.executedOrder!.toDTO();
    }

    return order.toDTO();
  }

  /**
   * Tente de matcher l'ordre avec des ordres opposés existants
   */
  private async tryMatchOrder(
    newOrder: OrderEntity,
    action: ActionEntity
  ): Promise<{
    matched: boolean;
    executedOrder?: OrderEntity;
    executionPrice?: Money;
    remainingOrder?: OrderEntity;
  }> {
    const oppositeType = newOrder.type === "buy" ? "sell" : "buy";
    // TODO : best method
    const allOrders = await this.orderRepository.findAllByActionIdAndStatus(
      action.ISIN,
      "pending"
    );

    const oppositeOrders = allOrders.filter(
      (order) => order.type === oppositeType && order.id !== newOrder.id
    );
    if (oppositeOrders.length === 0) {
      return { matched: false };
    }

    const compatibleOrders = oppositeOrders.filter((order) =>
      newOrder.isCompatibleWith(order)
    );
    if (compatibleOrders.length === 0) {
      return { matched: false };
    }
    const bestMatch = compatibleOrders.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0];

    const executionPrice = OrderEntity.calculateExecutionPrice(
      newOrder,
      bestMatch
    );
    const executionQuantity = Math.min(newOrder.quantity, bestMatch.quantity);

    const executed = await this.executeMatch(
      newOrder,
      bestMatch,
      executionPrice,
      executionQuantity,
      action
    );

    if (!executed || executed instanceof Error) {
      return { matched: false };
    }

    return {
      matched: true,
      executedOrder: executed.newOrder,
      executionPrice,
      remainingOrder: executed.remainingOrder,
    };
  }

  /**
   * Exécute la transaction entre deux ordres matchés
   */
  private async executeMatch(
    newOrder: OrderEntity,
    matchOrder: OrderEntity,
    executionPrice: Money,
    quantity: number,
    action: ActionEntity
  ): Promise<
    | {
        newOrder: OrderEntity;
        matchOrder: OrderEntity;
        remainingOrder?: OrderEntity;
      }
    | null
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | SameAccountTransactionError
    | InvalidTransactionLabelError
    | InvalidTransactionAmountError
  > {
    const now = this.clockService.now();

    const baseAmount = executionPrice.multiply(quantity);
    if (baseAmount instanceof Error) return null;

    const buyOrder = newOrder.type === "buy" ? newOrder : matchOrder;
    const sellOrder = newOrder.type === "sell" ? newOrder : matchOrder;

    const buyAccount = await this.accountRepository.findByIBAN(buyOrder.IBAN);
    const sellAccount = await this.accountRepository.findByIBAN(sellOrder.IBAN);

    if (!buyAccount || !sellAccount) return null;
    const fee = OrderEntity.defaultFee();

    const buyTotalAmount = baseAmount.add(fee);
    if (buyTotalAmount instanceof Error) return null;

    const sellNetAmount = baseAmount.subtract(fee);
    if (sellNetAmount instanceof Error) return null;

    const buyAmount = await this.moneyService.convert(
      buyTotalAmount,
      buyAccount.currency
    );

    const sellAmount = await this.moneyService.convert(
      sellNetAmount,
      sellAccount.currency
    );

    if (buyAmount instanceof Error) return buyAmount;
    if (sellAmount instanceof Error) return sellAmount;

    const debit = buyAccount.debit(buyAmount);
    if (debit instanceof Error) return null;

    sellAccount.credit(sellAmount);

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) return null;
    const buyTransaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: bankAccount.iban,
      toAccountId: buyAccount.iban,
      amount: buyAmount,
      label: `Achat ${quantity} ${action.symbol} @ ${executionPrice.amount}€`,
      date: now,
      icon: "📈",
    });

    const sellTransaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: sellAccount.iban,
      toAccountId: bankAccount.iban,
      amount: sellAmount,
      label: `Vente ${quantity} ${action.symbol} @ ${executionPrice.amount}€`,
      date: now,
      icon: "📈",
    });

    if (buyTransaction instanceof Error) {
      return buyTransaction;
    }
    if (sellTransaction instanceof Error) {
      return sellTransaction;
    }
    const executedNew = newOrder.markExecuted({
      now,
      transactionId:
        newOrder.type === "buy" ? buyTransaction.id : sellTransaction.id,
      executionPrice,
    });

    const executedMatch = matchOrder.markExecuted({
      now,
      transactionId:
        matchOrder.type === "buy" ? buyTransaction.id : sellTransaction.id,
      executionPrice,
    });

    if (executedNew instanceof Error || executedMatch instanceof Error) {
      return null;
    }

    let remainingOrder: OrderEntity | undefined;
    if (newOrder.quantity > quantity) {
      const order = OrderEntity.create({
        id: this.uuidService.generate(),
        IBAN: newOrder.IBAN,
        ISIN: newOrder.ISIN,
        type: newOrder.type,
        quantity: newOrder.quantity - quantity,
        price: newOrder.price,
        createdAt: now,
      });

      if (!(order instanceof Error)) {
        await this.orderRepository.save(order);
        remainingOrder = order;
      }
    }

    if (matchOrder.quantity > quantity) {
      const remainingMatch = OrderEntity.create({
        id: this.uuidService.generate(),
        IBAN: matchOrder.IBAN,
        ISIN: matchOrder.ISIN,
        type: matchOrder.type,
        quantity: matchOrder.quantity - quantity,
        price: matchOrder.price,
        createdAt: matchOrder.createdAt,
      });

      if (!(remainingMatch instanceof Error)) {
        await this.orderRepository.save(remainingMatch);
      }
    }

    await this.transactionRepository.save(sellTransaction);
    await this.transactionRepository.save(buyTransaction);
    await this.orderRepository.update(executedNew);
    await this.orderRepository.update(executedMatch);
    await this.accountRepository.update(buyAccount);
    await this.accountRepository.update(sellAccount);

    const updatedAction = action.updatePrice({
      newPrice: executionPrice,
      now: this.clockService.now(),
    });
    if (updatedAction instanceof Error) return updatedAction;
    await this.actionRepository.update(updatedAction);

    return {
      newOrder: executedNew,
      matchOrder: executedMatch,
      remainingOrder: remainingOrder,
    };
  }
}
