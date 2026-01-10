import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { BankInterestAccountNotFoundError } from "@application/errors/accounts/BankInterestAccountNotFoundError";
import { SavingsRateNotFoundError } from "@application/errors/savingsRate/SavingsRateNotFoundError";

export class ApplyDailyInterestUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly savingRateRepository: SavingRateRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService
  ) {}
  async execute(): Promise<
    | { distributed: number; totalAmount: number; skipped: number }
    | SavingsRateNotFoundError
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | FactorNegativeError
    | BankInterestAccountNotFoundError
  > {
    const rateConfig = await this.savingRateRepository.findRateAtDate(
      this.clockService.now()
    );
    if (!rateConfig) return new SavingsRateNotFoundError();

    const dailyRate = rateConfig.rate.getValue() / 100 / 365;

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) return new BankInterestAccountNotFoundError();
    const savingAccounts =
      await this.accountRepository.findAllSavingsAccounts();
    const today = this.clockService.now();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    let distributed = 0;
    let totalAmount = 0;
    let skipped = 0;

    for (const savingAccount of savingAccounts) {
      if (savingAccount.lastInterestTransactionId) {
        const lastTransaction = await this.transactionRepository.findById(
          savingAccount.lastInterestTransactionId
        );

        if (lastTransaction) {
          const lastTransactionDate = new Date(lastTransaction.date);
          lastTransactionDate.setHours(0, 0, 0, 0);

          // if (lastTransactionDate.getTime() === todayStart.getTime()) {
          //   skipped++;
          //   continue;
          // }
        }
      }

      const interest = savingAccount.applyDailyInterest(dailyRate);
      if (interest instanceof Error) return interest;

      if (interest.amount <= 0) {
        skipped++;
        continue;
      }

      savingAccount.credit(interest);

      const withdrawResult = bankAccount.debit(interest);
      if (withdrawResult instanceof Error) {
        savingAccount.debit(interest);
        return withdrawResult;
      }

      const transactionId = this.uuidService.generate();
      const transaction = TransactionEntity.create({
        id: transactionId,
        fromAccountId: bankAccount.iban,
        toAccountId: savingAccount.iban,
        amount: interest,
        label: `Intérêts journaliers (${rateConfig.rate.getValue()}%)`,
        icon: "💰",
        date: today,
      });
      if (transaction instanceof Error) return transaction;

      await this.transactionRepository.save(transaction);

      savingAccount.updateLastInterestTransaction(transactionId);
      await this.accountRepository.update(savingAccount);

      distributed++;
      totalAmount += interest.amount;
    }

    await this.accountRepository.update(bankAccount);
    return { distributed, totalAmount, skipped };
  }
}
