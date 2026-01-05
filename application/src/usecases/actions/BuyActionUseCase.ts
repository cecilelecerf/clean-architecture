import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UuidService } from "@application/ports/services/UuidService";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
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
import { OrderEntity, OrderToDTO } from "@domain/entities/OrderEntity";
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
import { ActionEntity } from "@domain/entities/ActionEntity";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { MoneyConverter } from "@domain/services/MoneyConverter";

type Props = {
  userId: UserEntity["id"];
  accountId: string;
  ISIN: ActionEntity["ISIN"];
  quantity: OrderEntity["quantity"];
} & Pick<OrderEntity, "limitPrice" | "scheduledFor">;

export class BuyActionUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly moneyService: MoneyConverter
  ) {}

  async execute({
    userId,
    accountId,
    ISIN,
    quantity,
    limitPrice,
    scheduledFor,
  }: Props): Promise<
    | OrderToDTO
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

    const action = await this.actionRepository.findByISIN(ISIN);
    if (!action) return new ActionNotFoundError();
    if (!action.isAvailable) return new ActionNotAvailableError(ISIN);

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

    const order = OrderEntity.create({
      id: this.uuidService.generate(),
      accountIban: accountIBAN,
      actionId: ISIN,
      quantity: quantity,
      price: action.currentPrice,
      createdAt: this.clockService.now(),
      type: "buy",
      date: this.clockService.now(),
      limitPrice,
      scheduledFor,
    });

    if (order instanceof Error) return order;
    let result:
      | void
      | FactorNegativeError
      | MoneyCurrencyMissingError
      | MoneyAmountInvalidError
      | MoneyAmountNegativeError
      | BankInterestAccountNotFoundError
      | undefined;
    if (order.canBeExecuted({ now: this.clockService.now(), action })) {
      result = await this.executeImmediately({
        order,
        action,
        userAccount,
      });
    }
    if (result instanceof Error) return result;

    await this.orderRepository.save(order);

    return order.toDTO();
  }
  private async executeImmediately({
    order,
    action,
    userAccount,
  }: {
    order: OrderEntity;
    action: ActionEntity;
    userAccount: AccountEntity;
  }): Promise<
    | void
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | BankInterestAccountNotFoundError
  > {
    const total = order.getTotal();
    if (total instanceof Error) return total;
    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) {
      return new BankInterestAccountNotFoundError();
    }
    const totalConvert = await this.moneyService.convert(
      total,
      userAccount.currency
    );
    if (totalConvert instanceof Error) return totalConvert;
    const transaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: userAccount.iban,
      toAccountId: bankAccount.iban,
      amount: totalConvert,
      label: `Achat ${order.quantity} action(s) ${action.symbol}`,
      date: this.clockService.now(),
      icon: "",
    });

    if (transaction instanceof Error) return transaction;
    const newOrder = order.markExecuted({
      now: this.clockService.now(),
      transactionId: transaction.id,
    });
    if (newOrder instanceof Error) return newOrder;

    const debit = userAccount.debit(totalConvert);
    if (debit instanceof Error) return debit;
    bankAccount.credit(total);
    await this.accountRepository.update(userAccount);
    await this.accountRepository.update(bankAccount);
    await this.transactionRepository.save(transaction);
  }
}
