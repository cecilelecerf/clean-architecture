import { RateNotFoundError } from "@application/errors/accounts";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { FactorNegativeError, MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";


export class ApplyDailyInterestUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly configRepository: SavingRateRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService
  ) {}
   async execute(): Promise<
    | void 
    | RateNotFoundError
    | FactorNegativeError 
    | MoneyCurrencyMissingError 
    | MoneyAmountInvalidError 
    | MoneyAmountNegativeError
    | FactorNegativeError  
    | MoneyCurrencyMismatchError> {
    const rateConfig = await this.configRepository.findCurrent();
    if (!rateConfig) return new RateNotFoundError();

    const dailyRate = rateConfig.rate.toDecimal() / 365;

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) {
      throw new Error("Bank interest account not configured");
    }

    const savingAccounts =
      await this.accountRepository.findAllSavingsAccounts();

    const today = this.clockService.now();

    for (const savingAccount of savingAccounts) {
      const interestResult = savingAccount.applyDailyInterest(
        bankAccount,
        dailyRate
      );

      if (interestResult instanceof Error) return interestResult;

      const transaction = TransactionEntity.from({
        id: this.uuidService.generate(),
        fromAccountId: bankAccount.iban,
        toAccountId: savingAccount.iban,
        amount: interestResult, 
        label: "Intérêts journaliers",
        icon: "interest",
        type: "credit",
        date: today,
      });

      await this.transactionRepository.save(transaction);

      await this.accountRepository.save(savingAccount);
    }

    await this.accountRepository.save(bankAccount);
  }
}
