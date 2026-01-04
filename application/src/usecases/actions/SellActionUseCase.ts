import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UuidService } from "@application/ports/services/UuidService";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";
import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";
import {
  ActionNotAvailableError,
  ActionNotFoundError,
} from "@application/errors/actions";
import { AccountNotFoundError } from "@application/errors/accounts";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { OrderEntity } from "@domain/entities/OrderEntity";
import {
  InvalidOrderTypeError,
  InvalidQuantityError,
} from "@domain/errors/order";
import { InsufficientFundsError } from "@domain/errors/account";
import { SameAccountTransactionError } from "@domain/errors/transaction/SameAccountTransactionError";
import {
  InvalidTransactionAmountError,
  InvalidTransactionLabelError,
} from "@domain/errors/transaction";
import { BankInterestAccountNotFoundError } from "@application/errors/accounts/BankInterestAccountNotFoundError";

type Props = {
  userId: UserEntity["id"];
  accountId: string;
  isin: string;
  quantity: number;
};

export class SellActionUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  async execute({ userId, accountId, isin, quantity }: Props): Promise<
    | {
        order: OrderEntity;
        transaction: TransactionEntity;
      }
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | ActionNotFoundError
    | ActionNotAvailableError
    | AccountNotFoundError
    | InsufficientFundsError
    | InvalidQuantityError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMissingError
    | SameAccountTransactionError
    | InvalidTransactionLabelError
    | InvalidTransactionAmountError
    | InvalidOrderTypeError
    | FactorNegativeError
    | BankInterestAccountNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const action = await this.actionRepository.findByISIN(isin);
    if (!action) return new ActionNotFoundError();
    if (!action.isAvailable) return new ActionNotAvailableError(isin);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return new InvalidQuantityError(quantity);
    }

    const accountIBAN = IBAN.create(accountId);
    if (accountIBAN instanceof Error) return accountIBAN;

    const userAccount = await this.accountRepository.findByIBAN(accountIBAN);
    if (!userAccount) return new AccountNotFoundError();

    if (userAccount.userId !== userId) {
      return new AccountNotFoundError();
    }

    const unitPrice = action.currentPrice.amount;
    const totalAmount = unitPrice * quantity;

    const totalMoney = Money.create({
      amount: totalAmount,
      currency: action.currentPrice.currency,
    });
    if (totalMoney instanceof Error) return totalMoney;

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) {
      return new BankInterestAccountNotFoundError();
    }

    const transaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: bankAccount.iban,
      toAccountId: accountIBAN,
      amount: totalMoney,
      label: `Vente de ${quantity} action(s) ${action.symbol}`,
      date: this.clockService.now(),
      icon: "",
    });

    if (transaction instanceof Error) return transaction;

    const order = OrderEntity.create({
      id: this.uuidService.generate(),
      userId: userId,
      actionId: isin,
      quantity: quantity,
      price: action.currentPrice,
      transactionId: transaction.id,
      createdAt: this.clockService.now(),
      type: "sell",
      date: this.clockService.now(),
    });

    if (order instanceof Error) return order;

    userAccount.credit(totalMoney);
    bankAccount.debit(totalMoney);

    await this.transactionRepository.save(transaction);
    await this.orderRepository.save(order);
    await this.accountRepository.update(userAccount);
    await this.accountRepository.update(bankAccount);

    return { order, transaction };
  }
}
