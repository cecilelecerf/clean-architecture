import { RateNotFoundError } from "@application/errors/accounts";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";


export class ApplyDailyInterestUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly configRepository: SavingRateRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService
  ) {}
   async execute(): Promise<void | RateNotFoundError> {
    const rate = await this.configRepository.findCurrent();

    if (!rate) return new RateNotFoundError();

    const savingsAccounts = await this.accountRepository.findAllSavingsAccounts();

    const today = this.clockService.now();

    if (savingsAccounts) {
      for (const account of savingsAccounts) { 
        const dailyRateDecimal = rate.rate.toDecimal() / 365;
        const interestResult = account.balance.multiply(dailyRateDecimal);

        // return l'error
         if (interestResult instanceof Error) continue;
        const interestMoney = interestResult;

        account.deposit(interestMoney);

        const transaction = TransactionEntity.from({
          id: this.uuidService.generate(),
          // TODO : il faut passer l'id d'un account
          fromAccountId: "BANK",
          toAccountId: account.iban,
          amount: interestMoney,
          type: "credit",
          date: today,
        });

        await this.transactionRepository.save(transaction);
        await this.accountRepository.save(account);
      }
    }
  }
}
