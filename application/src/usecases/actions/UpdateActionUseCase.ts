import { AccountNotFoundError } from "@application/errors/accounts";
import { BankInterestAccountNotFoundError } from "@application/errors/accounts/BankInterestAccountNotFoundError";
import { ActionNotFoundError } from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { MoneyConverter } from "@domain/services/MoneyConverter";
import { Money } from "@domain/values/Money";

interface Props {
  userId: string;
  ISIN: string;
  name?: string;
  totalNb?: number;
  symbol?: string;
  market?: string;
  activitySector?: string;
  priceAmount?: number;
  priceCurrency?: string;
  isAvailable?: boolean;
}

export class UpdateActionUsecase {
  public constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService,
    private readonly orderRepositry: OrderRepository,
    private readonly accountRepository: AccountRepository,
    private readonly uuidService: UuidService,
    private readonly transactionRepository: TransactionRepository,
    private readonly moneyConvertService: MoneyConverter
  ) {}

  public async execute({
    userId,
    ISIN,
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    priceAmount,
    priceCurrency,
    isAvailable,
  }: Props): Promise<
    | ActionEntity
    | ActionNotFoundError
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (
      user.hasRole({ role: "client" }) ||
      user.hasRole({ role: "conseiller" })
    )
      return new UserRoleMismatchError(["directeur"], user.role);

    const action = await this.actionRepository.findByISIN(ISIN);
    if (!action) return new ActionNotFoundError();

    let price: Money | undefined;
    if (priceAmount && priceCurrency) {
      const priceVO:
        | Money
        | MoneyCurrencyMissingError
        | MoneyAmountInvalidError
        | MoneyAmountNegativeError = Money.create({
        amount: priceAmount,
        currency: priceCurrency,
      });
      if (priceVO instanceof Error) return priceVO;
      else price = priceVO;
    }

    action.update({
      name,
      totalNb,
      symbol,
      market,
      activitySector,
      price,
      isAvailable,
      now: this.clockService.now(),
    });

    const orders = await this.orderRepositry.findAllByActionIdAndStatus(
      action.ISIN,
      "pending"
    );
    orders.forEach((order) => {
      if (!order.canBeExecuted({ action, now: this.clockService.now() }))
        return;
      this.executeImmediately({ order, action });
    });

    await this.actionRepository.update(action);
    return action;
  }

  private async executeImmediately({
    order,
    action,
  }: {
    order: OrderEntity;
    action: ActionEntity;
  }) {
    const total = action.currentPrice.multiply(order.quantity);
    if (total instanceof Error) return total;

    const userAccount = await this.accountRepository.findByIBAN(
      order.accountIban
    );
    if (!userAccount) return new AccountNotFoundError();

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) {
      return new BankInterestAccountNotFoundError();
    }
    const totalConvert = await this.moneyConvertService.convert(
      total,
      userAccount.currency
    );
    if (totalConvert instanceof Error) return totalConvert;
    const transaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: order.accountIban,
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
      price: action.currentPrice,
    });
    if (newOrder instanceof Error) return newOrder;

    userAccount.debit(totalConvert);
    bankAccount.credit(total);

    await this.accountRepository.update(userAccount);
    await this.accountRepository.update(bankAccount);
    await this.transactionRepository.save(transaction);
  }
}
